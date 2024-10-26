import { StoryNavigation } from "../components/StoryNavigation.tsx";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu.tsx";
import { SearchPane } from "../components/SearchPane.tsx";

const Search = () => {
  return (
    <div class="flex flex-col h-full">
      <WriteHeaderMenu />
      <div class="flex flex-1 overflow-hidden">
        <SearchPane />
      </div>
    </div>
  );
};

export default Search;
