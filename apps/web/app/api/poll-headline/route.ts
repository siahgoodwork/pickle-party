import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const { headlinePrompt, pollResult } = await req.json();

  console.log({ headlinePrompt, pollResult });

  const chatResponse = await fetch(
    `${process.env.SERVER_HOSTNAME || ""}/chat/headline`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        headlinePrompt,
        pollResult,
      }),
    }
  );

  const chatResponseObj = await chatResponse.json();

  if (chatResponseObj.ok === true) {
    return NextResponse.json({
      ok: true,
      chatResponse: chatResponseObj.response.choices,
    });
  } else {
    return NextResponse.json({
      ok: false,
    });
  }
}
