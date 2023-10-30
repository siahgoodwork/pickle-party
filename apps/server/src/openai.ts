import type { RequestHandler } from "express";
import OpenAI from "openai";
import { config } from "dotenv";

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatGenerateHeadlineFromPoll: RequestHandler = async (req, res) => {
  try {
    const { headlinePrompt, pollResult } = req.body;

    const chatRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `You are a creative API that looks at the results of a poll, and generates a news headline ${headlinePrompt}. 
    
    Here's the poll:
		Question: ${pollResult.question}
					${pollResult.choices
            .map(
              (c: { text: string; votes: number }) => `${c.text} - ${c.votes}`
            )
            .join("\n")}
`,
        },
      ],
    });
    return res.json({ ok: true, response: chatRes });
  } catch (err) {
    console.error(err);
    return res.json({ ok: false });
  }
};

export { chatGenerateHeadlineFromPoll };
