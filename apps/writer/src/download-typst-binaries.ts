import { Octokit } from "@octokit/rest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import axios from "axios";
import * as zlib from "node:zlib";
import * as unzipper from "unzipper";
import * as lzma from "lzma-native";
import * as tar from "tar";
import type { Release } from "@writer/server/src/procedures/get-releases";

const CACHE_DIR = path.join(".typst-cache");
const RELEASES_CACHE_FILE = path.join(CACHE_DIR, "releases.json");
const DOWNLOAD_DIR = path.join(CACHE_DIR, "downloads");
const EXTRACT_DIR = path.join(CACHE_DIR, "extracted");

const ensureDirExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const cacheReleases = async (releases: any) => {
  ensureDirExists(CACHE_DIR);
  fs.writeFileSync(RELEASES_CACHE_FILE, JSON.stringify(releases, null, 2));
};

const getCachedReleases = () => {
  if (fs.existsSync(RELEASES_CACHE_FILE)) {
    const data = fs.readFileSync(RELEASES_CACHE_FILE, "utf-8");
    return JSON.parse(data);
  }
  return null;
};

const downloadFile = async (url: string, dest: string) => {
  const writer = fs.createWriteStream(dest);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

const extractFile = async (filePath: string, destDir: string) => {
  ensureDirExists(destDir);
  console.log("filePath", filePath);

  const fileName = path.basename(filePath);
  console.log("filename", fileName);
  const extensionlessFile = fileName.slice(0, fileName.indexOf("."));
  console.log("extensionless", extensionlessFile);
  const fileExt = path.extname(fileName);
  const baseName = path.basename(fileName, fileExt);

  const unzipFile = async (inputPath: string, outputPath: string) => {
    if (fileExt === ".zip") {
      await fs
        .createReadStream(inputPath)
        .pipe(unzipper.Extract({ path: outputPath }))
        .promise();
    } else if (fileExt === ".xz") {
      const writePath = path.join(outputPath, baseName);
      console.log("decompress using xz", writePath);
      const decompressor = lzma.createDecompressor();
      const input = fs.createReadStream(inputPath);
      const output = fs.createWriteStream(writePath);

      input.pipe(decompressor).pipe(output);

      return new Promise((resolve, reject) => {
        output.on("finish", resolve);
        output.on("error", reject);
      });
    }
  };

  const untarFile = async (
    inputPath: string,
    outputPath: string,
    finalName: string,
  ) => {
    await tar.x({
      file: inputPath,
      cwd: outputPath,
      filter: (path) => path.endsWith("typst"),
      onentry: (entry) => {
        if (entry.path.endsWith("typst")) {
          entry.pipe(fs.createWriteStream(path.join(outputPath, finalName)));
        }
      },
    });
  };

  const tempDir = path.join(destDir, "temp");
  ensureDirExists(tempDir);

  console.log("unzipping to", tempDir);
  await unzipFile(filePath, tempDir);
  console.log("unzipped");
  if (fileName.includes(".tar")) {
    const tarFilePath = path.join(tempDir, baseName);
    await untarFile(tarFilePath, destDir, extensionlessFile);
  } else {
    const extractedFilePath = path.join(tempDir, "typst");
    const finalFilePath = path.join(destDir, fileName);
    if (fs.existsSync(extractedFilePath)) {
      fs.renameSync(extractedFilePath, finalFilePath);
    }
  }

  fs.rmSync(tempDir, { recursive: true, force: true });
};

const downloadReleaseAssets = async (release: Release) => {
  ensureDirExists(DOWNLOAD_DIR);
  const assets = release.assets;

  for (const asset of assets) {
    const assetPath = path.join(DOWNLOAD_DIR, asset.name);
    const base = path.basename(asset.name);
    const baseWithoutExtension = base.slice(0, base.indexOf("."));

    const extractPath = path.join(EXTRACT_DIR, baseWithoutExtension);

    if (!fs.existsSync(assetPath)) {
      console.log(`Downloading ${asset.name}...`);
      await downloadFile(asset.browser_download_url, assetPath);
    } else {
      console.log(`${asset.name} already exists, skipping download.`);
    }

    console.log(`Extracting ${asset.name}...`);
    await extractFile(assetPath, extractPath);
  }
};

const doThings = async () => {
  const octokit = new Octokit({});
  let releases = getCachedReleases();

  if (!releases) {
    console.log("Fetching releases from GitHub...");
    releases = await octokit.repos.listReleases({
      owner: "typst",
      repo: "typst",
    });
    await cacheReleases(releases.data);
    releases = releases.data;
  } else {
    console.log("Using cached releases...");
  }

  const latestRelease = releases[0];
  console.log(latestRelease);

  await downloadReleaseAssets(latestRelease);
};

doThings();
