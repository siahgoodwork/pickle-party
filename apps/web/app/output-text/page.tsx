"use client";

import { useSyncedStore } from "@syncedstore/react";
import { useEffect, useState } from "react";
import { store } from "../store";

export default function Ticker(): React.ReactNode {
  const { chatOutput } = useSyncedStore(store);
  const [yesno, setYesno] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setYesno((a) => !a);
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full"
      style={{
        backgroundImage: "url(/output-text-bg.jpg)",
        backgroundSize: "cover",
      }}
    >
      <h1 className="w-[80vw] text-[3vw] whitespace-pre-line font-vcr leading-[1.1] mb-12 text-left">
        {chatOutput.heading}
      </h1>
      <p className="w-[80vw] text-[2vw] whitespace-pre-line font-vcr leading-[1.1] text-left">
        {chatOutput.body}
      </p>

      <span className="h-[0]">{yesno ? " " : "  "}</span>
    </div>
  );
}
