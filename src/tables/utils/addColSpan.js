import { Editor, Transforms } from "slate";

export function addColSpan(editor, cellNode, n = 1) {
  setAttr(editor, cellNode.id, "colspan", (cellNode.colspan || 1) + n);
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
}
