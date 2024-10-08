import { PropsWithChildren, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { useDispatch } from "react-redux";
import { globalActions } from "../lib/slices/global";
import { settingsStore } from "../global-settings-store";

export const SigninProvider = (props: PropsWithChildren) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await settingsStore.get("client-token");
        if (token) {
          const res = await trpc.whoAmI.query();
          dispatch(globalActions.setSignedInUser(res ?? undefined));
        } else {
          dispatch(globalActions.setSignedInUser(undefined));
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        dispatch(globalActions.setSignedInUser(undefined));
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  return <>{props.children}</>;
};
