import { PropsWithChildren, ReactElement, ReactNode, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { useDispatch } from "react-redux";
import { globalActions } from "../lib/slices/global";

export const SigninProvider = (props: PropsWithChildren) => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("who am i?");
    trpc.whoAmI
      .query()
      .then((res) => {
        dispatch(globalActions.setSignedInUser(res ?? undefined));
      })
      .catch((error) => {
        dispatch(globalActions.setSignedInUser(undefined));
      });
  }, []);

  return <>{props.children}</>;
};
