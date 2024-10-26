import { importRoyalRoad } from "./procedures/import-royal-road";
import { userList } from "./procedures/user-list";
import { uploadStoryImage } from "./procedures/upload-story-image";
import { uploadStory } from "./procedures/upload-story";
import { login } from "./procedures/login";
import { userById } from "./procedures/user-by-id";
import { whoAmI } from "./procedures/who-am-i";
import { register } from "./procedures/register";
import { logout } from "./procedures/logout";
import { connectedClients } from "./procedures/connected-clients";
import { downloadStory } from "./procedures/download-story";
import { downloadFiles } from "./procedures/download-files";
import { listStories } from "./procedures/list-stories";
import { getStory } from "./procedures/get-story";
import { getChapter } from "./procedures/get-chapter";
import { router } from "./trpc";
import { sessionLogin } from "./procedures/sessionLogin";
import { sessionSignout } from "./procedures/sessionSignout";
import { listUploadedFiles } from "./procedures/uploaded-files";
import { getBookshelfStories } from "./procedures/get-bookshelf-stories";
import { authorList } from "./procedures/author-list";
import { getStoryStatus } from "./procedures/get-story-status";
import { publishStory } from "./procedures/publish-story";
import { getReleases } from "./procedures/get-releases";
import { listRandomStories } from "./procedures/list-random-stories";
import { randomizeOrder } from "./procedures/randomize-order";
import { setBookshelfState } from "./procedures/set-bookshelf-state";
import { checkBookshelfState } from "./procedures/check-bookshelf-state";
import { updateStoryReadStatus } from "./procedures/update-story-read-status";
import { getUserStories } from "./procedures/my-fiction";
import { publishToRoyalRoad } from "./procedures/publish-to-royal-road";

export const appRouter = router({
  userList: userList,
  importRoyalroad: importRoyalRoad,
  uploadStoryImage: uploadStoryImage,
  uploadStory: uploadStory,
  downloadStory: downloadStory,
  downloadFiles: downloadFiles,
  userById: userById,
  whoAmI: whoAmI,
  randomizeOrder: randomizeOrder,
  register: register,
  logout: logout,
  connectedClients: connectedClients,
  listStories: listStories,
  getStory: getStory,
  login: login,
  sessionLogin: sessionLogin,
  getChapter: getChapter,
  sessionSignout: sessionSignout,
  listUploadedFiles: listUploadedFiles,
  getBookshelfStories: getBookshelfStories,
  authorList: authorList,
  getStoryStatus: getStoryStatus,
  publishStory: publishStory,
  getReleases: getReleases,
  listRandomStories: listRandomStories,
  setBookshelfState: setBookshelfState,
  checkBookshelfState: checkBookshelfState,
  updateStoryReadStatus: updateStoryReadStatus,
  myFiction: getUserStories,
  publishToRoyalRoad: publishToRoyalRoad,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
