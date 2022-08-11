import { Editor } from "slate";
import { ReactEditor } from "slate-react";
import { TableSelection } from "./table-selection";
import { inSameTable } from "./utils/inSameTable";

export function handleMouseDown(editor, startEvent) {
  if (startEvent.ctrlKey || startEvent.metaKey) return;

  let startDOMCell = domInCell(editor, startEvent.target);
  const root = ReactEditor.toDOMNode(editor, editor);

  if (!startDOMCell) {
    // Not in a cell, let the default behavior happen.
    return;
  }

  // Create and dispatch a cell selection between the given anchor and
  // the position under the mouse.
  function setCellSelection($anchor, event) {
    let $head = cellUnderMouse(editor, event)?.[1];
    let starting = editor.metaKey == null;
    if (!$head || !inSameTable(editor, $anchor, $head)) {
      if (starting) $head = $anchor;
      else {
        new TableSelection(editor, null);
        return;
      }
    }

    new TableSelection(editor, {
      anchorCellPath: $anchor,
      focusCellPath: $head,
    });
    // let selection = new CellSelection($anchor, $head);
    if (starting) {
      // TODO: Update editor selection
      const anchorCellPath = Editor.node(editor, $anchor)?.[1] || null;
      if (starting) {
        editor.metaKey = anchorCellPath;
      }
    }
  }

  // Stop listening to mouse motion events.
  function stop() {
    root.removeEventListener("mouseup", stop);
    root.removeEventListener("dragstart", stop);
    root.removeEventListener("mousemove", move);

    if (editor.metaKey != null) editor.metaKey = null;
  }

  function move(event) {
    let anchor = editor.metaKey,
      $anchor;
    if (anchor != null) {
      // Continuing an existing cross-cell selection
      $anchor = anchor;
    } else if (domInCell(editor, event.target) != startDOMCell) {
      // Moving out of the initial cell -- start a new cell selection
      $anchor = cellUnderMouse(editor, startEvent)?.[1];
      if (!$anchor) return stop();
    }

    if ($anchor) {
      setCellSelection($anchor, event);
    }
  }

  root.addEventListener("mouseup", stop);
  root.addEventListener("dragstart", stop);
  root.addEventListener("mousemove", move);
}

export function domInCell(editor, dom) {
  const view = ReactEditor.toDOMNode(editor, editor);
  for (; dom && dom != view.dom; dom = dom.parentNode) {
    if (dom.nodeName == "TD" || dom.nodeName == "TH") return dom;
  }
}

export function cellAround(editor, pos) {
  return (
    Editor.above(editor, {
      at: pos,
      match: (n) => n.type === "table-cell",
    }) || null
  );
}

export function cellUnderMouse(editor, event) {
  let mousePos = ReactEditor.findEventRange(editor, event);
  if (!mousePos) return null;
  return mousePos ? cellAround(editor, mousePos) : null;
}
