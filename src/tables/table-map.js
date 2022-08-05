// import { Text } from "slate";
import { Rect } from "./rect";
import { computeMap } from "./utils";

export class TableMap {
  constructor(width, height, map, problems) {
    this.width = width;
    this.height = height;
    this.map = map;
    this.problems = problems;
  }

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

  static get(table) {
    return computeMap(table);
  }
}
