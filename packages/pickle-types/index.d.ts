import { JSONValue } from "@syncedstore/core";
interface Room {
  activePoll: string;
}

interface Poll {
  id: string;
  question: string;
  choices: PollChoice[];
}

interface PollChoice {
  id: string;
  text: string;
}

interface PollResult {
  id: string;
  choices: PollChoiceResult[];
}

interface PollChoiceResult {
  id: string;
  voters: string[];
}

interface Headline {
  id: string;
  text: string;
  active: boolean;
}

interface HeadlinePrompt {
  id: string;
  prompt: string;
}

export type { Room, Poll, PollResult, HeadlinePrompt, Headline };
