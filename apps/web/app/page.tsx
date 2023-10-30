"use client";
import { useSyncedStore } from "@syncedstore/react";
import { useMemo, useState } from "react";
import Marquee from "react-double-marquee";
import { store } from "./store";

// Get the Yjs document and sync automatically using y-webrtc

export default function Page(): JSX.Element {
  const state = useSyncedStore(store);
  const [userId, setUserId] = useState<string>();

  const activePoll = useMemo(
    () => state.polls.find((p) => p.id === state.room.activePoll),
    [state.room.activePoll, state.polls]
  );

  const activePollResults =
    activePoll === undefined
      ? undefined
      : state.pollResults.find((p) => p.id === activePoll.id);

  const userVotedActivePoll =
    userId === undefined
      ? false
      : state.pollResults.findIndex(
          (p) =>
            state.room.activePoll === p.id &&
            p.choices.findIndex((c) => c.voters.includes(userId)) > -1
        ) > -1;

  return (
    <main>
      <div className="py-2 text-white bg-black whitespace-nowrap">
        <Marquee direction="left">
          {state.headlines
            .filter((h) => h.active)
            .map((headline) => (
              <span key={headline.id} className="mx-8">
                {headline.text}
              </span>
            ))}
        </Marquee>
      </div>
      {userId === undefined ? (
        <div className="flex flex-col items-start p-4 gap-4">
          <h1>Who are you?</h1>
          <input
            type="text"
            id="userid_input"
            className="p-2 text-lg"
            placeholder="Your name"
          />
          <button
            type="button"
            onClick={() => {
              const id = (
                document.getElementById(
                  "userid_input"
                ) as HTMLInputElement | null
              )?.value;
              if (id !== undefined) {
                setUserId(() => id);
              }
            }}
          >
            Submit
          </button>
        </div>
      ) : (
        <div className="p-4 grid-cols-4 grid gap-4 grid-rows-4">
          <div className="col-span-3 aspect-[16/9] row-span-4">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/f_7QbCTkTOI"
              title="YouTube video player"
            />
          </div>
          <div className="col-span-1 row-span-2">
            {activePoll !== undefined ? (
              <div className="w-full h-full p-2 border border-black">
                <div>Poll</div>
                <h3 className="py-8 text-lg">{activePoll.question}</h3>
                {activePollResults && userVotedActivePoll ? (
                  <div>
                    {activePollResults.choices.map((c, _n, allChoices) => (
                      <div key={c.id}>
                        {activePoll.choices.find((cp) => cp.id === c.id)?.text}{" "}
                        -{" "}
                        {(
                          (c.voters.length /
                            allChoices.reduce(
                              (p, __c) => p + __c.voters.length,
                              0
                            )) *
                          100
                        ).toFixed(2)}{" "}
                        %
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col w-60 gap-2">
                    {activePoll.choices.map((choice) => (
                      <button
                        type="button"
                        key={choice.id}
                        onClick={() => {
                          const currentResultIndex =
                            state.pollResults.findIndex(
                              (pr) => pr.id === activePoll.id
                            );
                          if (currentResultIndex < 0) {
                            state.pollResults.push({
                              id: activePoll.id,
                              choices: activePoll.choices.map((c) => ({
                                voters: choice.id === c.id ? [userId] : [],
                                id: c.id,
                              })),
                            });
                          } else {
                            const choiceIndex = state.pollResults[
                              currentResultIndex
                            ].choices.findIndex((c) => c.id === choice.id);
                            if (choiceIndex > -1) {
                              state.pollResults[currentResultIndex].choices[
                                choiceIndex
                              ].voters.push(userId);
                            }
                          }
                        }}
                      >
                        {choice.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>No poll</div>
            )}
          </div>
          <div className="p-2 border border-black row-span-2">
            Chat goes here
          </div>
        </div>
      )}
    </main>
  );
}
