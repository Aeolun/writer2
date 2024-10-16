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
    <div className="flex items-center space-x-4 ml-auto">
      <div className="form-control">
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered w-24 md:w-auto"
        />
      </div>
      {user ? (
        <>
          <ul className="menu menu-horizontal px-1">
            <li>
              <Navitem to="/library">Library</Navitem>
            </li>
            <li>
              <Navitem to="/my-fiction">Own Fiction</Navitem>
            </li>
          </ul>
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
                <a>Profile</a>
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
        </>
      ) : (
        <ul className="menu menu-horizontal px-1">
          <li>
            <Navitem to="/login">Login</Navitem>
          </li>
        </ul>
      )}
    </div>
  );
};

export default UserStatus;
