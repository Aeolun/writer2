import { WriteHeaderMenu } from "../components/WriteHeaderMenu";
import { StorySettings } from "../components/StorySettings";

const Profile = () => {
  return (
    <div class="flex flex-col h-full">
      <WriteHeaderMenu />
      <div class="flex flex-1 overflow-hidden">
        <StorySettings />
      </div>
    </div>
  );
};

export default Profile;
