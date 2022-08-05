import { Editor, Location, NodeEntry, Path, Range, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { computeMap } from "../tables/utils";
import { inSameTable } from "../tables/utils/inSameTable";

export function handleMouseDown(editor, startEvent, tableSelectionDispatch) {
  if (startEvent.ctrlKey || startEvent.metaKey) return;

  let startDOMCell = domInCell(editor, startEvent.target),
    $anchor;
  const root = ReactEditor.toDOMNode(editor, editor);

  //   if (startEvent.shiftKey && view.state.selection instanceof CellSelection) {
  //     // TODO: Adding to an existing cell selection
  //     // setCellSelection(view.state.selection.$anchorCell, startEvent);
  //     startEvent.preventDefault();
  //   }
  //   else if (
  //     startEvent.shiftKey &&
  //     startDOMCell &&
  //     ($anchor = cellAround(editor, editor.selection.anchor)) != null &&
  //     cellUnderMouse(view, startEvent).pos != $anchor.pos
  //   ) {
  //     // Adding to a selection that starts in another cell (causing a
  //     // cell selection to be created).
  //     setCellSelection($anchor, startEvent);
  //     startEvent.preventDefault();
  //   }
  //   else
  if (!startDOMCell) {
    // Not in a cell, let the default behavior happen.
    return;
  }

  let mousePos = ReactEditor.findEventRange(editor, startEvent);
  const tableNode = Editor.above(editor, {
    match: (n) => n.type === "table",
    at: mousePos,
  })?.[0];
  const map = computeMap(tableNode);

  // Create and dispatch a cell selection between the given anchor and
  // the position under the mouse.
  function setCellSelection($anchor, event) {
    let $head = cellUnderMouse(editor, event)?.[1];
    let starting = editor.metaKey == null;
    if (!$head || !inSameTable(editor, $anchor, $head)) {
      if (starting) $head = $anchor;
      else {
        tableSelectionDispatch({
          type: "set-state",
          payload: {
            editor,
            selectionRange: null,
            map,
          },
        });
        return;
      }
    }

    tableSelectionDispatch({
      type: "set-state",
      payload: {
        editor,
        selectionRange: {
          anchorCellPath: $anchor,
          focusCellPath: $head,
        },
        map,
      },
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

    // TODO: find reason
    if (editor.metaKey == null) {
      tableSelectionDispatch({
        type: "set-state",
        payload: {
          editor,
          selectionRange: null,
          map,
        },
      });
    }
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

function domInCell(editor, dom) {
  const view = ReactEditor.toDOMNode(editor, editor);
  for (; dom && dom != view.dom; dom = dom.parentNode) {
    if (dom.nodeName == "TD" || dom.nodeName == "TH") return dom;
  }
}

function cellAround(editor, pos) {
  return (
    Editor.above(editor, {
      at: pos,
      match: (n) => n.type === "table-cell",
    }) || null
  );
}

function cellUnderMouse(editor, event) {
  let mousePos = ReactEditor.findEventRange(editor, event);
  if (!mousePos) return null;
  return mousePos ? cellAround(editor, mousePos) : null;
}
