import React, { useEffect, useState } from "react";
import { trpc } from "../utils/trpc"; // Assuming you have a trpc setup
import { useLocation, useParams } from "wouter";

import Divider from "../assets/divider.svg"; // Adjust the path as necessary

const ChapterPage = () => {
  const { chapterId, storyId, bookId } = useParams<{
    chapterId: string;
    storyId: string;
    bookId: string;
  }>();
  const [location, setLocation] = useLocation();
  const { data, error, isLoading } = trpc.getChapter.useQuery({ chapterId });

  // Function to navigate to a different chapter
  const navigateToChapter = (newChapterId: string) => {
    setLocation(`/story/${storyId}/book/${bookId}/chapter/${newChapterId}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading chapter</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white text-black dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">
        {data?.name}
      </h1>
      {data?.scenes.map((scene, index) => (
        <div key={scene.id} className="mb-6">
          {/* Separator between scenes */}
          {index > 0 && (
            <img
              src={Divider}
              alt="Scene Divider"
              className="my-8 m-auto max-w-60"
            />
          )}
          {scene.paragraphs.map((paragraph) => (
            <p
              key={paragraph.id}
              className="mb-4 text-gray-700 dark:text-gray-300"
            >
              {paragraph.latestRevision.body}
            </p>
          ))}
        </div>
      ))}
      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => navigateToChapter(data?.previousChapterId)}
          disabled={!data?.previousChapterId}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous Chapter
        </button>
        <button
          type="button"
          onClick={() => navigateToChapter(data?.nextChapterId)}
          disabled={!data?.nextChapterId}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next Chapter
        </button>
      </div>
    </div>
  );
};

export { ChapterPage };
