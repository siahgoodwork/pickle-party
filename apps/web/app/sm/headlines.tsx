import { useSyncedStore } from "@syncedstore/react";
import { nanoid } from "nanoid";
import classNames from "classnames";
import { toast } from "react-hot-toast";
import type { HeadlinePrompt, PollResult } from "pickle-types";
import { useMemo, useState } from "react";
import { store } from "../store";
import { wherePoll } from "./polls";

interface ChatResponse {
  ok: boolean;
  chatResponse: { message: { role: string; content: string } };
  //chatResponse: { message: { role: string; content: string } }[];
}

export default function Page(): React.ReactElement {
  const state = useSyncedStore(store);
  const {
    polls,
    pollResults,
    selectedPollResultsForHeadlines,
    otherPrompts,
    tenHeadlines,
  } = state;

  const [selectedPollResult, setSelectedPollResult] = useState<PollResult>();
  const [selectedHeadlinePrompt, setSelectedHeadlinePrompt] =
    useState<HeadlinePrompt>();
  const [generatingHeadline, setGeneratingHeadline] = useState(false);
  const [headlineInput, setHeadlineInput] = useState("");

  const pollResultsData = useMemo(() => {
    return selectedPollResultsForHeadlines
      .map((id) => {
        const poll = polls[id];
        const pr = pollResults[id];
        if (poll === undefined) {
          return false;
        }
        const topResultId =
          pr === undefined
            ? undefined
            : Object.values(pr.choices).sort(
                (a, b) => b.voters.length - a.voters.length
              )[0].id;
        return {
          id: poll.id,
          question: poll.question,
          topResult:
            poll.choices.find((c) => c.id === topResultId)?.text || "-",
        };
      })
      .filter((a) => a !== false) as {
      id: string;
      question: string;
      topResult: string;
    }[];
  }, [selectedPollResultsForHeadlines, polls, pollResults]);

  const [promptInput, setPromptInput] = useState<HeadlinePrompt>({
    id: "",
    prompt: "",
  });

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      <div className="hidden p-2 col-span-2">
        <h1 className="font-bold">Headline Prompts</h1>

        <h2 className="mt-8 mb-4 text-lg">
          <span className="text-gray-600">
            You are a creative API that looks at the results of a poll, and
            generates a news headline
          </span>{" "}
          <span className="text-black">{promptInput.prompt}</span>
        </h2>

        <textarea
          onChange={(e) => {
            setPromptInput((p) => ({
              ...p,
              prompt: e.target.value,
            }));
          }}
          value={promptInput.prompt}
          className="p-2 border border-black w-[40em] h-[5em] no-resize"
        />
        <br />

        <button
          type="button"
          onClick={() => {
            if (promptInput.id === "") {
              state.headlinePrompts.push({
                prompt: promptInput.prompt,
                id: nanoid(),
              });
            } else {
              const curPromptIndex = state.headlinePrompts.findIndex(
                (p) => p.id === promptInput.id
              );
              if (curPromptIndex > -1) {
                const updatedPrompt = {
                  ...promptInput,
                  prompt: promptInput.prompt,
                };
                state.headlinePrompts.splice(curPromptIndex, 1, updatedPrompt);
              }
            }

            setPromptInput({
              id: "",
              prompt: "",
            });
          }}
        >
          {promptInput.id === "" ? "Create prompt" : "Update prompt"}
        </button>

        {state.headlinePrompts.map((p, n) => (
          <div
            key={p.id}
            className={classNames(
              "p-2 my-2 border border-black",
              p.id === promptInput.id ? "bg-yellow-100" : "bg-[transparent]"
            )}
          >
            <div className="text-xs">{p.id}</div>
            <div>... {p.prompt}</div>
            <div>
              <button
                className="text-sm"
                type="button"
                onClick={() => {
                  setPromptInput(p);
                }}
              >
                Edit
              </button>
              <button
                className="text-sm"
                type="button"
                onClick={() => {
                  state.headlinePrompts.splice(n, 1);
                }}
              >
                Del
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden p-3 m-8 border border-black col-span-2 grid grid-cols-2">
        <div className="col-span-2">
          <h2 className="font-bold">Ticker headline generation prompts</h2>
        </div>
        <div className="p-2">
          <div>
            <select
              onChange={(e) => {
                setSelectedHeadlinePrompt(
                  state.headlinePrompts.find((p) => p.id === e.target.value)
                );
              }}
              className="w-full p-2 overflow-hidden bg-white border border-black"
              value={
                selectedHeadlinePrompt !== undefined
                  ? selectedHeadlinePrompt.id
                  : undefined
              }
            >
              <option value=""> </option>
              {state.headlinePrompts.map((hpr) => {
                return (
                  <option key={hpr.id} value={hpr.id}>
                    {state.headlinePrompts.find((p) => p.id === hpr.id)?.prompt}
                  </option>
                );
              })}
            </select>
            {state.headlinePrompts.findIndex(
              (p) => p.id === selectedHeadlinePrompt?.id
            ) > -1 ? (
              <div>
                <h2 className="mt-8 mb-4 text-lg">
                  <span className="text-gray-600">A news headline</span>{" "}
                  <span className="text-black">
                    {selectedHeadlinePrompt?.prompt}
                  </span>
                </h2>
              </div>
            ) : null}
          </div>
        </div>
        <div className="p-2">
          <select
            onChange={(e) => {
              setSelectedPollResult(state.pollResults[e.target.value]);
            }}
            className="p-2 bg-white border border-black"
            value={
              selectedPollResult !== undefined
                ? selectedPollResult.id
                : undefined
            }
          >
            <option value=""> </option>
            {Object.values(state.pollResults).map((result) => {
              if (result === undefined) {
                return false;
              }

              const id = result.id;
              const pollQuestion =
                id === "where-poll"
                  ? wherePoll.question
                  : state.polls[id]?.question;

              if (pollQuestion === undefined) {
                return false;
              }

              return (
                <option key={id} value={id}>
                  {pollQuestion}
                </option>
              );
            })}
          </select>
          {selectedPollResult === undefined ? (
            false
          ) : selectedPollResult.id === "where-poll" ? (
            <div>
              {Object.values(selectedPollResult.choices).map((choice) => (
                <div key={choice.id}>
                  {choice.id} - {choice.voters.length}
                </div>
              ))}
            </div>
          ) : state.polls[selectedPollResult.id || ""] ? (
            <div className="mt-8">
              {state.polls[selectedPollResult.id]?.choices.map((choice) => {
                return (
                  <div key={choice.id}>
                    {choice.text} -{" "}
                    {
                      state.pollResults[selectedPollResult.id]?.choices[
                        choice.id
                      ]?.voters.length
                    }
                  </div>
                );
              })}
            </div>
          ) : (
            false
          )}
        </div>

        <div className="text-center col-span-2">
          <button
            type="button"
            className="px-2 text-xl"
            disabled={
              generatingHeadline ||
              selectedPollResult === undefined ||
              selectedHeadlinePrompt === undefined
            }
            onClick={async () => {
              setGeneratingHeadline(true);
              try {
                if (selectedHeadlinePrompt === undefined) {
                  return;
                }

                if (selectedPollResult === undefined) {
                  return;
                }

                const _poll =
                  selectedPollResult.id === "where-poll"
                    ? wherePoll
                    : state.polls[selectedPollResult.id];

                if (_poll === undefined) {
                  return;
                }

                const data = await fetch("/api/poll-headline", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    headlinePrompt: selectedHeadlinePrompt.prompt,
                    pollResult: {
                      question: _poll.question,
                      choices: _poll.choices.map((c) => ({
                        votes:
                          selectedPollResult.choices[c.id]?.voters.length || 0, //eslint-disable-line @typescript-eslint/no-unnecessary-condition -- might return undefined object with dynamic key
                        text: c.text,
                      })),
                    },
                  }),
                });

                const dataObj: ChatResponse =
                  (await data.json()) as ChatResponse;

                if (
                  dataObj.ok &&
                  dataObj.chatResponse.message.content.length > 0
                ) {
                  setHeadlineInput(dataObj.chatResponse.message.content);
                } else {
                  throw Error("Failed to generate headline");
                }
                setGeneratingHeadline(false);
              } catch (err) {
                /* eslint no-console: 0 -- log error */
                console.error(err);
                /* eslint no-alert: 0 -- log error */
                alert("An error has occurred, try again.");
                setGeneratingHeadline(false);
              }
            }}
          >
            {generatingHeadline ? "Generating..." : "Make the headline"}
          </button>
        </div>
      </div>

      <div className="col-span-2">
        <div className="p-2">
          <div className="p-2 border border-black">
            <button
              type="button"
              onClick={async () => {
                setGeneratingHeadline(true);
                try {
                  if (otherPrompts.pollHeadlines === "") {
                    return;
                  }

                  const r = await fetch("/api/ten-headlines", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      pollResults: pollResultsData.map((prd) => prd.topResult),
                      prompt: otherPrompts.pollHeadlines,
                    }),
                  });
                  const dataObj = (await r.json()) as ChatResponse;

                  if (dataObj.ok && dataObj.chatResponse.message.content) {
                    setGeneratingHeadline(false);
                    const contentObj = JSON.parse(
                      dataObj.chatResponse.message.content
                    ) as { headlines?: string[] };

                    if (
                      contentObj.headlines &&
                      contentObj.headlines.length > 0
                    ) {
                      tenHeadlines.splice(
                        0,
                        tenHeadlines.length,
                        ...contentObj.headlines
                      );
                    }
                  } else {
                    throw Error("Failed to generate headline");
                  }
                } catch (err) {
                  /* eslint no-console: 0 -- log error */
                  console.error(err);
                  /* eslint no-alert: 0 -- log error */
                  alert("An error has occurred, try again.");
                  setGeneratingHeadline(false);
                }
              }}
            >
              {generatingHeadline ? "generating..." : "Generate"}
            </button>
            <ul className="p-2">
              {Array.isArray(tenHeadlines) &&
                tenHeadlines.map((hl) => (
                  <li key={hl}>
                    {hl}{" "}
                    <button
                      type="button"
                      className="text-sm"
                      onClick={() => {
                        state.headlines.push({
                          id: nanoid(),
                          active: false,
                          text: hl,
                        });
                        toast("added to ticker tape headlines");
                      }}
                    >
                      Add to ticker
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <textarea
          value={headlineInput}
          onChange={(e) => {
            setHeadlineInput(e.target.value);
          }}
          className="w-full resize-none h-[5rem]"
        />
        <button
          type="button"
          disabled={headlineInput === ""}
          onClick={() => {
            state.headlines.push({
              id: nanoid(),
              active: false,
              text: headlineInput,
            });
            setHeadlineInput(() => "");
          }}
        >
          Save headline
        </button>
      </div>

      <div className="col-span-2">
        <button
          type="button"
          onClick={() => {
            state.room.showTicker = !state.room.showTicker;
          }}
        >
          Turn {state.room.showTicker ? "Off" : "On"} Ticker Tape
        </button>

        <button
          type="button"
          onClick={() => {
            state.room.showDoubleTicker = !state.room.showDoubleTicker;
          }}
        >
          Turn {state.room.showDoubleTicker ? "Off" : "On"} Double Ticker Tape
        </button>
        {state.headlines.map((headline, n) => (
          <div
            key={headline.id}
            className="flex justify-between py-2 border-b border-black"
          >
            <h2>{headline.text}</h2>
            <div className="flex flex-shrink-0 w-32 gap-2">
              <button
                type="button"
                onClick={() => {
                  state.headlines.splice(n, 1);
                }}
              >
                Del
              </button>

              <div className="">
                Active{" "}
                <input
                  type="checkbox"
                  checked={headline.active}
                  onClick={(e) => {
                    const _headline = {
                      ...headline,
                      active: e.currentTarget.checked,
                    };

                    state.headlines.splice(n, 1, _headline);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
