import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import type { RefinementLevel } from "./constants";

type LoadingState = {
  [nodeId: string]: boolean;
};

type BookRefinements = Record<
  string,
  {
    text: string;
    level: RefinementLevel;
  }
>;

export const [loadingStates, setLoadingStates] = createStore<LoadingState>({});
export const [bookRefinements, setBookRefinements] =
  createStore<BookRefinements>({});

export const [storyRefinement, setStoryRefinement] = createSignal<
  string | null
>(null);
