"use client";
import { Tab } from "@headlessui/react";
import cls from "classnames";
import Pollmaker from "./polls";
import { status } from "../store";

const tabClass = cls(
  "ui-selected:text-white ui-selected:bg-black rounded px-2 py-1 ui-not-selected:bg-[transparent] ui-not-selected:text-black"
);

export default function Page(): JSX.Element {
  return (
    <main>
      {status() ? "connected" : "disconnected"}
      <Tab.Group>
        <Tab.List className="flex p-1 border-b-2 space-x-1 border-b-black">
          <Tab className={tabClass}>Polls</Tab>
          <Tab className={tabClass}>Results</Tab>
          <Tab className={tabClass}>Stage</Tab>
        </Tab.List>
        <Tab.Panel>
          <Pollmaker />
        </Tab.Panel>
      </Tab.Group>
    </main>
  );
}
