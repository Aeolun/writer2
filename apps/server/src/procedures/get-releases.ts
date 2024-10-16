import { publicProcedure } from "../trpc";
import axios from "axios";

export interface Release {
  id: string;
  version: string;
  date: string;
  downloadUrl: string;
}

export const getReleases = publicProcedure.query(async () => {
  try {
    const response = await axios.get<Release[]>(
      "https://api.github.com/repos/aeolun/writer2/releases",
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch releases from GitHub");
  }
});
