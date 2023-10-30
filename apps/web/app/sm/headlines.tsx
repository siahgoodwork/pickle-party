import { useSyncedStore } from "@syncedstore/react";
import { nanoid } from "nanoid";
import type { HeadlinePrompt, PollResult } from "pickle-types";
import { useState } from "react";
import { store } from "../store";

interface ChatResponse {
  ok: boolean;
  chatResponse: { message: { role: string; content: string } }[];
}

export default function Page(): React.ReactElement {
  const state = useSyncedStore(store);

  const [selectedPollResult, setSelectedPollResult] = useState<PollResult>();
  const [selectedHeadlinePrompt, setSelectedHeadlinePrompt] =
    useState<HeadlinePrompt>();
  const [generatingHeadline, setGeneratingHeadline] = useState(false);
  const [headlineInput, setHeadlineInput] = useState("");

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      <div className="p-2">
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
          {state.headlinePrompts.map((hpr) => (
            <option key={hpr.id} value={hpr.id}>
              {state.headlinePrompts.find((p) => p.id === hpr.id)?.prompt}
            </option>
          ))}
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
      <div className="p-2">
        <select
          onChange={(e) => {
            setSelectedPollResult(
              state.pollResults.find((p) => p.id === e.target.value)
            );
          }}
          className="p-2 bg-white border border-black"
          value={
            selectedPollResult !== undefined ? selectedPollResult.id : undefined
          }
        >
          {state.pollResults.map((result) => (
            <option key={result.id} value={result.id}>
              {state.polls.find((p) => p.id === result.id)?.question}
            </option>
          ))}
        </select>
        {state.polls.findIndex((p) => p.id === selectedPollResult?.id) > -1 ? (
          <div className="mt-8">
            {state.polls
              .find((p) => p.id === selectedPollResult?.id)
              ?.choices.map((choice) => {
                return (
                  <div key={choice.id}>
                    {choice.text} -{" "}
                    {
                      state.pollResults
                        .find((p) => p.id === selectedPollResult?.id)
                        ?.choices.find((c) => c.id === choice.id)?.voters.length
                    }
                  </div>
                );
              })}
          </div>
        ) : null}
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

              const _poll = state.polls.find(
                (p) => p.id === selectedPollResult.id
              );

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
                      votes: selectedPollResult.choices.find(
                        (_c) => c.id === _c.id
                      )?.voters.length,
                      text: c.text,
                    })),
                  },
                }),
              });

              const dataObj: ChatResponse = (await data.json()) as ChatResponse;

              if (dataObj.ok && dataObj.chatResponse.length > 0) {
                setHeadlineInput(dataObj.chatResponse[0].message.content);
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

      <div className="col-span-2">
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
        {state.headlines.map((headline, n) => (
          <div
            key={headline.id}
            className="flex justify-between py-2 border-b border-black"
          >
            <h2>{headline.text}</h2>
            <div className="flex-shrink-0 w-16">
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
        ))}
      </div>
    </div>
  );
}
