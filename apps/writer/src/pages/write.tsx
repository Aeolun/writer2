import { Component } from "solid-js";
import { StoryNavigation } from "../components/StoryNavigation";
import { StoryPane } from "../components/StoryPane";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu";

const Home: Component = () => {
  return (
    <div class="flex flex-col h-full">
      <WriteHeaderMenu />
      <div class="flex flex-1 overflow-hidden">
        <StoryNavigation />
        <StoryPane />
      </div>
    </div>
  );
};

export default Home;
