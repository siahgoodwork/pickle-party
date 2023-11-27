import { useSyncedStore } from "@syncedstore/react";
import type { PollResult } from "pickle-types";
import { useCallback } from "react";
import { store } from "./store";
import { wherePoll } from "./sm/polls";

type ValueOf<T> = T[keyof T] | undefined;

export function PollView({ userId }: { userId: string }): React.ReactElement {
  const { room, polls, pollResults } = useSyncedStore(store);

  const pollLayout = room.pollLayout || "A";
  const activePoll = { ...polls, "where-poll": wherePoll }[
    room.activePoll || ""
  ];
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

  if (activePoll === undefined) {
    return <div />;
  }

  return (
    <div
      className={`z-4 absolute bg-white text-black p-4 flex flex-col justify-center gap-4 ${
        pollLayout === "A"
          ? "left-[50%] top-[0] w-[50%] h-full"
          : pollLayout === "B"
          ? "left-0 top-[66.7%] w-full h-[33.3%]"
          : ""
      }`}
    >
      <h2 className="my-4 text-lg text-center">{activePoll.question}</h2>
      {room.activePoll === "where-poll" ? (
        userHasVotedActivePoll ? (
          <span className="text-center">Thank you for your response</span>
        ) : (
          <div className="relative">
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
              { id: "where-oceania", text: "oceania", pos: { x: 83, y: 75 } },
            ].map((option) => (
              <button
                type="button"
                onClick={() => {
                  sendVote(option.id);
                }}
                key={option.id}
                className="absolute translate-x-[-50%] translate-y-[-50%] bg-white rounded-[40px] [&:hover]:opacity-80 [&:hover]:bg-white px-2 text-sm"
                style={{ top: `${option.pos.y}%`, left: `${option.pos.x}%` }}
              >
                {option.text}
              </button>
            ))}
          </div>
        )
      ) : userHasVotedActivePoll ? (
        <span className="text-center">Thank you for your response</span>
      ) : (
        <div
          className={`gap-2 flex ${
            room.pollLayout === "A"
              ? "flex-col flex-nowrap"
              : "flex-row flex-wrap justify-center"
          }`}
        >
          {polls[room.activePoll || ""] === undefined ? (
            false
          ) : (
            <>
              {polls[room.activePoll || ""]?.choices.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={`${
                    room.pollLayout === "A" ? "w-full" : "w-[20%]"
                  }`}
                  onClick={() => {
                    sendVote(c.id);
                  }}
                >
                  {c.text}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
