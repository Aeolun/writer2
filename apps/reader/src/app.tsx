import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React, { useState } from "react";
import { trpc } from "./utils/trpc";
import { Route, Switch } from "wouter";
import { IndexPage } from "./pages";
import { Layout } from "./components/layout";
import { BookshelfPage } from "./pages/bookshelf";
import { AuthorsPage } from "./pages/authors";
import { StoriesPage } from "./pages/stories";

export const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:3000/trpc",
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
            <Route
              path="/author/:authorSlug"
              component={() => <>AuthorPage</>}
            />
            <Route path="/stories" component={StoriesPage} />
            <Route path="/story/:storySlug" component={() => <>Story Page</>} />
            <Route
              path="/story/:storySlug/:chapterSlug"
              component={() => <>Chapter Page</>}
            />
          </Switch>
        </Layout>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
