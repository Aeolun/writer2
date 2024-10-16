import {
  Client,
  Falsey,
  RefreshToken,
  BaseModel,
  RefreshTokenModel,
  Token,
  AuthorizationCodeModel,
  AuthorizationCode,
} from "@node-oauth/oauth2-server";
import { prisma } from "./prisma"; // Assuming prisma is your ORM

const model: RefreshTokenModel & BaseModel & AuthorizationCodeModel = {
  getAccessToken: async (token: string) => {
    const accessToken = await prisma.accessKey.findFirst({
      where: { key: token },
      include: { owner: true },
    });

    if (!accessToken) {
      throw new Error("Invalid token");
    }

    return {
      accessToken: accessToken.key,
      client: {
        id: accessToken.clientId,
        grants: accessToken.grants,
      },
      user: {
        id: accessToken.ownerId,
      },
    };
  },

  getClient: async (
    clientId: string,
    clientSecret: string,
  ): Promise<Client> => {
    return await prisma.client.findFirst({
      where: { id: clientId, secret: clientSecret },
    });
  },

  saveToken: async (token, client, user): Promise<Token | Falsey> => {
    const accessToken = await prisma.accessKey.create({
      data: {
        key: token.accessToken,
        ownerId: user.id,
        description: token.description,
      },
    });

    return {
      accessToken: accessToken.key,
      client: {
        id: client.id,
        grants: client.grants, // Ensure 'grants' is included
      },
      user: { id: user.id },
    };
  },

  // Optional: Implement if using refresh tokens
  getRefreshToken: async (refreshToken: string) => {
    return await prisma.refreshToken.findFirst({
      where: { token: refreshToken },
      include: { owner: true },
    });
  },

  // Optional: Implement if you want to support token revocation
  revokeToken: async (
    token: RefreshToken | Token,
    callback?: Callback<boolean> | undefined,
  ) => {
    await prisma.accessKey.delete({
      where: { key: token.accessToken },
    });
    return true;
  },

  verifyScope: async (token: Token, scope: string) => {
    const accessToken = await prisma.accessKey.findFirst({
      where: { key: token.accessToken },
      include: { owner: true },
    });

    if (!accessToken) {
      throw new Error("Invalid token");
    }

    const tokenScopes = accessToken.description
      ? accessToken.description.split(" ")
      : [];

    if (!tokenScopes.includes(scope)) {
      throw new Error("Insufficient scope");
    }

    return true;
  },

  getAuthorizationCode: async (code: string) => {
    // Implement logic to retrieve the authorization code
    const authorizationCode = await prisma.authorizationCode.findFirst({
      where: { code },
    });
    return authorizationCode || null; // Ensure it returns a Falsey or AuthorizationCode
  },
  saveAuthorizationCode: async (
    code: AuthorizationCode,
    client: Client,
    user: User,
  ): Promise<AuthorizationCode | null> => {
    // Implement logic to save the authorization code

    // Ensure the function returns an AuthorizationCode or null
    return code; // or return null if appropriate
  },
  revokeAuthorizationCode: async (code: AuthorizationCode) => {
    // Implement logic to revoke the authorization code
    const success = true; // or false, based on your logic
    return success;
  },
};

export default model;
