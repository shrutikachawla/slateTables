import { Editor, Range } from "slate";

const isPointIncludedInSelection = (editor, point) => {
  const { selection } = editor;
  return Range.includes(selection, point);
};

export function atEndOfCell(editor, cellId, axis, dir) {
  const [anchorCell] = Editor.nodes(editor, { match: (n) => n.id === cellId });
  if (anchorCell) {
    const [, anchorCellPath] = anchorCell;
    const selectedCellEdges = Editor.edges(editor, anchorCellPath);

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
  return null;
}
