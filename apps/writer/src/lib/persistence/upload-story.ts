export const uploadStory = async () => {
  trpc.uploadStory
    .mutate({
      story: state.story,
      language: state.language,
    })
    .then((result) => {
      console.log("uploaded");
      dispatch(storyActions.updatePublishTime(new Date(result).getTime()));
      dispatch(
        addNotification({
          message: "Story uploaded successfully",
          type: "success",
        }),
      );
    })
    .catch((error) => {
      console.error(error);
      const errorMessage = error.message || "An unknown error occurred";
      const errorDetails = error.shape?.data?.zodError?.fieldErrors || {};
      dispatch(
        addNotification({
          message: `Failed to upload story: ${errorMessage}`,
          type: "error",
          details: errorDetails,
        }),
      );
    });
};
