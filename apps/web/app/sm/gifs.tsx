import { useSyncedStore } from "@syncedstore/react";
import { AnimatePresence, motion } from "framer-motion";
import { store } from "../store";

export default function Gifs(): React.ReactElement {
  const { room, gifSubmissions, gifFeedItems } = useSyncedStore(store);

  return (
    <div className="p-2">
      <div className="flex gap-4">
        <div>
          Gifs:{" "}
          <button
            type="button"
            onClick={() => {
              room.gifSearchOn = !room.gifSearchOn;
            }}
          >
            Turn {room.gifSearchOn ? "off" : "on"}
          </button>
        </div>
        <div>
          Show Memes:{" "}
          <button
            type="button"
            onClick={() => {
              room.showMemes = !room.showMemes;
            }}
          >
            Turn {room.showMemes ? "off" : "on"}
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[auto_170px] gap-4 h-[calc(100vh_-_120px)]">
        <div className="p-2 border border-black">
          <h1 className="mt-4 text-lg font-bold">Submissions</h1>
          <button
            type="button"
            className="my-4"
            onClick={() => {
              gifSubmissions.splice(0, gifSubmissions.length);
            }}
          >
            Clear submissions
          </button>
          <div className="h-[calc(100vh_-_250px)] overflow-scroll no-scroll">
            <div className="grid gap-1 grid-cols-6">
              {gifSubmissions.map((gif, gifIndex) => {
                const gifIndexInFeed = gifFeedItems.findIndex(
                  (gf) => gf.url === gif.url
                );
                return (
                  <button
                    className="p-2 border"
                    key={gif.url}
                    type="button"
                    onClick={() => {
                      if (gifIndexInFeed > -1) {
                        gifFeedItems.splice(gifIndexInFeed, 1);
                      } else {
                        gifFeedItems.push({
                          url: gif.url,
                          sender: gif.sender,
                        });

                        if (gifFeedItems.length > 15) {
                          gifFeedItems.splice(0, gifFeedItems.length - 15);
                        }
                      }
                    }}
                  >
                    <p className="mb-2 text-sm">
                      sender: {gif.sender}{" "}
                      <button
                        type="button"
                        className="text-xs"
                        onClick={(e) => {
                          gifSubmissions.splice(gifIndex, 1);
                          e.stopPropagation();
                        }}
                      >
                        Del
                      </button>
                    </p>
                    <div className="relative w-full aspect-square">
                      <img
                        src={gif.url}
                        alt={`gif submitted by ${gif.sender}`}
                        className={`object-contain w-full h-full ${
                          gifIndexInFeed > -1 ? "opacity-25" : "opacity-100"
                        }`}
                      />

                      {gifIndexInFeed > -1 && (
                        <b className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] z-3 text-black bg-white px-2">
                          selected
                        </b>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative w-full p-2 border border-black">
          <h1 className="mt-4 text-lg font-bold">GIF Feed</h1>
          <div className="absolute flex flex-col justify-end w-full h-[calc(100%_-_60px)] overflow-hidden">
            <AnimatePresence>
              {gifFeedItems
                .filter((_gif, index, arr) => {
                  if (arr.length < 10) {
                    return true;
                  }
                  return arr.length - index < 10;
                })
                .map((gif) => {
                  const gifIndexInFeed = gifFeedItems.findIndex(
                    (gf) => gf.url === gif.url
                  );

                  return (
                    <motion.div
                      key={gif.url}
                      className="w-[150px]"
                      animate={{ maxHeight: "600px" }}
                      exit={{ maxHeight: 0 }}
                    >
                      <button
                        type="button"
                        className="w-full"
                        onClick={() => {
                          if (gifIndexInFeed > -1) {
                            gifFeedItems.splice(gifIndexInFeed, 1);
                          } else {
                            gifFeedItems.push({
                              url: gif.url,
                              sender: gif.sender,
                            });
                          }
                        }}
                      >
                        <img
                          src={gif.url}
                          alt="some gif"
                          className="block w-full max-w-[150px] h-auto"
                        />
                      </button>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
