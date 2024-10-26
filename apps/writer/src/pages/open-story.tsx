import { open } from "@tauri-apps/plugin-dialog";
import { checkProject } from "../lib/persistence/check-project";
import { loadProject } from "../lib/persistence/load-project";
import { setSetting, settingsState } from "../lib/stores/settings";
import { useNavigate } from "@solidjs/router";

const Home = () => {
  const nav = useNavigate();
  const recentStories = settingsState.recentStories;

  return (
    <div class="flex flex-col h-full bg-base-200">
      <div class="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
        <h1 class="text-2xl font-bold text-center mb-4">Open Story</h1>
        <div class="w-96 flex flex-col m-auto mt-8 gap-4">
          <h2 class="text-xl font-semibold mt-6">Recent stories</h2>
          <div class="space-y-2">
            {recentStories.map((story) => (
              <button
                type="button"
                class="btn btn-outline btn-primary w-full"
                onClick={async () => {
                  try {
                    const loadedStory = await loadProject(story.path);
                    setSetting("recentStories", [
                      { name: story.name, path: story.path },
                      ...recentStories
                        .filter((r) => r.path !== story.path)
                        .slice(0, 9),
                    ]);
                    nav("/write");
                  } catch (error) {
                    if (error instanceof Error) {
                      alert(error.message);
                    } else {
                      alert("Unknown error occurred");
                    }
                  }
                }}
              >
                {story.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            class="btn btn-primary"
            onClick={async () => {
              const projectPath = await open({
                multiple: false,
                directory: true,
              });
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
                  ...recentStories
                    .filter((r) => r.path !== projectPath)
                    .slice(0, 9),
                ]);
                setLocation("/");
              } catch (error) {
                if (error instanceof Error) {
                  alert(error.message);
                } else {
                  alert("Unknown error occurred");
                }
              }
            }}
          >
            Select a location from disk
          </button>
          <a href="/new-story" class="mt-12">
            <button type="button" class="btn btn-accent w-full">
              Create a new story
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
