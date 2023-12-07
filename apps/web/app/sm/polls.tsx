import type { Poll, WherePoll } from "pickle-types";
import { useState } from "react";
import classNames from "classnames";
import { useSyncedStore } from "@syncedstore/react";
import { nanoid } from "nanoid";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { store } from "../store";

const btnCls = classNames(`w-10 h-10 border bg-white`);

const pollSortFn: (a: Poll | undefined, b: Poll | undefined) => number = (
  a,
  b
) => {
  if (a === undefined || b === undefined) {
    if (a === undefined) return 1;
    if (b === undefined) return -1;
  }

  if (a.order === undefined && b.order === undefined) {
    return 0;
  }

  if (a.order === undefined && b.order !== undefined) {
    return -1;
  }

  if (b.order === undefined && a.order !== undefined) {
    return 1;
  }

  if (b.order !== undefined && a.order !== undefined) {
    return a.order - b.order;
  }

  return 0;
};

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
  order: -2000,
};

export default function Pollmaker(): JSX.Element {
  const { polls, room, pollResults } = useSyncedStore(store);
  const [showPollInput, setShowPollInput] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [pollInput, setPollInput] = useState<Poll>({
    id: "",
    question: "",
    choices: [],
    trivia: "",
    thankyouMessage: "",
  });

  return (
    <>
      <div className="grid grid-cols-[auto_minmax(300px,40%)]">
        <div className="flex flex-col p-2 gap-4">
          <div className="">
            <h3 className="my-2 font-bold">
              Polls ({Object.keys(polls).length + 1})
            </h3>

            <div>
              <input
                type="search"
                className="block w-full p-2 text-lg border border-b-0 border-black"
                placeholder="type here to filter polls by question"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
              />
            </div>

            <div className="overflow-y-scroll h-[calc(100vh_-_160px)] border border-black">
              {[
                ...Object.values(polls)
                  .sort(pollSortFn)
                  .map((p) => p?.id),
                "wherePoll",
              ]
                .filter((a) => a !== undefined)
                .map((pollId: string, n: number, _polls: string[]) => {
                  const poll =
                    pollId === "wherePoll" ? wherePoll : polls[pollId];
                  const hasPollResult =
                    poll === undefined
                      ? false
                      : pollResults[pollId] !== undefined;

                  if (poll === undefined) {
                    return false;
                  }

                  return (
                    <div
                      key={poll.id}
                      className={classNames(
                        "p-2 border-black hover:bg-white/40",
                        n > 0 && "border-t",
                        searchInput !== ""
                          ? poll.question
                              .toLowerCase()
                              .includes(searchInput.toLowerCase())
                            ? "block"
                            : "hidden"
                          : "block"
                      )}
                    >
                      <div className="grid grid-cols-[3fr_1fr]">
                        <div>
                          <h3 className="mb-8 font-bold">{poll.question}</h3>

                          <div className="grid-cols-[3fr_2fr] gap-4 grid">
                            <div>
                              <h4 className="mb-2 text-xs uppercase">
                                Choices
                              </h4>
                              <ul className="list-disc list-inside">
                                {poll.choices.map((choice) => {
                                  const votes = hasPollResult
                                    ? pollResults[poll.id]?.choices[choice.id]
                                        ?.voters.length || 0
                                    : undefined;
                                  const totalVotes = hasPollResult
                                    ? Object.values(
                                        pollResults[poll.id]?.choices || {}
                                      )
                                        .flat()
                                        .map((a) => a.voters.length)
                                        .reduce((a, b) => a + b, 0)
                                    : undefined;

                                  return (
                                    <li
                                      key={choice.id}
                                      className="flex items-center border-t border-black/30"
                                    >
                                      <div className="w-[50%]">
                                        {choice.text}
                                      </div>
                                      {hasPollResult &&
                                      votes !== undefined &&
                                      totalVotes !== undefined ? (
                                        <div className="px-2 text-xs">
                                          {votes}/{totalVotes} -{" "}
                                          {((votes / totalVotes) * 100).toFixed(
                                            2
                                          )}
                                          %
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                              {hasPollResult ? (
                                <button
                                  type="button"
                                  className="mt-2 text-xs"
                                  onClick={() => {
                                    if (
                                      Object.keys(pollResults).includes(poll.id)
                                    ) {
                                      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- this poll will definitely exist
                                      delete pollResults[poll.id];
                                    }
                                  }}
                                >
                                  Reset poll results
                                </button>
                              ) : (
                                false
                              )}
                            </div>
                            <div>
                              <h4 className="text-xs uppercase mt">Trivia</h4>
                              <p>{poll.trivia}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col controls gap-2">
                          <div className="flex justify-end gap-2">
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
                                    setShowPollInput(true);
                                    setPollInput({
                                      ...poll,
                                      choices: poll.choices.map((c) => ({
                                        ...c,
                                      })),
                                    });
                                  }}
                                >
                                  <PencilSquareIcon width={18} />
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
                                  <TrashIcon width={18} />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className="text-sm"
                              disabled={n === 0}
                              onClick={() => {
                                Object.values(polls)
                                  .sort(pollSortFn)
                                  .map((a, nn) => ({ ...a, order: nn }))
                                  .forEach((_p) => {
                                    const pollRef = polls[_p.id || ""];
                                    if (pollRef === undefined) {
                                      return;
                                    }
                                    if (_p.order === n) {
                                      pollRef.order = n - 1;
                                    } else if (_p.order === n - 1) {
                                      pollRef.order = n;
                                    }
                                  });
                              }}
                            >
                              <ArrowUpIcon width={18} />
                            </button>
                            <button
                              type="button"
                              className="text-sm"
                              disabled={n === _polls.length - 1}
                              onClick={() => {
                                Object.values(polls)
                                  .sort(pollSortFn)
                                  .map((a, nn) => ({ ...a, order: nn }))
                                  .forEach((_p) => {
                                    const pollRef = polls[_p.id || ""];
                                    if (pollRef === undefined) {
                                      return;
                                    }
                                    if (_p.order === n) {
                                      pollRef.order = n + 1;
                                    } else if (_p.order === n + 1) {
                                      pollRef.order = n;
                                    }
                                  });
                              }}
                            >
                              <ArrowDownIcon width={18} />
                            </button>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={() => {
                                room.activePoll =
                                  room.activePoll === poll.id ? "" : poll.id;
                              }}
                              type="button"
                              className={`text-sm ${
                                room.activePoll === poll.id
                                  ? "bg-pickle-green text-pickle-beige hover:bg-pickle-green/90"
                                  : ""
                              }`}
                            >
                              {room.activePoll === poll.id
                                ? "Unset active poll"
                                : "Set active vote"}
                            </button>
                            {poll.id !== room.activePollTrivia ? (
                              <button
                                className="text-sm"
                                type="button"
                                onClick={() => {
                                  room.activePollTrivia = poll.id;
                                }}
                              >
                                Active poll trivia
                              </button>
                            ) : (
                              <button
                                className="text-sm bg-pickle-green text-pickle-beige hover:bg-pickle-green/90"
                                type="button"
                                onClick={() => {
                                  room.activePollTrivia = undefined;
                                }}
                              >
                                {" "}
                                Unset active show trivia
                              </button>
                            )}
                            <button
                              type="button"
                              className={`text-sm ${
                                room.activePollResult === poll.id
                                  ? "bg-pickle-green text-pickle-beige hover:bg-pickle-green/90"
                                  : ""
                              }`}
                              onClick={() => {
                                if (room.activePollResult === poll.id) {
                                  room.activePollResult = undefined;
                                } else {
                                  room.activePollResult = poll.id;
                                }
                              }}
                            >
                              {room.activePollResult === poll.id
                                ? "Unset active poll result"
                                : "Set active poll result"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              <div className="sticky bottom-0 p-2 border-t border-black bg-pickle-beige">
                <button
                  className="w-full"
                  type="button"
                  onClick={() => {
                    setShowPollInput(true);
                    setPollInput({
                      id: "",
                      question: "",
                      choices: [],
                      trivia: "",
                      thankyouMessage: "",
                    });
                  }}
                >
                  New Poll
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="py-4">
            <h3>Poll Layout</h3>

            <div className="flex justify-start mb-2">
              <button
                type="button"
                onClick={() => {
                  room.showPollView = false;
                }}
                className={classNames([
                  "rounded-r-[0]",
                  room.showPollView === false
                    ? "bg-pickle-green hover:bg-pickle-green/80 text-pickle-beige"
                    : "",
                ])}
              >
                Off
              </button>
              <button
                type="button"
                onClick={() => {
                  room.showPollView = "poll";
                }}
                className={classNames([
                  "rounded-[0] border-x-0",
                  room.showPollView === "poll"
                    ? "bg-pickle-green hover:bg-pickle-green/80 text-pickle-beige"
                    : "",
                ])}
              >
                Show Poll
              </button>
              <button
                type="button"
                onClick={() => {
                  room.showPollView = "result";
                }}
                className={classNames([
                  "rounded-l-[0]",
                  room.showPollView === "result"
                    ? "bg-pickle-green hover:bg-pickle-green/80 text-pickle-beige"
                    : "",
                ])}
              >
                Show Results
              </button>
            </div>
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => {
                  room.pollLayout = "A";
                }}
                className={classNames([
                  "rounded-r-[0]",
                  room.pollLayout === "A"
                    ? "bg-pickle-green hover:bg-pickle-green/80 text-pickle-beige"
                    : "",
                ])}
              >
                Bottom
              </button>
              <button
                type="button"
                onClick={() => {
                  room.pollLayout = "B";
                }}
                className={classNames([
                  "rounded-[0] border-x-0",
                  room.pollLayout === "B"
                    ? "bg-pickle-green hover:bg-pickle-green/80 text-pickle-beige"
                    : "",
                ])}
              >
                Right
              </button>
              <button
                type="button"
                onClick={() => {
                  room.pollLayout = "C";
                }}
                className={classNames([
                  "rounded-l-[0]",
                  room.pollLayout === "C"
                    ? "bg-pickle-green hover:bg-pickle-green/80 text-pickle-beige"
                    : "",
                ])}
              >
                Fullscreen
              </button>
            </div>
          </div>
          <div>
            <h3>Poll Trivia</h3>
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => {
                  room.showPollTrivia = false;
                }}
                className={classNames([
                  "rounded-r-[0] ",
                  room.showPollTrivia
                    ? ""
                    : "bg-pickle-green hover:bg-pickle-green/80 text-pickle-beige",
                ])}
              >
                Hide Trivia
              </button>
              <button
                type="button"
                onClick={() => {
                  room.showPollTrivia = true;
                  room.pollLayout = "B";
                }}
                className={classNames([
                  "rounded-l-[0] border-l-0",
                  room.showPollTrivia
                    ? "bg-pickle-green hover:bg-pickle-green/80 text-pickle-beige"
                    : "",
                ])}
              >
                Show Trivia
              </button>
            </div>
            <span className="text-xs">
              Turning poll trivia on always sets &ldquo;Poll layout&rdquo; to
              &ldquo;Right&rdquo;
            </span>
          </div>
        </div>
      </div>
      <Dialog
        open={showPollInput}
        onClose={() => {
          setShowPollInput(false);
        }}
      >
        <Dialog.Panel>
          <div className="fixed top-0 left-0 w-screen h-screen pointer-events-none backdrop-blur-sm" />
          <div className="w-[40%] h-screen fixed top-0 right-0 bg-white overflow-y-scroll no-scroll">
            <div className="flex flex-col m-2 border border-black rounded gap-2">
              <div className="flex flex-col p-2 border-b gap-2 border-b-black">
                <h3 className="mb-4 font-bold">
                  {pollInput.id === "" ? "New Poll" : "Edit Poll"}
                </h3>

                <h3>Question</h3>
                <input
                  id="question"
                  name="question"
                  type="text"
                  className="w-full p-2 border border-black"
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
                </div>
                {pollInput.choices.map((choice, idx) => (
                  <fieldset
                    className="flex items-center py-2 gap-2"
                    key={choice.id}
                  >
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
                      className="h-[3em] block flex-grow p-2 resize-none border border-black"
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

              <div className="p-2">
                <label htmlFor="trivia">Thank you message</label>
                <textarea
                  className="w-full h-[6rem] p-2 resize-none border border-black"
                  value={pollInput.thankyouMessage || ""}
                  placeholder="Thank you for your response"
                  onChange={(e) => {
                    setPollInput((a) => {
                      const _a = { ...a };
                      _a.thankyouMessage = e.target.value;
                      return _a;
                    });
                  }}
                />
              </div>

              <div className="p-2">
                <label htmlFor="tq">Poll Trivia</label>
                <textarea
                  className="w-full h-[6rem] p-2 resize-none border border-black"
                  value={pollInput.trivia}
                  onChange={(e) => {
                    setPollInput((a) => {
                      const _a = { ...a };
                      _a.trivia = e.target.value;
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
                      const newPoll: Poll = {
                        ...pollInput,
                        id: newId,
                        order: Object.keys(polls).length,
                      };
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
                      thankyouMessage: "",
                    }));

                    setShowPollInput(false);
                  }}
                >
                  {pollInput.id === "" ? "Add Poll" : "Update Poll"}
                </button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}
