import { useSyncedStore } from "@syncedstore/react";
import classNames from "classnames";
import { nanoid } from "nanoid";
import { Combobox } from "@headlessui/react";
import type { HeadlinePrompt } from "pickle-types";
import { useMemo, useState } from "react";
import { store } from "../store";

export default function Page(): React.ReactElement {
  const state = useSyncedStore(store);
  const [promptInput, setPromptInput] = useState<HeadlinePrompt>({
    id: "",
    prompt: "",
  });

  const [pollHeadlinePrompt, setPollHeadlinePrompt] = useState<string>(
    state.otherPrompts.pollHeadlines || ""
  );
  const [chatCatPrompt, setChatCatPrompt] = useState<string>(
    state.otherPrompts.chatCategory || ""
  );

  const [selectedPollResults, setSelectedPollResults] = useState<string[]>([]);
  const [pollSearch, setPollSearch] = useState("");
  const pollResultsData = useMemo(() => {
    return selectedPollResults
      .map((id) => {
        const poll = state.polls[id];
        const pr = state.pollResults[id];
        if (poll === undefined || pr === undefined) {
          return false;
        }
        const topResultId = Object.values(pr.choices).sort(
          (a, b) => a.voters.length - b.voters.length
        )[0].id;
        return {
          id: poll.id,
          question: poll.question,
          topResult: poll.choices.find((c) => c.id === topResultId)?.text || "",
        };
      })
      .filter((a) => a !== false) as {
      id: string;
      question: string;
      topResult: string;
    }[];
  }, [selectedPollResults, state.polls, state.pollResults]);

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      <div className="flex flex-col p-2 gap-4">
        <div>
          <h1 className="font-bold">10 Poll Result Headlines</h1>
          <div>
            <textarea
              className="w-full border border-black bg-white h-[7rem]"
              value={pollHeadlinePrompt}
              onChange={(e) => {
                setPollHeadlinePrompt(e.target.value);
              }}
            />
            {pollHeadlinePrompt !== state.otherPrompts.pollHeadlines && (
              <button
                type="button"
                onClick={() => {
                  state.otherPrompts.pollHeadlines = pollHeadlinePrompt;
                }}
              >
                Save
              </button>
            )}

            <div>
              <h3 className="text-sm font-bold">Selected poll results</h3>
              {pollResultsData.map((prd) => (
                <div
                  key={prd.id}
                  className="relative pr-8 mb-1 border border-black border-bottom"
                >
                  <button
                    type="button"
                    className="absolute text-xs right-1 top-1"
                    onClick={() => {
                      setSelectedPollResults((pr) =>
                        pr.filter((_pr) => _pr !== prd.id)
                      );
                    }}
                  >
                    &times;
                  </button>
                  <span className="text-sm">{prd.topResult}</span>
                  <br />
                  <span className="text-xs opacity-30">{prd.question}</span>
                </div>
              ))}
            </div>

            <div className="relative">
              <Combobox
                value={selectedPollResults}
                onChange={(value) => {
                  setSelectedPollResults(value);
                  setPollSearch("");
                }}
                multiple
              >
                <Combobox.Input
                  onChange={(event) => {
                    setPollSearch(event.target.value);
                  }}
                  displayValue={(id: string) => state.polls[id]?.question || ""}
                  placeholder="search for poll"
                  className="w-full p-1 border border-black"
                />
                <div>
                  <Combobox.Options className="absolute top-[100%] bg-white p-1 border border-black w-full max-h-[20vh] overflow-y-scroll shadow-lg">
                    {Object.values(state.polls)
                      .filter(
                        (p) =>
                          p?.question.includes(pollSearch) &&
                          !selectedPollResults.includes(p.id)
                      )
                      .map((pr) =>
                        pr === undefined ? (
                          false
                        ) : (
                          <Combobox.Option
                            key={pr.id}
                            value={pr.id}
                            className="border-b cursor-pointer border-black/10 hover:bg-black/10"
                          >
                            {state.polls[pr.id]?.question}
                          </Combobox.Option>
                        )
                      )}
                  </Combobox.Options>
                </div>
              </Combobox>
            </div>
          </div>
        </div>

        <div>
          <h1 className="font-bold">Categorise chat prompt</h1>
          <div>
            <textarea
              className="w-full border border-black bg-white h-[7rem]"
              value={chatCatPrompt}
              onChange={(e) => {
                setChatCatPrompt(e.target.value);
              }}
            />
            {chatCatPrompt !== state.otherPrompts.chatCategory && (
              <button
                type="button"
                onClick={() => {
                  state.otherPrompts.chatCategory = chatCatPrompt;
                }}
              >
                Save
              </button>
            )}

            <pre className="text-sm font-normal">&lt;chat goes here&gt;</pre>
          </div>
        </div>
      </div>
      <div className="p-2">
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
    </div>
  );
}
