import { eq } from "drizzle-orm";
import NextAuth, {
  type AuthOptions,
  type Session as NextAuthSession,
} from "next-auth";
import GithubProvider, { type GithubProfile } from "next-auth/providers/github";
import short from "short-uuid";
import { db } from "../../../lib/drizzle";
import { user } from "../../../lib/drizzle/schema";

if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_SECRET) {
  throw new Error(
    "Please define GITHUB_ID and GITHUB_SECRET in your environment variables",
  );
}
if (!process.env.AUTH_SECRET) {
  throw new Error("Please define AUTH_SECRET in your environment variables");
}

export type WriterSession = {
  user_id: string;
  owner: string;
  github_access_token: string;
  github_access_token_expiry: number;
} & NextAuthSession;

export const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
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
    async jwt({ token, account, profile, trigger }) {
      const githubProfile = profile as GithubProfile;
      if (["signIn", "signUp"].includes(trigger ?? "")) {
        if (!account || !account.provider || !account.providerAccountId) {
          console.error("Cannot create token");
          throw new Error("Cannot create jwt token");
        }
        const providerId = `${account?.provider}-${account?.providerAccountId}`;

        try {
          let currentUser = await db.query.user.findFirst({
            where: eq(user.providerId, providerId),
          });

          console.log({
            account,
            profile,
          });
          const insertResult = await db
            .insert(user)
            .values({
              id: short.generate().toString(),
              providerId: providerId,
              nickname: githubProfile?.login,
              fullName: githubProfile?.name,
              email: githubProfile?.email,
            })
            .onConflictDoNothing()
            .returning();

          if (insertResult[0]) {
            currentUser = insertResult[0];
          }

          if (!currentUser) {
            throw new Error("Cannot sign in without creating user");
          }
          if (profile) {
            token.user_id = currentUser.id;
            token.owner = (profile as GithubProfile).login;
            token.access_token = account?.access_token;
            token.access_token_expiry = account?.expires_at;
          }

          console.log("finished retrieving/creating user");
        } catch (error) {
          console.error("error", error);
        }
      }

      return token;
    },
    session: (params): WriterSession => {
      return {
        ...params.session,
        user_id: params.token.user_id as string,
        owner: params.token.owner as string,
        github_access_token: params.token.access_token as string,
        github_access_token_expiry: params.token.access_token_expiry as number,
      };
    },
  },
};

export default NextAuth(authOptions);
