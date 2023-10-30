import { useSyncedStore } from "@syncedstore/react";
import { store } from "../store";

export default function Page(): React.ReactElement {
  const state = useSyncedStore(store);
  return (
    <div className="p-4">
      <h1>Results</h1>
      {state.pollResults.map((pr, npr) => {
        const poll = state.polls.find((p) => p.id === pr.id);

        return (
          <div key={pr.id} className="p-2 my-2 border border-black">
            <h2 className="font-bold">
              {poll === undefined ? "Poll deleted" : poll.question}
            </h2>
            <button
              type="button"
              onClick={() => {
                state.pollResults.splice(npr, 1);
              }}
            >
              Del
            </button>
            {pr.choices.map((c) => (
              <div key={c.id}>
                {c.id} {poll === undefined && "⚠️"} <br />
                {c.voters.join(",")}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
