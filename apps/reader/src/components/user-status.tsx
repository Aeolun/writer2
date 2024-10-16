import React from "react";
import { trpc } from "../utils/trpc";
import { Navitem } from "../ui-components/navitem/navitem";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

const UserStatus = () => {
  const { data: user, isLoading, error } = trpc.whoAmI.useQuery();
  const queryClient = useQueryClient();
  const signoutMutation = trpc.sessionSignout.useMutation();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    console.error("Error fetching user:", error);
    return <p>Error loading user information.</p>;
  }

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await signoutMutation.mutateAsync();
                    queryClient.invalidateQueries({
                      queryKey: getQueryKey(trpc.whoAmI),
                    });
                  } catch (error) {
                    console.error("Error signing out:", error);
                  }
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      ) : (
        <Navitem to="/login">Login</Navitem>
      )}
    </div>
  );
};

export default UserStatus;
