import { NextResponse } from "next/server";

export interface GifPartialPayload {
  id: string;
  slug: string;
  url: string;
  title: string;
  images: Record<
    "original" | "fixed_height" | "fixed_width",
    { height: string; width: string; url: string }
  >;
}

export async function POST(request: Request): Promise<NextResponse> {
  const { search } = (await request.json()) as { search?: string };
  if (typeof search !== "string" || search.length < 4) {
    return NextResponse.json({ ok: false });
  }

  const query = new URLSearchParams({
    api_key: process.env.GIPHY_API_KEY || "",
    q: search,
    limit: "20",
  });
  const r = await fetch(
    `https://api.giphy.com/v1/gifs/search?${query.toString()}`,
    {
      method: "get",
    }
  );
  const payload = (await r.json()) as { data: GifPartialPayload[] };
  return NextResponse.json({ ok: true, data: payload.data });
}
