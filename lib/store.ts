import { configureStore } from "@reduxjs/toolkit";
import { reducer as baseReducer } from "./slices/global";
import { reducer as storyReducer } from "./slices/story";
import { reducer as languageReducer } from "./slices/language";

export const store = configureStore({
  reducer: {
    base: baseReducer,
    story: storyReducer,
    language: languageReducer
  },
  devTools: true,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
