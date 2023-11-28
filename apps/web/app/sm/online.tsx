import { useEffect, useState } from "react";
import type { UserPresence } from "../page";
import { websocketProvider } from "../store";

export default function NumOnline(): React.ReactElement {
  const [userPresences, setUserPresences] = useState<UserPresence[]>([]);

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
  return <span>{userPresences.length}</span>;
}
