"""GitHub auto-push module for the developer prompt → main → Render auto-deploy flow.

Only the developer (is_developer=True) can call this. Uses the GitHub REST API to:
1. List files in a target branch
2. Create or update individual files with content + commit message
3. Open the resulting commit URL so the user can verify on github.com

Wraps everything as small async helpers using httpx (already in project transitively
via emergentintegrations). Falls back to requests if needed.
"""
import os
import base64
import logging
from typing import List, Dict, Any, Optional

import httpx
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

GITHUB_API = "https://api.github.com"


class GitHubPushFile(BaseModel):
    path: str = Field(..., description="Repo-relative path, e.g. backend/server.py")
    content: str = Field(..., description="Full file content (UTF-8 text)")


class GitHubPushRequest(BaseModel):
    prompt: str = Field("", description="Why this change — recorded in the commit body")
    commit_message: str = Field(..., description="Short commit subject (max 72 chars)")
    files: List[GitHubPushFile] = Field(..., description="Files to create or overwrite")
    branch: Optional[str] = Field(None, description="Override default branch from env")
    update_secret: Optional[str] = Field(None, description="Must match EPD_UPDATE_SECRET if set")


def _config() -> Dict[str, str]:
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    owner = os.environ.get("GITHUB_OWNER", "").strip()
    repo = os.environ.get("GITHUB_REPO", "").strip()
    branch = os.environ.get("GITHUB_BRANCH", "main").strip()
    if not token or not owner or not repo:
        raise RuntimeError("GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO not configured in backend/.env")
    return {"token": token, "owner": owner, "repo": repo, "branch": branch}


def _headers(token: str) -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "EnergyProjectDesignServices/1.0",
    }


async def _get_file_sha(client: httpx.AsyncClient, cfg: Dict[str, str], path: str, branch: str) -> Optional[str]:
    """Returns current sha if the file exists on the target branch, else None."""
    url = f"{GITHUB_API}/repos/{cfg['owner']}/{cfg['repo']}/contents/{path}"
    resp = await client.get(url, params={"ref": branch}, headers=_headers(cfg["token"]), timeout=20)
    if resp.status_code == 200:
        data = resp.json()
        return data.get("sha") if isinstance(data, dict) else None
    if resp.status_code == 404:
        return None
    resp.raise_for_status()
    return None


async def _put_file(
    client: httpx.AsyncClient,
    cfg: Dict[str, str],
    path: str,
    content: str,
    branch: str,
    commit_message: str,
    existing_sha: Optional[str],
) -> Dict[str, Any]:
    url = f"{GITHUB_API}/repos/{cfg['owner']}/{cfg['repo']}/contents/{path}"
    body: Dict[str, Any] = {
        "message": commit_message,
        "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
        "branch": branch,
        "committer": {
            "name": "Energy Project Design — AI Developer",
            "email": "ai-developer@energyprojectdesign.ro",
        },
    }
    if existing_sha:
        body["sha"] = existing_sha
    resp = await client.put(url, json=body, headers=_headers(cfg["token"]), timeout=30)
    if resp.status_code not in (200, 201):
        raise RuntimeError(f"GitHub PUT {path} failed [{resp.status_code}]: {resp.text[:400]}")
    return resp.json()


async def push_files(req: GitHubPushRequest) -> Dict[str, Any]:
    """Push the supplied files to GitHub. Returns commit SHAs + URLs for each file."""
    secret = os.environ.get("EPD_UPDATE_SECRET", "").strip()
    if secret and (req.update_secret or "").strip() != secret:
        raise RuntimeError("Update secret invalid sau lipsește. Vezi setarea EPD_UPDATE_SECRET.")
    if not req.files:
        raise RuntimeError("Niciun fișier de actualizat.")
    if len(req.commit_message) > 200:
        raise RuntimeError("commit_message prea lung (max 200 caractere).")

    cfg = _config()
    branch = (req.branch or cfg["branch"]).strip()
    full_message = req.commit_message
    if req.prompt:
        full_message = f"{req.commit_message}\n\nPrompt: {req.prompt[:1500]}"

    pushed: List[Dict[str, Any]] = []
    async with httpx.AsyncClient() as client:
        for f in req.files:
            sha = await _get_file_sha(client, cfg, f.path, branch)
            result = await _put_file(client, cfg, f.path, f.content, branch, full_message, sha)
            commit = result.get("commit", {})
            content = result.get("content", {})
            pushed.append({
                "path": f.path,
                "operation": "updated" if sha else "created",
                "commit_sha": commit.get("sha"),
                "commit_url": commit.get("html_url"),
                "file_url": content.get("html_url"),
            })

    repo_url = f"https://github.com/{cfg['owner']}/{cfg['repo']}"
    return {
        "ok": True,
        "branch": branch,
        "files_pushed": len(pushed),
        "results": pushed,
        "repo_url": repo_url,
        "compare_url": f"{repo_url}/commits/{branch}",
        "render_deploy_url": f"https://{cfg['repo'].lower()}.onrender.com",
    }


async def repo_status() -> Dict[str, Any]:
    """Lightweight status check — last commit SHA + branch info."""
    cfg = _config()
    async with httpx.AsyncClient() as client:
        url = f"{GITHUB_API}/repos/{cfg['owner']}/{cfg['repo']}/branches/{cfg['branch']}"
        resp = await client.get(url, headers=_headers(cfg["token"]), timeout=15)
        resp.raise_for_status()
        data = resp.json()
        commit = data.get("commit", {})
        return {
            "owner": cfg["owner"],
            "repo": cfg["repo"],
            "branch": cfg["branch"],
            "last_commit_sha": commit.get("sha", "")[:7],
            "last_commit_url": commit.get("html_url"),
            "last_commit_message": commit.get("commit", {}).get("message", "")[:200],
            "last_commit_date": commit.get("commit", {}).get("author", {}).get("date"),
            "repo_url": f"https://github.com/{cfg['owner']}/{cfg['repo']}",
        }
