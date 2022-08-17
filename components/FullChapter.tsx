import React, { ReactElement } from "react";
import { Chapter } from "../lib/slices/story";

export const FullChapter = (props: { chapter: number }) => {
  return <div>{props.chapter}</div>;
};
