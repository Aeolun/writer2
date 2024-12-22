import { checkProject } from "./check-project";
import { loadProject } from "./load-project";
import { setSetting, settingsState } from "../stores/settings";

export const openStory = async (projectPath: string) => {
  if (!projectPath) {
    alert("Please select a folder");
    return;
  }
  const validProject = await checkProject(projectPath);
  if (!validProject) {
    alert("This is not a folder with a writer project");
    return;
  }
  try {
    const story = await loadProject(projectPath);
    setSetting("recentStories", [
      { name: story.story.name, path: projectPath },
      ...settingsState.recentStories
        .filter((r) => r.path !== projectPath)
        .slice(0, 9),
    ]);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      alert(error.message);
    } else {
      console.error(error);
      alert("Unknown error occurred");
    }
  }
};
