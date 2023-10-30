"use client";
import { Tab } from "@headlessui/react";
import cls from "classnames";
import { useEffect, useState } from "react";
import { websocketProvider } from "../store";
import Pollmaker from "./polls";
import PollResults from "./poll-results";
import Headlines from "./headlines";
import HeadlinePrompts from "./headline-prompts";

const tabClass = cls(
  "ui-selected:text-white ui-selected:bg-black rounded px-2 py-1 ui-not-selected:bg-[transparent] ui-not-selected:text-black"
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
    <main>
      <b
        className={`w-4 h-4 border ${
          connected ? "bg-green-500" : "bg-[transparent]"
        } block border-black`}
      >
        {" "}
      </b>
      <Tab.Group>
        <Tab.List className="flex p-1 border-b-2 space-x-1 border-b-black">
          <Tab className={tabClass}>Polls</Tab>
          <Tab className={tabClass}>Headline Prompts</Tab>
          <Tab className={tabClass}>Headlines</Tab>
          <Tab className={tabClass}>Results</Tab>
          <Tab className={tabClass}>Stage</Tab>
        </Tab.List>

        <Tab.Panel>
          <Pollmaker />
        </Tab.Panel>

        <Tab.Panel>
          <HeadlinePrompts />
        </Tab.Panel>

        <Tab.Panel>
          <Headlines />
        </Tab.Panel>

        <Tab.Panel>
          <PollResults />
        </Tab.Panel>
      </Tab.Group>
    </main>
  );
}
