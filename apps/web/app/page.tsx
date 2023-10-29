"use client";
import { useSyncedStore } from "@syncedstore/react";
import { useMemo } from "react";
import { store, status as connStatus } from "./store";

// Get the Yjs document and sync automatically using y-webrtc

export default function Page(): JSX.Element {
  const state = useSyncedStore(store);

  const status = useMemo(() => connStatus(), [state]);

  return (
    <main>
      hey
      {status ? "connected" : "no"}
      {state.vehicles.length}
      <input id="input1" type="text" />
      <button
        onClick={() => {
          const inputElem = document.getElementById(
            "input1"
          ) as HTMLInputElement | null;
          if (inputElem === null) return;
          state.vehicles.push({
            color: "pink",
            brand: inputElem.value,
          });
        }}
        type="button"
      >
        Test it
      </button>
      {state.vehicles.map((v, i) => (
        <div key={`vehicle_${i}+${v.brand}`}>
          {v.brand} , {v.color}
        </div>
      ))}
    </main>
  );
}
