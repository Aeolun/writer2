import { cache } from "../redis";
import { publicProcedure } from "../trpc";
import axios from "axios";

export interface Release {
  id: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  assets: {
    browser_download_url: string;
    name: string;
    id: number;
    label: string;
    size: number;
  }[];
}

export const getReleases = publicProcedure.query(async () => {
  try {
    const response = await cache.wrap(
      "releases",
      () =>
        axios
          .get<Release[]>(
            "https://api.github.com/repos/aeolun/writer2/releases",
            {
              headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              },
            },
          )
          .then((res) => res.data),
      60 * 1000,
    );

    return response.map((release) => {
      return {
        name: release.name,
        description: release.body,
        publishedAt: release.published_at,
        windowsUrl: release.assets.find((asset) =>
          asset.name.includes("setup.exe"),
        )?.browser_download_url,
        macUrl: release.assets.find((asset) => asset.name.includes("mac.dmg"))
          ?.browser_download_url,
        siliconUrl: release.assets.find((asset) =>
          asset.name.includes("mac-silicon.dmg"),
        )?.browser_download_url,
        linuxUrl: release.assets.find((asset) =>
          asset.name.includes("amd64.AppImage"),
        )?.browser_download_url,
        releaseUrl: release.html_url,
      };
    });
  } catch (error) {
    console.error(error?.stack);
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data);
    }
    return [];
  }
});
