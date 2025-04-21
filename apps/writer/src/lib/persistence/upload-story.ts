import { trpc } from "../trpc";
import { storyState } from "../stores/story";
import { addNotification } from "../stores/notifications";
import { stateToStory } from "./state-to-story";
import { setUploading, setLastKnownServerUpdate } from "../stores/ui";
import { settingsState } from "../stores/settings";
import { checkSyncStatus, hasConflicts } from "./check-sync-status";

interface TRPCError {
  shape?: {
    data?: {
      zodError?: {
        fieldErrors: Record<string, string[]>;
      };
    };
  };
}

interface UploadResult {
  success: boolean;
  updatedAt: string;
  error?: string;
}

export const uploadStory = async () => {
  if (!storyState.story || !storyState.openPath) {
    addNotification({
      title: "Upload failed",
      message: "No story loaded to upload",
      type: "error",
    });
    return;
  }

  try {
    // Check sync status before uploading
    const syncStatus = await checkSyncStatus();

    // If there are conflicts, fail the upload
    if (hasConflicts(syncStatus)) {
      addNotification({
        title: "Upload failed",
        message:
          "There are conflicts between local and server versions. Please resolve conflicts before uploading.",
        type: "error",
      });
      return;
    }

    // Set uploading state to true
    setUploading(true);

    // Use the stateToStory function to get the complete story data
    const persistedStory = stateToStory();

    const royalRoadCredentials =
      settingsState.royalRoadEmail && settingsState.royalRoadPassword
        ? {
            username: settingsState.royalRoadEmail,
            password: settingsState.royalRoadPassword,
          }
        : undefined;

    // Check if we need Royal Road credentials
    const needsRoyalRoadCredentials =
      persistedStory.story.settings?.publishToRoyalRoad &&
      Object.values(persistedStory.story.chapter).some(
        (chapter) =>
          chapter.visibleFrom &&
          new Date(chapter.visibleFrom) < new Date() &&
          chapter.royalRoadId,
      );

    if (needsRoyalRoadCredentials && !royalRoadCredentials) {
      addNotification({
        title: "Upload failed",
        message: "Royal Road credentials are required for publishing",
        type: "error",
      });
      setUploading(false);
      return;
    }

    const result = (await trpc.uploadStory.mutate({
      ...persistedStory,
      royalRoadCredentials,
    })) as UploadResult;

    if (result.success) {
      console.log("Story uploaded successfully");
      addNotification({
        title: "Success",
        message: "Story uploaded successfully",
        type: "success",
      });
      setLastKnownServerUpdate(storyState.story?.modifiedTime ?? null);

      // Refresh sync state after successful upload
      await checkSyncStatus();
    } else {
      console.error("Upload failed:", result.error);
      addNotification({
        title: "Upload failed",
        message: result.error || "Failed to upload story",
        type: "error",
      });
    }

    return result;
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const errorDetails =
      (error as TRPCError)?.shape?.data?.zodError?.fieldErrors || {};

    addNotification({
      title: "Upload failed",
      message: `Failed to upload story: ${errorMessage}`,
      type: "error",
      details: errorDetails,
    });

    throw error;
  } finally {
    // Always set uploading state back to false when done
    setUploading(false);
  }
};
