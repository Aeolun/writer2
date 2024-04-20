import { useEffect } from "react";
import { save } from "../actions/save";

export const useAutosave = (storyLoaded: boolean) => {
  useEffect(() => {
    if (storyLoaded) {
      const saveInterval = setInterval(() => {
        save().catch((e) => {
          console.error(e);
        });
      }, 10000);

      const handleVisibilityChange = () => {
        save().catch((e) => {
          console.error(e);
        });
      };
      // this to immediately throw a 409 if the story has been updated elsewhere
      window.addEventListener("focus", handleVisibilityChange);

      return () => {
        clearInterval(saveInterval);
        window.removeEventListener("focus", handleVisibilityChange);
      };
    }
  }, [storyLoaded]);
};
