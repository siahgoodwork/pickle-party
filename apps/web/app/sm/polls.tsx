import type { Poll, WherePoll } from "pickle-types";
import { useState } from "react";
import classNames from "classnames";
import { useSyncedStore } from "@syncedstore/react";
import { nanoid } from "nanoid";
import { store } from "../store";

const btnCls = classNames(`w-10 h-10 border bg-white`);

export const wherePoll: WherePoll = {
  id: "where-poll",
  choices: [
    { id: "where-asia", text: "asia" },
    { id: "where-na", text: "north america" },
    { id: "where-sa", text: "south america" },
    { id: "where-africa", text: "africa" },
    { id: "where-europe", text: "europe" },
    { id: "where-oceania", text: "oceania" },
  ],
  question: "Which part of the world do you come from?",
  trivia: "",
};

export default function Pollmaker(): JSX.Element {
  const { polls, room } = useSyncedStore(store);
  const [pollInput, setPollInput] = useState<Poll>({
    id: "",
    question: "",
    choices: [],
    trivia: "",
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col m-2 border border-black rounded gap-2">
        <div className="flex flex-col p-2 border-b gap-2 border-b-black">
          <h3 className="font-bold">
            {pollInput.id === "" ? "New Poll" : "Edit Poll"}
          </h3>
          <input
            id="question"
            name="question"
            type="text"
            className="w-full p-2"
            placeholder="Type poll question here"
            value={pollInput.question}
            onChange={(e) => {
              setPollInput((p) => ({ ...p, question: e.target.value }));
            }}
          />
        </div>
        <div className="p-2 border-b border-black">
          <div className="flex items-center gap-4">
            <h3>Choices</h3>
            <button
              className="text-sm"
              onClick={() => {
                setPollInput((a) => {
                  return {
                    ...a,
                    choices: [...a.choices, { id: nanoid(), text: "" }],
                  };
                });
              }}
              type="button"
            >
              Add choice
            </button>
          </div>
          {pollInput.choices.map((choice, idx) => (
            <fieldset className="flex items-center py-2 gap-2" key={choice.id}>
              <button
                className={btnCls}
                disabled={idx === 0}
                onClick={() => {
                  if (idx < 1) {
                    return;
                  }
                  const newChoices = [...pollInput.choices];
                  newChoices[idx - 1] = pollInput.choices[idx];
                  newChoices[idx] = pollInput.choices[idx - 1];
                  setPollInput((p) => ({ ...p, choices: newChoices }));
                }}
                type="button"
              >
                &uarr;
              </button>
              <button
                className={btnCls}
                disabled={idx >= pollInput.choices.length - 1}
                onClick={() => {
                  if (idx >= pollInput.choices.length - 1) {
                    return;
                  }
                  const newChoices = [...pollInput.choices];
                  newChoices[idx + 1] = pollInput.choices[idx];
                  newChoices[idx] = pollInput.choices[idx + 1];
                  setPollInput((p) => ({ ...p, choices: newChoices }));
                }}
                type="button"
              >
                &darr;
              </button>
              <button
                className={btnCls}
                disabled={pollInput.choices.length < 2}
                onClick={() => {
                  if (pollInput.choices.length <= 1) {
                    return;
                  }

                  const newChoices = pollInput.choices.filter(
                    (_a, n) => n !== idx
                  );

                  setPollInput((p) => ({ ...p, choices: newChoices }));
                }}
                type="button"
              >
                &times;
              </button>
              <textarea
                className="h-[3em] block flex-grow p-2 resize-none"
                onChange={(e) => {
                  setPollInput((a) => {
                    const _a = { ...a };
                    _a.choices[idx].text = e.target.value;
                    return _a;
                  });
                }}
                value={choice.text}
              />
            </fieldset>
          ))}
        </div>

        <div className="p-2">
          <textarea
            className="w-full h-[6rem] p-2 resize-none"
            value={pollInput.trivia}
            onChange={(e) => {
              setPollInput((a) => {
                const _a = { ...a };
                a.trivia = e.target.value;
                return _a;
              });
            }}
          />
        </div>

        <div className="p-2 py-4">
          <button
            type="button"
            disabled={pollInput.choices.length < 2}
            onClick={() => {
              if (pollInput.id === "") {
                //create new poll
                const newId = nanoid();
                const newPoll: Poll = { ...pollInput, id: newId };
                polls[newId] = newPoll;
              } else {
                // update the poll

                polls[pollInput.id] = pollInput;
              }

              setPollInput(() => ({
                id: "",
                choices: [],
                question: "",
                trivia: "",
              }));
            }}
          >
            {pollInput.id === "" ? "Add Poll" : "Update Poll"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="p-2">
          <h3 className="font-bold">Poll Layout</h3>
          <button
            type="button"
            onClick={() => {
              room.pollLayout = "A";
            }}
            className={`${
              room.pollLayout === "A"
                ? "bg-pickle-green text-pickle-beige"
                : "bg-[transparent] text-black"
            }`}
          >
            Right
          </button>
          <button
            type="button"
            onClick={() => {
              room.pollLayout = "B";
            }}
            className={`${
              room.pollLayout === "B"
                ? "bg-pickle-green text-pickle-beige"
                : "bg-[transparent] text-black"
            }`}
          >
            Bottom
          </button>
        </div>
        <div className="p-2">
          <h3 className="font-bold">
            Current Polls ({Object.keys(polls).length + 1})
          </h3>

          {[...Object.keys(polls), "wherePoll"].map((pollId: string) => {
            const poll = pollId === "wherePoll" ? wherePoll : polls[pollId];

            if (poll === undefined) {
              return false;
            }

            return (
              <div
                key={poll.id}
                className={classNames(
                  "p-2 border-t border-black",
                  room.activePoll === poll.id
                    ? "bg-white"
                    : pollInput.id === poll.id
                    ? "bg-yellow-100"
                    : ""
                )}
              >
                <div className="flex items-center gap-2">
                  {poll.id !== room.activePoll && (
                    <>
                      <button
                        type="button"
                        disabled={
                          room.activePoll === poll.id ||
                          poll.id === "where-poll"
                        }
                        className="text-sm"
                        onClick={() => {
                          setPollInput({
                            ...poll,
                            choices: poll.choices.map((c) => ({ ...c })),
                          });
                        }}
                      >
                        edit
                      </button>
                      <button
                        type="button"
                        className="text-sm"
                        disabled={
                          room.activePoll === poll.id ||
                          poll.id === "where-poll"
                        }
                        onClick={() => {
                          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- this poll will definitely exist
                          delete polls[poll.id];
                        }}
                      >
                        del
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      room.activePoll =
                        room.activePoll === poll.id ? "" : poll.id;
                    }}
                    type="button"
                    className="text-sm"
                  >
                    {room.activePoll === poll.id
                      ? "Disable Active"
                      : "Set Active"}
                  </button>
                </div>
                <div>
                  <h3 className="my-2 text-lg">{poll.question}</h3>
                </div>
                <div className="grid grid-cols-2">
                  <ul className="list-disc list-inside">
                    {poll.choices.map((choice) => {
                      return <li key={choice.id}>{choice.text}</li>;
                    })}
                  </ul>
                  <div>
                    <h4 className="text-xs uppercase">Trivia</h4>
                    <p>{poll.trivia}</p>

                    {poll.id !== room.activePollTrivia ? (
                      <button
                        className="text-sm"
                        type="button"
                        onClick={() => {
                          room.activePollTrivia = poll.id;
                        }}
                      >
                        Show Trivia
                      </button>
                    ) : (
                      <button
                        className="text-sm"
                        type="button"
                        onClick={() => {
                          room.activePollTrivia = undefined;
                        }}
                      >
                        {" "}
                        Unset show trivia 🟢
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
