import { useEffect } from "react";
import { save } from "../actions/save";

export const useAutosave = (storyLoaded: boolean) => {
  let saveCount = 0;
  const autosavePercentage = 30;
  useEffect(() => {
    if (storyLoaded) {
      const saveInterval = setInterval(() => {
        saveCount++;
        save(saveCount % autosavePercentage === 0).catch((e) => {
          console.error(e);
        });
      }, 10000);

      const handleVisibilityChange = () => {
        save(saveCount % autosavePercentage === 0).catch((e) => {
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
