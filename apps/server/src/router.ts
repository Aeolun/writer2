import { importRoyalRoad } from "./procedures/import-royal-road";
import { userList } from "./procedures/user-list";
import { uploadImage } from "./procedures/upload-image";
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

export const appRouter = router({
  userList: userList,
  importRoyalroad: importRoyalRoad,
  uploadImage: uploadImage,
  uploadStory: uploadStory,
  downloadStory: downloadStory,
  downloadFiles: downloadFiles,
  userById: userById,
  whoAmI: whoAmI,
  register: register,
  logout: logout,
  connectedClients: connectedClients,
  listStories: listStories,
  getStory: getStory,
  login: login,
  getChapter: getChapter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
