import React, { useState, useEffect } from "react";
import styles from "./table-cell.less";
import { blendColors } from "../../utils/blendColors";
import { useSelectedCells } from "../../tables/contexts/SelectedCellsContext";
import { ReactEditor, useSlate } from "slate-react";
import { handleMouseDown } from "../onMouseDown";
import { useTableSelectionDispatchState } from "../../tables/contexts/TableSelectionContext";

const TableCellElement = ({ slateElement, attributes, children }) => {
  const editor = useSlate();
  const { colspan = 1 } = slateElement;
  const { rowspan = 1 } = slateElement;
  const [selected, setSelected] = useState(false);
  const [selectionColor, setSelectionColor] = useState("#B8B8B88C");
  const [selectedCells] = useSelectedCells();
  const tableSelectionDispatch = useTableSelectionDispatchState();

  const { id } = slateElement;
  const backgroundColor = slateElement.backgroundColor || "transparent";
  //

  useEffect(() => {
    if (selectedCells?.length > 1) {
      if (selectedCells?.find((value) => value === id)) {
        setSelected(true);
      } else {
        setSelected(false);
      }
    } else {
      setSelected(false);
    }
  }, [id, selectedCells]);

  useEffect(() => {
    if (backgroundColor !== "transparent") {
      setSelectionColor(blendColors(backgroundColor, 0.3));
    } else {
      setSelectionColor("#B8B8B88C");
    }
  }, [backgroundColor]);

  return (
    <td
      style={{
        border: "1px solid black",
        background: selected ? selectionColor : backgroundColor,
      }}
      {...attributes}
      colSpan={colspan}
      rowSpan={rowspan}
      className={styles.singleCell}
      onMouseDown={(event) => {
        const nativeEvent = event.nativeEvent;
        handleMouseDown(editor, nativeEvent, tableSelectionDispatch);
      }}
    >
      {children}
    </td>
  );
};

export default TableCellElement;
