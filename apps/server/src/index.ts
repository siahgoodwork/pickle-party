import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { WebsocketProvider } from "y-websocket";

export const store = syncedStore({});

const doc = getYjsDoc(store);

// Start a y-websocket server, e.g.: HOST=localhost PORT=1234 npx y-websocket-server

const wsProvider = new WebsocketProvider(
  "wss://pickle-yjs-websocket.goodwork.run",
  //"wss://pickle-yjs-websocket.goodwork.run",
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
