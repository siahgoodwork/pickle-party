import type { Poll, WherePoll } from "pickle-types";
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { useSyncedStore } from "@syncedstore/react";
import { nanoid } from "nanoid";
import { Dialog } from "@headlessui/react";
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
    { id: "where-asia", text: "Asia" },
    { id: "where-na", text: "North America" },
    { id: "where-sa", text: "South America" },
    { id: "where-africa", text: "Africa" },
    { id: "where-europe", text: "Europe" },
    { id: "where-oceania", text: "Oceania" },
  ],
  question: "Which part of the world do you come from?",
  trivia: "",
  order: -2000,
  group: "A",
};

export default function Pollmaker(): JSX.Element {
  const { polls, room, pollResults } = useSyncedStore(store);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showPollInput, setShowPollInput] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [insertIndex, setInsertIndex] = useState(
    (Object.keys(polls).length - 1).toString()
  );
  const [pollInput, setPollInput] = useState<Poll>({
    id: "",
    question: "",
    choices: [],
    trivia: "",
    thankyouMessage: "",
  });

  useEffect(() => {
    if (scrollRef.current === null) {
      return;
    }

    const scrollContainer = scrollRef.current;

    const scrollHandler: () => void = () => {
      const scrollPos = scrollContainer.scrollTop;
      localStorage.setItem("poll-scroll", scrollPos.toString());
    };

    const prevScroll = localStorage.getItem("poll-scroll");
    if (prevScroll !== null && !isNaN(parseInt(prevScroll))) {
      scrollContainer.scrollTo({ top: parseInt(prevScroll) });
    }

    scrollContainer.addEventListener("scrollend", scrollHandler);

    return () => {
      scrollContainer.removeEventListener("scrollend", scrollHandler);
    };
  }, []);

  return (
    <>
      <div className="grid grid-cols-[auto_minmax(300px,40%)]">
        <div className="flex flex-col p-2 gap-4">
          <div className="">
            <h3 className="my-2 font-bold">
              Polls ({Object.keys(polls).length + 1}){" "}
              <button
                type="button"
                className="text-xs font-normal"
                onClick={() => {
                  Object.values(polls)
                    .sort(pollSortFn)
                    .forEach((poll, n) => {
                      if (poll === undefined) {
                        return;
                      }
                      if (polls[poll.id] === undefined) {
                        return;
                      }
                      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style -- we have already checked that polls[poll.id] is not undefined
                      (polls[poll.id] as Poll).order = n;
                    });
                }}
              >
                Flush Order
              </button>
              <button
                type="button"
                className="text-xs font-normal"
                onClick={() => {
                  Object.values(polls).forEach((poll) => {
                    if (poll === undefined) {
                      return;
                    }
                    if (polls[poll.id] === undefined) {
                      return;
                    }
                    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style -- we have already checked that polls[poll.id] is not undefined
                    (polls[poll.id] as Poll).group = "A";
                  });
                }}
              >
                Override Poll Groups
              </button>
              <button
                type="button"
                className="text-xs font-normal"
                onClick={() => {
                  Object.keys(pollResults).forEach((key) => {
                    //eslint-disable-next-line -- this exists
                    delete pollResults[key];
                  });
                }}
              >
                Reset All Poll Results
              </button>
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

            <div
              className="overflow-y-scroll h-[calc(100vh_-_160px)] border border-black"
              ref={scrollRef}
            >
              {[
                "wherePoll",
                ...Object.values(polls)
                  .sort(pollSortFn)
                  .map((p) => p?.id),
              ]
                .filter((a) => a !== undefined)
                .map((pollId: string, n: number, _polls: string[]) => {
                  const poll =
                    pollId === "wherePoll" ? wherePoll : polls[pollId];

                  const hasPollResult =
                    poll === undefined
                      ? false
                      : pollId === "wherePoll"
                      ? pollResults["where-poll"] !== undefined
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
                          <h3 className="mb-8 font-bold">
                            <span className="inline-block px-2 mr-2 text-sm font-normal border border-black rounded opacity-50">
                              {poll.order}
                            </span>
                            {poll.question}
                          </h3>

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
                              <p className="whitespace-pre-line">
                                {poll.trivia}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col controls gap-2">
                          <div className="flex justify-end gap-2">
                            {poll.id !== room.activePoll && (
                              <>
                                <button
                                  type="button"
                                  disabled={poll.id === "where-poll"}
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
                                  disabled={poll.id === "where-poll"}
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
                              disabled={n <= 1 || poll.id === "where-poll"}
                              onClick={() => {
                                Object.values(polls)
                                  .sort(pollSortFn)
                                  .forEach((_p) => {
                                    if (_p === undefined) {
                                      return;
                                    }
                                    const pollRef = polls[_p.id || ""];
                                    if (pollRef === undefined) {
                                      return;
                                    }
                                    if (_p.order === n - 1) {
                                      pollRef.order = n - 2;
                                    } else if (_p.order === n - 2) {
                                      pollRef.order = n - 1;
                                    }
                                  });
                              }}
                            >
                              <ArrowUpIcon width={18} />
                            </button>
                            <button
                              type="button"
                              className="text-sm"
                              disabled={
                                n === _polls.length - 1 ||
                                poll.id === "where-poll"
                              }
                              onClick={() => {
                                Object.values(polls).forEach((_p) => {
                                  if (_p === undefined) {
                                    return;
                                  }
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
                              <ArrowDownIcon width={18} />
                            </button>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {poll.id !== room.activePoll ? (
                              <button
                                className="text-sm"
                                type="button"
                                onClick={() => {
                                  room.activePollTrivia = poll.id;
                                  room.activePoll = poll.id;
                                  room.activePollResult = poll.id;
                                  // eslint-disable-next-line -- type is ok, incorrect lint error here
                                  room.pollLayout = poll.group || "A";
                                }}
                              >
                                Set active poll
                              </button>
                            ) : (
                              <button
                                className="text-sm bg-pickle-green text-pickle-beige hover:bg-pickle-green/90"
                                type="button"
                                onClick={() => {
                                  room.activePollTrivia = undefined;
                                  room.activePoll = undefined;
                                  room.activePollResult = undefined;
                                }}
                              >
                                {" "}
                                Unset active poll
                              </button>
                            )}

                            <button
                              type="button"
                              className="text-sm"
                              onClick={() => {
                                setInsertIndex(
                                  poll.id === "where-poll"
                                    ? "0"
                                    : (poll.order
                                        ? poll.order - 2
                                        : n
                                      ).toString()
                                );
                                setShowPollInput(true);
                              }}
                            >
                              Insert poll below
                            </button>

                            <div
                              className={`p-1 border border-black rounded-lg grid poll-group gap-1 grid-cols-2 grid-rows-2 ${
                                poll.id === "where-poll"
                                  ? "pointer-events-none opacity-30"
                                  : ""
                              }`}
                            >
                              {(
                                [
                                  { group: "A", label: "Btm" },
                                  { group: "C", label: "Full" },
                                  { group: "D", label: "Ctr+Rgt" },
                                  { group: "E", label: "Ctr" },
                                ] as {
                                  group: "A" | "B" | "C" | "D" | "E";
                                  label: string;
                                }[]
                              ).map((group) => (
                                <button
                                  key={group.group}
                                  type="button"
                                  onClick={() => {
                                    //eslint-disable-next-line -- this will exist for sure
                                    (polls[poll.id] as Poll).group =
                                      group.group;
                                  }}
                                  className={`text-xs ${
                                    poll.group === group.group
                                      ? "bg-gray-500 text-pickle-beige hover:bg-gray-500/90"
                                      : ""
                                  }`}
                                >
                                  {group.label}
                                </button>
                              ))}
                            </div>
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
                  room.showPollTrivia = false;
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
                  "rounded-[0] border-x-0 hidden",
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
                  "rounded-[0] border-l-0",
                  room.pollLayout === "C"
                    ? "bg-pickle-green hover:bg-pickle-green/80 text-pickle-beige"
                    : "",
                ])}
              >
                Fullscreen
              </button>
              <button
                type="button"
                onClick={() => {
                  room.pollLayout = "D";
                }}
                className={classNames([
                  "rounded-[0] border-x-0",
                  room.pollLayout === "D"
                    ? "bg-pickle-green hover:bg-pickle-green/80 text-pickle-beige"
                    : "",
                ])}
              >
                Ctr + Right
              </button>
              <button
                type="button"
                onClick={() => {
                  room.pollLayout = "E";
                }}
                className={classNames([
                  "rounded-l-[0]",
                  room.pollLayout === "E"
                    ? "bg-pickle-green hover:bg-pickle-green/80 text-pickle-beige"
                    : "",
                ])}
              >
                Center
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
              Trivia is not visible for layouts &quot;Bottom&quot; or
              &quot;Fullscreen&quot;
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
          <div className="fixed top-0 left-0 w-screen h-screen bg-black opacity-25 pointer-events-none" />
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
              {pollInput.id === "" && (
                <div className="p-2 border-b border-black">
                  <h3>Insert After</h3>
                  <input
                    id="insert_after"
                    name="insert_after"
                    value={insertIndex}
                    onChange={(e) => {
                      setInsertIndex(e.target.value);
                    }}
                  />
                </div>
              )}

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
                      const newOrder =
                        parseInt(insertIndex) || Object.keys(polls).length;

                      const newId = nanoid();
                      const newPoll: Poll = {
                        ...pollInput,
                        id: newId,
                        order: newOrder + 0.1,
                      };
                      polls[newId] = newPoll;

                      Object.values(polls)
                        .sort(pollSortFn)
                        .forEach((poll, n) => {
                          if (poll === undefined) {
                            return;
                          }
                          if (polls[poll.id] === undefined) {
                            return;
                          }
                          // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style -- we have already checked that polls[poll.id] is not undefined
                          (polls[poll.id] as Poll).order = n;
                        });
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
