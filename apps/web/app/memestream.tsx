import { useSyncedStore } from "@syncedstore/react";
import { motion, AnimatePresence } from "framer-motion";
import { store } from "./store";

export function MemeStream(): React.ReactElement {
  const { gifFeedItems } = useSyncedStore(store);
  return (
    <div className="relative w-full h-full row-span-4">
      <div className="absolute flex flex-col justify-end w-full h-full overflow-hidden">
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
                animate={{ maxHeight: "600px" }}
                exit={{ maxHeight: 0 }}
                transition={{ duration: 0.8 }}
              >
                <img src={gif.url} alt="some gif" className="block w-full" />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
