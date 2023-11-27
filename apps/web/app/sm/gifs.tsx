import { useSyncedStore } from "@syncedstore/react";
import { store } from "../store";

export default function Gifs(): React.ReactElement {
  const { room, gifSubmissions, gifFeedItems } = useSyncedStore(store);

  return (
    <div className="p-2">
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
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-2 border border-black">
          <h1 className="mt-4 text-lg font-bold">Submissions</h1>
          <div className="h-[calc(100vh_-_200px)] overflow-scroll no-scroll">
            <div className="grid gap-1 grid-cols-4 ">
              {gifSubmissions.map((gif) => {
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
                      }
                    }}
                  >
                    sender: {gif.sender}
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
        <div className="p-2 border border-black">
          <h1 className="mt-4 text-lg font-bold">GIF Feed</h1>
          <div className="h-[calc(100vh_-_200px)] no-scroll">
            <div className="h-full grid gap-0 grid-cols-2 grid-rows-4">
              {gifFeedItems.map((gif) => {
                const gifIndexInFeed = gifFeedItems.findIndex(
                  (gf) => gf.url === gif.url
                );
                return (
                  <button
                    className="relative p-0 border-0"
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
                      }
                    }}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={gif.url}
                        alt={`gif submitted by ${gif.sender}`}
                        className={`object-cover w-full h-full`}
                      />
                      <span className="text-sm bg-white absolute bottom-0 right-0">
                        {gif.sender}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
