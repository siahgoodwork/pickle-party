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
    <div className="fixed top-0 left-0 w-full h-full">
      <img
        src={chatOutput.imageUrl}
        alt="chat output"
        className="absolute object-cover w-full h-full"
      />

      <span className="h-[0]">{yesno ? " " : "  "}</span>
    </div>
  );
}
