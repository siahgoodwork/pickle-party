import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

export const store = syncedStore({
  vehicles: [],
  fragment: "xml",
});

const doc = getYjsDoc(store);

// Start a y-websocket server, e.g.: HOST=localhost PORT=1234 npx y-websocket-server

const wsProvider = new WebsocketProvider(
  "ws://localhost:1234",
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
});

doc.on("update", () => {
  const a = doc.getArray<{ color: string; brand: string }>("vehicles");
  console.log(a.toJSON());
});
