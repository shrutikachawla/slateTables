import { findWidth, nodeSize } from ".";
import { TableMap } from "../table-map";

export function computeMap(table) {
  if (table.type !== "table") {
    throw new Error("Not a table node" + table.type);
  }
  // Create the map of ids
  // For all rows
  let width = findWidth(table),
    height = table.children.length;
  let map = [],
    mapPos = 0,
    problems = null,
    colWidths = [];
  for (let i = 0, e = width * height; i < e; i++) map[i] = 0;

  for (let row = 0, pos = 0; row < height; row++) {
    let rowNode = table.children?.[row];
    pos++;
    for (let i = 0; ; i++) {
      while (mapPos < map.length && map[mapPos] != 0) mapPos++;
      if (i == rowNode.children.length) break;
      let cellNode = rowNode.children[i],
        { colspan = 1, rowspan = 1, colwidth } = cellNode;
      for (let h = 0; h < rowspan; h++) {
        // If
        if (h + row >= height) {
          (problems || (problems = [])).push({
            type: "overlong_rowspan",
            pos,
            n: rowspan - h
          });
          break;
        }
        let start = mapPos + h * width;
        for (let w = 0; w < colspan; w++) {
          if (map[start + w] === 0) map[start + w] = cellNode.id;
          else
            (problems || (problems = [])).push({
              type: "collision",
              row,
              pos,
              n: colspan - w
            });
          let colW = colwidth && colwidth[w];
          if (colW) {
            let widthIndex = ((start + w) % width) * 2,
              prev = colWidths[widthIndex];
            if (
              prev == null ||
              (prev != colW && colWidths[widthIndex + 1] == 1)
            ) {
              colWidths[widthIndex] = colW;
              colWidths[widthIndex + 1] = 1;
            } else if (prev == colW) {
              colWidths[widthIndex + 1]++;
            }
          }
        }
      }
      mapPos += colspan;
      const cellSize = nodeSize(cellNode);
      pos += cellSize;
    }
    let expectedPos = (row + 1) * width,
      missing = 0;
    while (mapPos < expectedPos) if (map[mapPos++] == 0) missing++;
    if (missing)
      (problems || (problems = [])).push({ type: "missing", row, n: missing });
    pos++;
  }

  let tableMap = new TableMap(width, height, map, problems);
  // badWidths = false;

  // For columns that have defined widths, but whose widths disagree
  // between rows, fix up the cells whose width doesn't match the
  // computed one.
  // for (let i = 0; !badWidths && i < colWidths.length; i += 2)
  //   if (colWidths[i] != null && colWidths[i + 1] < height) badWidths = true;
  // if (badWidths) findBadColWidths(tableMap, colWidths, table);
  return tableMap;
}
