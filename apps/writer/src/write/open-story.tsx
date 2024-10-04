import { Button, Flex, Heading } from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-dialog";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { settingsStore } from "../global-settings-store.ts";
import { checkProject } from "../lib/persistence/check-project";
import { loadProject } from "../lib/persistence/load-project";

const Home = () => {
  const [location, setLocation] = useLocation();
  const [recentStories, setRecentStories] = useState<
    { name: string; path: string }[]
  >([]);
  useEffect(() => {
    settingsStore.get("recent-stories").then((stories) => {
      if (stories && Array.isArray(stories)) {
        setRecentStories(stories);
      }
    });
  }, []);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <Flex flex={1} direction={"column"} p={4} gap={2} overflow={"hidden"}>
        <Heading size={"lg"}>Open Story</Heading>
        <Flex width={"80"} direction={"column"} margin={"4em auto"}>
          No story is loaded, load a story?
          <Button
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
                settingsStore
                  .set("recent-stories", [
                    { name: story.story.name, path: projectPath },
                    ...recentStories
                      .filter((r) => r.path !== projectPath)
                      .slice(0, 9),
                  ])
                  .then(() => {
                    return settingsStore.save();
                  })
                  .catch((error) => {
                    console.error("Error saving recent stories", error);
                  });
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
            Load from disk
          </Button>
          <Heading>Recent stories</Heading>
          {recentStories.map((story) => (
            <Button
              key={story.name}
              onClick={async () => {
                try {
                  const loadedStory = await loadProject(story.path);
                  settingsStore
                    .set("recent-stories", [
                      { name: loadedStory.story.name, path: story.path },
                      ...recentStories
                        .filter((r) => r.path !== story.path)
                        .slice(0, 9),
                    ])
                    .then(() => {
                      return settingsStore.save();
                    })
                    .catch((error) => {
                      console.error("Error saving recent stories", error);
                    });
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
              {story.name}
            </Button>
          ))}
          <Link href={"/new-story"}>
            <Button>Create a new story</Button>
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Home;
