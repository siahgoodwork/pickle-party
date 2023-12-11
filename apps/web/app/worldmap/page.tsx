"use client";
import { useSyncedStore } from "@syncedstore/react";
import { store } from "../store";

export default function Page(): React.ReactElement {
  const { room, pollResults } = useSyncedStore(store);

  const showingPollResults = pollResults[room.activePollResult || ""];

  const totalVotes =
    showingPollResults === undefined
      ? 0
      : Object.values(showingPollResults.choices)
          .flat()
          .map((c) => c.voters)
          .flat().length;

  if (showingPollResults === undefined) {
    return <div />;
  }

  return (
    <div
      className="absolute top-0 left-0 w-full h-full"
      style={{ backgroundImage: "url(/bg.jpg)", backgroundSize: "cover" }}
    >
      <div className="absolute video-frame left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <div className="relative flex items-center w-full h-full p-12 bg-[#f6ff65]/80">
          <div className="w-full relative top-[8%]">
            <img
              src="/continents.svg"
              alt="world map"
              className="block w-full h-auto"
            />
            {[
              { id: "where-asia", text: "Asia", pos: { x: 70, y: 30 } },
              {
                id: "where-na",
                text: "North America",
                pos: { x: 23, y: 15 },
              },
              {
                id: "where-sa",
                text: "South America",
                pos: { x: 25, y: 65 },
              },
              { id: "where-africa", text: "Africa", pos: { x: 53, y: 60 } },
              { id: "where-europe", text: "Europe", pos: { x: 50, y: 20 } },
              {
                id: "where-oceania",
                text: "Oceania",
                pos: { x: 80, y: 75 },
              },
            ].map((option) => (
              <span
                key={option.id}
                className="absolute translate-x-[-50%] shadow translate-y-[-50%] bg-white rounded-[10px] [&:hover]:opacity-80 [&:hover]:bg-white px-2 text-[2vh] border-[#00f0ff] border-[2px] text-[#5d49d6] font-vcr"
                style={{
                  top: `${option.pos.y}%`,
                  left: `${option.pos.x}%`,
                }}
              >
                {(
                  ((showingPollResults.choices[option.id]?.voters.length || 0) / //eslint-disable-line @typescript-eslint/no-unnecessary-condition -- some choices might not be populated yet
                    totalVotes) *
                  100
                ).toFixed(0)}
                % {option.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
