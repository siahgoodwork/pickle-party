import type { Poll } from "pickle-types";
import { useState } from "react";
import classNames from "classnames";
import { useSyncedStore } from "@syncedstore/react";
import { nanoid } from "nanoid";
import { store } from "../store";

const btnCls = classNames(`w-10 h-10 border bg-white`);

export default function Pollmaker(): JSX.Element {
  const { polls, room } = useSyncedStore(store);
  const [pollInput, setPollInput] = useState<Poll>({
    id: "",
    question: "",
    choices: [],
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
                className="h-[6em] block w-[20em] p-2 resize-none"
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
          <button
            type="button"
            disabled={pollInput.choices.length < 2}
            onClick={() => {
              if (pollInput.id === "") {
                //create new poll
                const newId = nanoid();
                const newPoll: Poll = { ...pollInput, id: newId };
                polls.push(newPoll);
              } else {
                // update the poll
                const pollIndex = polls.findIndex((p) => p.id === pollInput.id);
                if (pollIndex > -1) {
                  polls.splice(pollIndex, 1, pollInput);
                }
              }

              setPollInput(() => ({
                id: "",
                choices: [],
                question: "",
              }));
            }}
          >
            {pollInput.id === "" ? "Add Poll" : "Update Poll"}
          </button>
        </div>
      </div>

      <div className="p-2">
        <h3>Current Polls ({polls.length})</h3>

        {polls.map((poll, n) => {
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
                {poll.question}
                {poll.id !== room.activePoll && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={room.activePoll === poll.id}
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
                      disabled={room.activePoll === poll.id}
                      onClick={() => {
                        polls.splice(n, 1);
                      }}
                    >
                      del
                    </button>
                  </div>
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
                <ul className="list-disc list-inside">
                  {poll.choices?.map((choice) => {
                    return <li key={choice.id}>{choice.text}</li>;
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
