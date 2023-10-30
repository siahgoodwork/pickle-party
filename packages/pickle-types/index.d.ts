import { JSONValue } from "@syncedstore/core";
interface Room {
  activePoll: string;
}

interface Poll extends JSONValue {
  id: string;
  question: string;
  choices: PollChoice[];
}

interface PollChoice {
  id: string;
  text: string;
}

export type { Room, Poll };
