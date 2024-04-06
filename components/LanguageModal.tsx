import React from "react";
import {
  Box, Button, Checkbox,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody, ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay, Table,
  Textarea,
} from "@chakra-ui/react";
import {useDispatch, useSelector} from "react-redux";
import { RootState } from "../lib/store";
import {storyActions} from "../lib/slices/story";
import {languageActions} from "../lib/slices/language";
import {LanguageForm} from "./LanguageForm";

export const LanguageModal = (props: {
  languageId: string;
  onClose: () => void;
}) => {
  const { languageId } = props;
  const [ newWord, setNewWord ] = React.useState('');

  const language = useSelector(
    (state: RootState) => state.language.languages[languageId]
  );

  return (
    <Modal isOpen={true} onClose={props.onClose} size={'full'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Language {language?.id}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <LanguageForm languageId={languageId} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
