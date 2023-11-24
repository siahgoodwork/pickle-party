"use client";

import { useSyncedStore } from "@syncedstore/react";
import { nanoid } from "nanoid";
import type { ReactElement } from "react";
import { useState, useCallback, useEffect } from "react";
import type { ChatMessage } from "pickle-types";
import { store, websocketProvider } from "./store";
import type { UserPresence } from "./page";

export default function Page({ userId }: { userId: string }): ReactElement {
  const [chatInput, setChatInput] = useState("");
  const { chat, room } = useSyncedStore(store);
  const [userPresences, setUserPresences] = useState<UserPresence[]>([]);
  const _chat = [...chat].filter((c) =>
    room.chatBanned === undefined
      ? true
      : !room.chatBanned.includes(c.sender) || c.sender === userId
  );

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

  useEffect(() => {
    const messageDiv = document.getElementById("chatMessages");
    if (messageDiv === null) {
      return;
    }
    const msgScrollY = messageDiv.scrollTop;
    const msgHeight = messageDiv.offsetHeight;
    const msgScrollHeight = messageDiv.scrollHeight;

    if (Math.abs(msgScrollHeight - (msgScrollY + msgHeight)) < msgHeight) {
      messageDiv.scrollTo({
        top: messageDiv.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chat, chat.length]);

  useEffect(() => {
    const messageDiv = document.getElementById("chatMessages");
    if (messageDiv === null) {
      return;
    }

    messageDiv.scrollTo({
      top: messageDiv.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const sendMessage = useCallback(
    (msg: ChatMessage) => {
      chat.push(msg);
      setChatInput("");

      const messageDiv = document.getElementById("chatMessages");
      if (messageDiv === null) {
        return;
      }

      setTimeout(() => {
        messageDiv.scrollTo({
          top: messageDiv.scrollHeight,
          behavior: "smooth",
        });
      }, 600);
    },
    [chat, setChatInput]
  );

  return (
    <div className="w-full h-full">
      {room.chatOn === true ? (
        <div className="h-full">
          <h1 className="p-2 text-xs text-white uppercase bg-black">
            Pickle Messenger ({userPresences.length} online)
          </h1>
          <div id="chat" className="flex flex-col-reverse">
            <div className="flex flex-shrink-0 w-full p-1 border-t border-black height-24 gap-2">
              <input
                type="text"
                value={chatInput}
                className="flex-grow min-w-0 px-2"
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    sendMessage({
                      message: chatInput,
                      id: nanoid(),
                      sender: userId,
                      timestamp: new Date().toISOString(),
                    });
                  }
                }}
                onChange={(e) => {
                  setChatInput(e.target.value);
                }}
              />

              <button
                type="button"
                className="w-40px"
                onClick={() => {
                  sendMessage({
                    message: chatInput,
                    id: nanoid(),
                    sender: userId,
                    timestamp: new Date().toISOString(),
                  });
                }}
              >
                Send
              </button>
            </div>

            <div
              className="h-[calc(100vh_-_160px)] px-2 py-4 overflow-scroll messages no-scroll bg-white"
              key="chat-message"
              id="chatMessages"
            >
              {_chat
                .sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                )
                .map((msg, n, chatArr) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col items-start md:flex-row message gap-1 md:gap-2
											${
                        (chatArr[n - 1] as ChatMessage | undefined) !==
                          undefined && chatArr[n - 1].sender === msg.sender
                          ? "mt-1"
                          : "mt-4"
                      }
											`}
                  >
                    <label
                      className={`p-1 text-sm pointer-events-none sender flex-shrink-0 w-[5em] truncate text-black/50 ${
                        (chatArr[n - 1] as ChatMessage | undefined) !==
                          undefined && chatArr[n - 1].sender === msg.sender
                          ? "opacity-0 md:h-auto h-[0] md:overflow-hidden"
                          : ""
                      }`}
                    >
                      {msg.sender}
                    </label>
                    <span
                      className={`flex-grow p-1 px-2 border-pickle-green/20 border rounded ${
                        msg.sender === userId
                          ? "bg-pickle-beige/50"
                          : "bg-pickle-beige/10"
                      }`}
                    >
                      {msg.message}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div>Quiet time</div>
      )}
    </div>
  );
}
