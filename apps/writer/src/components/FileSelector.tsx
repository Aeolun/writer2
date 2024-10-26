import { FilePanel } from "./FilePanel";
import { createSignal } from "solid-js";
import { NotImplementedYet } from "./NotImplementedYet";

interface FileSelectorProps {
  value?: string;
  onChange: (newValue: string) => void;
  showOnlyUploaded?: boolean;
}

export const FileSelector = ({
  value,
  onChange,
  showOnlyUploaded,
}: FileSelectorProps) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const handleSelectFile = (fileName: string) => {
    console.log("fileName", fileName);
    onChange(fileName);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        class="btn btn-primary"
        onClick={() => setIsOpen(true)}
      >
        Select File
      </button>
      <div>Selected File: {value}</div>

      <div class="modal" classList={{ "modal-open": isOpen() }}>
        <div class="modal-box">
          <h3 class="font-bold text-lg">Select a File</h3>
          <button
            type="button"
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
          <NotImplementedYet />
          {/* <FilePanel
            selectFile={handleSelectFile}
            showOnlyUploaded={showOnlyUploaded}
          /> */}
        </div>
      </div>
    </>
  );
};
