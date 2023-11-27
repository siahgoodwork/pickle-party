"use client";
import { useSyncedStore } from "@syncedstore/react";
import { useEffect, useState } from "react";
import Chat from "./chat";
import { PollView } from "./poll";
import { store, websocketProvider } from "./store";
import GifSearcher from "./gif-searcher";

// Get the Yjs document and sync automatically using y-webrtc

export interface UserPresence {
  user?: { name: string };
}

export default function Page(): JSX.Element {
  const state = useSyncedStore(store);
  const [connected, setConnected] = useState(false);

  const [userId, setUserId] = useState<string>("");
  const [onboarding, setOnboarding] = useState(true);
  const [userPresences, setUserPresences] = useState<UserPresence[]>([]);

  useEffect(() => {
    const awareness = websocketProvider.awareness;
    const handleChange = function (): void {
      setUserPresences(
        Array.from(awareness.getStates().values()).filter(
          (a: UserPresence) =>
            a.user !== undefined && typeof a.user.name === "string"
        )
      );
    };
    awareness.on("change", handleChange);
    handleChange();

    const id = setInterval(() => {
      setConnected(websocketProvider.wsconnected);
    }, 1000);
    return () => {
      clearInterval(id);
      awareness.off("change", handleChange);
    };
  }, []);

  return (
    <main>
      {onboarding ? (
        <div
          className="w-full h-[100vh] relative"
          style={{ backgroundImage: "url(/bg.jpg)", backgroundSize: "400px" }}
        >
          <div className="bg-pickle-beige absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 flex flex-col gap-2">
            <h1 className="text-lg font-bold text-center text-pickle-purple">
              What is your name?
            </h1>
            <input
              type="text"
              id="userid_input"
              className="block p-2 text-lg text-center border border-black"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
              }}
              placeholder="Your name"
              data-1p-ignore
            />
            {userPresences.map((c) => c.user?.name).includes(userId) ? (
              <span className="text-sm text-center">
                Someone is already using this name{" "}
              </span>
            ) : !/^[a-zA-Z]+$/.test(userId) ? (
              <span className="text-sm text-center">alphabets only</span>
            ) : null}
            <button
              type="button"
              disabled={
                !/^[a-zA-Z]+$/.test(userId) ||
                userPresences.map((c) => c.user?.name).includes(userId)
              }
              onClick={() => {
                if (userPresences.map((c) => c.user?.name).includes(userId)) {
                  return;
                }

                const awareness = websocketProvider.awareness;
                awareness.setLocalStateField("user", { name: userId });
                setOnboarding(false);
              }}
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 grid-cols-4 grid gap-2 grid-rows-4 h-[calc(100vh_-_50px)]">
          <div
            className={`${
              state.room.chatOn ? "col-span-3" : "col-span-4"
            } row-span-4`}
            id="video-frame"
          >
            <div className="flex items-center w-full h-full p-2 bg-pickle-green">
              <div className="relative flex items-center justify-center w-full h-auto border aspect-video text-pickle-beige border-pickle-beige">
                <div>live video here</div>
                <PollView userId={userId} />
              </div>
            </div>
          </div>

          {state.room.chatOn ? (
            <div className="border border-black rounded row-span-2">
              <Chat userId={userId} />
            </div>
          ) : null}
          <div className="border border-black rounded row-span-2">
            <GifSearcher userId={userId} />
          </div>
        </div>
      )}

      {connected ? null : (
        <div className="fixed top-0 left-0 w-full h-full z-19 bg-pickle-purple/80 backdrop-blur">
          <div className="bg-pickle-beige absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 flex flex-col gap-2 z-20">
            <h1 className="text-lg font-bold text-center text-pickle-purple">
              Disconnected
            </h1>
            <p>Connecting...</p>
          </div>
        </div>
      )}
    </main>
  );
}
