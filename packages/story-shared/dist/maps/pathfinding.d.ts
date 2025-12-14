export interface PathfindingLandmark {
    id: string;
    mapId: string;
    x: number;
    y: number;
    name: string;
    description?: string;
    type?: string;
    population?: string;
    industry?: string;
    planetaryBodies?: string;
    region?: string;
    sector?: string;
    color?: string;
    size?: string;
}
export interface PathfindingHyperlaneSegment {
    id: string;
    hyperlaneId: string;
    mapId: string;
    order: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    startLandmarkId?: string | null;
    endLandmarkId?: string | null;
}
export interface PathfindingHyperlane {
    id: string;
    mapId: string;
    speedMultiplier: number;
    segments: PathfindingHyperlaneSegment[];
}
export interface PathSegment {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    travelTime: number;
    type: "normal" | "hyperlane";
    hyperlaneId?: string;
    startLandmarkId?: string | null;
    endLandmarkId?: string | null;
}
export interface PathfindingResult {
    segments: PathSegment[];
    totalTime: number;
    path: string[];
}
export declare function calculateOptimalPath(startX: number, startY: number, endX: number, endY: number, landmarks: PathfindingLandmark[], hyperlanes: PathfindingHyperlane[], hyperdriveRating: number): PathfindingResult;
export declare function formatTravelTime(minutes: number): string;
//# sourceMappingURL=pathfinding.d.ts.map