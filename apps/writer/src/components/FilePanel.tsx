import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../lib/store.ts";

import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { resolve } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import {
  copyFile,
  mkdir,
  readDir,
  readFile,
  remove,
} from "@tauri-apps/plugin-fs";
import { Link as LinkIcon, Trash, Upload } from "iconoir-react";
import { useCallback, useEffect, useState } from "react";
import { storyActions } from "../lib/slices/story.ts";
import { trpc } from "../lib/trpc.ts";
import { arrayBufferToBase64 } from "../lib/util.ts";

export interface File {
  name: string;
  isDir: boolean;
}

const Item = ({
  signedIn,
  handleClick,
  handleAction,
  uploadData,
  file,
}: {
  signedIn: boolean;
  handleClick: (fileName: string, isDir: boolean) => Promise<void>;
  handleAction: (
    fileName: string,
    action: "delete" | "upload" | "copy-link",
  ) => Promise<void>;
  uploadData?: {
    hash: string;
    publicUrl: string;
  };
  file: File;
}): JSX.Element => {
  const [uploading, setUploading] = useState<boolean>(false);
  return (
    <Flex
      key={file.name}
      className={file.isDir ? "dir" : "file"}
      onClick={() => {
        handleClick(file.name, file.isDir);
      }}
      cursor={"pointer"}
      _hover={{
        bg: "gray.300",
      }}
      w={"100%"}
    >
      {file.isDir ? "📁" : file.name.includes(".png") ? "🖼" : "📄"}
      {file.name}
      {file.isDir ? "/" : ""}
      {!file.isDir ? (
        <>
          {uploadData?.publicUrl ? (
            <IconButton
              aria-label={"copy link"}
              size={"xs"}
              colorScheme={"blue"}
              icon={<LinkIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleAction(uploadData.publicUrl, "copy-link");
              }}
            />
          ) : null}
          <IconButton
            ml={"auto"}
            isDisabled={!signedIn}
            aria-label={"upload"}
            size={"xs"}
            isLoading={uploading}
            colorScheme={"blue"}
            icon={<Upload />}
            onClick={(e) => {
              e.stopPropagation();
              setUploading(true);
              handleAction(file.name, "upload").then(() => {
                setUploading(false);
              });
            }}
          />

          <IconButton
            aria-label={"delete"}
            size={"xs"}
            colorScheme={"red"}
            icon={<Trash />}
            onClick={(e) => {
              e.stopPropagation();
              handleAction(file.name, "delete");
            }}
          />
        </>
      ) : null}
    </Flex>
  );
};

