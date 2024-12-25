import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { settingsState } from "./settings";
import { trpc } from "../trpc";

export interface UserState {
  signedInUser?: {
    name: string | null | undefined;
    avatarUrl: string | null | undefined;
    id: number;
    createdAt: string;
    email: string;
  } | null;
}

export const userStateDefault: UserState = {
  signedInUser: null,
};

export const [userState, setUserState] = createStore(userStateDefault);

export const setSignedInUser = (user: UserState["signedInUser"]) =>
  setUserState("signedInUser", user);
