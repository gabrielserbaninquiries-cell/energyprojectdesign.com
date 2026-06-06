"""Email sending via Gmail SMTP — supports a SECONDARY business 'From' address.

Each user can configure a separate Gmail account used only for sending business
emails (different from the account they use to log in to the platform). When the
user has not configured their own SMTP credentials, we fall back to a
platform-wide GMAIL_USER / GMAIL_APP_PASSWORD pair so first-time / trial users
can still send a few emails out.

Optionally a custom "From" display name and reply-to address can be supplied
(useful when a company sends from `office@company.com` but wants replies to go
to `dispatcher@company.com`).
"""
import os
import smtplib
from email.message import EmailMessage
from typing import List, Optional, Tuple


def send_email_with_attachment(
    gmail_user: str,
    gmail_password: str,
    recipients: List[str],
    subject: str,
    body: str,
    attachment_name: str,
    attachment_bytes: bytes,
    extra_attachments: Optional[List[Tuple[str, bytes, str]]] = None,
    from_name: Optional[str] = None,
    reply_to: Optional[str] = None,
    cc: Optional[List[str]] = None,
    bcc: Optional[List[str]] = None,
) -> dict:
    """Send an email with the generated DOCX attached.

    Args:
        gmail_user / gmail_password: SMTP credentials. May be the user's
            secondary business Gmail (preferred) or the login Gmail.
        from_name: Optional display name shown to recipients (e.g. the
            company name). Falls back to SMTP_FROM_NAME env var.
        reply_to: Optional Reply-To address — answers go here even if the
            email was sent from the business address above.
    """
    # Fall back to platform-wide credentials
    if not gmail_user or not gmail_password:
        gmail_user = os.environ.get("GMAIL_USER", "").strip()
        gmail_password = os.environ.get("GMAIL_APP_PASSWORD", "").strip()

    if not gmail_user or not gmail_password:
        return {
            "ok": False,
            "error": "Adresa Gmail nu este configurată. Mergeți la Setări → Configurare email pentru a o adăuga.",
        }

    display_name = (from_name or os.environ.get("SMTP_FROM_NAME", "")).strip()
    from_header = f"{display_name} <{gmail_user}>" if display_name else gmail_user

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_header
    msg["To"] = ", ".join(recipients)
    if cc:
        msg["Cc"] = ", ".join(cc)
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body or "")

    msg.add_attachment(
        attachment_bytes,
        maintype="application",
        subtype="vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=attachment_name,
    )

    for name, data, mime in (extra_attachments or []):
        maintype, subtype = mime.split("/", 1) if "/" in mime else ("application", "octet-stream")
        msg.add_attachment(data, maintype=maintype, subtype=subtype, filename=name)

    all_recipients = list(recipients) + list(cc or []) + list(bcc or [])

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=20) as server:
            server.login(gmail_user, gmail_password)
            server.send_message(msg, to_addrs=all_recipients)
        return {"ok": True, "sent_from": gmail_user}
    except smtplib.SMTPAuthenticationError:
        return {"ok": False, "error": "Autentificare Gmail eșuată. Verificați adresa și App Password-ul (16 caractere)."}
    except Exception as e:
        return {"ok": False, "error": f"Eroare SMTP: {str(e)}"}


def send_simple_email(
    gmail_user: str,
    gmail_password: str,
    recipients: List[str],
    subject: str,
    body: str,
    from_name: Optional[str] = None,
    reply_to: Optional[str] = None,
) -> dict:
    """Plain-text email without attachment — used for chatbot summaries,
    notifications, account events."""
    if not gmail_user or not gmail_password:
        gmail_user = os.environ.get("GMAIL_USER", "").strip()
        gmail_password = os.environ.get("GMAIL_APP_PASSWORD", "").strip()
    if not gmail_user or not gmail_password:
        return {"ok": False, "error": "Email nu este configurat."}

    display_name = (from_name or os.environ.get("SMTP_FROM_NAME", "")).strip()
    from_header = f"{display_name} <{gmail_user}>" if display_name else gmail_user

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_header
    msg["To"] = ", ".join(recipients)
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body or "")

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=20) as server:
            server.login(gmail_user, gmail_password)
            server.send_message(msg)
        return {"ok": True, "sent_from": gmail_user}
    except smtplib.SMTPAuthenticationError:
        return {"ok": False, "error": "Autentificare Gmail eșuată."}
    except Exception as e:
        return {"ok": False, "error": f"Eroare SMTP: {str(e)}"}
