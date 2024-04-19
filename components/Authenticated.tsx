import { signIn, useSession } from "next-auth/react";
import type { PropsWithChildren } from "react";

export default function Authenticated(props: PropsWithChildren) {
  const { data: session } = useSession();
  if (session) {
    return props.children;
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
