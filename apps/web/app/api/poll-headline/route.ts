import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const maxDuration = 30;

interface ChatResponse {
  ok: boolean;
  response: { choices: { message: { role: string; content: string } }[] };
}

export async function POST(
  req: NextRequest
): Promise<ReturnType<typeof NextResponse.json>> {
  const { headlinePrompt, pollResult } = (await req.json()) as {
    headlinePrompt: string;
    pollResult: {
      question: string;
      choices: { votes: number; text: string }[];
    };
  };

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

  const chatResponseObj = (await chatResponse.json()) as ChatResponse;

  if (chatResponseObj.ok) {
    return NextResponse.json({
      ok: true,
      chatResponse: chatResponseObj.response.choices,
    });
  }
  return NextResponse.json({
    ok: false,
  });
}
