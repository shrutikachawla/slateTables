import { Editor, Path, Transforms } from "slate";
import uniqid from "uniqid";
import { TableMap } from "./table-map";
import { TableSelection } from "./table-selection";
import { addColSpan, setAttr } from "./utils/addColSpan";

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
    case "insert-row-above":
      status = addRowBefore(editor, cellId);
      new TableSelection(editor, null);
      break;
    case "insert-row-below":
      status = addRowAfter(editor, cellId);
      new TableSelection(editor, null);
      break;
    case "delete-column":
      status = deleteColumn(editor, cellId);
      new TableSelection(editor, null);
      break;
    case "delete-row":
      status = deleteRow(editor, cellId);
      new TableSelection(editor, null);
      break;
    case "merge-cells":
      status = mergeCells(editor, cellId);
      break;
    case "split-cells":
      status = splitCell(editor, cellId);
      break;
    case "default":
      new TableSelection(editor, null);
      break;
  }
};

function addColumnBefore(editor, cellId) {
  if (!cellId || !isInTable(editor, cellId)) return false;
  let rect = selectedRect(editor, cellId);
  addColumn(editor, rect, rect.left);
  return true;
}

function addColumnAfter(editor, cellId) {
  if (!cellId || !isInTable(editor, cellId)) return false;
  let rect = selectedRect(editor, cellId);
  addColumn(editor, rect, rect.right);
  return true;
}

function addRowBefore(editor, cellId) {
  if (!cellId || !isInTable(editor, cellId)) return false;
  let rect = selectedRect(editor, cellId);
  addRow(editor, rect, rect.top);
  return true;
}

function deleteColumn(editor, cellId) {
  if (!isInTable(editor, cellId)) return false;
  let rect = selectedRect(editor, cellId);
  if (rect.left == 0 && rect.right == rect.map.width) return false;
  Editor.withoutNormalizing(editor, () => {
    for (let i = rect.right - 1; ; i--) {
      removeColumn(editor, rect, i);
      if (i == rect.left) break;
      rect.table = Editor.node(editor, rect.table[1]);
      rect.map = TableMap.get(rect.table[0]);
    }
  });
  return true;
}

// Remove the selected rows from a table.
function deleteRow(editor, cellId) {
  if (!isInTable(editor, cellId)) return false;
  let rect = selectedRect(editor, cellId);
  if (rect.top == 0 && rect.bottom == rect.map.height) return false;
  Editor.withoutNormalizing(editor, () => {
    for (let i = rect.bottom - 1; ; i--) {
      removeRow(editor, rect, i);
      if (i == rect.top) break;
      rect.table = Editor.node(editor, rect.table[1]);
      rect.map = TableMap.get(rect.table[0]);
    }
  });
  return true;
}

function addRowAfter(editor, cellId) {
  if (!cellId || !isInTable(editor, cellId)) return false;
  let rect = selectedRect(editor, cellId);
  addRow(editor, rect, rect.bottom);
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
function addColumn(editor, { map, table }, col) {
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
      const tableCellNode = {
        type: "table-cell",
        id: uniqid(),
        children: [{ text: "Imma new cell" }],
      };
      const pos = map.positionAt(row, col, table[0]);

      // If the cell to-be-inserted is at the end of table-row
      if (pos === -1) {
        const rowEntry = Editor.node(editor, table[1].concat(row));
        const cellPath = rowEntry[1].concat(rowEntry[0].children.length);
        Transforms.insertNodes(editor, tableCellNode, { at: cellPath });
        continue;
      }
      const [[cellNode, cellPath]] = Editor.nodes(editor, {
        match: (n) => n.id === pos,
        at: [],
      });
      Transforms.insertNodes(editor, tableCellNode, { at: cellPath });
      let span = 1;

      while (span < (cellNode.rowspan || 1)) {
        row++;
        span++;
        const beforePos = map.positionOfPreviousAt(row, col, table[0]);

        const [[, prevPath]] = Editor.nodes(editor, {
          at: [],
          match: (n) => n.id === beforePos,
        });

        const tempPath = cellPath.slice();
        let [column] = tempPath.splice(-1, 1);
        tempPath.splice(tempPath.length - 1, 1, row);
        let insertionPath =
          column === 0
            ? tempPath.concat(0)
            : tempPath.concat(prevPath[prevPath.length - 1] + 1);

        Transforms.insertNodes(editor, tableCellNode, { at: insertionPath });
      }
    }
  }
  const [newTable] = Editor.nodes(editor, {
    match: (n) => n.id === table[0].id,
    at: [],
  });
  TableMap.recalculateTableMap(newTable[0]);
}

