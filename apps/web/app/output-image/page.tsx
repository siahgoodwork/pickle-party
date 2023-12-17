"use client";

import { useSyncedStore } from "@syncedstore/react";
import { store } from "../store";

export default function Ticker(): React.ReactNode {
  const { chatOutput } = useSyncedStore(store);

  //eslint-disable-next-line -- debugging
  console.log(chatOutput.imageUrl);

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
    </div>
  );
}
