import { trpc } from "../utils/trpc";

import StoryCard from "../components/storycard";
import { useLocation, useParams } from "wouter";
import { useSearchParams } from "../hooks/use-search-params";
import { Helmet } from "react-helmet";

export const StoriesPage = () => {
  const params = useSearchParams();
  const {
    data: storiesData,
    isLoading,
    error,
  } = trpc.listStories.useQuery({
    limit: 20,
    cursor: params.get("cursor") ?? undefined,
  });
  const [location, navigate] = useLocation();

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
    <>
      <Helmet>
        <title>Stories - Reader</title>
      </Helmet>
      <h1 className="text-3xl font-bold mb-6">Stories</h1>
      <div className="flex flex-wrap justify-between gap-6">
        {storiesData?.stories.map((story) => (
          <StoryCard
            key={story.id}
            id={story.id}
            summary={story.summary}
            coverArtAsset={story.coverArtAsset}
            name={story.name}
            ownerName={story.owner.name ?? ""}
            pages={story.pages ?? 0}
            color={story.coverColor}
            textColor={story.coverTextColor}
            royalRoadId={story.royalRoadId ?? undefined}
          />
        ))}
      </div>
      {storiesData?.nextCursor ? (
        <div className="mt-8 text-center">
          <button
            type="button"
            className="bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            onClick={() => {
              navigate(`/stories?cursor=${storiesData.nextCursor}`);
            }}
          >
            Load More
          </button>
        </div>
      ) : (
        <div className="mt-8 text-center flex flex-col gap-4">
          <p>Woe is me, no more stories 😔</p>
          <p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/")}
            >
              Go home
            </button>
          </p>
        </div>
      )}
    </>
  );
};
