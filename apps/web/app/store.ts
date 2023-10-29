import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { WebsocketProvider } from "y-websocket";

interface Vehicle {
  color: string;
  brand: string;
}

// Create your SyncedStore store
export const store = syncedStore({
  vehicles: [] as Vehicle[],
  fragment: "xml",
});

// Create a document that syncs automatically using Y-websocket
const doc = getYjsDoc(store);
const websocketProvider = new WebsocketProvider(
  "ws://localhost:1234",
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
