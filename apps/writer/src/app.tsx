import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import wdyr from "@welldone-software/why-did-you-render";
import React from "react";
import { Provider } from "react-redux";
import { AiPopup } from "./components/AiPopup";
import "./lib/App.css";
import { Route, Switch } from "wouter";
import { SigninPopup } from "./components/SigninPopup.tsx";
import { SigninProvider } from "./components/SigninProvider.tsx";
import GlobalSettings from "./global-settings.tsx";
import { store } from "./lib/store";
import Home from "./write";
import Characters from "./write/characters.tsx";
import Files from "./write/files.tsx";
import Language from "./write/language.tsx";
import Locations from "./write/locations.tsx";
import NewStory from "./write/new-story.tsx";
import OpenStory from "./write/open-story.tsx";
import PlotPoints from "./write/plot-points.tsx";
import Preview from "./write/preview.tsx";
import Profile from "./write/profile.tsx";
import Search from "./write/search.tsx";
import Settings from "./write/settings.tsx";
import "highlight.js/styles/a11y-light.css";
import EmbedSearch from "./write/embed-search.tsx";

if (process.env.NODE_ENV === "development") {
  wdyr(React, {
    trackAllPureComponents: true,
  });
}

const theme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },
});

function MyApp() {
  return (
    <ChakraProvider theme={theme}>
      <Provider store={store}>
        <SigninProvider>
          <AiPopup />
          <SigninPopup />
          <Switch>
            <Route path={"/"} component={Home} />
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
          </Switch>
        </SigninProvider>
      </Provider>
    </ChakraProvider>
  );
}

export default MyApp;
