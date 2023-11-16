import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { WebsocketProvider } from "y-websocket";
import express from "express";
import { Room } from "pickle-types";
import { Y } from "@syncedstore/core";
import { Poll } from "pickle-types";

import bodyParser from "body-parser";
import {
  chatCategoriseConversation,
  chatGeneralPrompt,
  chatGenerateHeadlineFromPoll,
  chatImaginePickle,
} from "./openai";

export const store = syncedStore<{
  room: Partial<Room>;
}>({ room: {} });

const doc = getYjsDoc(store);

// Start a y-websocket server, e.g.: HOST=localhost PORT=1234 npx y-websocket-server

const wsProvider = new WebsocketProvider(
  "wss://pickle-yjs-websocket.goodwork.run",
  "my-roomname",
  doc,
  {
    WebSocketPolyfill: require("ws"),
  }
);

wsProvider.on("status", (event: any) => {
  console.log(event);
});

wsProvider.on("sync", (synced: boolean) => {
  console.log(synced);
  const polls = doc.get("polls") as Y.Array<Poll>;
});

doc.on("update", () => {
  const a = doc.getArray<{ color: string; brand: string }>("vehicles");
  console.log(a.toJSON());
});

const app = express();

app.use(bodyParser.json());

app.post("/chat/categorise-conversation", chatCategoriseConversation);
app.post("/chat/imagine-pickle", chatImaginePickle);
app.post("/chat/headline", chatGenerateHeadlineFromPoll);

app.listen(process.env.PORT || 4000);
