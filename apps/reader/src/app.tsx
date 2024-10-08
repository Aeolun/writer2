import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import "./index.css";
import React, { useState } from "react";
import { trpc } from "./utils/trpc";
import { Route, Switch } from "wouter";
import { IndexPage } from "./pages";
import { Layout } from "./components/layout";
import { BookshelfPage } from "./pages/bookshelf";
import { AuthorsPage } from "./pages/authors";
import { StoriesPage } from "./pages/stories";
import { StoryPage } from "./pages/story";
import { ChapterPage } from "./pages/chapter";
import { AuthorPage } from "./pages/author";

export const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:2022/",
          // You can pass any HTTP headers you wish here
          async headers() {
            return {
              authorization: "",
            };
          },
        }),
      ],
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Switch>
            <Route path="/bookshelf" component={BookshelfPage} />
            <Route path="/" component={IndexPage} />
            <Route path="/authors" component={AuthorsPage} />
            <Route path="/author/:authorId" component={AuthorPage} />
            <Route path="/stories" component={StoriesPage} />
            <Route path="/story/:storyId" component={StoryPage} />
            <Route
              path="/story/:storyId/book/:bookId/chapter/:chapterId"
              component={ChapterPage}
            />
          </Switch>
        </Layout>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
