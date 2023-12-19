import { JSONValue } from "@syncedstore/core";
interface Room {
  activePoll: string;
  password: string;
  activePollResult: string;
  activePollTrivia: string;
  pollLayout: "A" | "B" | "C" | "D" | "E";
  chatOn: boolean;
  showPollView: "poll" | "result" | false;
  showPollTrivia: boolean;
  showMemes: boolean;
  showTicker: boolean;
  showDoubleTicker: boolean;
  youtubeEmbedUrl: string;
  chatBanned: string[];
  gifSearchOn: boolean;
  curtains: boolean;
}

interface Poll {
  id: string;
  question: string;
  choices: PollChoice[];
  trivia: string;
  thankyouMessage?: string;
  order?: number;
  group?: "A" | "B" | "C" | "D" | "E";
}

interface WherePoll extends Poll {
  id: "where-poll";
  question: string;
  choices: PollChoice[];
  trivia: string;
}

interface PollChoice {
  id: string;
  text: string;
}

interface PollResult {
  id: string;
  choices: Record<string, PollChoiceResult>;
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

interface ChatOutput {
  heading: string;
  body: string;
  imageUrl: string;
  pickleName: string;
}

interface GifSubmission {
  url: string;
  sender: string;
}

interface GifFeedItem {
  url: string;
  sender: string;
}

export type {
  Room,
  WherePoll,
  Poll,
  PollResult,
  HeadlinePrompt,
  Headline,
  ChatMessage,
  GifSubmission,
  GifFeedItem,
  ChatOutput,
};
