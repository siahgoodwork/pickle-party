import type { RequestHandler } from "express";
import OpenAI from "openai";
import { config } from "dotenv";

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatCategoriseConversation: RequestHandler = async (req, res) => {
  try {
    const { conversation } = req.body;

    const chatRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
You are a personality test API. Read users input and return one personality that best matches the context based on the following types. You return format should be a JSON, and the keys are title, content, and reason.
 
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
	"title": "Conformity Rules",
	"content": "<ul><li>Believing one should always do what people in authority say</li><li>Following rules even when no one is watching</li><li>Obeying all the laws</li></ul>"
	},
	{
	"title": "Conformity Interpersonal",
	"content": "<ul><li>Avoiding to upset other people</li><li>Thinking it is important never to be annoying to anyone</li><li>Always trying to be tactful and avoid irritating people.</li></ul>"
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
    const { conversation, category, description } = req.body;

    const chatRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Here's a list of food items: 
- Cucumbers (Pickles)
- Carrots
- Radishes
- Onions
- Garlic
- plastic bag
- cars
- Green Beans
- Cauliflower
- Bell Peppers
- Eggs
- Herring (Matjes)
- Mango
- Lemons
- Watermelon Rind
- Cherries
- Apples
- Pears
- Ginger
- Turnips
- Pineapple
- Peaches
- Tomatoes
- Zucchini
- Cabbage
- Brussels Sprouts
- Okra
- Figs
- Plums
- Swiss Chard Stems
- Snap Peas
- Radish Greens
- Artichokes
- Shrimp
- Lime
- Strawberries
- Avocado
- Green Tomatillos
- Papaya
- Blueberries
- Rhubarb
- Cranberries
- Pumpkin
- Escarole
- Capers
- Tofu
- Cheese (e.g., Feta)
- Hot Peppers
- Turkey
- Chicken Feet (in some Asian cuisines)

Here are some known pickling methods: 
1 Brine Fermentation
2 Vinegar Pickling
3 Quick Pickling
4 Lacto-Fermentation
5 Canning
6 Refrigerator Pickles
7 Dry Salt Pickling
8 Preserving in Alcohol (e.g., Pickled Cherries in Brandy)
9 Oil Pickling
10 Soy Sauce Pickling
11 Pressure Canning
12 Water Bath Canning
13 Freezer Pickling
14 Kimchi Fermentation
15 Pickling in Wine
16 Honey Pickling
17 Pickling in Fruit Juice (e.g., Apple Cider)
18 Fermenting with Kombucha
19 Spiced Pickling
20 Pickling in Fish Sauce

For a group of people, whose personality type is provided, take inspiration from their conversation and suggest a pickle dish using a pickling method and a food item above that best matches them. Give a creative name for the pickle dish. 
					`,
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
