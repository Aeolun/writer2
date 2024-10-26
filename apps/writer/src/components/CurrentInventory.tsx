import { getItemsAtParagraph } from "../lib/stores/retrieval/get-items-at-paragraph";

export const CurrentInventory = (props: {
  currentParagraphId: string;
  onClose: () => void;
}) => {
  const itemsUntilParagraph = getItemsAtParagraph(props.currentParagraphId);

  return (
    <div class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Current Inventory</h3>
        <div class="py-4">
          <ul>
            {itemsUntilParagraph
              ? Object.keys(itemsUntilParagraph)
                  .filter((item) => itemsUntilParagraph[item] > 0)
                  .map((item) => (
                    <li>
                      {item} x{itemsUntilParagraph[item]}
                    </li>
                  ))
              : null}
          </ul>
        </div>
      </div>
    </div>
  );
};
