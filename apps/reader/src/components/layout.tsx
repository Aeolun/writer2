import { PropsWithChildren } from "react";
import { Link } from "wouter";
import { Navitem } from "../ui-components/navitem/navitem";

export const Layout = (props: PropsWithChildren) => {
  const prefersDarkMode = window.matchMedia?.(
    "(prefers-color-scheme: dark)",
  ).matches;

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="sticky top-0 bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-300 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Navitem to="/">Home</Navitem>
              <Navitem to="/authors">Authors</Navitem>
              <Navitem to="/stories">Stories</Navitem>
            </div>
          </div>
        </div>
      </nav>
      <main
        className="flex-grow px-4 py-8 dark:bg-gray-800 dark:text-gray-200"
        style={{
          backgroundImage: prefersDarkMode
            ? "url(/bg-dark.png)"
            : "url(/bg-light.png)",
          backgroundAttachment: "fixed",
        }}
      >
        {props.children}
      </main>
    </div>
  );
};
