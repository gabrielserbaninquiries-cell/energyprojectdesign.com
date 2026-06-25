"""Test fixtures — env-driven credentials & helpers.

Move hardcoded test secrets out of test files into env vars so:
  - production secrets never appear in source
  - tests can be run against different envs (preview / staging / local)

Usage in tests:
    from tests.fixtures import get_test_credentials, get_admin_credentials
    creds = get_test_credentials()
    response = client.post("/auth/login", json=creds)
"""
from __future__ import annotations

import os
from typing import Dict


def get_test_credentials() -> Dict[str, str]:
    """Standard test user credentials, env-driven with sane defaults for CI."""
    return {
        "email": os.environ.get("TEST_USER_EMAIL", "test_user@example.com"),
        "password": os.environ.get("TEST_USER_PASSWORD", "TestPass123!"),
        "name": os.environ.get("TEST_USER_NAME", "Test User"),
    }


def get_admin_credentials() -> Dict[str, str]:
    """Admin test credentials, env-driven."""
    return {
        "email": os.environ.get("TEST_ADMIN_EMAIL", "admin_test@example.com"),
        "password": os.environ.get("TEST_ADMIN_PASSWORD", "AdminPass123!"),
        "name": os.environ.get("TEST_ADMIN_NAME", "Test Admin"),
    }


def get_owner_credentials() -> Dict[str, str]:
    """Real platform owner credentials — only set in CI/dev env, never committed."""
    email = os.environ.get("EPD_OWNER_EMAIL")
    password = os.environ.get("EPD_OWNER_PASSWORD")
    if not email or not password:
        # Fallback: use safe test creds. Avoids skipping tests entirely.
        return get_test_credentials()
    return {"email": email, "password": password}
