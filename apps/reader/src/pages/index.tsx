import StoryCard from "../components/storycard";
import { trpc } from "../utils/trpc";
import { Helmet } from "react-helmet";

export const IndexPage = () => {
  const {
    data: storiesData,
    isLoading,
    error,
  } = trpc.listRandomStories.useQuery({ limit: 8 });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <Helmet>
        <title>Home - Reader</title>
      </Helmet>
      <header className="text-center my-8 text-base-content">
        <h1 className="text-5xl font-bold">Welcome to Reader</h1>
        <p className="text-xl mt-4">
          Dive into a world of stories and imagination
        </p>
      </header>

      <div className="flex flex-row overflow-x-hidden py-4 justify-around gap-6">
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

      {/* Announcement Section */}
      <div className="announcement-section bg-blue-100 dark:bg-blue-900 p-4 rounded w-full shadow-md">
        <h2 className="text-2xl font-semibold">Announcement</h2>
        <p className="mt-2">
          You might notice that the site is currently very bare bones. I'm
          working on adding more features and improving the site, but it's still
          a work in progress. Most of the content you see is actually from&nbsp;
          <a href="https://www.royalroad.com" target="_blank" rel="noreferrer">
            RoyalRoad
          </a>
          , and was mostly added to prevent the site from looking extremely sad.
          Any attempt to read those stories here will redirect you to RoyalRoad
          instead.
        </p>
        <p className="mt-2 text-xs">
          Posted <time dateTime="2024-10-17">2024-10-17</time> by Aeolun
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card w-80 bg-base-100 dark:bg-base-800 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Latest Releases</h2>
            <p>Check out the latest stories added to our collection.</p>
            <div className="card-actions justify-end">
              <button type="button" className="btn btn-secondary">
                Explore
              </button>
            </div>
          </div>
        </div>

        <div className="card w-80 bg-base-100 dark:bg-base-800 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Join Our Community</h2>
            <p>
              Become a part of our vibrant community of writers and readers.
            </p>
            <div className="card-actions justify-end">
              <button type="button" className="btn btn-accent">
                Sign Up
              </button>
            </div>
          </div>
        </div>
        <div className="card w-80 bg-base-100 dark:bg-base-800 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Here from RoyalRoad?</h2>
            <p>Import your existing RoyalRoad stories.</p>
            <div className="card-actions justify-end">
              <button type="button" className="btn btn-primary">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Reader. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
