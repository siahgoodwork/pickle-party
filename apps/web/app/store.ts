"use client";

import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { WebsocketProvider } from "y-websocket";
import type {
  Room,
  Poll,
  PollResult,
  HeadlinePrompt,
  Headline,
  ChatMessage,
  GifSubmission,
  GifFeedItem,
  ChatOutput,
} from "pickle-types";

// Create your SyncedStore store
export const store = syncedStore<{
  polls: Record<string, Poll>;
  pollResults: Record<string, PollResult>;
  headlines: Headline[];
  headlinePrompts: HeadlinePrompt[];
  otherPrompts: {
    chatCategory?: string;
    pollHeadlines?: string;
    imaginePickle?: string;
  };
  chat: ChatMessage[];
  chatOutput: Partial<ChatOutput>;
  gifSubmissions: GifSubmission[];
  gifFeedItems: GifFeedItem[];
  room: Partial<Room>;

  // jian hong's 10 GPT headlines from 10 polls
  selectedPollResultsForHeadlines: string[];
  tenHeadlines: string[];
}>({
  room: {},
  polls: {},
  pollResults: {},
  headlines: [],
  headlinePrompts: [],
  gifSubmissions: [],
  gifFeedItems: [],
  chat: [],
  chatOutput: {},
  otherPrompts: {},
  selectedPollResultsForHeadlines: [],
  tenHeadlines: [],
});

// Create a document that syncs automatically using Y-websocket
const doc = getYjsDoc(store);

//enable garbage collection
doc.gc = true;

const websocketProvider = new WebsocketProvider(
  process.env.NEXT_PUBLIC_YWEBSOCK_HOST || "ws://localhost:1234",
  "pickle1",
  doc
);

export const disconnect: () => void = () => {
  websocketProvider.disconnect();
};
export const connect: () => void = () => {
  websocketProvider.connect();
};

export { websocketProvider };
