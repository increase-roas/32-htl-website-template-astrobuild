#!/usr/bin/env python3
"""Crawl sunpoolandspasupply.com and download unique images via curl.exe."""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.parse
from collections import deque
from pathlib import Path

ORIGIN = "https://www.sunpoolandspasupply.com"
OUT_DIR = Path(__file__).resolve().parent.parent / "scraped-images-sun-pool"
USER_AGENT = "Mozilla/5.0 (compatible; IncreaseRoasImageArchive/1.0)"
CURL = "curl.exe"

IMG_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif", ".ico", ".bmp")
SKIP_PREFIXES = ("mailto:", "tel:", "sms:", "javascript:", "data:", "#")
SKIP_HOST_SNIPPETS = (
    "google.com",
    "googleapis.com",
    "gstatic.com",
    "facebook.com",
    "cloudflareinsights.com",
    "fonts.gstatic.com",
)

URL_IN_ATTR = re.compile(
    r"""(?:src|srcset|href|content|poster|data-src|data-bg)=["']([^"']+)["']""",
    re.I,
)
CSS_URL = re.compile(r"""url\(\s*['"]?([^'")]+)['"]?\s*\)""", re.I)
ABS_IMG = re.compile(
    r"""https?://[^\s"'<>]+\.(?:png|jpe?g|webp|gif|svg|avif|ico)(?:\?[^\s"'<>]*)?""",
    re.I,
)
HREF = re.compile(r"""href=["']([^"']+)["']""", re.I)
SRCSET_SPLIT = re.compile(r"\s*,\s*")


def log(msg: str) -> None:
    print(msg, flush=True)


def is_image_url(url: str) -> bool:
    path = urllib.parse.urlparse(url).path.lower()
    return any(path.endswith(ext) for ext in IMG_EXT)


def same_site(url: str) -> bool:
    host = urllib.parse.urlparse(url).netloc.lower()
    return host in ("", "www.sunpoolandspasupply.com", "sunpoolandspasupply.com")


def resolve(base: str, raw: str) -> str | None:
    raw = raw.strip()
    if not raw or raw.lower().startswith(SKIP_PREFIXES):
        return None
    if raw.startswith("//"):
        raw = "https:" + raw
    abs_url = urllib.parse.urljoin(base, raw)
    parsed = urllib.parse.urlparse(abs_url)
    if parsed.scheme not in ("http", "https"):
        return None
    return parsed._replace(fragment="").geturl()


def extract_srcset(value: str, base: str) -> list[str]:
    urls: list[str] = []
    for part in SRCSET_SPLIT.split(value):
        candidate = part.strip().split()[0] if part.strip() else ""
        resolved = resolve(base, candidate)
        if resolved:
            urls.append(resolved)
    return urls


def extract_from_text(text: str, base: str) -> tuple[set[str], set[str]]:
    pages: set[str] = set()
    images: set[str] = set()
    for match in URL_IN_ATTR.finditer(text):
        value = match.group(1)
        attr = match.group(0).split("=")[0].lower()
        if attr == "srcset":
            for u in extract_srcset(value, base):
                if is_image_url(u):
                    images.add(u)
                elif same_site(u):
                    pages.add(u)
            continue
        resolved = resolve(base, value)
        if not resolved:
            continue
        if is_image_url(resolved):
            images.add(resolved)
        elif resolved.lower().endswith((".css", ".js", ".json", ".xml")) and same_site(resolved):
            pages.add(resolved)
        elif same_site(resolved) and not is_image_url(resolved):
            pages.add(resolved)
    for match in CSS_URL.finditer(text):
        resolved = resolve(base, match.group(1))
        if resolved and is_image_url(resolved):
            images.add(resolved)
        elif resolved and resolved.lower().endswith(".css") and same_site(resolved):
            pages.add(resolved)
    for match in ABS_IMG.finditer(text):
        images.add(match.group(0).rstrip(".,);"))
    for match in HREF.finditer(text):
        resolved = resolve(base, match.group(1))
        if resolved and same_site(resolved) and not is_image_url(resolved):
            pages.add(resolved)
    return pages, images


def curl_get(url: str, dest: Path | None = None) -> tuple[int, bytes]:
    args = [
        CURL,
        "-sL",
        "--max-time",
        "40",
        "-A",
        USER_AGENT,
        "-w",
        "\n__HTTP__%{http_code}",
        "-o",
    ]
    if dest is None:
        fd, tmp_name = tempfile.mkstemp(prefix="sunpool-")
        os.close(fd)
        out_path = Path(tmp_name)
        cleanup = True
    else:
        dest.parent.mkdir(parents=True, exist_ok=True)
        out_path = dest
        cleanup = False
    args.append(str(out_path))
    args.append(url)
    try:
        proc = subprocess.run(args, capture_output=True, text=True, check=False)
        trailer = (proc.stdout or "").strip()
        status = 0
        if "__HTTP__" in trailer:
            try:
                status = int(trailer.rsplit("__HTTP__", 1)[-1].strip() or "0")
            except ValueError:
                status = 0
        body = out_path.read_bytes() if out_path.exists() else b""
        if cleanup:
            try:
                out_path.unlink(missing_ok=True)
            except OSError:
                pass
        return status, body
    except Exception as exc:  # noqa: BLE001
        log(f"  curl fail {url}: {exc}")
        return 0, b""


