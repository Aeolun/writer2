import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import wdyr from "@welldone-software/why-did-you-render";
import React from "react";
import { Provider } from "react-redux";
import { AiPopup } from "./components/AiPopup";
import "./lib/App.css";
import { Route, Router, Switch } from "wouter";
import { migrate } from "./db/migrate";
import GlobalSettings from "./global-settings.tsx";
import { store } from "./lib/store";
import Home from "./write";
import Characters from "./write/characters.tsx";
import Language from "./write/language.tsx";
import Locations from "./write/locations.tsx";
import PlotPoints from "./write/plot-points.tsx";
import Preview from "./write/preview.tsx";
import Settings from "./write/settings.tsx";

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

await migrate();

function MyApp() {
  return (
    <ChakraProvider theme={theme}>
      <Provider store={store}>
        <AiPopup />
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/characters"} component={Characters} />
          <Route path={"/language"} component={Language} />
          <Route path={"/locations"} component={Locations} />
          <Route path={"/plot-points"} component={PlotPoints} />
          <Route path={"/preview"} component={Preview} />
          <Route path={"/settings"} component={Settings} />
          <Route path={"/global-settings"} component={GlobalSettings} />
        </Switch>
      </Provider>
    </ChakraProvider>
  );
}

export default MyApp;