function addRow(editor, { map, table }, row) {
  let cells = [];
  for (let col = 0, index = map.width * row; col < map.width; col++, index++) {
    // Covered by a rowspan cell
    if (
      row > 0 &&
      row < map.height &&
      map.map[index] == map.map[index - map.width]
    ) {
      let pos = map.map[index];

      const [rowCell] = Editor.nodes(editor, {
        match: (n) => n.id === pos,
        at: [],
      });
      Transforms.setNodes(
        editor,
        { rowspan: rowCell[0].rowspan + 1 },
        { at: rowCell[1] }
      );
      col += (rowCell[0].colspan || 1) - 1;
      index++;
    } else {
      const tableCellNode = {
        type: "table-cell",
        id: uniqid(),
        children: [{ text: "" }],
      };
      cells.push(tableCellNode);
    }
  }
  const rowNode = {
    type: "table-row",
    id: uniqid(),
    children: cells,
  };
  Transforms.insertNodes(editor, rowNode, { at: table[1].concat(row) });
  const [modifiedTableNode] = Editor.node(editor, table[1]);
  TableMap.recalculateTableMap(modifiedTableNode);
}

// Command function that removes the selected columns from a table.
function removeColumn(editor, { map, table }, col) {
  for (let row = 0; row < map.height; ) {
    let index = row * map.width + col,
      pos = map.map[index],
      [[cellNode, cellPath]] = Editor.nodes(editor, {
        at: [],
        match: (n) => n.id === pos,
      });
    // If this is part of a col-spanning cell
    if (
      (col > 0 && map.map[index - 1] == pos) ||
      (col < map.width - 1 && map.map[index + 1] == pos)
    ) {
      const [cellWithColSpan] = Editor.nodes(editor, {
        match: (n) => n.id === map.map[index],
        at: [],
      });
      Transforms.setNodes(
        editor,
        { colspan: cellWithColSpan[0].colspan - 1 },
        { at: cellWithColSpan[1] }
      );
    } else {
      Transforms.removeNodes(editor, { at: cellPath });
    }
    row += cellNode.rowspan || 1;
  }
}

function removeRow(editor, { map, table }, row) {
  let rowPos = 0;
  for (let i = 0; i < row; i++) {
    const [rowNode] = Editor.node(editor, table[1].concat(i));
    rowPos += rowNode.children.length;
  }

  let cellNode, cellPath;
  for (let col = 0, index = row * map.width; col < map.width; col++, index++) {
    let pos = map.map[index];
    const [cell] = Editor.nodes(editor, {
      match: (n) => n.id === pos,
      at: [],
    });

    if (cell) [cellNode, cellPath] = cell;
    if (row > 0 && pos == map.map[index - map.width]) {
      // If this cell starts in the row above, simply reduce its rowspan
      Transforms.setNodes(
        editor,
        { rowspan: (cellNode.rowspan || 1) - 1 },
        { at: cellPath }
      );
      col += (cellNode.colspan || 1) - 1;
    } else if (row < map.width && pos == map.map[index + map.width]) {
      // Else, if it continues in the row below, it has to be moved down
      const newCell = {
        type: "table-cell",
        children: cellNode?.children || [],
        rowspan: (cellNode?.rowspan || 1) - 1,
        colspan: cellNode?.colspan || 1,
        id: uniqid(),
      };
      let newPos = map.positionAt(row + 1, col, table[0]);
      const [intendedNode] = Editor.nodes(editor, {
        match: (n) => n.id === newPos,
        at: [],
      });
      let insertionPath = intendedNode[1];

      const insertionIndex =
        insertionPath[insertionPath.length - 1] == 0
          ? 0
          : insertionPath[insertionPath.length - 1];
      insertionPath.splice(-1, 1, insertionIndex);
      Transforms.insertNodes(editor, newCell, { at: insertionPath });
      col += (cellNode.colspan || 1) - 1;
    }
  }
  Transforms.removeNodes(editor, { at: table[1].concat(row) });
}

