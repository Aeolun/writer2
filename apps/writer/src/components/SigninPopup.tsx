import { createSignal } from "solid-js";
import { reloadTrpc, trpc } from "../lib/trpc";
import { setSigninPopupOpen, uiState } from "../lib/stores/ui";
import { setSetting } from "../lib/stores/settings";
import { setSignedInUser, userState } from "../lib/stores/user";

export const SigninPanel = () => {
  const [activeTab, setActiveTab] = createSignal("signin");
  const [clientName, setClientName] = createSignal("");
  const [signInEmail, setSignInEmail] = createSignal("");
  const [signInPassword, setSignInPassword] = createSignal("");
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [isRegistered, setIsRegistered] = createSignal(false);

  const handleSignInSubmit = (event) => {
    event.preventDefault();
    trpc.login
      .mutate({
        email: signInEmail(),
        password: signInPassword(),
        description: clientName(),
      })
      .then(async (result) => {
        if (result) {
          setSetting("clientToken", result);
          reloadTrpc();
          const res = await trpc.whoAmI.query();
          setSignedInUser(res ?? undefined);
        }

        setSigninPopupOpen(false);
      });
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    trpc.register
      .mutate({
        email: email(),
        name: name(),
        password: password(),
      })
      .then((result) => {
        setIsRegistered(true);
      });
  };

  return (
    <div class="p-4 w-full">
      {userState.signedInUser ? (
        <div>Hello {userState.signedInUser?.name}</div>
      ) : (
        <>
          <div class="text-lg">Register / Sign-in</div>
          <div class="text-sm mt-2">
            If you want to sync your story using our servers, you can sign in or
            register here.
          </div>
          <div class="text-sm mt-2">
            This is also necessary if you want to publish your story to the
            public <i>reader</i> application, or automatically sync to other
            supported services. It's <strong>not</strong> necessary if you want
            to just manually copy your content to other services (e.g.
            Royalroad) using the preview functionality.
          </div>
          <div class="text-sm mt-2">
            You have to only sign-in once per writer instance. Once you sign in
            a token is generated that writer will thereafter use for
            communication.
          </div>
          <div class="tabs tabs-bordered mt-4">
            <button
              type="button"
              class={`tab ${activeTab() === "signin" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              class={`tab ${activeTab() === "register" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>
          {activeTab() === "register" ? (
            <div class="p-4">
              <h2 class="text-xl font-bold">Register</h2>
              {isRegistered() ? (
                <div class="box">
                  Thank you for registering, please sign-in now.
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit}>
                  <div class="form-control">
                    <label class="label">Name</label>
                    <input
                      type="text"
                      class="input input-bordered"
                      value={name()}
                      onInput={(e) => setName(e.target.value)}
                    />
                    <span class="label-text">
                      This is the name that will be displayed to other users.
                    </span>
                  </div>
                  <div class="form-control">
                    <label class="label">Email</label>
                    <input
                      type="email"
                      class="input input-bordered"
                      value={email()}
                      onInput={(e) => setEmail(e.target.value)}
                    />
                    <span class="label-text">
                      This is the email that will be used for communication.
                      Never shown to other users.
                    </span>
                  </div>
                  <div class="form-control">
                    <label class="label">Password</label>
                    <input
                      type="password"
                      class="input input-bordered"
                      value={password()}
                      onInput={(e) => setPassword(e.target.value)}
                    />
                    <span class="label-text">
                      This is the password you will use to sign in.
                    </span>
                  </div>
                  <button type="submit" class="btn btn-primary mt-4">
                    Register
                  </button>
                </form>
              )}
            </div>
          ) : null}
          {activeTab() === "signin" ? (
            <div class="p-4">
              <h2 class="text-xl font-bold">Sign in</h2>
              <form onSubmit={handleSignInSubmit}>
                <div class="form-control">
                  <label class="label">Client name</label>
                  <input
                    type="text"
                    class="input input-bordered"
                    value={clientName()}
                    onInput={(e) => setClientName(e.target.value)}
                  />
                  <span class="label-text">
                    This is the name of the device you are using. It can be
                    anything you want.
                  </span>
                </div>
                <div class="form-control">
                  <label class="label">Email</label>
                  <input
                    type="email"
                    class="input input-bordered"
                    value={signInEmail()}
                    onInput={(e) => setSignInEmail(e.target.value)}
                  />
                </div>
                <div class="form-control">
                  <label class="label">Password</label>
                  <input
                    type="password"
                    class="input input-bordered"
                    value={signInPassword()}
                    onInput={(e) => setSignInPassword(e.target.value)}
                  />
                </div>
                <button type="submit" class="btn btn-primary mt-4">
                  Sign in
                </button>
              </form>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
