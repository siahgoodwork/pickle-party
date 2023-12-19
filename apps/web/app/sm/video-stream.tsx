import { useSyncedStore } from "@syncedstore/react";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import type { UserPresence } from "../page";
import { store, websocketProvider } from "../store";

export default function VideoStream(): React.ReactElement {
  const { room } = useSyncedStore(store);
  const [input, setInput] = useState<string>(room.youtubeEmbedUrl || "");
  const [roomPwInput, setRoomPwInput] = useState("");
  const [userPresences, setUserPresences] = useState<UserPresence[]>([]);

  useEffect(() => {
    const awareness = websocketProvider.awareness;
    const handleChange = function (): void {
      const users = Array.from(awareness.getStates().values()).filter(
        (a: UserPresence) =>
          a.user !== undefined && typeof a.user.name === "string"
      );
      setUserPresences(users);
    };

    awareness.on("change", handleChange);

    handleChange();

    return () => {
      awareness.off("change", handleChange);
    };
  }, []);

  return (
    <div className="flex flex-col">
      <div className="p-2 mux-controls">
        <h2 className="my-2 font-bold">Room Password</h2>
        Current Password: {room.password}
        <br />
        <input
          type="text"
          value={roomPwInput}
          onChange={(e) => {
            setRoomPwInput(e.target.value);
          }}
        />
        <button
          type="button"
          onClick={() => {
            room.password = roomPwInput;
            setRoomPwInput("");
          }}
        >
          Set Password
        </button>
      </div>
      <div className="p-2 mux-controls">
        <h2 className="my-2 font-bold">Mux Stream</h2>
        <div>
          <label>
            Stream key
            <input
              className="w-full"
              value="307b85a2-a17e-fd30-f6ff-f14b71126f73"
            />
          </label>
          <label>
            {" "}
            RTMP URL
            <input
              className="w-full"
              value="rtmp://global-live.mux.com:5222/app"
            />
          </label>
        </div>
      </div>

      <div className="p-2">
        <h2 className="my-2 font-bold">Now Online ({userPresences.length})</h2>
        <ul className="grid grid-cols-4">
          {userPresences
            .sort((a, b) =>
              a.user?.name === undefined
                ? -1
                : b.user?.name === undefined
                ? 1
                : a.user.name > b.user.name
                ? 1
                : -1
            )
            .map((user) => (
              <li key={user.user?.name}>{user.user?.name}</li>
            ))}
        </ul>
      </div>
      <div className="hidden p-2">
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
      <div className="p-4">
        <h2 className="font-bold">Blackout</h2>
        <button
          type="button"
          className={
            !room.curtains
              ? "bg-pickle-green text-pickle-beige hover:bg-pickle-green/90"
              : ""
          }
          onClick={() => {
            room.curtains = false;
          }}
        >
          Show time
        </button>
        <button
          type="button"
          className={
            room.curtains
              ? "bg-pickle-green text-pickle-beige hover:bg-pickle-green/90"
              : ""
          }
          onClick={() => {
            room.curtains = true;
          }}
        >
          Black out
        </button>
      </div>
    </div>
  );
}
