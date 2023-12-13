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
            className={`flex flex-col justify-center text-black z-4 gap-2  pointer-events-auto ${
              room.pollLayout === "A"
                ? "p-4 bg-[#D8FECC]/90"
                : room.pollLayout === "C"
                ? "h-full bg-[transparent]"
                : room.pollLayout === "D"
                ? "w-[22.91%] h-[55%] top-[22.5%] left-[38.54%] absolute  bg-[#f6ff65]/90"
                : room.pollLayout === "E"
                ? "w-[22.91%] h-[55%] top-[18.51%] left-[20.83%] absolute  bg-[#f6ff65]/90"
                : ""
            }`}
          >
            {userHasVotedActivePoll ? (
              <>
                {room.pollLayout === "A" || room.pollLayout === "C" ? (
                  <h2 className="p-4 text-[1.7vw] leading-[1.1] m-0 text-[#fe52f8] text-center">
                    {activePoll.question}
                  </h2>
                ) : (
                  <h2 className="p-4 pt-8 text-[1.5vw] leading-[1.15] poll-heading-gradient">
                    {activePoll.question}
                  </h2>
                )}
                <span
                  className={`text-[1.35vw] items-center flex text-center justify-center mx-4 ${
                    room.pollLayout === "B" ||
                    room.pollLayout === "D" ||
                    room.pollLayout === "E"
                      ? "flex-grow"
                      : room.pollLayout === "A"
                      ? "text-[#FE52F8]"
                      : room.pollLayout === "C"
                      ? "text-[#fe52f8]"
                      : ""
                  }`}
                >
                  {polls[room.activePoll || ""]?.thankyouMessage ===
                    undefined ||
                  polls[room.activePoll || ""]?.thankyouMessage?.length === 0
                    ? "Thank you for your response"
                    : polls[room.activePoll || ""]?.thankyouMessage}
                </span>
              </>
            ) : (
              <div
                className={`flex flex-col justify-start w-full h-full gap-2 flex-nowrap ${
                  room.pollLayout === "A"
                    ? "p-4 items-start"
                    : room.pollLayout === "C"
                    ? "justify-center items-center"
                    : "items-center "
                }`}
              >
                {polls[room.activePoll || ""] === undefined &&
                room.activePoll !== "where-poll" ? (
                  false
                ) : room.activePoll === "where-poll" ? (
                  <>
                    {room.pollLayout === "A" ? (
                      <h2 className="p-4 text-[1.7vw] leading-[1.1] m-0 text-[#fe52f8] text-left">
                        {activePoll.question}
                      </h2>
                    ) : room.pollLayout === "C" ? (
                      <h2 className="p-4 text-[1.7vw] leading-[1.1] m-0 text-[#fe52f8]">
                        {activePoll.question}
                      </h2>
                    ) : (
                      <h2 className="p-4 pt-8 text-[1.5vw] leading-[1.15] w-full poll-heading-gradient">
                        {activePoll.question}
                      </h2>
                    )}
                    <div
                      className={`flex w-full gap-2 pointer-events-auto ${
                        room.pollLayout === "B" ||
                        room.pollLayout === "D" ||
                        room.pollLayout === "E"
                          ? "flex-col flex-nowrap justify-center flex-grow"
                          : room.pollLayout === "A"
                          ? "justify-start"
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
                              ? "w-auto bg-white rounded text-black mx-8 border-black border border-2 hover:bg-white/90"
                              : room.pollLayout === "A"
                              ? "inline-block bg-white rounded text-black mx-2 border-black border border-2 hover:bg-white/90"
                              : "w-[20%] bg-[#FE52F8] text-black hover:bg-[#fe52f8]/90"
                          } text-[1.3vw] leading-[1] py-1`}
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
                    {room.pollLayout === "A" ? (
                      <h2 className="p-4 text-[1.7vw] leading-[1.1] m-0 text-[#fe52f8] text-left">
                        {activePoll.question}
                      </h2>
                    ) : room.pollLayout === "C" ? (
                      <h2 className="p-4 text-[1.7vw] leading-[1.1] m-0 text-[#fe52f8]">
                        {activePoll.question}
                      </h2>
                    ) : (
                      <h2 className="p-4 pt-8 text-[1.5vw] leading-[1.15] w-full poll-heading-gradient">
                        {activePoll.question}
                      </h2>
                    )}
                    <div
                      className={`flex w-full gap-2 ${
                        room.pollLayout === "B" ||
                        room.pollLayout === "D" ||
                        room.pollLayout === "E"
                          ? "flex-col flex-nowrap justify-center flex-grow"
                          : room.pollLayout === "A"
                          ? "justify-start"
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
                              ? "w-auto bg-white rounded text-black mx-8 border-black border border-2 hover:bg-white/90"
                              : room.pollLayout === "A"
                              ? "inline-block bg-white rounded text-black mx-2 border-black border border-2 hover:bg-white/90"
                              : "w-[20%] bg-[#FE52F8] text-black hover:bg-[#fe52f8]/90"
                          }`}
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
            <div
              className="relative flex items-center w-full h-full p-12"
              style={{
                backgroundImage: "url(/iceland.jpg)",
                backgroundSize: "cover",
              }}
            >
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
                      ((showingPollResults.choices[option.id]?.voters.length || //eslint-disable-line @typescript-eslint/no-unnecessary-condition -- some choices might not be populated yet
                        0) /
                        totalVotes) *
                      100
                    ).toFixed(0)}
                    % {option.text}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            false
          )
        ) : (room.pollLayout === "B" ||
            room.pollLayout === "D" ||
            room.pollLayout === "E") &&
          prPoll !== undefined ? (
          <div
            className={
              room.pollLayout === "B"
                ? "flex flex-col justify-center bg-[#f6ff65]/80 leading-[1]"
                : room.pollLayout === "D"
                ? "w-[22.91%] h-[55%] top-[22.5%] left-[38.54%] absolute bg-[#f6ff65]/80 flex flex-col justify-center"
                : "w-[21.35%] h-[50.92%] top-[18.52%] left-[20.83%] absolute bg-[#f6ff65]/80 flex flex-col justify-center"
            }
          >
            <h2 className="p-4 pt-8 text-[1.3vw] leading-[1.05] poll-heading-gradient">
              {prPoll.question}
            </h2>
            <div className="flex flex-col justify-center flex-grow">
              {Object.values(prPoll.choices).map((c) => {
                const resultChoice = showingPollResults.choices[c.id];

                return (
                  <div
                    key={c.id}
                    className="flex flex-col items-start justify-center p-4"
                  >
                    <span className="text-[1.3vw] text-right">
                      {(
                        ((resultChoice?.voters.length || 0) / totalVotes) * //eslint-disable-line @typescript-eslint/no-unnecessary-condition -- some choices might not be populated yet
                        100
                      ).toFixed(0)}
                      %
                    </span>
                    <span className="text-[1.2vw]">
                      {prPoll.choices.find((_c) => _c.id === c.id)?.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : prPoll !== undefined ? (
          <div
            className={`flex flex-col justify-center items-center p-4 ${
              room.pollLayout === "C"
                ? "h-full bg-transparent"
                : room.pollLayout === "A"
                ? "bg-[#d8fecc]/90"
                : "h-auto bg-[#f6ff65]/90"
            }`}
          >
            <h2 className="p-4 text-[1.7vw] leading-[1.1] m-0 text-[#fe52f8] text-center">
              {prPoll.question}
            </h2>
            <div
              className={
                room.pollLayout === "A"
                  ? "flex gap-12 flex-wrap"
                  : room.pollLayout === "C"
                  ? " text-[#fe52f8]"
                  : "flex flex-col gap-2"
              }
            >
              {Object.values(prPoll.choices).map((c) => {
                const resultChoice = showingPollResults.choices[c.id];

                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-start gap-[1vw] w-auto"
                  >
                    <span className="text-[1.5vw]">
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
          </div>
        ) : (
          false
        )
      ) : (
        false
      )}
      {room.showPollTrivia && room.activePollTrivia !== undefined ? (
        room.pollLayout === "B" ? (
          <div className="flex items-center justify-start p-4 text-left bg-[#b3f5b2]/80 row-start-2 row-span-1 text-[1.0vw] leading-[1.1] whitespace-pre-line">
            {polls[room.activePollTrivia]?.trivia}
          </div>
        ) : room.pollLayout === "D" ? (
          <div className="flex items-center justify-start p-4 text-left bg-[#b3f5b2]/80 row-start-2 row-span-1 text-[1.0vw] top-[0] left-[68.23%] w-[21.35%] h-[50.75%] absolute leading-[1.10] whitespace-pre-line">
            {polls[room.activePollTrivia]?.trivia}
          </div>
        ) : room.pollLayout === "E" ? (
          <div className="flex items-center justify-start p-4 text-left bg-[#b3f5b2]/80 row-start-2 row-span-1 text-[1.0vw] top-[30.55%] left-[58.33%] w-[21.35%] h-[50.92%] absolute leading-[1.1] whitespace-pre-line">
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
