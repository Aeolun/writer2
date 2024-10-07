import { PropsWithChildren } from "react";
import { menu, wrapper } from "./layout.css";
import { Link } from "wouter";
import { themeClass } from "../theme.css";
import { Navitem } from "../ui-components/navitem/navitem";

export const Layout = (props: PropsWithChildren) => {
  return (
    <div className={`${themeClass} ${wrapper}`}>
      <div className={menu}>
        <Navitem to="/">Home</Navitem>
        <Navitem to="authors">Authors</Navitem>
        <Navitem to="stories">Stories</Navitem>
      </div>
      {props.children}
    </div>
  );
};
