import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { FilePanel } from "./FilePanel";

interface FileSelectorProps {
  value?: string;
  onChange: (newValue: string) => void;
  showOnlyUploaded?: boolean;
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  value,
  onChange,
  showOnlyUploaded,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectFile = (fileName: string) => {
    console.log("fileName", fileName);
    onChange(fileName);
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Select File</Button>
      <div>Selected File: {value}</div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a File</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FilePanel
              selectFile={handleSelectFile}
              showOnlyUploaded={showOnlyUploaded}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
