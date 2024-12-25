import { createSignal, Show } from "solid-js";
import { setSignedInUser, userState } from "../lib/stores/user";
import { trpc } from "../lib/trpc";
import { FiMenu, FiSettings } from "solid-icons/fi";
import { NotificationManager } from "./NotificationManager";
import { A, useNavigate } from "@solidjs/router";
import { storyState, unloadStory } from "../lib/stores/story";
import { setAiPopupOpen, uiState } from "../lib/stores/ui";
import { uploadStory } from "../lib/persistence/upload-story";
import { importRoyalRoad } from "../lib/persistence/import-royal-road";
import { setSetting } from "../lib/stores/settings";
import { saveStory } from "../lib/persistence/save-story";
import { addNotification } from "../lib/stores/notifications";
import { unloadState } from "../lib/persistence/unload-state";

export const WriteHeaderMenu = () => {
  const navigate = useNavigate();
  const [isUserOpen, setIsUserOpen] = createSignal(false);
  const [isSettingsOpen, setIsSettingsOpen] = createSignal(false);
  const [isMainOpen, setIsMainOpen] = createSignal(false);

  return (
    <>
      <NotificationManager />
      <div class="bg-white flex justify-between shadow-lg z-20">
        <div class="px-2 py-1 flex items-center gap-1">
          <div
            class="dropdown"
            classList={{
              "dropdown-open": isMainOpen(),
            }}
          >
            <button
              type="button"
              class="btn btn-ghost"
              onClick={() => {
                setIsMainOpen(!isMainOpen());
              }}
            >
              <FiMenu />
            </button>
            <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <A
                  href="/new-story"
                  onClick={() => {
                    unloadState();
                  }}
                >
                  New Story
                </A>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    unloadState();
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
            <button class="btn btn-ghost px-2" type="button">
              Story
            </button>
          </A>
          <A href={"/snowflake"}>
            <button class="btn btn-ghost btn-xs" type="button">
              Snowflake
            </button>
          </A>
          <A href={"/characters"}>
            <button class="btn btn-ghost px-2" type="button">
              Characters
            </button>
          </A>
          <A href={"/files"}>
            <button class="btn btn-ghost px-2" type="button">
              Files
            </button>
          </A>
          <A href={"/search"}>
            <button class="btn btn-ghost px-2" type="button">
              Search
            </button>
          </A>
          <A href={"/locations"}>
            <button class="btn btn-ghost px-2" type="button">
              Locations
            </button>
          </A>
          <A href={"/plot-points"}>
            <button class="btn btn-ghost px-2" type="button">
              Plot Points
            </button>
          </A>
          <A href={"/settings"}>
            <button class="btn btn-ghost px-2" type="button">
              Story Settings
            </button>
          </A>
          <A href={"/preview"}>
            <button
              class="btn btn-secondary px-4"
              disabled={!uiState.currentId}
              type="button"
            >
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
            disabled={
              !storyState.story?.settings?.royalRoadId ||
              !userState.signedInUser?.name
            }
            onClick={() => {
              if (storyState.story?.settings?.royalRoadId) {
                importRoyalRoad(storyState.story?.settings?.royalRoadId);
              }
            }}
          >
            {uiState.importDialog.running ? (
              <span class="loading loading-spinner" />
            ) : null}
            {uiState.importDialog.running ? "Importing..." : "Import"}
          </button>
          <button
            class="btn btn-ghost"
            type="button"
            onClick={() => {
              uploadStory();
            }}
            disabled={!userState.signedInUser?.name}
          >
            Upload
          </button>
          <div
            class="dropdown dropdown-end"
            classList={{ "dropdown-open": isSettingsOpen() }}
          >
            <button
              class="btn btn-circle"
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen())}
            >
              <FiSettings />
            </button>

            <ul class="dropdown-content menu p-2 shadow bg-base-100 z-[1] rounded-box w-52">
              <li>
                <A href={"/global-settings"}>App settings</A>
              </li>
            </ul>
          </div>
          <div
            class="dropdown dropdown-end"
            classList={{ "dropdown-open": isUserOpen() }}
          >
            <button
              class="avatar online"
              type="button"
              onClick={() => setIsUserOpen(!isUserOpen())}
            >
              <div class="w-10 rounded-full ring-primary ring-1 ring-offset-base-200 rounded-full ring ring-offset-1">
                {userState.signedInUser?.avatarUrl ? (
                  <img
                    src={userState.signedInUser.avatarUrl}
                    alt={userState.signedInUser.name ?? "Avatar"}
                  />
                ) : (
                  <img src="/disappointed2.png" alt="Avatar" />
                )}
              </div>
            </button>

            <ul class="dropdown-content menu p-2 shadow bg-base-100 z-[1] rounded-box w-52">
              <Show
                when={userState.signedInUser?.name}
                fallback={
                  <li>
                    <A href={"/profile"}>Sign in</A>
                  </li>
                }
              >
                <>
                  <li>
                    <A href={"/profile"}>Profile</A>
                  </li>
                  <li>
                    <button
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
