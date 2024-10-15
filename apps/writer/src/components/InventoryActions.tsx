import { Flex, Button, Select, Input, Text } from "@chakra-ui/react";
import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteList,
  AutoCompleteItem,
} from "@choc-ui/chakra-autocomplete";
import { scene } from "../db/schema";
import { storyActions } from "../lib/slices/story";
import { InventoryAction } from "@writer/shared";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/store";
import { globalActions } from "../lib/slices/global";
import { selectedSceneSelectedParagraphSelector } from "../lib/selectors/selectedSceneSelectedParagraphSelector";

export const InventoryActions = () => {
  const [inventory, setInventory] = useState<InventoryAction>({
    type: "add",
    item_name: "",
    item_amount: 1,
  });
  const items = useAppSelector((store) => store.story.item);
  const dispatch = useAppDispatch();
  const selectedParagraph = useAppSelector(
    selectedSceneSelectedParagraphSelector,
  );

  return (
    <Flex gap={1} alignItems="center" mt="2">
      <Text minW="6em">Inventory</Text>
      <Button
        onClick={() => {
          dispatch(globalActions.setShowInventory(true));
        }}
      >
        Current
      </Button>
      <Select
        value={inventory.type}
        onChange={(e) => {
          setInventory({
            ...inventory,
            type: e.currentTarget.value as "add" | "remove",
          });
        }}
      >
        <option value="add">Add</option>
        <option value="remove">Remove</option>
      </Select>
      <AutoComplete
        openOnFocus
        onSelectOption={(option) => {
          setInventory({
            ...inventory,
            item_name: option.item.value,
          });
        }}
      >
        <AutoCompleteInput
          variant="filled"
          value={inventory.item_name}
          onChange={(e) => {
            setInventory({
              ...inventory,
              item_name: e.currentTarget.value,
            });
          }}
        />
        <AutoCompleteList>
          {Object.values(items ?? {}).map((item) => (
            <AutoCompleteItem key={`option-${item.id}`} value={item.name}>
              {item.name}
            </AutoCompleteItem>
          ))}
        </AutoCompleteList>
      </AutoComplete>
      <Input
        type="number"
        value={inventory.item_amount}
        onChange={(e) => {
          setInventory({
            ...inventory,
            item_amount: Number.parseInt(e.currentTarget.value),
          });
        }}
      />
      <Button
        onClick={() => {
          if (scene && inventory && selectedParagraph?.selectedParagraph) {
            dispatch(
              storyActions.addInventoryActionToSceneParagraph({
                sceneId: selectedParagraph.id,
                paragraphId: selectedParagraph.selectedParagraph,
                ...inventory,
              }),
            );
          }
        }}
      >
        Add
      </Button>
    </Flex>
  );
};
