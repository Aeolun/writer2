import { createSignal } from "solid-js";
import { reloadTrpc, trpc } from "../lib/trpc";
import { setSigninPopupOpen, uiState } from "../lib/stores/ui";

export const SigninPopup = () => {
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
        dispatch(
          globalActions.setSetting({
            key: "clientToken",
            value: result,
          }),
        );
        reloadTrpc();
        const res = await trpc.whoAmI.query();
        dispatch(globalActions.setSignedInUser(res ?? undefined));

        dispatch(globalActions.setSigninPopupOpen(false));
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
    <div
      class={`modal ${uiState.signinPopupOpen ? "modal-open" : ""}`}
      onClick={() => {
        setSigninPopupOpen(false);
      }}
    >
      <div class="modal-overlay" />
      <div class="modal-content">
        <div class="modal-header">Register / Sign-in</div>
        <div class="modal-body">
          <div>
            If you want to sync your story using our servers, you can sign in or
            register here.
          </div>
          <div>
            This is also necessary if you want to publish your story to the
            public <i>reader</i> application. It's <strong>not</strong>{" "}
            necessary if you want to publish to other services supported by{" "}
            <i>writer</i> (e.g. Royalroad).
          </div>
          <div>
            You have to only sign-in once per writer instance. Once you sign in
            a token is generated that writer will thereafter use for
            communication.
          </div>
          <div class="tabs">
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
          <div class="tab-content">
            {activeTab() === "signin" && (
              <div>
                <h2 class="text-md">Sign in</h2>
                <form onSubmit={handleSignInSubmit}>
                  <div class="form-control">
                    <label class="label">Client name</label>
                    <input
                      type="text"
                      class="input"
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
                      class="input"
                      value={signInEmail()}
                      onInput={(e) => setSignInEmail(e.target.value)}
                    />
                  </div>
                  <div class="form-control">
                    <label class="label">Password</label>
                    <input
                      type="password"
                      class="input"
                      value={signInPassword()}
                      onInput={(e) => setSignInPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" class="btn">
                    Sign in
                  </button>
                </form>
              </div>
            )}
            {activeTab() === "register" && (
              <div>
                <h2 class="text-md">Register</h2>
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
                        class="input"
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
                        class="input"
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
                        class="input"
                        value={password()}
                        onInput={(e) => setPassword(e.target.value)}
                      />
                      <span class="label-text">
                        This is the password you will use to sign in.
                      </span>
                    </div>
                    <button type="submit" class="btn">
                      Register
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
