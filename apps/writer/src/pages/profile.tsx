import { WriteHeaderMenu } from "../components/WriteHeaderMenu";
import { NotImplementedYet } from "../components/NotImplementedYet";

const ProfilePage = () => {
  return (
    <div class="flex flex-col h-full">
      <WriteHeaderMenu />
      <div class="flex flex-1 overflow-hidden">
        <NotImplementedYet />
      </div>
    </div>
  );
};

export default ProfilePage;
