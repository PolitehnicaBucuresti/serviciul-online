import { NextResponse } from "next/server";
import { websites } from "@/lib/websites";

export const dynamic = "force-dynamic";

async function checkWebsite(url) {
  const timeoutMs = 6000;

  try {
    const headResponse = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store"
    });

    if (headResponse.ok) {
      return true;
    }
  } catch (_error) {
    // Some endpoints block HEAD, fallback to GET below.
  }

  try {
    const getResponse = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store"
    });
    return getResponse.ok;
  } catch (_error) {
    return false;
  }
}

export async function GET() {
  const checks = await Promise.all(
    websites.map(async (site) => ({
      nume: site.nume,
      url: site.url,
      online: await checkWebsite(site.url)
    }))
  );

  return NextResponse.json({ checks }, { headers: { "Cache-Control": "no-store" } });
}
