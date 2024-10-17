import React, { useEffect, useState } from "react";
import { trpc } from "../utils/trpc";
import { Apple, LinkXmark, Linux, Menu, Windows } from "iconoir-react";
import { Helmet } from "react-helmet";

export const DownloadPage: React.FC = () => {
  const releases = trpc.getReleases.useQuery();

  if (releases.isLoading) {
    return <div>Loading...</div>;
  }
  if (releases.error) {
    return <div>Error: {releases.error.message}</div>;
  }

  return (
    <>
      <Helmet>
        <title>Releases - Reader</title>
      </Helmet>
      <h1 className="text-3xl font-bold mb-6">Releases</h1>
      <div className="mb-6 card glass bg-base-100">
        <div className="card-body">
          <p>
            Writer 2 is currently in beta. Download the latest version to get
            the best experience. At this point we do not check for version
            discrepancies between client and server, so if you are encountering
            issues, please download the latest version of the writer client.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {releases.data?.map((release) => (
          <div
            key={release.id}
            className="flex flex-row justify-between w-full"
          >
            <div className="flex gap-2 justify-between items-center bg-slate-100 dark:bg-slate-800 w-full p-2 rounded-lg">
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{release.name}</h2>
                <p className="text-gray-600">
                  {new Date(release.publishedAt).toLocaleString()}
                </p>
                <p>{release.description}</p>
              </div>
              <div className="ml-auto grid grid-cols-4 gap-2">
                {release.windowsUrl ? (
                  <a
                    href={release.windowsUrl}
                    className="btn btn-primary"
                    download
                  >
                    <Windows />
                  </a>
                ) : (
                  <div></div>
                )}
                {release.macUrl ? (
                  <a href={release.macUrl} className="btn btn-primary" download>
                    <Apple /> x64
                  </a>
                ) : (
                  <a className="btn btn-primary btn-disabled" download>
                    <Apple /> x64
                  </a>
                )}
                {release.siliconUrl ? (
                  <a
                    href={release.siliconUrl}
                    className="btn btn-primary"
                    download
                  >
                    <Apple /> ARM
                  </a>
                ) : (
                  <a className="btn btn-primary btn-disabled" download>
                    <Apple /> ARM
                  </a>
                )}
                {release.linuxUrl ? (
                  <a
                    href={release.linuxUrl}
                    className="btn btn-primary"
                    download
                  >
                    <Linux />
                  </a>
                ) : (
                  <div></div>
                )}
              </div>
              <div className="dropdown dropdown-left">
                <button type="button" className="btn btn-accent">
                  <Menu />
                </button>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                >
                  <li>
                    <a>.deb</a>
                  </li>
                  <li>
                    <a>.rpm</a>
                  </li>
                  <li>
                    <a>.msi</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ))}
        {releases.data?.length === 0 && <div>No releases found</div>}
      </div>
    </>
  );
};
