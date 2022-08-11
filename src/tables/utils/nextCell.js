import { Editor } from "slate";
import { TableMap } from "../table-map";

export function nextCell(editor, posId, axis, dir) {
  const table = Editor.above(editor, {
    match: (n) => n.type === "table",
  })?.[0];
  window.Editor = Editor;
  if (table) {
    let map = TableMap.get(table);
    let moved = map.nextCell(posId, axis, dir);
    return moved == null ? null : moved;
  }
}
