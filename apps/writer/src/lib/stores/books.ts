import { Book } from "@writer/shared";
import { createStore } from "solid-js/store";

export const [booksStore, setBooksStore] = createStore<{
  books: Record<string, Book>;
}>({
  books: {},
});
