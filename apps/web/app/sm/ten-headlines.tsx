import { useSyncedStore } from "@syncedstore/react";
import { useMemo, useState } from "react";
import { store } from "../store";

interface ChatResponse {
  ok: boolean;
  chatResponse: { message: { role: string; content: string } };
}

export default function TenHeadlines(): React.ReactElement {
  const {
    polls,
    pollResults,
    selectedPollResultsForHeadlines,
    otherPrompts,
    tenHeadlines,
  } = useSyncedStore(store);
  const [generatingHeadline, setGeneratingHeadline] = useState(false);

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
  return (
    <div>
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

              if (contentObj.headlines && contentObj.headlines.length > 0) {
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
      <ul>
        {Array.isArray(tenHeadlines) &&
          tenHeadlines.map((hl) => <li key={hl}>{hl}</li>)}
      </ul>
    </div>
  );
}
