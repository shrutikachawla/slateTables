import { Editor } from "slate";
import { TableMap } from "../table-map";

export function nextCell(editor, posId, axis, dir) {
  const table = Editor.above(editor, {
    match: (n) => n.type === "table"
  });
  console.log("Cannot find table map", { table, selection: editor.selection });
  window.Editor = Editor;
  if (table) {
    let map = TableMap.get(table[0]);
    let moved = map.nextCell(posId, axis, dir);
    console.log("Move to:", { moved });
    return moved == null ? null : moved;
  }
}
