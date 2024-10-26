import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import "./index.css";
import React, { useState } from "react";
import { Provider } from "react-redux";
import { trpc } from "./utils/trpc";
import { Route, Switch } from "wouter";
import { IndexPage } from "./pages";
import { Layout } from "./components/layout";
import { ListsPage } from "./pages/lists";
import { AuthorsPage } from "./pages/authors";
import { StoriesPage } from "./pages/stories";
import { StoryPage } from "./pages/story";
import { ChapterPage } from "./pages/chapter";
import { AuthorPage } from "./pages/author";
import { LoginPage } from "./pages/login";
import { BookshelfPage } from "./pages/bookshelf";
import { DownloadPage } from "./pages/download";
import { AdminPage } from "./pages/admin";
import { MyFictionPage } from "./pages/my-fiction";
import store from "./store";
export const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:2022/trpc",
          // You can pass any HTTP headers you wish here
          async headers() {
            return {
              Authorization: `Bearer ${localStorage.getItem("sessionToken")}`,
            };
          },
        }),
      ],
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <Layout>
            <Switch>
              <Route path="/bookshelf" component={BookshelfPage} />
              <Route path="/" component={IndexPage} />
              <Route path="/authors" component={AuthorsPage} />
              <Route path="/author/:authorId" component={AuthorPage} />
              <Route path="/stories" component={StoriesPage} />
              <Route path="/stories/:genre" component={StoriesPage} />
              <Route path="/library" component={ListsPage} />
              <Route path="/download" component={DownloadPage} />
              <Route path="/admin" component={AdminPage} />
              <Route path="/my-fiction" component={MyFictionPage} />
              <Route path="/story/:storyId" component={StoryPage} />
              <Route path="/login" component={LoginPage} />
              <Route
                path="/story/:storyId/book/:bookId/chapter/:chapterId"
                component={ChapterPage}
              />
            </Switch>
          </Layout>
        </Provider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
