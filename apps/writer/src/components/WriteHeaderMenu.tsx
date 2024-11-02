import { createSignal, Show } from "solid-js";
import { setSignedInUser, userState } from "../lib/stores/user";
import { trpc } from "../lib/trpc";
import { FiMenu } from "solid-icons/fi";
import { NotificationManager } from "./NotificationManager";
import { A, useNavigate } from "@solidjs/router";
import { storyState, unloadStory } from "../lib/stores/story";
import {
  setAiPopupOpen,
  setSaving,
  setSigninPopupOpen,
  store,
  uiState,
} from "../lib/stores/ui";
import { uploadStory } from "../lib/persistence/upload-story";
import { importRoyalRoad } from "../lib/persistence/import-royal-road";
import { setSetting } from "../lib/stores/settings";
import { saveStory } from "../lib/persistence/save-story";
import { addNotification } from "../lib/stores/notifications";

export const WriteHeaderMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = createSignal(false);
  const isSignedIn = userState.signedInUser;
  const rrStoryId = storyState.story?.id;

  return (
    <>
      <NotificationManager />
      <div class="bg-white flex justify-between shadow-lg z-20">
        <div class="px-2 py-1 flex items-center gap-1">
          <div class="dropdown">
            <button type="button" class="btn btn-ghost">
              <FiMenu />
            </button>
            <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <A href="/new-story">New Story</A>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    unloadStory();
                    navigate("/open-story");
                  }}
                >
                  Open Story
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    saveStory(true).catch((error) => {
                      addNotification({
                        type: "error",
                        title: "Save failed",
                        message: error.message,
                      });
                    });
                  }}
                >
                  {uiState.saving ? (
                    <span class="loading loading-spinner" />
                  ) : null}
                  Save Story
                </button>
              </li>
            </ul>
          </div>
          <A href={"/write"}>
            <button class="btn btn-ghost btn-xs" type="button">
              Story
            </button>
          </A>
          <A href={"/characters"}>
            <button class="btn btn-ghost btn-xs" type="button">
              Characters
            </button>
          </A>
          <A href={"/files"}>
            <button class="btn btn-ghost btn-xs" type="button">
              Files
            </button>
          </A>
          <A href={"/search"}>
            <button class="btn btn-ghost btn-xs" type="button">
              Search
            </button>
          </A>
          <A href={"/locations"}>
            <button class="btn btn-ghost btn-xs" type="button">
              Locations
            </button>
          </A>
          <A href={"/plot-points"}>
            <button class="btn btn-ghost btn-xs" type="button">
              Plot Points
            </button>
          </A>
          <A href={"/settings"}>
            <button class="btn btn-ghost btn-xs" type="button">
              Story Settings
            </button>
          </A>
          <A href={"/preview"}>
            <button class="btn btn-secondary btn-xs" type="button">
              Preview
            </button>
          </A>
        </div>
        <div class="px-2 py-1 flex gap-2 justify-end items-center">
          <Show when={uiState.saving}>
            <div class="loading loading-spinner" />
          </Show>
          <button
            class="btn btn-ghost"
            type="button"
            onClick={() => {
              setAiPopupOpen(true);
            }}
          >
            AI Question
          </button>

          <button
            class="btn btn-ghost"
            type="button"
            disabled={!rrStoryId || !isSignedIn?.name}
            onClick={() => {
              if (rrStoryId) {
                importRoyalRoad(rrStoryId);
              }
            }}
          >
            Import
          </button>
          <button
            class="btn btn-ghost"
            type="button"
            onClick={() => {
              uploadStory();
            }}
            disabled={!isSignedIn?.name}
          >
            Upload
          </button>

          <div
            class="dropdown dropdown-end"
            classList={{ "dropdown-open": isOpen() }}
          >
            <div
              class="avatar online"
              role="button"
              onClick={() => setIsOpen(!isOpen())}
            >
              <div class="w-10 rounded-full ring-primary ring-1 ring-offset-base-200 w-10rounded-full ring ring-offset-1">
                {isSignedIn?.picture ? (
                  <img
                    src={isSignedIn.picture}
                    alt={isSignedIn.name ?? "Avatar"}
                  />
                ) : (
                  <img src="/disappointed2.png" alt="Avatar" />
                )}
              </div>
            </div>

            <ul class="dropdown-content menu p-2 shadow bg-base-100 z-[1] rounded-box w-52">
              <Show
                when={isSignedIn?.name}
                fallback={
                  <>
                    <li>
                      <A href={"/global-settings"}>App settings</A>
                    </li>
                    <li>
                      <A href={"/profile"}>Sign in</A>
                    </li>
                  </>
                }
              >
                <>
                  <li>
                    <A href={"/global-settings"}>Settings</A>
                  </li>
                  <li>
                    <A href={"/profile"}>Profile</A>
                  </li>
                  <li>
                    <button
                      class="btn btn-ghost"
                      type="button"
                      onClick={() => {
                        trpc.logout.mutate().then(() => {
                          setSignedInUser(undefined);
                          setSetting("clientToken", "");
                        });
                      }}
                    >
                      Log out
                    </button>
                  </li>
                </>
              </Show>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
