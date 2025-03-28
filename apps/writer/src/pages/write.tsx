import { Component } from "solid-js";
import { StoryNavigation } from "../components/StoryNavigation";
import { StoryPane } from "../components/StoryPane";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu";
import { storyState } from "../lib/stores/story";
const Home: Component = () => {
  return storyState.openPath ? (
    <div class="flex flex-col h-full">
      <WriteHeaderMenu />
      <div class="flex flex-1 overflow-hidden">
        <StoryNavigation />
        <StoryPane />
      </div>
    </div>
  ) : (
    <div>
      <h1>No story open</h1>
    </div>
  );
};

export default Home;
