import { useSyncedStore } from "@syncedstore/react";
import { useEffect, useState } from "react";
import { store } from "../store";

export function ChatAdmin(): JSX.Element {
  const { chat, room, otherPrompts } = useSyncedStore(store);

  const [thinkingCategory, setThinkingCategory] = useState<boolean>(false);
  const [imaginingPickle, setImaginingPickle] = useState<boolean>(false);

  const [categoriseResult, setCategoriseResult] = useState<{
    title: string;
    content: string;
    reason: string;
  }>();

  const [pickleResult, setPickleResult] = useState("");

  const _chat = [...chat];

  useEffect(() => {
    const chatMessages = document.getElementById("chatMessages");
    if (chatMessages === null) {
      return;
    }

    if (chatMessages.scrollTop < 200) {
      chatMessages.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [chat, chat.length]);

  useEffect(() => {
    if (thinkingCategory) {
      setCategoriseResult(() => undefined);
      setPickleResult(() => "");
      setTimeout(() => {
        setThinkingCategory(() => false);
      }, 30000);
    }
  }, [thinkingCategory]);

  useEffect(() => {
    if (imaginingPickle) {
      setPickleResult(() => "");
      setTimeout(() => {
        setImaginingPickle(() => false);
      }, 30000);
    }
  }, [imaginingPickle]);

  return (
    <div className="py-2">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-2 col-span-2">
          <div className="flex items-center mb-2 gap-2">
            Chatbox:
            <button
              type="button"
              onClick={() => {
                room.chatOn = !room.chatOn;
              }}
            >
              Turn {room.chatOn === true ? "off" : "on"}
            </button>
            <button
              type="button"
              onClick={() => {
                chat.splice(0, chat.length);
              }}
            >
              Clear messages
            </button>
            <button
              type="button"
              onClick={() => {
                const text = _chat
                  .sort(
                    (a, b) =>
                      new Date(a.timestamp).getTime() -
                      new Date(b.timestamp).getTime()
                  )
                  .map((c) => `${c.timestamp} - ${c.sender} : ${c.message}\r\n`)
                  .join("");
                const element = document.createElement("a");
                element.setAttribute(
                  "href",
                  `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
                );
                element.setAttribute(
                  "download",
                  `chat-${new Date().toISOString()}.txt`
                );

                element.style.display = "none";
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
              }}
            >
              Download chat
            </button>
          </div>
          <hr />
          <div
            className="border border-black overflow-scroll no-scroll h-[70vh] bg-white"
            id="chatMessages"
          >
            <div>
              <ul>
                {_chat
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .map((c, n) => (
                    <li
                      key={c.id}
                      className={`flex items-start p-1 gap-4 ${
                        room.chatBanned !== undefined &&
                        room.chatBanned.includes(c.sender)
                          ? "opacity-50"
                          : "opacity-100"
                      }`}
                    >
                      <label className="p-1 text-sm">
                        {c.sender}{" "}
                        <button
                          type="button"
                          className="text-xs"
                          onClick={() => {
                            if (room.chatBanned === undefined) {
                              room.chatBanned = [];
                              return;
                            }
                            if (room.chatBanned.includes(c.sender)) {
                              //unban
                              const i = room.chatBanned.findIndex(
                                (name) => name === c.sender
                              );
                              if (i > -1) {
                                room.chatBanned.splice(i, 1);
                              }
                            } else {
                              room.chatBanned.push(c.sender);
                            }
                          }}
                        >
                          {Array.isArray(room.chatBanned) &&
                          room.chatBanned.includes(c.sender)
                            ? "Unban"
                            : "Ban"}
                        </button>
                      </label>

                      <div className="flex-grow">{c.message}</div>

                      <label
                        className="p-1 text-xs"
                        title={new Date(c.timestamp).toLocaleString()}
                      >
                        {new Date(c.timestamp).toLocaleTimeString()}
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          chat.splice(chat.length - 1 - n, 1);
                        }}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="p-2">
          <h1>Banned from chat</h1>
          <ul className="">
            {Array.isArray(room.chatBanned) &&
              room.chatBanned.map((person) => (
                <li key={person}>
                  {person}{" "}
                  <button
                    className="text-xs"
                    type="button"
                    onClick={() => {
                      if (room.chatBanned === undefined) {
                        return;
                      }
                      const i = room.chatBanned.findIndex(
                        (name) => name === person
                      );
                      if (i > -1) {
                        room.chatBanned.splice(i, 1);
                      }
                    }}
                  >
                    Unban
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="p-2 mx-2 border border-black">
        <h2>Categorise chat</h2>
        <button
          type="button"
          disabled={thinkingCategory}
          onClick={async () => {
            setThinkingCategory(true);
            const chatStr = _chat
              .sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              )
              .map((c) => `${c.timestamp} - ${c.sender} : ${c.message}\r\n`)
              .join("");

            try {
              const req = await fetch("/api/categorise-conversation", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  conversation: chatStr,
                  prompt: otherPrompts.chatCategory || "",
                }),
              });

              const res = (await req.json()) as {
                ok: boolean;
                chatResponse?: {
                  index: 0;
                  message: { role: string; content: string };
                };
              };

              if (res.ok) {
                const payload = JSON.parse(
                  res.chatResponse?.message.content || ""
                ) as {
                  title: string;
                  content: string;
                  reason: string;
                };
                setCategoriseResult(payload);
              } else {
                throw Error("Error getting response from GPT");
              }
              setThinkingCategory(false);
            } catch (err) {
              /* eslint no-console: ["error", { allow: ["warn", "error"] }] -- warn user here */
              console.warn(err);
              /*eslint no-alert: "off" -- allow for now */
              alert("failed to get response from GPT. Try again.");
              setThinkingCategory(false);
            }
          }}
        >
          {thinkingCategory ? "Thinking..." : "Go"}
        </button>
        {categoriseResult !== undefined && (
          <div>
            Type: {categoriseResult.title}
            <br />
            Reason: {categoriseResult.reason}
            <br />
            Content:{" "}
            <div
              className="[&>ul]:list-disc [&>ul]:list-inside"
              dangerouslySetInnerHTML={{ __html: categoriseResult.content }}
            />
            <hr className="my-8 border-t border-black bg-none" />
            <button
              type="button"
              onClick={async () => {
                setImaginingPickle(true);

                const chatStr = _chat
                  .sort(
                    (a, b) =>
                      new Date(a.timestamp).getTime() -
                      new Date(b.timestamp).getTime()
                  )
                  .map((c) => `${c.timestamp} - ${c.sender} : ${c.message}`)
                  .join("  ");

                try {
                  const req = await fetch("/api/imagine-pickle", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      conversation: chatStr,
                      category: categoriseResult.title,
                      description: categoriseResult.content,
                      prompt: otherPrompts.imaginePickle,
                    }),
                  });

                  const res = (await req.json()) as {
                    ok: boolean;
                    chatResponse?: {
                      index: number;
                      message: { role: string; content: string };
                    };
                  };

                  if (res.ok) {
                    setPickleResult(res.chatResponse?.message.content || "");
                    setImaginingPickle(false);
                  } else {
                    throw Error("Error getting response from GPT");
                  }
                } catch (err) {
                  /* eslint no-console: ["error", { allow: ["warn", "error"] }] -- warn user here */
                  console.warn(err);
                  /*eslint no-alert: "off" -- allow for now */
                  alert("failed to get response from GPT. Try again.");
                  setImaginingPickle(false);
                }
              }}
              disabled={imaginingPickle}
            >
              {imaginingPickle ? "thinking..." : "Imagine A Pickle"}
            </button>
            <p>{pickleResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}
