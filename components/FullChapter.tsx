import React, { ReactElement } from "react";
import { Chapter } from "../lib/slices/global";

export const FullChapter = (props: { chapter: Chapter }) => {
  return <div>{props.chapter.text}</div>;
};
