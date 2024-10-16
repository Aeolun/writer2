import { PropsWithChildren } from "react";
import { Navitem } from "../ui-components/navitem/navitem";
import useDarkMode from "use-dark-mode";
import UserStatus from "./user-status";
import { useColorMode } from "../hooks/use-color-mode";
import { Helmet } from "react-helmet";
export const Layout = (props: PropsWithChildren) => {
  const colorMode = useColorMode();

  return (
    <div
      className="flex flex-col min-h-screen"
      data-theme={colorMode === "light" ? "fantasy" : "forest"}
    >
      <Helmet>
        <meta charSet="utf-8" />
        <title>Unknown - Reader</title>
      </Helmet>
      <nav className="sticky navbar top-0 bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-300 shadow-md z-50">
        <div className="container m-auto">
          <div>
            <a href="/" className="btn btn-ghost text-xl">
              Reader
            </a>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Navitem to="/">Home</Navitem>
              </li>
              <li>
                <Navitem to="/stories">Stories</Navitem>
              </li>
              <li>
                <Navitem to="/bookshelf">Bookshelf</Navitem>
              </li>
              <li>
                <Navitem to="/authors">Authors</Navitem>
              </li>
              <li>
                <Navitem to="/download">Download Writer</Navitem>
              </li>
            </ul>
          </div>

          <UserStatus />
        </div>
      </nav>
      <main
        className="flex-grow px-4 py-8 overflow-hidden"
        style={{
          backgroundImage:
            colorMode === "dark" ? "url(/bg-dark.png)" : "url(/bg-light.png)",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="container mx-auto">{props.children}</div>
      </main>
    </div>
  );
};
