import { useSyncedStore } from "@syncedstore/react";
import { store } from "../store";

export default function Page(): React.ReactElement {
  const state = useSyncedStore(store);
  return (
    <div className="p-4">
      <h1>Results</h1>
      {state.pollResults.map((pr) => (
        <div key={pr.id} className="p-2 my-2 border border-black">
          {pr.choices.map((c) => (
            <div key={c.id}>
              {c.id} <br />
              {c.voters.join(",")}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
