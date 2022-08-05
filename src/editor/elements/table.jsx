import React, { useEffect } from "react";
import { useSlate } from "slate-react";
import { useTableSelection } from "../../tables/contexts/TableSelectionContext";
import { useSelectedCells } from "../../tables/contexts/SelectedCellsContext";
import { computeMap } from "../../tables/utils";

const TableElement = ({ attributes, children, slateElement }) => {
  const computedMap = computeMap(slateElement);

  const editor = useSlate();
  const [tableSelection] = useTableSelection();
  const [, selectedCellsDispatch] = useSelectedCells();

  useEffect(() => {
    selectedCellsDispatch({
      type: "set-state",
      payload: {
        tableSelection,
        editor,
        map: computedMap,
      },
    });
  }, [JSON.stringify(tableSelection)]);

  return (
    <table
      style={{
        borderSpacing: 0,
        borderCollapse: "separate",
        width: "100%",
      }}
      draggable={false}
    >
      <tbody {...attributes}>{children}</tbody>
    </table>
  );
};

export default TableElement;
