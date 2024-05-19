import type { NextPage } from "next";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Preview } from "../../components/Preview";
import { useAutosave } from "../../lib/hooks/use-autosave";
import { sortedBookObjects } from "../../lib/selectors/sortedBookObjects";
import type { RootState } from "../../lib/store";

const Home: NextPage = () => {
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const scenes = useSelector(sortedBookObjects);

  const dispatch = useDispatch();
  useAutosave(!!storyLoaded);

  return scenes ? <Preview objects={scenes} /> : null;
};

export default Home;
