import { PropsWithChildren } from "react";
import { Link } from "wouter";
import { navItem } from "./navitem.css";

export const Navitem = (
  props: PropsWithChildren<{
    to: string;
  }>,
) => {
  return (
    <Link to={props.to} className={navItem}>
      {props.children}
    </Link>
  );
};
