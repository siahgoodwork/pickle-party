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

  if (chatOutput.imageUrl === undefined) {
    return <div className="fixed top-0 left-0 w-full h-full">No image</div>;
  }

  return (
    <div
      className="fixed top-0 left-0 w-full h-full"
      style={{
        backgroundImage: "url(/output-image-bg.jpg)",
        backgroundSize: "cover",
      }}
    >
      <img
        src={chatOutput.imageUrl}
        alt="chat output"
        className="absolute object-cover w-[80%] aspect-video top-[45%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
      />
      <span className="text-[3vw] text-center absolute top-[86%] w-full left-0 font-vcr">
        {chatOutput.pickleName}
      </span>

      <span className="h-[0]">{yesno ? " " : "  "}</span>
    </div>
  );
}
