import { path } from "@tauri-apps/api";
import { exists, readTextFile } from "@tauri-apps/plugin-fs";

export const checkProject = async (projectPath: string) => {
  const projectFile = await path.join(projectPath, "index.json");
  const projectIndexExists = await exists(projectFile);

  if (!projectIndexExists) {
    return false;
  }

  const fileData = await readTextFile(projectFile);
  try {
    const parsed = JSON.parse(fileData);
    if (!parsed.story || !parsed.story.name) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};
