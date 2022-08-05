import { NodeEntry, Point } from "slate";
export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface TableSelection {
  anchor: Point;
  focus: Point;
  height: number;
  width: number;
  map: any;
  // FIXME: Change map's type
  anchorCell: NodeEntry;
  focusCell: NodeEntry;
}
