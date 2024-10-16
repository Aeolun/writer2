import { trpc } from "../utils/trpc";

export const ListsPage = () => {
  const {
    data: bookshelfStories,
    isLoading,
    error,
  } = trpc.getBookshelfStories.useQuery();

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
      <h1 className="text-3xl font-bold mb-6">My library</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookshelfStories?.map((story) => (
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
    </div>
  );
};
