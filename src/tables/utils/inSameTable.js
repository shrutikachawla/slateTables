import { Editor, Path } from "slate";

export function inSameTable(editor, $a, $b) {
  const tableAPath = Editor.above(editor, {
    match: (n) => n.type === "table",
    at: $a,
  })?.[1];
  const tableBPath = Editor.above(editor, {
    match: (n) => n.type === "table",
    at: $b,
  })?.[1];
  return Path.equals(tableAPath, tableBPath) || false;
}
