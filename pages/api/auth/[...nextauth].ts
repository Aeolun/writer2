import NextAuth, {
  type AuthOptions,
  type Session as NextAuthSession,
} from "next-auth";
import GithubProvider, { type GithubProfile } from "next-auth/providers/github";

if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_SECRET) {
  throw new Error(
    "Please define GITHUB_ID and GITHUB_SECRET in your environment variables",
  );
}
if (!process.env.AUTH_SECRET) {
  throw new Error("Please define AUTH_SECRET in your environment variables");
}

export type WriterSession = {
  owner: string;
} & NextAuthSession;

export const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_APP_ID,
      clientSecret: process.env.GITHUB_APP_SECRET,
    }),
    // ...add more providers here
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (profile) {
        token.owner = (profile as GithubProfile).login;
      }
      return token;
    },
    session: (params): WriterSession => {
      return {
        ...params.session,
        owner: params.token.owner as string,
      };
    },
  },
};

export default NextAuth(authOptions);
