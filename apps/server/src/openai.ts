import type { RequestHandler } from "express";
import OpenAI from "openai";
import { config } from "dotenv";

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatCategoriseConversation: RequestHandler = async (req, res) => {
  try {
    const { conversation, prompt } = req.body;

    const chatRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            prompt === ""
              ? `
You are a personality test API. Read users input and return one personality that best matches the context based on the following types. Your return format should be a JSON, and the keys are title, content, and reason.
 
	[
	{
	"title": "Self-direction Thought",
	"content": "<ul><li>Being creative</li><li>Forming one’s own opinions and have original ideas</li><li>Learning things for oneself and improving one’s abilities</li></ul>"
	},
	{
	"title": "Self-direction Action",
	"content": "<ul><li>Making one’s own decisions about life</li><li>Doing everything independently</li><li>Appreciating the freedom to choose what one does</li></ul>"
	},
	{
	"title": "Stimulation",
	"content": "<ul><li>Always looking for different kinds of things to do</li><li>Seeking excitement in life</li><li>Having all sorts of new experiences</li></ul>"
	},
	{
	"title": "Hedonism",
	"content": "<ul><li>Having a good time</li><li>Enjoying life’s pleasures</li><li>Taking advantage of every opportunity to have fun</li></ul>"
	},
	{
	"title": "Achievement",
	"content": "<ul><li>Being ambitious</li><li>Seeking success</li><li>Wanting people to admire own achievements</li></ul>"
	},
	{
	"title": "Power Dominance",
	"content": "<ul><li>Wanting people to do what one says</li><li>Aspiring to be the most influential person in any group</li><li>Yearning to be the one who tells others what to do</li></ul>"
	},
	{
	"title": "Power Resources",
	"content": "<ul><li>Having the feeling of power that money can bring</li><li>Being wealthy</li><li>Pursue high status and power</li></ul>"
	},
	{
	"title": "Face",
	"content": "<ul><li>Avoiding to be shamed</li><li>Protecting one’s public image</li><li>Wanting people to always treat one with respect and dignity</li></ul>"
	},
	{
	"title": "Security Personal",
	"content": "<ul><li>Avoiding anything that might endanger one’s safety</li><li>Prioritise personal security</li><li>Living in secure surroundings</li></ul>"
	},
	{
	"title": "Security Societal",
	"content": "<ul><li>Place importance on one country ’s ability to protect itself against all threats</li><li>Wanting the state to be strong so it can defend its citizens</li><li>Appreciate order and stability in society</li></ul>"
	},
	{
	"title": "Tradition",
	"content": "<ul><li>Maintaining traditional values or beliefs</li><li>Following family customs or the customs of a religion</li><li>Valuing the traditional practices of one’s culture</li></ul>"
	},
	{
	"title": "Humility",
	"content": "<ul><li>Trying not to draw attention to oneself</li><li>Being humble</li><li>Being satisfied with what one has and not to ask for more</li></ul>"
	},
	{
	"title": "Benevolence Caring",
	"content": "<ul><li>Helping the people dear to one</li><li>Caring for the well-being of people one is close to</li><li>Always trying to be responsive to the needs of one’s family and friends</li></ul>"
	},
	{
	"title": "Benevolence Dependability",
	"content": "<ul><li>Being loyal to those who are close</li><li>Going out of one’s way to be a dependable and trustworthy friend</li><li>Wanting to be completely reliable to those one spends time with</li></ul>"
	},
	{
	"title": "Universalism Concern",
	"content": "<ul><li>Protecting the weak and vulnerable members of society</li><li>Finding it important that every person in the world have equal opportunities in life</li><li>Wanting everyone to be treated justly, even people one doesn’t know</li></ul>"
	},
	{
	"title": "Universalism Nature",
	"content": "<ul><li>Believing strongly one should care for nature</li><li>Working against threats to the world of nature</li><li>Protecting the natural environment from destruction or pollution</li></ul>"
	},
	{
	"title": "Universalism Tolerance",
	"content": "<ul><li>Working to promote harmony and peace among diverse groups</li><li>Listening to people who are different</li><li>Seeking to understand people, even if one disagrees with them</li></ul>"
	}
	]
	`
              : `${prompt} 
Your return format should be a JSON, and the keys are title, content, and reason.
		`,
        },
        {
          role: "user",
          content: `Here is the context, which is a conversation between different users: ${conversation}`,
        },
      ],
    });
    return res.json({ ok: true, response: chatRes });
  } catch (err) {
    console.error(err);
    return res.json({ ok: false });
  }
};

const chatImaginePickle: RequestHandler = async (req, res) => {
  try {
    const { conversation, category, description, prompt } = req.body;

    const chatRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: `
					The group of people is of personality type: ${category}. This means they are: 
					${description}

Here is the conversation: ${conversation}`,
        },
      ],
    });
    return res.json({ ok: true, response: chatRes });
  } catch (err) {
    console.error(err);
    return res.json({ ok: false });
  }
};

const chatGeneralPrompt: RequestHandler = async (req, res) => {
  try {
    const { prompt } = req.body;

    const chatRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    return res.json({ ok: true, response: chatRes });
  } catch (err) {
    console.error(err);
    return res.json({ ok: false });
  }
};

const chatGenerateHeadlineFromPoll: RequestHandler = async (req, res) => {
  try {
    const { headlinePrompt, pollResult } = req.body;

    const chatRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `You are a tabloid journalist that looks at the results of a poll, and generates a news headline ${headlinePrompt}. 
    
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

export {
  chatGenerateHeadlineFromPoll,
  chatGeneralPrompt,
  chatCategoriseConversation,
  chatImaginePickle,
};
