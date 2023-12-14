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
  };
  chat: ChatMessage[];
  gifSubmissions: GifSubmission[];
  gifFeedItems: GifFeedItem[];
  room: Partial<Room>;
}>({
  room: {},
  polls: {},
  pollResults: {},
  headlines: [],
  headlinePrompts: [],
  gifSubmissions: [],
  gifFeedItems: [],
  chat: [],
  otherPrompts: {},
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
