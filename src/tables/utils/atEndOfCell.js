import { Editor, Range } from "slate";

const isPointIncludedInSelection = (editor, point) => {
  const { selection } = editor;
  return Range.includes(selection, point);
};

export function atEndOfCell(editor, axis, dir) {
  if (editor.selectedCells.length === 1) {
    const [selectedCellId] = editor?.selectedCells;
    const [, selectedCellPath] = Editor.above(editor, {
      match: (n) => n.id === selectedCellId
    });
    const selectedCellEdges = Editor.edges(editor, selectedCellPath);
    if (axis === "horiz") {
      //Check if cursor at starting of cell
      if (dir === -1) {
        const leftCellEdge = selectedCellEdges[0];
        const atEnd = isPointIncludedInSelection(editor, leftCellEdge);
        if (atEnd) return leftCellEdge;
      }

      //Check if curson at ending of cell
      if (dir === 1) {
        const rightCellEdge = selectedCellEdges[1];
        const atEnd = isPointIncludedInSelection(editor, rightCellEdge);
        if (atEnd) return rightCellEdge;
      }
    }
  }
  return null;
}