export const FilePanel = () => {
  const [files, setFiles] = useState<File[]>([]);

  const uploadedFiles = useSelector(
    (store: RootState) => store.story.uploadedFiles,
  );
  const storyId = useSelector((store: RootState) => store.story.id);
  const dispatch = useDispatch();
  const isSignedIn = useSelector((store: RootState) => store.base.signedInUser);
  const projectDir = useSelector((store: RootState) => store.base.openPath);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [createDirOpen, setCreateDirOpen] = useState<boolean>(false);
  const [openedFile, setOpenedFile] = useState<string>("");
  const [newDirectoryName, setNewDirectoryName] = useState<string>("");

  if (!projectDir) {
    throw new Error("No project directory set");
  }

  const handleClick = useCallback(
    async (name: string, isDir: boolean) => {
      if (isDir) {
        let newPath = await resolve(projectDir, "data", currentPath, name);
        if (!newPath.includes(`${projectDir}/data`)) {
          newPath = `${projectDir}/data`;
        }
        setCurrentPath(newPath.replace(`${projectDir}/data`, ""));
      } else {
        const newPath = await resolve(
          projectDir,
          "data",
          currentPath.replace(/^\//, ""),
          name,
        );
        setOpenedFile(convertFileSrc(newPath));
      }
    },
    [currentPath, projectDir],
  );

  const handleAction = useCallback(
    async (name: string, action: "delete" | "upload" | "copy-link") => {
      if (action === "delete") {
        const newPath = await resolve(
          projectDir,
          "data",
          currentPath.replace(/^\//, ""),
          name,
        );
        await remove(newPath);
        await getFiles();
      } else if (action === "upload") {
        if (!isSignedIn) {
          throw new Error("Not signed in");
        }
        const readPath = await resolve(
          projectDir,
          "data",
          currentPath.replace(/^\//, ""),
          name,
        );
        const newPath = readPath.replace(`${projectDir}/data`, "");
        console.log("uploading", readPath, newPath);
        const fileData = await readFile(readPath);
        return trpc.uploadImage
          .mutate({
            dataBase64: arrayBufferToBase64(fileData),
            path: newPath,
            storyId: storyId,
          })
          .then((res) => {
            console.log("uploaded");
            dispatch(
              storyActions.putUploadedFile({
                path: newPath,
                hash: res.sha256,
                publicUrl: res.fullUrl,
              }),
            );
          })
          .catch((error) => {
            console.error(error);
          });
      } else if (action === "copy-link") {
        writeText(name)
          .then(() => {
            console.log("copied");
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
    [currentPath, projectDir, isSignedIn, storyId],
  );

  const getFiles = useCallback(
    async function getFiles() {
      if (!projectDir) {
        throw new Error("No project directory set");
      }
      const loadPath = await resolve(
        projectDir,
        "data",
        currentPath.replace(/^\//, ""),
      );

      const contents = await readDir(loadPath);

      const entries = [
        { name: "..", isDirectory: true, path: ".." },
        ...contents,
      ];

      console.log(entries);
      const names = entries.map((entry) => ({
        name: entry.name || "",
        isDir: entry.isDirectory,
      }));

      setFiles(names);
    },
    [currentPath, projectDir],
  );

  useEffect(() => {
    getFiles();
  }, [getFiles]);

  return (
    <Flex flex={1} direction={"column"} overflow={"hidden"}>
      <HStack overflow={"hidden"} flex={1}>
        <VStack maxW={"30%"} minW={"300px"} h={"100%"} flex={1}>
          <Box bg={"gray.400"} px={2} py={1} w={"100%"} minH={"2em"}>
            {currentPath}
          </Box>
          <VStack
            alignItems={"flex-start"}
            gap={2}
            overflow={"auto"}
            flex={1}
            w={"100%"}
          >
            {files.map((file: File) => (
              <Item
                key={file.name}
                signedIn={!!isSignedIn?.name}
                handleAction={handleAction}
                uploadData={uploadedFiles?.[`${currentPath}/${file.name}`]}
                handleClick={handleClick}
                file={file}
              />
            ))}
          </VStack>
          <HStack>
            <Button
              onClick={async () => {
                setCreateDirOpen(true);
              }}
            >
              Create Dir
            </Button>
            <Button
              onClick={async () => {
                const files = await open({
                  multiple: true,
                  directory: false,
                });
                console.log(files);
                await Promise.all(
                  files?.map(async (f) => {
                    if (f.name) {
                      const destination = await resolve(
                        projectDir,
                        "data",
                        currentPath.replace(/^\//, ""),
                        f.name,
                      );
                      return copyFile(f.path, destination);
                    }
                  }) ?? [],
                );
                await getFiles();
              }}
            >
              Add File
            </Button>
          </HStack>
          <Modal
            isOpen={createDirOpen}
            onClose={() => {
              setCreateDirOpen(false);
            }}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Create Directory</ModalHeader>
              <ModalBody>
                <Input
                  onChange={(e) => {
                    setNewDirectoryName(e.target.value);
                  }}
                  value={newDirectoryName}
                  placeholder={"directory name"}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  onClick={async () => {
                    setCreateDirOpen(false);

                    const newDir = await resolve(
                      projectDir,
                      "data",
                      currentPath.replace(/^\//, ""),
                      newDirectoryName,
                    );
                    await mkdir(newDir);
                    await getFiles();
                  }}
                >
                  Create
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
        <Box overflow={"auto"} h={"100%"} w={"100%"} textAlign={"center"}>
          {["png", "jpg", "jpeg", "webp"].includes(
            openedFile
              ?.substring(openedFile?.lastIndexOf(".") + 1)
              .toLowerCase(),
          ) ? (
            <img src={openedFile} alt={"preview"} />
          ) : (
            openedFile
          )}
        </Box>
      </HStack>
    </Flex>
  );
};
