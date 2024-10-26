import {
  notificationsState,
  removeNotification,
} from "../lib/stores/notifications";
import { For } from "solid-js";

export const NotificationManager = () => {
  const notifications = notificationsState.notifications;

  return (
    <div class="fixed top-4 right-4 z-50">
      <div class="flex flex-col space-y-2">
        <For each={notifications}>
          {(notification) => (
            <div class={`alert alert-${notification.type} relative pr-8`}>
              <div class="flex-1 mr-2">
                <span>{notification.message}</span>
                {notification.details &&
                  Object.keys(notification.details).length > 0 && (
                    <div class="mt-2">
                      <For each={Object.entries(notification.details)}>
                        {([field, errors]) => (
                          <span class="text-sm text-red-500">
                            {field}: {errors.join(", ")}
                          </span>
                        )}
                      </For>
                    </div>
                  )}
              </div>
              <button
                type="button"
                class="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={() => removeNotification(notification.id)}
              >
                ✕
              </button>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
