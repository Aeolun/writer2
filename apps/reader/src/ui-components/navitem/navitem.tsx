import { PropsWithChildren } from "react";
import { Link } from "wouter";

export const Navitem = (
  props: PropsWithChildren<{
    to: string;
  }>,
) => {
  return (
    <Link to={props.to} className="transition-colors duration-200">
      {props.children}
    </Link>
  );
};
