import { useSyncedStore } from "@syncedstore/react";
import { motion, AnimatePresence } from "framer-motion";
import { store } from "./store";

export function MemeStream(): React.ReactElement {
  const { gifFeedItems } = useSyncedStore(store);
  return (
    <div className="relative w-full h-full">
      <div className="absolute flex justify-end w-[2000000px] h-full overflow-hidden right-0 top-0">
        <AnimatePresence>
          {gifFeedItems
            .filter((_gif, index, arr) => {
              if (arr.length < 10) {
                return true;
              }
              return arr.length - index < 10;
            })
            .map((gif) => (
              <motion.div
                key={gif.url}
                animate={{ width: "11.3vw" }}
                exit={{ width: "0vw" }}
                transition={{ duration: 0.8 }}
                className="ml-2 aspect-square"
              >
                <img
                  src={gif.url}
                  alt="some gif"
                  className="block object-contain w-full h-full"
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
