"use client";

import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { WebsocketProvider } from "y-websocket";
import type { Room, Poll } from "pickle-types";

// Create your SyncedStore store
export const store = syncedStore<{
  polls: Poll[];
  room: Partial<Room>;
}>({
  room: {},
  polls: [],
});

// Create a document that syncs automatically using Y-websocket
const doc = getYjsDoc(store);

//enable garbage collection
doc.gc = true;

const websocketProvider = new WebsocketProvider(
  process.env.NEXT_PUBLIC_YWEBSOCK_HOST || "ws://localhost:1234",
  "my-roomname",
  doc
);

export const disconnect: () => void = () => {
  websocketProvider.disconnect();
};
export const connect: () => void = () => {
  websocketProvider.connect();
};

export const status: () => boolean = () => {
  return websocketProvider.wsconnected;
};
