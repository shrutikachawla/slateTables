import { Editor, Transforms } from "slate";

export function addColSpan(editor, cellNode, n = 1) {
  setAttr(editor, cellNode.id, "colspan", (cellNode.colspan || 1) + n);
  if (cellNode.colwidth) {
    // Reset column widths
    // result.colwidth = result.colwidth.slice();
    // for (let i = 0; i < n; i++) result.colwidth.splice(pos, 0, 0);
  }
  return (cellNode.colspan || 1) + n;
}

export function setAttr(editor, cellId, key, value) {
  Transforms.setNodes(
    editor,
    { [key]: value },
    { match: (n) => n.id === cellId, at: [] }
  );
  return true;
}

export function removeColSpan(editor, cellNode, n = 1) {
  setAttr(editor, cellNode.id, "colspan", (cellNode.colspan || 1) - n);
  if (cellNode.colwidth) {
    // result.colwidth = result.colwidth.slice();
    // result.colwidth.splice(pos, n);
    // if (!result.colwidth.some((w) => w > 0)) result.colwidth = null;
  }
  // return result;
}
