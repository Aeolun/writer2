import { FilePanel } from "../components/FilePanel.tsx";
import { NotImplementedYet } from "../components/NotImplementedYet.tsx";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu.tsx";

const Files = () => {
  return (
    <div class="flex flex-col h-full">
      <WriteHeaderMenu />
      <div class="flex flex-1 overflow-hidden">
        <FilePanel />
      </div>
    </div>
  );
};

export default Files;
