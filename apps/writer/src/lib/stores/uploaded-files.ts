import { UploadedFile } from "@writer/shared";
import { createStore } from "solid-js/store";

export const [uploadedFiles, setUploadedFiles] = createStore<{
  files: Record<string, UploadedFile>;
}>({ files: {} });

export const addUploadedFile = (path: string, file: UploadedFile) => {
  setUploadedFiles("files", (prev) => ({ ...prev, [path]: file }));
};
