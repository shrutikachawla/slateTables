import { Editor, Transforms } from "slate";
import { atEndOfCell } from "./atEndOfCell";
import { nextCell } from "./nextCell";

export function shiftArrowSelection(event, editor, axis, dir) {
  const { selectedCells = [] } = editor;
  let posId = selectedCells[0];
  //If selection spans a single cell
  if (selectedCells.length === 1) {
    //Check if selection covers the end edge of cell
    let end = atEndOfCell(editor, axis, dir);
    if (end == null) return false;
    // const [anchorCellNodeEntry] = Array.from(
    //   Editor.nodes(editor, {
    //     match: (n) => n.id === posId,
    //     at: []
    //   })
    // );
    // Transforms.select(editor, anchorCellNodeEntry[1]);
  }

  // if (dir < 0) posId = selectedCells[0];
  // else posId = selectedCells[selectedCells.length - 1];
  let focusCellId = nextCell(editor, posId, axis, dir);
  console.log("Focus cell id", focusCellId);
  if (!focusCellId) return false;
  const [focusCellNodeEntry] = Array.from(
    Editor.nodes(editor, {
      match: (n) => n.id === focusCellId,
      at: []
    })
  );
  const [focusPoint] = Editor.edges(editor, focusCellNodeEntry[1]);
  event.preventDefault();

  console.log("Focus point", { focusPoint });
  Transforms.setSelection(editor, { focus: focusPoint });
  // if (dir < 0) {
  //   if(selectedCells)
  // }
  // } else {
  //   if(selectedCells.length === 1){

  // }
  // Transforms.select(editor, {
  //   anchor: editor.selection.anchor,
  //   focus: focusPoint
  // });
  // }
  return true;
}
