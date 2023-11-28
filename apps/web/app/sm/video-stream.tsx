import { useSyncedStore } from "@syncedstore/react";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { store } from "../store";

export default function VideoStream(): React.ReactElement {
  const { room } = useSyncedStore(store);
  const [input, setInput] = useState<string>(room.youtubeEmbedUrl || "");

  return (
    <div className="p-2">
      <div className="p-2 mb-4 border border-black">
        Current URL: {room.youtubeEmbedUrl}
      </div>
      <input
        type="text"
        className="w-full p-2 font-mono border border-black"
        value={input}
        placeholder="paste url here"
        onChange={(e) => {
          setInput(e.target.value);
        }}
      />
      <p className="text-sm">
        Paste the youtube url here (the one with ?watch=xxxxxx). It will be
        converted to the proper embed version automatically.{" "}
      </p>
      <button
        className="mt-2"
        type="button"
        onClick={() => {
          const urlObj = new URL(input);
          const search = new URLSearchParams(urlObj.searchParams);
          const v = search.get("v");
          if (v === null) {
            toast.error("invalid youtube url, try again");
            return;
          }
          const embedUrl = `https://youtube.com/embed/${v}?&controls=0&autoplay=1`;
          room.youtubeEmbedUrl = embedUrl;
          setInput(() => "");
        }}
      >
        Update
      </button>
    </div>
  );
}
