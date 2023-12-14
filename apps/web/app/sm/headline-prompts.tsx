import { useSyncedStore } from "@syncedstore/react";
import classNames from "classnames";
import { nanoid } from "nanoid";
import type { HeadlinePrompt } from "pickle-types";
import { useState } from "react";
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

            <pre className="text-sm font-normal">
              &lt;10 poll results here&gt;
            </pre>
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
