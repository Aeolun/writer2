import React from "react";
import styles from "./storycard.module.css";
import classnames from "classnames";
import { useLocation } from "wouter";
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
}) => {
  const [location, navigate] = useLocation();
  return (
    <div
      className={styles.cardContainer}
      style={{ "--color": color, "--textColor": textColor }}
    >
      <div className={styles.card}>
        <div className={styles.cardLeft} />
        <div
          className={classnames(
            styles.cardFront,
            "bg-slate-100 dark:bg-slate-800 relative",
          )}
        >
          <img src={coverArtAsset} alt={name} className="w-full object-cover" />
          {royalRoadId && (
            <a
              href={`https://www.royalroad.com/fiction/${royalRoadId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-0 right-0 w-16 h-16 text-xs text-gray-500"
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
          <h2 className={"text-lg font-bold"}>{name}</h2>
          <p className={"text-xs overflow-x-hidden w-full"}>{pages} pages</p>
          <div
            className={"text-xs flex-1 overflow-x-hidden w-full"}
            dangerouslySetInnerHTML={{ __html: summary }}
          />

          <div className="flex flex-row gap-2 justify-around">
            <button type="button" className="btn btn-accent btn-sm">
              + Library
            </button>
            <a
              className="btn btn-primary btn-sm"
              href={
                royalRoadId
                  ? `https://www.royalroad.com/fiction/${royalRoadId}`
                  : `/story/${id}`
              }
              rel="noopener noreferrer"
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
