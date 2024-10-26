import "./lib/App.css";
import { Root } from "./root.tsx";
import { Route, Router } from "@solidjs/router";
import { lazy } from "solid-js";

const GlobalSettings = lazy(() => import("./pages/global-settings.tsx"));
const Characters = lazy(() => import("./pages/characters.tsx"));
const EmbedSearch = lazy(() => import("./pages/embed-search.tsx"));
const Files = lazy(() => import("./pages/files.tsx"));
const Language = lazy(() => import("./pages/language.tsx"));
const Locations = lazy(() => import("./pages/locations.tsx"));
const NewStory = lazy(() => import("./pages/new-story.tsx"));
const OpenStory = lazy(() => import("./pages/open-story.tsx"));
const PlotPoints = lazy(() => import("./pages/plot-points.tsx"));
const Preview = lazy(() => import("./pages/preview.tsx"));
const Profile = lazy(() => import("./pages/profile.tsx"));
const Search = lazy(() => import("./pages/search.tsx"));
const Settings = lazy(() => import("./pages/settings.tsx"));
const Home = lazy(() => import("./pages/write.tsx"));

function WriterRouter() {
  return (
    <Router root={Root}>
      <Route path={"/"} component={OpenStory} />
      <Route path={"/write"} component={Home} />
      <Route path={"/characters"} component={Characters} />
      <Route path={"/language"} component={Language} />
      <Route path={"/locations"} component={Locations} />
      <Route path={"/plot-points"} component={PlotPoints} />
      <Route path={"/preview"} component={Preview} />
      <Route path={"/files"} component={Files} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/search"} component={Search} />
      <Route path={"/embed-search"} component={EmbedSearch} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/new-story"} component={NewStory} />
      <Route path={"/open-story"} component={OpenStory} />
      <Route path={"/global-settings"} component={GlobalSettings} />
      <Route
        path="*404"
        component={() => {
          return <div>404</div>;
        }}
      />
    </Router>
  );
}

export default WriterRouter;
