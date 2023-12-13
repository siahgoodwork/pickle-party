"use client";
import { useSyncedStore } from "@syncedstore/react";
import { useEffect, useState } from "react";
// import MuxVideo from "@mux/mux-video-react";
import Marquee from "react-fast-marquee";
import BadWords from "bad-words";
import Chat, { additionalFilterWords } from "./chat";
import { PollView } from "./poll";
import { store, websocketProvider } from "./store";
import GifSearcher from "./gif-searcher";
import { MemeStream } from "./memestream";

export interface UserPresence {
  user?: { name: string };
}

const filter = new BadWords();
filter.addWords(...additionalFilterWords);

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

  const showingPanel1 =
    state.room.chatOn === true || state.room.gifSearchOn === true;

  const showingPanel2 =
    state.room.pollLayout === "B" &&
    ((state.room.showPollView === "poll" &&
      state.room.activePoll !== undefined) ||
      (state.room.showPollView === "result" &&
        state.room.activePollResult !== undefined) ||
      (state.room.showPollTrivia === true &&
        state.room.activePollTrivia !== undefined));

  return (
    <main className="font-vcr">
      <link rel="preload" as="image" href="/continents.svg" />
      <link rel="preload" as="image" href="/iceland.jpg" />

      {onboarding ? (
        <div
          className="w-full h-[100vh] relative"
          style={{ backgroundImage: "url(/bg.jpg)", backgroundSize: "cover" }}
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
                Someone is already using this name
              </span>
            ) : !/^[a-zA-Z]+$/.test(userId) ? (
              <span className="text-sm text-center">alphabets only</span>
            ) : filter.isProfane(userId) ? (
              <span className="text-sm text-center">
                Please choose a different user name
              </span>
            ) : null}
            <button
              type="button"
              disabled={
                !/^[a-zA-Z]+$/.test(userId) ||
                userPresences.map((c) => c.user?.name).includes(userId) ||
                filter.isProfane(userId)
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
        <div
          className="relative flex items-center justify-center w-screen h-screen"
          style={{ backgroundImage: "url(/bg.jpg)", backgroundSize: "cover" }}
        >
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

              <div className="w-full h-full absolute top-0 left-0 z-[30] overlays pointer-events-none">
                {(state.room.showPollView !== undefined &&
                  state.room.pollLayout === "C") ||
                state.room.pollLayout === "D" ||
                state.room.pollLayout === "E" ? (
                  <PollView userId={userId} />
                ) : (
                  false
                )}
                {state.room.showDoubleTicker === true &&
                state.room.showTicker === true ? (
                  <div
                    className={`absolute left-0 top-[1.38%] pl-[0.78%] pointer-events-auto leading-[1] ${
                      showingPanel1 && showingPanel2
                        ? "w-[60%]"
                        : showingPanel1 || showingPanel2
                        ? "w-[80%]"
                        : "w-full pr-[0.78%]"
                    }`}
                  >
                    <div className="py-1 pointer-events-none bg-gradient-to-r from-[#e7587e] to-[#f9fb7f] to-[45%] flex">
                      <div className="font-bebas text-[3.5vh] mx-1 border border-[4px] px-1 border-black bg-white">
                        Pickled&nbsp;News
                      </div>
                      <Marquee>
                        {state.headlines
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
                ) : (
                  false
                )}
                <div
                  className={`absolute left-0 bottom-[1.38%] pl-[0.78%] pointer-events-auto leading-[1] ${
                    showingPanel1 && showingPanel2
                      ? "w-[60%]"
                      : showingPanel1 || showingPanel2
                      ? "w-[80%]"
                      : "w-full pr-[0.78%]"
                  }`}
                >
                  {state.room.showPollView !== undefined &&
                  state.room.pollLayout === "A" ? (
                    <PollView userId={userId} />
                  ) : state.room.showTicker ? (
                    <div className="py-1 pointer-events-none bg-gradient-to-r from-[#e7587e] to-[#f9fb7f] to-[45%] flex">
                      <div className="font-bebas text-[3.5vh] mx-1 border border-[4px] px-1 border-black bg-white">
                        Pickled&nbsp;News
                      </div>
                      <Marquee>
                        {state.headlines
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
                  ) : (
                    false
                  )}
                </div>
                <div
                  className={`absolute pointer-events-none left-0 bottom-[1.38%] h-[23%] pl-[0.78%] ${
                    showingPanel1 && showingPanel2
                      ? "w-[60%]"
                      : showingPanel1 || showingPanel2
                      ? "w-[80%]"
                      : "w-full"
                  }`}
                >
                  {state.room.showMemes ? <MemeStream /> : false}
                </div>

                {(state.room.showPollView && state.room.pollLayout === "B") ||
                state.room.showPollTrivia ? (
                  <div
                    className={`grid grid-rows-4 grid-cols-1 w-[20%] h-full z-[40] absolute top-0  pointer-events-auto ${
                      state.room.chatOn || state.room.gifSearchOn
                        ? "right-[20%]"
                        : "right-0"
                    }`}
                  >
                    {state.room.pollLayout === "B" ? (
                      <PollView userId={userId} />
                    ) : (
                      false
                    )}
                  </div>
                ) : (
                  false
                )}

                {state.room.chatOn || state.room.gifSearchOn ? (
                  <div className="grid grid-rows-4 gap-[1.4%] grid-cols-1 w-[18.43%] h-[97.22%] z-[40] absolute right-[0.781%] top-[1.38%] pointer-events-auto">
                    {state.room.chatOn ? (
                      <div
                        className={`${
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
                        className={`${
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
