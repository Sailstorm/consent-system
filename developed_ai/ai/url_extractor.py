import ipaddress
import logging
import socket
import time
from urllib.parse import quote, urljoin, urlsplit, urlunsplit

import certifi
import trafilatura
import urllib3


logger = logging.getLogger("uvicorn.error")

MAX_URL_LENGTH = 2048
MAX_DOWNLOAD_BYTES = 5 * 1024 * 1024
MAX_POLICY_CHARACTERS = 100_000
MIN_POLICY_CHARACTERS = 100
MAX_REDIRECTS = 5

CONNECT_TIMEOUT_SECONDS = 10
READ_TIMEOUT_SECONDS = 15
DOWNLOAD_BUDGET_SECONDS = 45

REDIRECT_STATUSES = {301, 302, 303, 307, 308}
HTML_CONTENT_TYPES = {
    "text/html",
    "application/xhtml+xml",
}


class PolicyExtractionError(RuntimeError):
    def __init__(self, message, status_code=422):
        super().__init__(message)
        self.status_code = status_code


def _validate_url(raw_url):
    """Validate and normalise an HTTP(S) URL."""
    raw_url = raw_url.strip()

    if not raw_url or len(raw_url) > MAX_URL_LENGTH:
        raise PolicyExtractionError(
            "Please provide a valid policy URL.",
            status_code=400,
        )

    # Reject characters that could cause inconsistent URL parsing.
    if "\\" in raw_url or any(
        ord(character) < 32 or ord(character) == 127
        for character in raw_url
    ):
        raise PolicyExtractionError(
            "The URL contains unsupported characters.",
            status_code=400,
        )

    try:
        parts = urlsplit(raw_url)
        scheme = parts.scheme.lower()

        if scheme not in {"http", "https"}:
            raise ValueError("Unsupported scheme")

        if parts.username is not None or parts.password is not None:
            raise ValueError("Credentials in URL are not allowed")

        if not parts.hostname:
            raise ValueError("Missing hostname")

        host = (
            parts.hostname.rstrip(".")
            .encode("idna")
            .decode("ascii")
            .lower()
        )

        if not host or "%" in host or any(
            character.isspace() for character in host
        ):
            raise ValueError("Invalid hostname")

        expected_port = 443 if scheme == "https" else 80
        port = parts.port or expected_port

        # First version only supports standard web ports.
        if port != expected_port:
            raise ValueError("Unsupported port")

        authority = f"[{host}]" if ":" in host else host
        path = quote(
            parts.path or "/",
            safe="/%:@!$&'()*+,;=-._~",
        )
        query = quote(
            parts.query,
            safe="=&?/%:@!$'()*+,;~-._",
        )

        normalised_url = urlunsplit(
            (scheme, authority, path, query, "")
        )

        return normalised_url, scheme, host, port, path, query

    except (ValueError, UnicodeError) as exc:
        raise PolicyExtractionError(
            "Use a public HTTP or HTTPS URL without credentials "
            "or a custom port.",
            status_code=400,
        ) from exc


def _resolve_public_address(host, port):
    """
    Reject non-public destinations and return a validated IP.

    The downloader connects directly to this validated address,
    instead of resolving the hostname again when connecting.
    """
    try:
        addresses = socket.getaddrinfo(
            host,
            port,
            type=socket.SOCK_STREAM,
        )
    except OSError as exc:
        raise PolicyExtractionError(
            "The policy website could not be resolved.",
            status_code=502,
        ) from exc

    public_addresses = []

    for _, _, _, _, address in addresses:
        ip = ipaddress.ip_address(address[0])

        if isinstance(ip, ipaddress.IPv6Address):
            checked_ip = ip.ipv4_mapped or ip

            # Do not support IPv6 transition mechanisms here.
            if ip.sixtofour is not None or ip.teredo is not None:
                raise PolicyExtractionError(
                    "This network address is not supported.",
                    status_code=400,
                )
        else:
            checked_ip = ip

        if (
            not checked_ip.is_global
            or checked_ip.is_multicast
            or checked_ip.is_reserved
        ):
            raise PolicyExtractionError(
                "URLs pointing to local or private networks "
                "are not allowed.",
                status_code=400,
            )

        public_addresses.append(str(ip))

    if not public_addresses:
        raise PolicyExtractionError(
            "The website has no usable public address.",
            status_code=502,
        )

    # Prefer IPv4 when both address families are available.
    public_addresses.sort(
        key=lambda value: ipaddress.ip_address(value).version
    )

    return public_addresses[0]


