"use client";
import { useSyncedStore } from "@syncedstore/react";
import { useEffect, useState } from "react";
// import MuxVideo from "@mux/mux-video-react";
import Chat from "./chat";
import { PollView } from "./poll";
import { store, websocketProvider } from "./store";
import GifSearcher from "./gif-searcher";
import { MemeStream } from "./memestream";

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
        <div className="relative flex items-center justify-center w-screen h-screen">
          <div className="video-frame">
            <div className="relative w-full h-full">
              {/* <MuxVideo
										className="w-full aspect-video max-h-[100%] object-contain"
										playbackId="KC00JDCS9NLiZ8Oh7Z9xCJd71y9PWwkIvNPUZJghVcQA"
										streamType="on-demand"
										controls
										autoPlay
										muted
									/>
									*/}
              <iframe
                className="w-full aspect-video max-h-[100%] object-contain"
                src={state.room.youtubeEmbedUrl || ""}
                title="video frame"
              />

              <div className="w-full h-full absolute top-0 left-0 z-[30] overlays">
                {(state.room.showPollView && state.room.pollLayout === "B") ||
                state.room.showPollTrivia ||
                state.room.showMemes ? (
                  <div
                    className={`grid grid-rows-4 grid-cols-1 w-[20%] h-full z-[40] absolute top-0 bg-white ${
                      state.room.chatOn || state.room.gifSearchOn
                        ? "right-[20%]"
                        : "right-0"
                    }`}
                  >
                    {state.room.showMemes ? (
                      <MemeStream />
                    ) : (
                      <PollView userId={userId} />
                    )}
                  </div>
                ) : (
                  false
                )}

                {state.room.chatOn || state.room.gifSearchOn ? (
                  <div className="grid grid-rows-4 grid-cols-1 w-[20%] h-full z-[40] absolute right-0 top-0 bg-white">
                    {state.room.chatOn ? (
                      <div
                        className={`border border-black rounded ${
                          state.room.gifSearchOn ? "row-span-2" : "row-span-4"
                        }`}
                      >
                        <Chat
                          userId={userId}
                          key={`chat_${
                            state.room.gifSearchOn
                              ? "with_chat"
                              : "without_chat"
                          }`}
                        />
                      </div>
                    ) : (
                      false
                    )}
                    {state.room.gifSearchOn ? (
                      <div
                        className={`border border-black rounded ${
                          state.room.chatOn ? "row-span-2" : "row-span-4"
                        }`}
                      >
                        <GifSearcher userId={userId} />
                      </div>
                    ) : (
                      false
                    )}
                  </div>
                ) : (
                  false
                )}
              </div>
            </div>
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
