import { useSyncedStore } from "@syncedstore/react";
import type { PollResult } from "pickle-types";
import { useCallback } from "react";
import { store } from "./store";
import { wherePoll } from "./sm/polls";

type ValueOf<T> = T[keyof T] | undefined;

export function PollView({ userId }: { userId: string }): React.ReactElement {
  const { room, polls, pollResults } = useSyncedStore(store);

  // const pollLayout = room.pollLayout || "A";
  const activePoll = { ...polls, "where-poll": wherePoll }[
    room.activePoll || ""
  ];

  const showingPollResults = pollResults[room.activePollResult || ""];
  const prPoll =
    showingPollResults?.id === "where-poll"
      ? wherePoll
      : polls[room.activePollResult || ""];

  const totalVotes =
    showingPollResults === undefined
      ? 0
      : Object.values(showingPollResults.choices)
          .flat()
          .map((c) => c.voters)
          .flat().length;

  const userHasVotedActivePoll =
    activePoll === undefined
      ? false
      : pollResults[activePoll.id]?.choices === undefined
      ? false
      : Object.values(pollResults[activePoll.id]?.choices || {})
          .map((c) => c.voters)
          .flat()
          .includes(userId);

  const sendVote = useCallback(
    (optionId: string) => {
      if (room.activePoll === undefined) {
        return;
      }

      const thisPollResult = pollResults[room.activePoll];
      if (thisPollResult === undefined) {
        // insert new poll result object
        const _newResult: PollResult = {
          id: room.activePoll,
          choices: { [optionId]: { id: optionId, voters: [userId] } },
        };
        pollResults[room.activePoll] = _newResult;
      } else {
        const optionRef = thisPollResult.choices[optionId] as ValueOf<
          PollResult["choices"]
        >;

        // insert option
        if (optionRef !== undefined) {
          if (Array.isArray(optionRef.voters)) {
            optionRef.voters.push(userId);
          } else {
            optionRef.voters = [userId];
          }
        } else {
          thisPollResult.choices[optionId] = {
            id: optionId,
            voters: [userId],
          };
        }
      }
    },
    [userId, pollResults, room.activePoll]
  );

  return (
    <div
      className={`h-full grid-rows-2 ${
        room.pollLayout === "B" ? "grid row-span-4" : "block"
      }`}
    >
      {room.showPollView === "poll" ? (
        activePoll === undefined ? (
          false
        ) : (
          <div
            className={`flex flex-col justify-center p-4 text-black z-4 gap-4  bg-[#f6ff65]/80 ${
              room.pollLayout === "C"
                ? "h-full"
                : room.pollLayout === "D"
                ? "w-[22.91%] h-[55%] top-[22.5%] left-[38.54%] absolute"
                : room.pollLayout === "E"
                ? "w-[22.91%] h-[55%] top-[18.51%] left-[20.83%] absolute"
                : ""
            }`}
          >
            {userHasVotedActivePoll ? (
              <>
                <h2 className="my-4 text-lg text-center">
                  {activePoll.question}
                </h2>
                <span className="text-center">
                  {polls[room.activePoll || ""]?.thankyouMessage ===
                    undefined ||
                  polls[room.activePoll || ""]?.thankyouMessage?.length === 0
                    ? "Thank you for your response"
                    : polls[room.activePoll || ""]?.thankyouMessage}
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center justify-start w-full h-full gap-2 flex-nowrap">
                {polls[room.activePoll || ""] === undefined &&
                room.activePoll !== "where-poll" ? (
                  false
                ) : room.activePoll === "where-poll" ? (
                  <>
                    <h2 className="my-4 text-lg text-center leading-[1.15]">
                      {activePoll.question}
                    </h2>
                    <div
                      className={`flex w-full gap-2 ${
                        room.pollLayout === "B" || room.pollLayout === "D"
                          ? "flex-col flex-nowrap"
                          : "justify-center flex-wrap"
                      }`}
                    >
                      {wherePoll.choices.map((c) => (
                        <button
                          type="button"
                          key={c.id}
                          className={`${
                            room.pollLayout === "B" ||
                            room.pollLayout === "D" ||
                            room.pollLayout === "E"
                              ? "w-full"
                              : "w-[30%]"
                          } border-0 hover:bg-white/10`}
                          onClick={() => {
                            sendVote(c.id);
                          }}
                        >
                          {c.text}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="my-4 text-lg text-center leading-[1.15]">
                      {activePoll.question}
                    </h2>
                    <div
                      className={`flex w-full gap-2 ${
                        room.pollLayout === "B" || room.pollLayout === "D"
                          ? "flex-col"
                          : "justify-center flex-wrap"
                      }`}
                    >
                      {polls[room.activePoll || ""]?.choices.map((c) => (
                        <button
                          type="button"
                          key={c.id}
                          className={`${
                            room.pollLayout === "B" ||
                            room.pollLayout === "D" ||
                            room.pollLayout === "E"
                              ? "w-full"
                              : "w-[20%]"
                          } border-0 hover:bg-white/10`}
                          onClick={() => {
                            sendVote(c.id);
                          }}
                        >
                          {c.text}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )
      ) : room.showPollView === "result" && showingPollResults !== undefined ? (
        room.activePollResult === "where-poll" ? (
          room.pollLayout === "C" ? (
            <div className="relative flex items-center w-full h-full p-12 bg-[#f6ff65]/80">
              <div className="w-full relative top-[8%]">
                <img
                  src="/continents.svg"
                  alt="world map"
                  className="block w-full h-auto"
                />
                {[
                  { id: "where-asia", text: "asia", pos: { x: 70, y: 30 } },
                  {
                    id: "where-na",
                    text: "north america",
                    pos: { x: 23, y: 15 },
                  },
                  {
                    id: "where-sa",
                    text: "south america",
                    pos: { x: 25, y: 65 },
                  },
                  { id: "where-africa", text: "africa", pos: { x: 53, y: 60 } },
                  { id: "where-europe", text: "europe", pos: { x: 50, y: 20 } },
                  {
                    id: "where-oceania",
                    text: "oceania",
                    pos: { x: 80, y: 75 },
                  },
                ].map((option) => (
                  <span
                    key={option.id}
                    className="absolute translate-x-[-50%] shadow translate-y-[-50%] bg-white rounded-[40px] [&:hover]:opacity-80 [&:hover]:bg-white px-2 text-[2vh]"
                    style={{
                      top: `${option.pos.y}%`,
                      left: `${option.pos.x}%`,
                    }}
                  >
                    {(
                      ((showingPollResults.choices[option.id]?.voters.length || //eslint-disable-line @typescript-eslint/no-unnecessary-condition -- some choices might not be populated yet
                        0) /
                        totalVotes) *
                      100
                    ).toFixed(0)}
                    % - {option.text}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            false
          )
        ) : room.pollLayout === "B" && prPoll !== undefined ? (
          <div className="flex flex-col justify-center bg-[#f6ff65]/80">
            {Object.values(prPoll.choices).map((c) => {
              const resultChoice = showingPollResults.choices[c.id];

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-start gap-[1vw]"
                >
                  <span className="text-[1.3vw] w-[40%] text-right">
                    {(
                      ((resultChoice?.voters.length || 0) / totalVotes) * //eslint-disable-line @typescript-eslint/no-unnecessary-condition -- some choices might not be populated yet
                      100
                    ).toFixed(0)}
                    %
                  </span>
                  <span className="text-[1.3vw]">
                    {prPoll.choices.find((_c) => _c.id === c.id)?.text}
                  </span>
                </div>
              );
            })}
          </div>
        ) : room.pollLayout === "D" && prPoll !== undefined ? (
          <div className="w-[22.91%] h-[55%] top-[22.5%] left-[38.54%] absolute bg-[#f6ff65]/80 flex flex-col justify-center">
            {Object.values(prPoll.choices).map((c) => {
              const resultChoice = showingPollResults.choices[c.id];

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-start gap-[1vw]"
                >
                  <span className="text-[1.3vw] w-[40%] text-right">
                    {(
                      ((resultChoice?.voters.length || 0) / totalVotes) * //eslint-disable-line @typescript-eslint/no-unnecessary-condition -- some choices might not be populated yet
                      100
                    ).toFixed(0)}
                    %
                  </span>
                  <span className="text-[1.3vw]">
                    {prPoll.choices.find((_c) => _c.id === c.id)?.text}
                  </span>
                </div>
              );
            })}
          </div>
        ) : room.pollLayout === "E" && prPoll !== undefined ? (
          <div className="w-[20.83%] h-[50.92%] top-[18.52%] left-[20.83%] absolute bg-[#f6ff65]/80 flex flex-col justify-center">
            {Object.values(prPoll.choices).map((c) => {
              const resultChoice = showingPollResults.choices[c.id];

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-start gap-[1vw]"
                >
                  <span className="text-[1.3vw] w-[40%] text-right">
                    {(
                      ((resultChoice?.voters.length || 0) / totalVotes) * //eslint-disable-line @typescript-eslint/no-unnecessary-condition -- some choices might not be populated yet
                      100
                    ).toFixed(0)}
                    %
                  </span>
                  <span className="text-[1.3vw]">
                    {prPoll.choices.find((_c) => _c.id === c.id)?.text}
                  </span>
                </div>
              );
            })}
          </div>
        ) : prPoll !== undefined ? (
          <div
            className={`flex flex-wrap justify-center items-center p-4 bg-[#f6ff65]/50 ${
              room.pollLayout === "C" ? "h-full" : "h-auto"
            }`}
          >
            {Object.values(prPoll.choices).map((c) => {
              const resultChoice = showingPollResults.choices[c.id];

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-start gap-[1vw] w-[25%]"
                >
                  <span className="text-[1.3vw] w-[40%] text-right">
                    {(
                      ((resultChoice?.voters.length || 0) / totalVotes) * //eslint-disable-line @typescript-eslint/no-unnecessary-condition -- some choices might not be populated yet
                      100
                    ).toFixed(0)}
                    %
                  </span>
                  <span className="text-[1.3vw]">
                    {prPoll.choices.find((_c) => _c.id === c.id)?.text}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          false
        )
      ) : (
        false
      )}
      {room.showPollTrivia && room.activePollTrivia !== undefined ? (
        room.pollLayout === "B" ? (
          <div className="flex items-center justify-center p-4 text-center bg-[#b3f5b2]/80 row-start-2 row-span-1 text-[1.2vw]">
            {polls[room.activePollTrivia]?.trivia}
          </div>
        ) : room.pollLayout === "D" ? (
          <div className="flex items-center justify-center p-4 text-center bg-[#b3f5b2]/80 row-start-2 row-span-1 text-[1.2vw] top-[0] left-[68.23%] w-[21.35%] h-[50.75%] absolute">
            {polls[room.activePollTrivia]?.trivia}
          </div>
        ) : room.pollLayout === "E" ? (
          <div className="flex items-center justify-center p-4 text-center bg-[#b3f5b2]/80 row-start-2 row-span-1 text-[1.2vw] top-[30.55%] left-[58.33%] w-[20.83%] h-[50.92%] absolute">
            {polls[room.activePollTrivia]?.trivia}
          </div>
        ) : (
          false
        )
      ) : (
        false
      )}
    </div>
  );
}
