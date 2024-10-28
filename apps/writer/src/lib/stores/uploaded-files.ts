import { UploadedFile } from "@writer/shared";
import { createStore } from "solid-js/store";

export const [uploadedFiles, setUploadedFiles] = createStore<
  Record<string, UploadedFile>
>({});

export const addUploadedFile = (path: string, file: UploadedFile) => {
  setUploadedFiles((prev) => ({ ...prev, [path]: file }));
};
