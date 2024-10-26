import React from "react";
import { trpc } from "../utils/trpc";
import StoryCard from "../components/storycard";
import { Helmet } from "react-helmet";

export const MyFictionPage = () => {
  const { data: myFictionData, isLoading, error } = trpc.myFiction.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>My Fiction - Reader</title>
      </Helmet>
      <h1 className="text-3xl font-bold mb-6">My Fiction</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myFictionData?.map((story) => (
          <StoryCard
            key={story.id}
            id={story.id}
            coverArtAsset={story.coverArtAsset}
            name={story.name}
            ownerName={story.ownerName ?? ""}
            pages={story.pages ?? 0}
            summary={story.summary ?? ""}
            color={story.color ?? ""}
            textColor={story.textColor ?? ""}
            royalRoadId={story.royalRoadId ?? undefined}
          />
        ))}
      </div>
    </div>
  );
};
