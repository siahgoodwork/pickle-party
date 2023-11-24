import { JSONValue } from "@syncedstore/core";
interface Room {
  activePoll: string;
  activePollResult: string;
  pollLayout: "A" | "B" | "C";
  pollResultLayout: "A" | "B" | "C";
  chatOn: boolean;
  chatBanned: string[];
}

interface Poll {
  id: string;
  question: string;
  choices: PollChoice[];
}

interface WherePoll extends Poll {
  id: "where-poll";
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

interface ChatMessage {
  id: string;
  message: string;
  sender: string;
  timestamp: string; // unix timestamp stored as string
  admin?: boolean;
}

export type {
  Room,
  WherePoll,
  Poll,
  PollResult,
  HeadlinePrompt,
  Headline,
  ChatMessage,
};
