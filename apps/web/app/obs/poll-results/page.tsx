"use client";

import { useSyncedStore } from "@syncedstore/react";
import { useEffect } from "react";
import { store } from "../../store";
import { wherePoll } from "../../sm/polls";

export default function Page(): React.ReactElement {
  useEffect(() => {
    const body = document.querySelector("body");
    if (body === null) {
      return;
    }
    body.style.background = "transparent";
  }, []);
  const { room, pollResults, polls } = useSyncedStore(store);

  const showingPollResults = pollResults[room.activePollResult || ""];
  const prPoll =
    showingPollResults?.id === "where-poll"
      ? wherePoll
      : polls[room.activePollResult || ""];

  if (showingPollResults === undefined || prPoll === undefined) {
    return <div />;
  }

  const totalVotes = Object.values(showingPollResults.choices)
    .flat()
    .map((c) => c.voters)
    .flat().length;

  return (
    <div className="w-full h-full">
      <div
        style={{
          top:
            room.pollResultLayout === "A"
              ? 0
              : room.pollResultLayout === "B"
              ? "66%"
              : 0,
          left:
            room.pollResultLayout === "A"
              ? "50%"
              : room.pollResultLayout === "B"
              ? 0
              : "50%",
          width:
            room.pollResultLayout === "A"
              ? "50%"
              : room.pollResultLayout === "B"
              ? "100%"
              : "50%",
          height:
            room.pollResultLayout === "A"
              ? "100%"
              : room.pollResultLayout === "B"
              ? "34%"
              : "50%",
        }}
        className="absolute flex flex-col items-center justify-center bg-white gap-[3vh] p-12"
      >
        <div className="text-center text-[5vh]">{prPoll.question}</div>
        <div
          className={`grid gap-4 w-full px-16 ${
            room.pollResultLayout === "A"
              ? "grid-cols-1"
              : room.pollResultLayout === "B"
              ? "grid-cols-4"
              : "grid-cols-2"
          }`}
        >
          {Object.values(showingPollResults.choices).map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-start gap-[3vw]"
            >
              <span
                className="text-[3vh] w-[40%] text-right"
                title={c.voters.join(",")}
              >
                {((c.voters.length / totalVotes) * 100).toFixed(0)}%
              </span>
              <span className="text-[3vh]">
                {prPoll?.choices.find((_c) => _c.id === c.id)?.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
