import React, { useEffect, useState } from "react";
import { trpc } from "../utils/trpc";

export const DownloadPage: React.FC = () => {
  const releases = trpc.getReleases.useQuery();

  if (releases.isLoading) {
    return <div>Loading...</div>;
  }
  if (releases.error) {
    return <div>Error: {releases.error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
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
      <ul className="list-disc list-inside">
        {releases.data?.map((release) => (
          <li key={release.id} className="mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{release.version}</h2>
                <p className="text-gray-600">{release.date}</p>
              </div>
              <a
                href={release.downloadUrl}
                className="btn btn-primary"
                download
              >
                Download
              </a>
            </div>
          </li>
        ))}
        {releases.data?.length === 0 && <div>No releases found</div>}
      </ul>
    </div>
  );
};
