import { Editor, Path } from "slate";
import { TableMap } from "./table-map";
import croveEmitter from "../utils/crove";

window.Path = Path;

export class TableSelection {
  constructor(editor, selectionRange = null) {
    if (selectionRange === null) {
      croveEmitter.emit("changeTableSelection", null);
      return;
    }
    const { anchorCellPath, focusCellPath = anchorCellPath } = selectionRange;
    if (!anchorCellPath || !focusCellPath) return;
    const anchorCell = Editor.node(editor, anchorCellPath);
    const focusCell = Editor.node(editor, focusCellPath);
    if (anchorCell && focusCell) {
      const tableNode = Editor.above(editor, {
        match: (n) => n.type === "table",
        at: anchorCellPath,
      })?.[0];
      const map = TableMap.get(tableNode);
      const rect = map.rectBetween(anchorCell[0]?.id, focusCell[0]?.id);
      const selectedCells = map.cellsInRect(rect);
      this.anchorCell = anchorCell;
      this.focusCell = focusCell;
      this.selectedCells = selectedCells;
      this.tableId = tableNode.id;
      editor.tableSelection = this;
      croveEmitter.emit("changeTableSelection", this);
    } else {
      editor.tableSelection = null;
      croveEmitter.emit("changeTableSelection", null);
    }
  }
}
