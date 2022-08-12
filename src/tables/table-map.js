// import { Text } from "slate";
import { Rect } from "./rect";
import { computeMap } from "./utils";

let readFromCache, addToCache;
// Prefer using a weak map to cache table maps. Fall back on a
// fixed-size cache if that's not supported.
if (typeof WeakMap != "undefined") {
  // eslint-disable-next-line
  let cache = new WeakMap();
  readFromCache = (key) => cache.get(key);
  addToCache = (key, value) => {
    cache.set(key, value);
    return value;
  };
} else {
  let cache = [],
    cacheSize = 10,
    cachePos = 0;
  readFromCache = (key) => {
    for (let i = 0; i < cache.length; i += 2) {
      if (cache[i] == key) {
        return cache[i + 1];
      }
    }
  };
  addToCache = (key, value) => {
    if (cachePos == cacheSize) cachePos = 0;
    cache[cachePos++] = key;
    return (cache[cachePos++] = value);
  };
}

export class TableMap {
  constructor(width, height, map, problems) {
    this.width = width;
    this.height = height;
    this.map = map;
    this.problems = problems;
  }

  // :: (number) → Rect
  // Find the dimensions of the cell at the given position.
  findCell(pos) {
    for (let i = 0; i < this.map.length; i++) {
      let curPos = this.map[i];
      if (curPos != pos) continue;
      let left = i % this.width,
        top = (i / this.width) | 0;
      let right = left + 1,
        bottom = top + 1;
      for (let j = 1; right < this.width && this.map[i + j] == curPos; j++)
        right++;
      for (
        let j = 1;
        bottom < this.height && this.map[i + this.width * j] == curPos;
        j++
      )
        bottom++;
      return new Rect(left, top, right, bottom);
    }
    throw new RangeError("No cell with offset " + pos + " found");
  }

  // :: (number, number) → Rect
  // Get the rectangle spanning the two given cells.
  rectBetween(a, b) {
    let {
      left: leftA,
      right: rightA,
      top: topA,
      bottom: bottomA,
    } = this.findCell(a);
    let {
      left: leftB,
      right: rightB,
      top: topB,
      bottom: bottomB,
    } = this.findCell(b);
    return new Rect(
      Math.min(leftA, leftB),
      Math.min(topA, topB),
      Math.max(rightA, rightB),
      Math.max(bottomA, bottomB)
    );
  }

  // :: (Rect) → [number]
  // Return the position of all cells that have the top left corner in
  // the given rectangle.
  cellsInRect(rect) {
    let result = [],
      seen = {};
    for (let row = rect.top; row < rect.bottom; row++) {
      for (let col = rect.left; col < rect.right; col++) {
        let index = row * this.width + col,
          pos = this.map[index];
        if (seen[pos]) continue;
        seen[pos] = true;
        if (
          (col != rect.left || !col || this.map[index - 1] != pos) &&
          (row != rect.top || !row || this.map[index - this.width] != pos)
        )
          result.push(pos);
      }
    }
    return result;
  }

  // :: (number, string, number) → ?number
  // Find the next cell in the given direction, starting from the cell
  // at `pos`, if any.
  nextCell(pos, axis, dir) {
    let { left, right, top, bottom } = this.findCell(pos);
    if (axis == "horiz") {
      if (dir < 0 ? left == 0 : right == this.width) return null;
      return this.map[top * this.width + (dir < 0 ? left - 1 : right)];
    } else {
      if (dir < 0 ? top == 0 : bottom == this.height) return null;
      return this.map[left + this.width * (dir < 0 ? top - 1 : bottom)];
    }
  }

  // :: (number, number, Node) → number
  // Return the position at which the cell at the given row and column
  // starts, or would start, if a cell started there.
  positionAt(row, col, table) {
    for (let i = 0, rowStart = 0; ; i++) {
      let rowEnd = rowStart + table.children.length;
      if (i == row) {
        let index = col + row * this.width,
          rowEndIndex = (row + 1) * this.width;
        // Skip past cells from previous rows (via rowspan)
        while (index < rowEndIndex && this.map[index] < rowStart) index++;
        return index == rowEndIndex ? -1 : this.map[index];
      }
      rowStart = rowEnd;
    }
  }

  positionOfPreviousAt(row, col, table) {
    for (let i = 0, rowStart = 0; ; i++) {
      let rowEnd = rowStart + table.children.length;
      if (i == row) {
        let index = col + row * this.width,
          rowEndIndex = (row + 1) * this.width;
        // Skip past cells from previous rows (via rowspan)
        while (index < rowEndIndex && this.map[index] < rowStart) index++;
        return this.map[index - 1];
      }
      rowStart = rowEnd;
    }
  }

  // :: (number) → number
  // Find the left side of the cell at the given position.
  colCount(pos) {
    for (let i = 0; i < this.map.length; i++)
      if (this.map[i] == pos) return i % this.width;
    throw new RangeError("No cell with offset " + pos + " found");
  }

  static get(table) {
    return readFromCache(table) || addToCache(table, computeMap(table));
  }

  static recalculateTableMap(table) {
    return addToCache(table, computeMap(table));
  }
}
