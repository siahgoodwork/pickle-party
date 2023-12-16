import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { WebsocketProvider } from "y-websocket";
import express from "express";
import {
  Room,
  Poll,
  PollResult,
  Headline,
  HeadlinePrompt,
  ChatMessage,
  GifSubmission,
  GifFeedItem,
  ChatOutput,
} from "pickle-types";
import { config } from "dotenv";

import bodyParser from "body-parser";

import {
  chatCategoriseConversation,
  chatGeneralPrompt,
  chatGenerateHeadlineFromPoll,
  chatImaginePickle,
} from "./openai";
import { YArray } from "yjs/dist/src/internals";

config();

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

const doc = getYjsDoc(store);
const roomName = "pickle1";

const wsProvider = new WebsocketProvider(
  process.env.YWEBSOCKET_HOST || "",
  roomName,
  doc,
  {
    WebSocketPolyfill: require("ws"),
  }
);

wsProvider.on("status", (event: any) => {
  console.log(event);
});

wsProvider.on("sync", (synced: boolean) => {});

const app = express();

app.use(bodyParser.json());

app.post("/chat/categorise-conversation", chatCategoriseConversation);
app.post("/chat/imagine-pickle", chatImaginePickle);
app.post("/chat/headline", chatGenerateHeadlineFromPoll);
app.post("/chat/general", chatGeneralPrompt);

app.get("/room", (_req, res) => {
  const room = doc.getMap("room");
  const polls = doc.getMap("polls");
  const pollResults = doc.getMap("pollResults");
  const gifSubmissions = doc.getArray("gifSubmissions");
  res.json({ room, polls, pollResults, gifSubmissions });
});

app.get("/room/unban-all", (_req, res) => {
  const room = doc.getMap("room");
  const banned = room.get("chatBanned") as YArray<string>;
  banned.delete(0, banned.length);
  res.json({ room });
});

app.listen(process.env.PORT || 4000);
