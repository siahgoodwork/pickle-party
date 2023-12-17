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
  const { pollResults, prompt } = (await req.json()) as {
    pollResults: string[];
    prompt: string;
  };

  try {
    const _prompt = `${prompt}. Here are the words or phrases: ${pollResults
      .map((pr, n) => `${n + 1}. ${pr}`)
      .join(
        " "
      )}. Return the results as a JSON object with key 'headlines', with the value being an array of 10 strings. Each string contains just the headline, without index number. `;

    const chatResponse = await fetch(
      `${process.env.SERVER_HOSTNAME || ""}/chat/general`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: _prompt,
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
