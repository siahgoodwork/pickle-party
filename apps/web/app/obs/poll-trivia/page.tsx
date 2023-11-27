"use client";

import { useSyncedStore } from "@syncedstore/react";
import { useEffect } from "react";
import { store } from "../../store";

export default function Page(): React.ReactElement {
  useEffect(() => {
    const body = document.querySelector("body");
    if (body === null) {
      return;
    }
    body.style.background = "transparent";
  }, []);
  const { room, polls } = useSyncedStore(store);

  const thisPoll = polls[room.activePollTrivia || ""];

  if (thisPoll === undefined) {
    return <div />;
  }

  return (
    <div className="w-full h-full">
      <div
        style={{
          top:
            room.pollTriviaLayout === "A"
              ? 0
              : room.pollTriviaLayout === "B"
              ? "66%"
              : 0,
          left:
            room.pollTriviaLayout === "A"
              ? "50%"
              : room.pollTriviaLayout === "B"
              ? 0
              : "50%",
          width:
            room.pollTriviaLayout === "A"
              ? "50%"
              : room.pollTriviaLayout === "B"
              ? "100%"
              : "50%",
          height:
            room.pollTriviaLayout === "A"
              ? "100%"
              : room.pollTriviaLayout === "B"
              ? "34%"
              : "50%",
        }}
        className="absolute flex flex-col items-center justify-center bg-white gap-[3vh] p-12"
      >
        <div className="text-center text-[5vh] whitespace-pre-line">
          {thisPoll.trivia}
        </div>
      </div>
    </div>
  );
}
