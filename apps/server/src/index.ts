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

const store = syncedStore<{
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
