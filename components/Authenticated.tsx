import { signIn, useSession } from "next-auth/react";
import type { ReactElement } from "react";

export const Authenticated = (props: {
  children: ReactElement;
}): ReactElement | null => {
  const { data: session } = useSession();

  if (session) {
    return props.children ? props.children : null;
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
};
