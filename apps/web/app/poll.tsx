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

  return (
    <div className="h-full grid-rows-2 grid row-span-4">
      {activePoll === undefined ? (
        false
      ) : (
        <div
          className={`z-4 bg-white text-black p-4 flex flex-col justify-center gap-4 ${
            pollLayout === "B" ? "" : ""
          }`}
        >
          <h2 className="my-4 text-lg text-center">{activePoll.question}</h2>
          {userHasVotedActivePoll ? (
            <span className="text-center">
              {polls[room.activePoll || ""]?.thankyouMessage === undefined ||
              polls[room.activePoll || ""]?.thankyouMessage?.length === 0
                ? "Thank you for your response"
                : polls[room.activePoll || ""]?.thankyouMessage}
            </span>
          ) : (
            <div
              className={`gap-2 flex flex-col flex-nowrap w-full items-center`}
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
                        room.pollLayout === "A"
                          ? "w-full"
                          : room.pollLayout === "B"
                          ? "w-[20%]"
                          : "w-[25%]"
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
      )}
      {room.showPollTrivia && room.activePollTrivia !== undefined ? (
        <div className="flex items-center justify-center p-4 text-center bg-white row-start-2 row-span-1 text-[1.2vw]">
          {polls[room.activePollTrivia]?.trivia}
        </div>
      ) : (
        false
      )}
    </div>
  );
}
