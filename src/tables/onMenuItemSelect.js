import { Editor, Path, Transforms } from "slate";
import uniqid from "uniqid";
import { TableMap } from "./table-map";
import { TableSelection } from "./table-selection";
import { addColSpan } from "./utils/addColSpan";

export const onMenuItemSelect = (editor, key, cellId) => {
  let status = false;
  switch (key) {
    case "insert-column-left":
      status = addColumnBefore(editor, cellId);
      new TableSelection(editor, null);
      break;
    case "insert-column-right":
      status = addColumnAfter(editor, cellId);
      new TableSelection(editor, null);
      break;
    case "default":
      if (status) {
        new TableSelection(editor, null);
      }
      break;
  }
};

function addColumnBefore(editor, cellId) {
  if (!cellId || !isInTable(editor, cellId)) return false;
  let rect = selectedRect(editor, cellId);
  addColumn(editor, { ...rect, dir: "left" }, rect.left);
  return true;
}

function addColumnAfter(editor, cellId) {
  if (!cellId || !isInTable(editor, cellId)) return false;
  let rect = selectedRect(editor, cellId);
  addColumn(editor, { ...rect, dir: "right" }, rect.right);
  return true;
}

function isInTable(editor, cellId) {
  const tableSelection = editor.tableSelection;
  if (tableSelection?.selectedCells.includes(cellId)) return true;
  try {
    const [cellInTable] = Editor.nodes(editor, {
      match: (n) => n.id === cellId,
      at: [],
    });
    if (!(cellInTable?.[0].type === "table-cell")) return false;
    new TableSelection(editor, { anchorCellPath: cellInTable[1] });
    const tableNode = Editor.above(editor, {
      match: (n) => n.type === "table",
      at: cellInTable[1],
    });
    if (tableNode) return true;
    return false;
  } catch (exception) {
    return false;
  }
}

// Helper to get the selected rectangle in a table, if any. Adds table
// map, table node, and table start offset to the object for
// convenience.
function selectedRect(editor, cellId) {
  let sel = editor.tableSelection,
    $pos = selectionCell(editor, cellId);
  let table = Editor.above(editor, {
      match: (n) => n.type === "table",
      at: $pos[1],
    }),
    map = TableMap.get(table[0]);
  let rect;
  if (!!sel) rect = map.rectBetween(sel.anchorCell[0].id, sel.focusCell[0].id);
  else rect = map.findCell($pos[0].id);
  rect.map = map;
  rect.table = table;
  return rect;
}

function selectionCell(editor, cellId = null) {
  let sel = editor.tableSelection;
  if (sel?.anchorCell) {
    return Path.isAfter(sel.anchorCell[1], sel.focusCell[1])
      ? sel.anchorCell
      : sel.focusCell;
  }
  const [selectedCell] = Editor.nodes(editor, {
    at: [],
    match: (n) => n.id === cellId,
  });
  return selectedCell;
}

// Add a column at the given position in a table.
function addColumn(editor, { map, table, dir }, col) {
  const tableCellNode = {
    type: "table-cell",
    id: uniqid(),
    children: [{ text: "Imma new cell" }],
  };

  for (let row = 0; row < map.height; row++) {
    let index = row * map.width + col;
    // If this position falls inside a col-spanning cell
    if (col > 0 && col < map.width && map.map[index - 1] == map.map[index]) {
      let pos = map.map[index],
        [[cellNode]] = Editor.nodes(editor, {
          match: (n) => n.id === pos,
          at: [],
        });
      addColSpan(editor, cellNode);
      // Skip ahead if rowspan > 1
      row += cellNode.rowspan - 1;
    } else {
      const pos = map.positionAt(row, col, table[0]);
      let cellNode, cellPath;

      // If the cell to-be-inserted is at the end of table-row
      if (pos === -1) {
        const rowEntry = Editor.node(editor, table[1].concat(row));
        cellPath = rowEntry[1].concat(rowEntry[0].children.length);
        Transforms.insertNodes(editor, tableCellNode, { at: cellPath });
        continue;
      }
      [[cellNode, cellPath]] = Editor.nodes(editor, {
        match: (n) => n.id === pos,
        at: [],
      });
      Transforms.insertNodes(editor, tableCellNode, { at: cellPath });
      let span = cellNode.rowspan || 1;
      while (span != 1) {
        row++;
        span--;
        const cellRect = map.findCell(cellNode.id);
        let [col] = cellPath.splice(-1, 1);
        cellPath.splice(cellPath.length - 1, 1, row);
        let insertionPath =
          col === 0 ? cellPath.concat(0) : cellPath.concat(cellRect.left);
        Transforms.insertNodes(editor, tableCellNode, { at: insertionPath });
      }
    }
  }
}