def walk_json(obj, found: set[str]) -> None:
    if isinstance(obj, dict):
        for v in obj.values():
            walk_json(v, found)
    elif isinstance(obj, list):
        for v in obj:
            walk_json(v, found)
    elif isinstance(obj, str):
        if obj.startswith("http") and is_image_url(obj):
            found.add(obj)
        elif obj.startswith("/") and is_image_url(obj):
            resolved = resolve(ORIGIN + "/", obj)
            if resolved:
                found.add(resolved)


def safe_name(url: str, used: dict[str, int]) -> str:
    parsed = urllib.parse.urlparse(url)
    host = parsed.netloc.replace(":", "_")
    path = urllib.parse.unquote(parsed.path).lstrip("/")
    if not path:
        path = "index"
    query = ""
    if parsed.query:
        query = "_" + re.sub(r"[^a-zA-Z0-9._-]+", "_", parsed.query)[:40]
    name = f"{host}/{path}{query}"
    if name in used:
        used[name] += 1
        stem, ext = os.path.splitext(name)
        name = f"{stem}__{used[name]}{ext}"
    else:
        used[name] = 0
    return name


def should_skip_host(url: str) -> bool:
    host = urllib.parse.urlparse(url).netloc.lower()
    return any(snip in host for snip in SKIP_HOST_SNIPPETS)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    seed = [
        ORIGIN + "/",
        ORIGIN + "/sitemap.xml",
        ORIGIN + "/api/inventory",
        ORIGIN + "/active-inventory/",
        ORIGIN + "/book/",
        ORIGIN + "/contact.html",
        ORIGIN + "/financing.html",
        ORIGIN + "/hot-tubs/",
        ORIGIN + "/inventory.html",
        ORIGIN + "/privacy-policy/",
        ORIGIN + "/quiz/",
        ORIGIN + "/swim-spas/",
        ORIGIN + "/evergreen/",
        ORIGIN + "/evergreen-catalog/",
        ORIGIN + "/catalog/",
        ORIGIN + "/assets/inventory.css",
    ]

    queued: deque[str] = deque(seed)
    seen_pages: set[str] = set()
    images: set[str] = set()

    while queued:
        url = queued.popleft()
        key = url.split("#")[0]
        if key in seen_pages:
            continue
        path = urllib.parse.urlparse(key).path.lower()
        if path.startswith("/admin") or path.startswith("/cdn-cgi"):
            continue
        seen_pages.add(key)
        log(f"crawl {key}")
        status, body = curl_get(key)
        if status != 200 or not body:
            log(f"  miss {status}")
            continue
        text = body.decode("utf-8", errors="replace")
        stripped = key.split("?", 1)[0].lower()

        if stripped.endswith("/api/inventory") or text.lstrip().startswith("{") or text.lstrip().startswith("["):
            try:
                data = json.loads(text)
                extra: set[str] = set()
                walk_json(data, extra)
                images.update(extra)
                log(f"  json images +{len(extra)}")
                continue
            except json.JSONDecodeError:
                pass

        if stripped.endswith(".xml") or text.lstrip().startswith("<?xml"):
            for loc in re.findall(r"<loc>([^<]+)</loc>", text):
                resolved = resolve(ORIGIN + "/", loc)
                if resolved and same_site(resolved) and resolved not in seen_pages:
                    queued.append(resolved)
            continue

        more_pages, more_images = extract_from_text(text, key)
        images.update(more_images)
        added = 0
        for page in more_pages:
            p = urllib.parse.urlparse(page).path.lower()
            if p.startswith("/admin") or p.startswith("/cdn-cgi"):
                continue
            # don't crawl every hashed astro module forever; still allow css/js for url()
            if page not in seen_pages:
                queued.append(page)
                added += 1
        log(f"  images={len(more_images)} new_pages={added}")

        # cap crawl so we don't follow infinite query variants
        if len(seen_pages) > 250:
            log("crawl cap reached")
            break

    log(f"\nFound {len(images)} unique image URLs from {len(seen_pages)} pages")

    used: dict[str, int] = {}
    manifest = []
    ok = 0
    fail = 0
    for url in sorted(images):
        if should_skip_host(url):
            continue
        rel = safe_name(url, used)
        dest = OUT_DIR / rel
        if dest.exists() and dest.stat().st_size > 0:
            log(f"have {rel}")
            ok += 1
            manifest.append({"url": url, "file": rel.replace("\\", "/"), "bytes": dest.stat().st_size})
            continue
        log(f"dl {url}")
        status, body = curl_get(url, dest)
        if status == 200 and dest.exists() and dest.stat().st_size > 0:
            ok += 1
            manifest.append({"url": url, "file": rel.replace("\\", "/"), "bytes": dest.stat().st_size})
        else:
            fail += 1
            log(f"  skip {status}")
            if dest.exists() and dest.stat().st_size == 0:
                dest.unlink(missing_ok=True)
        time.sleep(0.02)

    (OUT_DIR / "manifest.json").write_text(
        json.dumps({"origin": ORIGIN, "count": ok, "failed": fail, "files": manifest}, indent=2),
        encoding="utf-8",
    )
    log(f"\nDone. saved={ok} failed={fail} dir={OUT_DIR}")


if __name__ == "__main__":
    sys.stdout.reconfigure(line_buffering=True)
    main()
