export const importRoyalRoad = async (storyId: string) => {
  const numericStoryId = Number(storyId);

  if (Number.isNaN(numericStoryId)) {
    console.error("Invalid Royal Road story ID");
    return;
  }

  trpc.importRoyalroad
    .mutate({
      storyId: numericStoryId,
    })
    .then((result) => {
      console.log("imported");
      if (result?.story) {
        openStory(result);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};