def _download_html(source_url):
    current_url = source_url
    deadline = time.monotonic() + DOWNLOAD_BUDGET_SECONDS

    for redirect_count in range(MAX_REDIRECTS + 1):
        (
            current_url,
            scheme,
            host,
            port,
            path,
            query,
        ) = _validate_url(current_url)

        ip = _resolve_public_address(host, port)

        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise PolicyExtractionError(
                "Downloading the policy page timed out.",
                status_code=504,
            )

        timeout = urllib3.Timeout(
            connect=min(CONNECT_TIMEOUT_SECONDS, remaining),
            read=min(READ_TIMEOUT_SECONDS, remaining),
        )

        if scheme == "https":
            pool = urllib3.HTTPSConnectionPool(
                host=ip,
                port=port,
                server_hostname=host,
                assert_hostname=host,
                cert_reqs="CERT_REQUIRED",
                ca_certs=certifi.where(),
                timeout=timeout,
                retries=False,
            )
        else:
            pool = urllib3.HTTPConnectionPool(
                host=ip,
                port=port,
                timeout=timeout,
                retries=False,
            )

        target = path + (f"?{query}" if query else "")
        host_header = f"[{host}]" if ":" in host else host
        response = None

        try:
            response = pool.urlopen(
                "GET",
                target,
                headers={
                    "Host": host_header,
                    "User-Agent": "ConsentAssistant/1.0",
                    "Accept": "text/html,application/xhtml+xml",
                    # Avoid unbounded decompression of downloaded data.
                    "Accept-Encoding": "identity",
                },
                assert_same_host=False,
                redirect=False,
                retries=False,
                preload_content=False,
                decode_content=False,
            )

            if response.status in REDIRECT_STATUSES:
                location = response.headers.get("Location")

                if not location:
                    raise PolicyExtractionError(
                        "The website returned an invalid redirect.",
                        status_code=502,
                    )

                if redirect_count >= MAX_REDIRECTS:
                    raise PolicyExtractionError(
                        "The policy URL redirected too many times.",
                        status_code=422,
                    )

                next_url = urljoin(current_url, location)

                # Revalidate and resolve every redirect destination.
                validated_next_url, next_scheme, *_ = _validate_url(
                    next_url
                )

                if scheme == "https" and next_scheme == "http":
                    raise PolicyExtractionError(
                        "The website redirected to an insecure HTTP page.",
                        status_code=422,
                    )

                current_url = validated_next_url
                continue

            if response.status != 200:
                raise PolicyExtractionError(
                    f"The policy website returned HTTP "
                    f"{response.status}. Please paste the policy text.",
                    status_code=502,
                )

            content_type = (
                response.headers.get("Content-Type", "")
                .split(";", 1)[0]
                .strip()
                .lower()
            )

            if content_type not in HTML_CONTENT_TYPES:
                raise PolicyExtractionError(
                    "This URL does not return an HTML page. "
                    "PDF and other file formats are not supported yet.",
                    status_code=415,
                )

            content_encoding = (
                response.headers.get("Content-Encoding", "identity")
                .strip()
                .lower()
            )

            if content_encoding not in {"", "identity"}:
                raise PolicyExtractionError(
                    "The website returned an unsupported compressed "
                    "response. Please paste the policy text.",
                    status_code=415,
                )

            chunks = []
            total_bytes = 0

            while True:
                if time.monotonic() >= deadline:
                    raise PolicyExtractionError(
                        "Downloading the policy page timed out.",
                        status_code=504,
                    )

                chunk = response.read(
                    64 * 1024,
                    decode_content=False,
                )

                if not chunk:
                    break

                total_bytes += len(chunk)

                if total_bytes > MAX_DOWNLOAD_BYTES:
                    raise PolicyExtractionError(
                        "The policy page is too large to download.",
                        status_code=413,
                    )

                chunks.append(chunk)

            return b"".join(chunks), current_url

        except urllib3.exceptions.TimeoutError as exc:
            raise PolicyExtractionError(
                "The policy website took too long to respond.",
                status_code=504,
            ) from exc

        except (urllib3.exceptions.HTTPError, OSError) as exc:
            raise PolicyExtractionError(
                "Could not download the policy page. "
                "Please try another URL or paste the text.",
                status_code=502,
            ) from exc

        finally:
            if response is not None:
                response.close()
            pool.close()

    raise PolicyExtractionError("Could not follow the policy URL.")


def extract_policy_from_url(url):
    started_at = time.perf_counter()
    source_url, *_ = _validate_url(url)

    html, final_url = _download_html(source_url)

    try:
        text = trafilatura.extract(
            html,
            url=final_url,
            output_format="txt",
            include_comments=False,
            include_tables=True,
            include_links=True,
            deduplicate=False,
            favor_recall=True,
        )
    except Exception as exc:
        logger.exception("Policy HTML extraction failed.")
        raise PolicyExtractionError(
            "The policy page could not be converted to text."
        ) from exc

    if not text:
        raise PolicyExtractionError(
            "No readable policy text was found. The page may require "
            "JavaScript or login. Please paste the policy text."
        )

    text = text.strip()

    if len(text) < MIN_POLICY_CHARACTERS:
        raise PolicyExtractionError(
            "Too little text was extracted. Please paste the policy "
            "text to avoid analysing an incomplete page."
        )

    if len(text) > MAX_POLICY_CHARACTERS:
        raise PolicyExtractionError(
            "The extracted policy exceeds the 100,000-character limit. "
            "It has not been truncated.",
            status_code=413,
        )

    elapsed = time.perf_counter() - started_at

    logger.info(
        "URL extraction complete: characters=%d elapsed=%.2fs",
        len(text),
        elapsed,
    )

    return {
        "source_url": source_url,
        "final_url": final_url,
        "text": text,
        "character_count": len(text),
        "extraction_seconds": round(elapsed, 2),
    }