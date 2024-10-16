import { trpc } from "../utils/trpc";

export const StoriesPage = () => {
  const {
    data: storiesData,
    isLoading,
    error,
  } = trpc.listStories.useQuery({ limit: 20 });

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
      <h1 className="text-3xl font-bold mb-6">Stories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storiesData?.stories.map((story) => (
          <div key={story.id} className="card bg-base-100 shadow-xl">
            <figure>
              <img
                src={story.coverArtAsset}
                alt={story.name}
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{story.name}</h2>
              <p className="text-gray-600 mb-2">by {story.owner.name}</p>
              <p>{story.pages} pages</p>
              <div className="card-actions justify-end">
                <a href={`/story/${story.id}`} className="btn btn-primary">
                  Read Now
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      {storiesData?.nextCursor && (
        <div className="mt-8 text-center">
          <button
            type="button"
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
};
