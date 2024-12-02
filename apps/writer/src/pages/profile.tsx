import { WriteHeaderMenu } from "../components/WriteHeaderMenu";
import { SigninPanel } from "../components/SigninPopup";

const ProfilePage = () => {
  return (
    <div class="flex flex-col h-full">
      <WriteHeaderMenu />
      <div class="flex flex-1 overflow-hidden">
        <SigninPanel />
      </div>
    </div>
  );
};

export default ProfilePage;
