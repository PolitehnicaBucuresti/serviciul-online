import { NextResponse } from "next/server";
import { allWebsites } from "@/lib/websites";

export const dynamic = "force-dynamic";

async function checkWebsite(url) {
  const timeoutMs = 25000;
  const maxAttempts = 2;
  const requestOptions = {
    // Manual redirect avoids false negatives for sites
    // that point to internal/unreachable callback hosts.
    redirect: "manual",
    cache: "no-store",
    headers: {
      "User-Agent": "ServiciulOnlineStatusCheck/1.0",
      Accept: "text/html,application/xhtml+xml"
    }
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const headResponse = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(timeoutMs),
        ...requestOptions
      });

      // Any non-5xx response means the service is reachable.
      if (headResponse.status < 500) {
        return true;
      }
    } catch (_error) {
      // Some endpoints are slow or block HEAD; fallback to GET below.
    }

    try {
      const getResponse = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(timeoutMs),
        ...requestOptions
      });

      if (getResponse.status < 500) {
        return true;
      }
    } catch (_error) {
      // Retry below.
    }
  }

  return false;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const singleUrl = searchParams.get("url");

  if (singleUrl) {
    const isKnownUrl = allWebsites.some((site) => site.url === singleUrl);
    if (!isKnownUrl) {
      return NextResponse.json({ error: "URL necunoscut." }, { status: 400 });
    }

    const online = await checkWebsite(singleUrl);
    return NextResponse.json(
      { url: singleUrl, online },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const checks = await Promise.all(
    allWebsites.map(async (site) => ({
      nume: site.nume,
      url: site.url,
      online: await checkWebsite(site.url)
    }))
  );

  return NextResponse.json({ checks }, { headers: { "Cache-Control": "no-store" } });
}
