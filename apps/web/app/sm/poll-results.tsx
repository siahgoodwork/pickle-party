import { useSyncedStore } from "@syncedstore/react";
import { store } from "../store";
import { wherePoll } from "./polls";

export default function Page(): React.ReactElement {
  const state = useSyncedStore(store);
  return (
    <div className="p-4">
      <h1>Results</h1>
      {Object.values(state.pollResults).map((pr) => {
        if (pr === undefined) {
          return false;
        }

        const poll = pr.id === "where-poll" ? wherePoll : state.polls[pr.id];

        return (
          <div key={pr.id} className="p-2 my-2 border border-black">
            <div className="flex items-center gap-2">
              <h2 className="font-bold">
                {poll === undefined ? "Poll deleted" : poll.question}
              </h2>
              <button
                // disabled={state.room.activePoll === pr.id}
                type="button"
                onClick={() => {
                  if (Object.keys(state.pollResults).includes(pr.id)) {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- this poll will definitely exist
                    delete state.pollResults[pr.id];
                  }
                }}
              >
                Del
              </button>
            </div>
            {Object.values(pr.choices).map((c) => (
              <div key={c.id}>
                <span
                  className="px-2 py-0 text-sm border border-black"
                  title={c.voters.join(",")}
                >
                  {c.voters.length} votes
                </span>{" "}
                {poll?.choices.find((_c) => _c.id === c.id)?.text}{" "}
                {poll === undefined && "⚠️"}{" "}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
