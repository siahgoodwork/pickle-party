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
  const { conversation, category, prompt } = (await req.json()) as {
    conversation: string;
    category: string;
    prompt: string;
  };

  try {
    const chatResponse = await fetch(
      `${process.env.SERVER_HOSTNAME || ""}/chat/imagine-pickle`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation,
          category,
          prompt,
        }),
      }
    );

    const chatResponseObj = (await chatResponse.json()) as ChatResponse;

    if (chatResponseObj.response.choices.length < 1) {
      throw Error("Did not receive a response from ChatGPT, try again");
    }

    return NextResponse.json({
      ok: true,
      chatResponse: chatResponseObj.response.choices[0],
    });
  } catch (err) {
    /* eslint no-console: ["error", { allow: ["warn", "error"] }] -- warn user here */
    console.warn(err);
    return NextResponse.json({
      ok: false,
    });
  }
}
