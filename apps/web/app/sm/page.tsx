"use client";
import { Tab } from "@headlessui/react";
import cls from "classnames";
import { useEffect, useState } from "react";
import { websocketProvider } from "../store";
import Pollmaker from "./polls";
import Headlines from "./headlines";
import HeadlinePrompts from "./headline-prompts";
import { ChatAdmin } from "./chat-admin";
import Gifs from "./gifs";
import VideoStream from "./video-stream";
import NumOnline from "./online";
import TenHeadlines from "./ten-headlines";

const tabClass = cls(
  "ui-selected:text-pickle-beige ui-selected:bg-pickle-green rounded px-2 py-1 ui-not-selected:bg-pickle-beige ui-not-selected:text-black ui-selected:border ui-selected:border-pickle-beige"
);

export default function Page(): JSX.Element {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setConnected(websocketProvider.wsconnected);
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <main className="min-h-screen bg-pickle-beige">
      <img
        src="/pickle.gif"
        alt="Pickle gif"
        className="w-[30px] h-[30px] rounded-full overflow-hidden block object-contain absolute top-2 right-2"
      />
      <Tab.Group>
        <Tab.List className="flex items-center p-1 bg-black space-x-1 border-b-black">
          <b
            className={`w-3 h-3 border rounded-full ${
              connected ? "bg-pickle-green" : "bg-[transparent]"
            } block border-pickle-beige`}
          />

          <b className="w-24 font-mono text-xs font-normal text-pickle-beige">
            <NumOnline /> online
          </b>

          <Tab className={tabClass}>Polls</Tab>
          <Tab className={tabClass}>Chat</Tab>
          <Tab className={tabClass}>GPT Prompts</Tab>
          <Tab className={tabClass}>Ticker Tape</Tab>
          {/* <Tab className={tabClass}>Headlines</Tab> */}
          <Tab className={tabClass}>GIFs</Tab>
          <Tab className={tabClass}>Show</Tab>
        </Tab.List>

        <Tab.Panel>
          <Pollmaker />
        </Tab.Panel>

        <Tab.Panel>
          <ChatAdmin />
        </Tab.Panel>

        <Tab.Panel>
          <HeadlinePrompts />
        </Tab.Panel>

        <Tab.Panel>
          <Headlines />
        </Tab.Panel>

        {/*
					<Tab.Panel>
						<TenHeadlines />
					</Tab.Panel>
					*/}

        <Tab.Panel>
          <Gifs />
        </Tab.Panel>

        <Tab.Panel>
          <VideoStream />
        </Tab.Panel>
      </Tab.Group>
    </main>
  );
}
