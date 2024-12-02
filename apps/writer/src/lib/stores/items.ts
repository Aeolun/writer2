import type { Item } from "@writer/shared";
import { createStore } from "solid-js/store";

export const [items, setItemsState] = createStore<{
  items: Record<string, Item>;
}>({ items: {} });

export const setItems = (items: Record<string, Item>) => {
  setItemsState("items", items);
};
