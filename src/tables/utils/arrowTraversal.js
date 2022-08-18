import { Editor, Transforms } from "slate";
import { TableSelection } from "../table-selection";
import { nextCell } from "./nextCell";

export function arrowTraversal(event, editor, axis, dir) {
  let { tableSelection = null } = editor;
  let focusCellNode, focusCellPath;
  if (!!tableSelection) {
    [[focusCellNode, focusCellPath]] = tableSelection.focusCell;
    new TableSelection(editor, null);
  } else {
    [[focusCellNode, focusCellPath]] = Editor.nodes(editor, {
      match: (n) => n.type === "table-cell",
    });
  }
  if (focusCellNode) {
    let nextCellId = nextCell(editor, focusCellNode.id, axis, dir);
    const [nextCellNodeEntry] = Editor.nodes(editor, {
      match: (n) => n.id === nextCellId,
      at: [],
    });
    if (nextCellNodeEntry) {
      event.preventDefault();
      const [, cellPath] = nextCellNodeEntry;
      Transforms.setSelection(editor, {
        anchor: { path: cellPath, offset: 0 },
        focus: { path: cellPath, offset: 0 },
      });
    }
  }
}
