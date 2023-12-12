"use client";

import { useSyncedStore } from "@syncedstore/react";
import Marquee from "react-fast-marquee";
import { store } from "../store";

export default function Ticker(): React.ReactNode {
  const { headlines } = useSyncedStore(store);

  if (headlines.length < 1) {
    return "loading";
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full">
      <div className="video-frame left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full absolute">
        <div className="absolute left-0 top-[1.38%] pl-[0.78%] pointer-events-auto leading-[1] w-full pr-[0.78%]">
          <div className="py-1 pointer-events-none bg-gradient-to-r from-[#e7587e] to-[#f9fb7f] to-[45%] flex">
            <div className="font-bebas text-[3.5vh] mx-1 border border-[4px] px-1 border-black bg-white">
              Pickled&nbsp;News
            </div>
            <Marquee>
              {headlines
                .filter((h) => h.active)
                .sort((a, b) => (a.text > b.text ? 1 : -1))
                .map((headline) => {
                  return (
                    <span
                      key={headline.id}
                      className="text-[4vh] px-[1em] block font-bebas"
                    >
                      {headline.text}
                    </span>
                  );
                })}
            </Marquee>
          </div>
        </div>
        <div className="absolute left-0 bottom-[1.38%] pl-[0.78%] pointer-events-auto leading-[1] w-full pr-[0.78%]">
          <div className="py-1 pointer-events-none bg-gradient-to-r from-[#e7587e] to-[#f9fb7f] to-[45%] flex">
            <div className="font-bebas text-[3.5vh] mx-1 border border-[4px] px-1 border-black bg-white">
              Pickled&nbsp;News
            </div>
            <Marquee>
              {headlines
                .filter((h) => h.active)
                .map((headline) => {
                  return (
                    <span
                      key={headline.id}
                      className="text-[4vh] px-[1em] block font-bebas"
                    >
                      {headline.text}
                    </span>
                  );
                })}
            </Marquee>
          </div>
        </div>
      </div>
    </div>
  );
}
