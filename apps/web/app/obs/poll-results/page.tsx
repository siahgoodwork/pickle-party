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
        {prPoll.id === "where-poll" ? (
          <div className="relative w-full">
            <img
              src="/continents.svg"
              alt="world map"
              className="block w-full h-auto"
            />
            {[
              { id: "where-asia", text: "asia", pos: { x: 70, y: 30 } },
              { id: "where-na", text: "north america", pos: { x: 23, y: 15 } },
              { id: "where-sa", text: "south america", pos: { x: 25, y: 65 } },
              { id: "where-africa", text: "africa", pos: { x: 53, y: 60 } },
              { id: "where-europe", text: "europe", pos: { x: 50, y: 20 } },
              { id: "where-oceania", text: "oceania", pos: { x: 80, y: 75 } },
            ].map((option) => (
              <span
                key={option.id}
                className="absolute translate-x-[-50%] shadow translate-y-[-50%] bg-white rounded-[40px] [&:hover]:opacity-80 [&:hover]:bg-white px-2 text-[2vh]"
                style={{ top: `${option.pos.y}%`, left: `${option.pos.x}%` }}
              >
                {(
                  ((showingPollResults.choices[option.id]?.voters.length || 0) / //eslint-disable-line @typescript-eslint/no-unnecessary-condition -- some choices might not be populated yet
                    totalVotes) *
                  100
                ).toFixed(0)}
                % - {option.text}
              </span>
            ))}
          </div>
        ) : (
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
                  {prPoll.choices.find((_c) => _c.id === c.id)?.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
