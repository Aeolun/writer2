import { open } from "@tauri-apps/plugin-dialog";
import { settingsState } from "../lib/stores/settings";
import { useNavigate } from "@solidjs/router";
import { openStory } from "../lib/persistence/open-story";
import { For } from "solid-js";

const Home = () => {
  const nav = useNavigate();

  return (
    <div class="flex flex-col h-full bg-base-200">
      <div class="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
        <h1 class="text-2xl font-bold text-center mb-4">Open Story</h1>
        <div class="w-96 flex flex-col m-auto mt-8 gap-4">
          <h2 class="text-xl font-semibold mt-6">Recent stories</h2>
          <div class="space-y-2">
            <For each={settingsState.recentStories}>
              {(story) => (
                <button
                  type="button"
                  class="btn btn-outline btn-primary w-full"
                  onClick={async () => {
                    openStory(story.path);
                    nav("/write");
                  }}
                >
                  {story.name}
                </button>
              )}
            </For>
          </div>
          <button
            type="button"
            class="btn btn-primary"
            onClick={async () => {
              const projectPath = await open({
                multiple: false,
                directory: true,
              });
              if (projectPath) {
                openStory(projectPath);
                nav("/write");
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