// Merge the selected cells into a single cell. Only available when
// the selected cells' outline forms a rectangle.
export function mergeCells(editor, cellId) {
  let sel = editor.tableSelection;
  if (!sel || Path.equals(sel.anchorCell[1], sel.focusCell[1])) return false;
  let rect = selectedRect(editor, cellId),
    { map } = rect;
  if (cellsOverlapRectangle(map, rect)) return false;

  let seen = {},
    content = [],
    mergedPos,
    mergedCell;
  for (let row = rect.top; row < rect.bottom; row++) {
    for (let col = rect.left; col < rect.right; col++) {
      let cellPos = map.map[row * map.width + col];
      const [cell] = Editor.nodes(editor, {
        match: (n) => n.id === cellPos,
        at: [],
      });
      if (seen[cellPos]) continue;
      seen[cellPos] = true;
      if (mergedPos == null) {
        mergedPos = cellPos;
        mergedCell = cell;
      } else {
        if (!isEmpty(cell[0])) content = content.concat(cell[0].children);
        Transforms.removeNodes(editor, { at: cell[1] });
      }
    }
  }

  // Different from prose; test all cases
  Transforms.setNodes(
    editor,
    {
      rowspan: rect.bottom - rect.top,
      colspan: rect.right - rect.left,
    },
    { at: mergedCell[1] }
  );

  let insertionPath = mergedCell[1].slice();
  insertionPath = insertionPath.concat(mergedCell[0].children.length);

  if (content.length > 0) {
    Transforms.insertNodes(editor, content, {
      at: insertionPath,
    });
  }
  new TableSelection(editor, { anchorCell: mergedCell });
}

function isEmpty(cell) {
  if (cell.children.length > 0) return false;
  return true;
}

function cellsOverlapRectangle({ width, height, map }, rect) {
  let indexTop = rect.top * width + rect.left,
    indexLeft = indexTop;
  let indexBottom = (rect.bottom - 1) * width + rect.left,
    indexRight = indexTop + (rect.right - rect.left - 1);
  for (let i = rect.top; i < rect.bottom; i++) {
    if (
      (rect.left > 0 && map[indexLeft] == map[indexLeft - 1]) ||
      (rect.right < width && map[indexRight] == map[indexRight + 1])
    )
      return true;
    indexLeft += width;
    indexRight += width;
  }
  for (let i = rect.left; i < rect.right; i++) {
    if (
      (rect.top > 0 && map[indexTop] == map[indexTop - width]) ||
      (rect.bottom < height && map[indexBottom] == map[indexBottom + width])
    )
      return true;
    indexTop++;
    indexBottom++;
  }
  return false;
}

// Split a selected cell, whose rowpan or colspan is greater than one,
// into smaller cells with the cell type (th, td) returned by getType function.
export function splitCell(editor, cellId) {
  let sel = editor.selection;
  let cellNode, cellPos;
  if (!sel) {
    [[cellNode, cellPos]] = Editor.nodes(editor, {
      match: (n) => n.id === cellId,
      at: [],
    });
  } else {
    if (!Path.equals(sel.anchorCell[1], sel.focusCell[1])) return false;
    cellNode = sel.anchorCell[0];
    cellPos = sel.focusCell[1];
  }
  if (cellNode?.colspan == 1 && cellNode?.rowspan == 1) {
    return false;
  }
  let rect = selectedRect(editor, cellId);
  for (let row = rect.top; row < rect.bottom; row++) {
    for (let col = rect.left, i = 0; col < rect.right; col++, i++) {
      if (col == rect.left && row == rect.top) continue;
      const newCell = {
        ...cellNode,
        rowspan: 1,
        colspan: 1,
        children: [{ text: "New Cell" }],
        id: uniqid(),
      };

      const insertionPath = rect.table[1].concat(row).concat(col);
      Transforms.insertNodes(editor, newCell, { at: insertionPath });
    }
  }

  if (cellNode.rowspan > 1) setAttr(editor, cellNode.id, "rowspan", 1);
  if (cellNode.colspan > 1) setAttr(editor, cellNode.id, "colspan", 1);

  return true;
}
