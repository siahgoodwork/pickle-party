"use client";

import { useSyncedStore } from "@syncedstore/react";
import { useEffect } from "react";
import Marquee from "react-fast-marquee";
import { store } from "../../store";

export default function Page(): React.ReactElement {
  useEffect(() => {
    const body = document.querySelector("body");
    if (body === null) {
      return;
    }
    body.style.background = "transparent";
  }, []);
  const { headlines } = useSyncedStore(store);

  if (headlines.length < 1) {
    return <div />;
  }

  return (
    <div className="w-full h-full">
      <div className="absolute bottom-0 left-0 w-full bg-white py-[1vh]">
        <Marquee>
          {headlines
            .filter((h) => h.active)
            .map((headline) => {
              return (
                <span key={headline.id} className="text-[3vh] px-[3em] block">
                  {headline.text}
                </span>
              );
            })}
        </Marquee>
      </div>
    </div>
  );
}
