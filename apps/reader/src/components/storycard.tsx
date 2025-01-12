import React, { useState } from "react";
import styles from "./storycard.module.css";
import classnames from "classnames";
import { useLocation } from "wouter";
import { openAddToBookshelf, setIsOpen } from "../slices/bookshelf-slice";
import { useAppDispatch } from "../store";
import { Check } from "iconoir-react";

interface StoryCardProps {
  id: string;
  coverArtAsset: string;
  name: string;
  ownerName: string;
  pages: number;
  summary: string; // Add summary to props
  color: string;
  textColor: string;
  royalRoadId?: number;
  isCompleted?: boolean;
  wordsPerWeek?: number;
  canAddToLibrary?: boolean;
}

const StoryCard: React.FC<StoryCardProps> = ({
  id,
  coverArtAsset,
  name,
  summary,
  color,
  textColor,
  pages,
  royalRoadId,
  isCompleted,
  wordsPerWeek,
  canAddToLibrary,
}: StoryCardProps) => {
  const [location, navigate] = useLocation();
  const dispatch = useAppDispatch();

  const handleAddToLibraryClick = () => {
    dispatch(openAddToBookshelf(id)); // Show the popup when the button is clicked
  };

  return (
    <div
      className={styles.cardContainer}
      style={{ "--color": color, "--textColor": textColor }}
    >
      <div className={styles.card}>
        <div className={styles.cardGlow}>
          <div className={styles.cardGlowInner} />
        </div>
        <div className={styles.cardLeft} />
        <div
          className={classnames(
            styles.cardFront,
            "bg-slate-100 dark:bg-slate-800 relative",
          )}
        >
          {coverArtAsset ? (
            <img
              src={coverArtAsset}
              alt={name}
              className="w-full object-cover"
            />
          ) : (
            <p className="text-center text-gray-500 self-start mt-8 font-serif">
              {name}
            </p>
          )}
          <div className="absolute bottom-0 right-6 w-8 h-8 text-lg text-gray-500">
            {isCompleted ? " ✅" : " 🔥"}
          </div>
          {royalRoadId && (
            <a
              href={`https://www.royalroad.com/fiction/${royalRoadId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-0 right-0 w-8 h-8 text-xs text-gray-500"
            >
              <img src="/rr-192x192.png" alt="External Link" />
            </a>
          )}
        </div>
        <div
          className={classnames(
            styles.cardBack,
            "flex flex-col shadow-md p-4 gap-2",
          )}
        >
          <h2
            className={`${
              name.length > 40
                ? "text-xs"
                : name.length > 20
                  ? "text-md"
                  : "text-lg"
            } font-bold`}
          >
            {name}
          </h2>
          <p className={"text-xs overflow-x-hidden w-full"}>
            {pages} pages{isCompleted ? " ✅" : " 🔥"} {wordsPerWeek ?? "?"} W/W
          </p>
          <div
            className={"text-xs flex-1 overflow-x-hidden w-full"}
            dangerouslySetInnerHTML={{ __html: summary }}
          />

          <div className="flex flex-row gap-2 justify-around">
            {canAddToLibrary && (
              <button
                type="button"
                className="btn btn-accent btn-sm"
                onClick={handleAddToLibraryClick} // Attach the event handler
              >
                + Library
              </button>
            )}
            <a
              className="btn btn-primary btn-sm"
              href={
                royalRoadId
                  ? `https://www.royalroad.com/fiction/${royalRoadId}`
                  : `/story/${id}`
              }
              target={royalRoadId ? "_blank" : undefined}
              rel={royalRoadId ? "noopener noreferrer" : undefined}
            >
              Read
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
