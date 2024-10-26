import { Item } from "@writer/shared";
import { createStore } from "solid-js/store";

export const [items, setItems] = createStore<{
  items: Record<string, Item>;
}>({ items: {} });
