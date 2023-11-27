import { useSyncedStore } from "@syncedstore/react";
import { store } from "../store";
import { wherePoll } from "./polls";

export default function Page(): React.ReactElement {
  const { room, pollResults, polls } = useSyncedStore(store);
  return (
    <div className="p-4">
      <h1>Results</h1>
      <div className="p-2">
        <h3 className="font-bold">Poll Layout</h3>
        <button
          type="button"
          onClick={() => {
            room.pollResultLayout = "A";
          }}
          className={`${
            room.pollResultLayout === "A"
              ? "bg-pickle-green text-pickle-beige"
              : "bg-[transparent] text-black"
          }`}
        >
          Right
        </button>
        <button
          type="button"
          onClick={() => {
            room.pollResultLayout = "B";
          }}
          className={`${
            room.pollResultLayout === "B"
              ? "bg-pickle-green text-pickle-beige"
              : "bg-[transparent] text-black"
          }`}
        >
          Bottom
        </button>
        <button
          type="button"
          onClick={() => {
            room.pollResultLayout = "C";
          }}
          className={`${
            room.pollResultLayout === "C"
              ? "bg-pickle-green text-pickle-beige"
              : "bg-[transparent] text-black"
          }`}
        >
          Top Right Quarter
        </button>
      </div>
      {Object.values(pollResults).map((pr) => {
        if (pr === undefined) {
          return false;
        }

        const poll = pr.id === "where-poll" ? wherePoll : polls[pr.id];
        const totalVotes = Object.values(pr.choices)
          .flat()
          .map((c) => c.voters)
          .flat().length;

        return (
          <div
            key={pr.id}
            className={`p-2 my-2 border border-black ${
              pr.id === room.activePollResult ? "bg-white" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <h2 className="font-bold">
                {poll === undefined ? "Poll deleted" : poll.question}
              </h2>
              <button
                // disabled={room.activePoll === pr.id}
                type="button"
                onClick={() => {
                  if (Object.keys(pollResults).includes(pr.id)) {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- this poll will definitely exist
                    delete pollResults[pr.id];
                  }
                }}
              >
                Del
              </button>
              <button
                type="button"
                onClick={() => {
                  if (room.activePollResult === pr.id) {
                    room.activePollResult = undefined;
                  } else {
                    room.activePollResult = pr.id;
                  }
                }}
              >
                {room.activePollResult === pr.id
                  ? "Unset active"
                  : "Set active"}
              </button>
            </div>
            {Object.values(pr.choices).map((c) => (
              <div key={c.id}>
                <span
                  className="px-2 py-0 text-sm border border-black"
                  title={c.voters.join(",")}
                >
                  {c.voters.length}/{totalVotes} votes
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
