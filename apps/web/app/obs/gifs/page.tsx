"use client";

import { useSyncedStore } from "@syncedstore/react";
import { useEffect } from "react";
import { store } from "../../store";
import { wherePoll } from "../../sm/polls";

export default function Page(): React.ReactElement {
  useEffect(() => {
    const body = document.querySelector("body");
    if (body === null) {
      return;
    }
    body.style.background = "transparent";
  }, []);
  const { gifFeedItems } = useSyncedStore(store);

  if (gifFeedItems === undefined || gifFeedItems.length < 1) {
    return <div />;
  }

  return (
    <div className="w-full h-full">
      <div className="h-full w-[50%] absolute top-0 left-[50%] grid gap-0 grid-cols-2 grid-rows-4">
        {gifFeedItems.map((gif) => {
          const gifIndexInFeed = gifFeedItems.findIndex(
            (gf) => gf.url === gif.url
          );
          return (
            <div className="relative w-full h-full" key={gif.url}>
              <img
                src={gif.url}
                alt={`gif submitted by ${gif.sender}`}
                className={`object-cover w-full h-full`}
              />
              <span className="absolute bottom-0 right-0 text-sm bg-white">
                {gif.sender}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
