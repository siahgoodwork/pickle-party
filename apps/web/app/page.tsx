"use client";
import { useSyncedStore } from "@syncedstore/react";
import { store } from "./store";
import { Tab } from "@headlessui/react";

// Get the Yjs document and sync automatically using y-webrtc

export default function Page(): JSX.Element {
  const state = useSyncedStore(store);

  return (
    <main>
      <Tab.Group>
        <Tab.List>Polls</Tab.List>
        <Tab.List>Results</Tab.List>
        <Tab.List>Stage</Tab.List>
      </Tab.Group>
      <Tab.Panel>
        <button
          onClick={() => {
            state.polls.push({
              question: "Hey man",
              choices: ["holy moly", "holy cow", "duck"],
            });
          }}
          type="button"
        >
          Add pll
        </button>
        {state.polls.length}
      </Tab.Panel>
    </main>
  );
}
