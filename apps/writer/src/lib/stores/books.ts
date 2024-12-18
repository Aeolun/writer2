import { Book } from "@writer/shared";
import { createStore } from "solid-js/store";
import { appendNode, findNode, removeNode } from "./tree";
import shortUUID from "short-uuid";

export const [booksStore, setBooksStore] = createStore<{
  books: Record<string, Book>;
}>({
  books: {},
});

export const createBook = () => {
  const id = shortUUID.generate();
  setBooksStore("books", id, {
    id,
    title: "New book",
    summary: "",
    modifiedAt: Date.now(),
  } satisfies Book);
  appendNode({ id, type: "book", name: "New book", isOpen: true });
};

export const updateBookValue = <K extends keyof Book>(
  id: string,
  key: K,
  value: Book[K],
) => {
  setBooksStore("books", id, {
    ...booksStore.books[id],
    [key]: value,
    modifiedAt: Date.now(),
  });
};

export const deleteBook = (id: string) => {
  // check if there are any arcs in this book
  const arcs = findNode(id)?.children?.filter((c) => c.type === "arc");
  if (arcs && arcs.length > 0) {
    alert("Remove all arcs first");
    return;
  }
  removeNode(id);
  // @ts-expect-error: this is a valid way to delete
  setBooksStore("books", id, undefined);
};
