export function findWidth(table) {
  let width = -1,
    hasRowSpan = false;
  for (let row = 0; row < table.children.length; row++) {
    let rowNode = table.children[row],
      rowWidth = 0;
    if (hasRowSpan)
      for (let j = 0; j < row; j++) {
        let prevRow = table.children[j];
        for (let i = 0; i < prevRow.children.length; i++) {
          let cell = prevRow.children[i];
          if (j + (cell.rowspan || 1) > row) {
            rowWidth += cell.colspan || 1;
          }
        }
      }
    for (let i = 0; i < rowNode.children.length; i++) {
      let cell = rowNode.children[i];
      const colspan = cell.colspan || 1;
      rowWidth += colspan;
      if ((cell.rowspan || 1) > 1) {
        hasRowSpan = true;
      }
    }
    if (width === -1) {
      width = rowWidth;
    } else if (width !== rowWidth) {
      width = Math.max(width, rowWidth);
    }
  }
  return width;
}
