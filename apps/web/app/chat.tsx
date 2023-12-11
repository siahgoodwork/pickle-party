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

  useEffect(() => {
    const handleResize: () => void = () => {
      const container = document.getElementById("chat-container");
      const msgDiv = document.getElementById("chatMessages");
      if (container === null || msgDiv === null) {
        return;
      }
      const cHeight = container.offsetHeight;
      const targetHeight = `${cHeight * 0.8 - 43}px`;
      msgDiv.style.height = targetHeight;
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [
    room.chatOn,
    // TODO: add room.gifSearcherOn dependency
  ]);

  return (
    <div
      className="w-full h-full"
      style={{ backgroundImage: "url(/chat-bg.jpg)", backgroundSize: "cover" }}
    >
      {room.chatOn === true ? (
        <div className="h-full" id="chat-container">
          <div
            className="w-full aspect-[3.6] flex items-center justify-start overflow-hidden"
            style={{
              backgroundImage: "url(/chat-heading.jpg)",
              backgroundSize: "cover",
            }}
          >
            <h1 className="p-2 leading-[1.2]">
              Pickle Messenger
              <br />({userPresences.length} online)
            </h1>
          </div>
          <div id="chat" className="flex flex-col-reverse">
            <div className="flex-shrink-0 w-full p-1 height-24">
              <div className="flex items-center m-1 bg-white gap-0">
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
                |
                <button
                  type="button"
                  className="border-0 "
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
            </div>

            <div
              className="px-2 py-4 overflow-scroll messages no-scroll"
              //key="chat-message"
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
                      className={`p-1 text-sm pointer-events-none sender flex-shrink-0 w-[5em] truncate text-black/90 text-xs ${
                        (chatArr[n - 1] as ChatMessage | undefined) !==
                          undefined && chatArr[n - 1].sender === msg.sender
                          ? "opacity-0 md:h-auto h-[0] md:overflow-hidden"
                          : ""
                      }`}
                    >
                      {msg.sender}
                    </label>
                    <span
                      className={`flex-grow p-1 px-2 text-sm ${
                        msg.sender === userId ? "bg-[#31e4ee]" : "bg-white"
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
