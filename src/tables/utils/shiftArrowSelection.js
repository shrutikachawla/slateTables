import { Editor } from "slate";
import { TableSelection } from "../table-selection";
import { atEndOfCell } from "./atEndOfCell";
import { nextCell } from "./nextCell";

export function shiftArrowSelection(event, editor, axis, dir) {
  let { tableSelection = null } = editor;
  window.Editor = Editor;

  let anchorCellNodeEntry;

  if (!tableSelection) {
    [anchorCellNodeEntry] = Editor.nodes(editor, {
      match: (n) => n.type === "table-cell",
      at: editor.selection,
    });
    //If selection spans a single cell
    if (anchorCellNodeEntry) {
      //Check if selection covers the end edge of cell
      let end = atEndOfCell(editor, anchorCellNodeEntry[0].id, axis, dir);
      if (end == null) return false;
      tableSelection = new TableSelection(editor, {
        anchorCellPath: anchorCellNodeEntry[1],
      });
    }
  }

  let focusCellId = nextCell(editor, tableSelection.focusCell[0].id, axis, dir);
  if (!focusCellId) return false;
  const [focusCellNodeEntry] = Editor.nodes(editor, {
    match: (n) => n.id === focusCellId,
    at: [],
  });

  if (!focusCellNodeEntry) return;

  event.preventDefault();
  new TableSelection(editor, {
    anchorCellPath: tableSelection.anchorCell[1],
    focusCellPath: focusCellNodeEntry?.[1],
  });
  return true;
}
