import { isHotkey } from "is-hotkey";
import { Editor } from "slate";
import { arrowTraversal } from "../tables/utils/arrowTraversal";
import { shiftArrowSelection } from "../tables/utils/shiftArrowSelection";

export function onKeyDown(editor, event) {
  if (isHotkey("Shift+ArrowLeft", event)) {
    const onTable = Editor.above(editor, {
      match: (n) => n.type === "table",
      at: editor.selection,
    });
    if (onTable) {
      shiftArrowSelection(event, editor, "horiz", -1);
    }
  }

  if (isHotkey("Shift+ArrowRight", event)) {
    const onTable = Editor.above(editor, {
      match: (n) => n.type === "table",
      at: editor.selection,
    });
    if (onTable) {
      shiftArrowSelection(event, editor, "horiz", 1);
    }
  }

  if (isHotkey("Shift+ArrowUp", event)) {
    const onTable = Editor.above(editor, {
      match: (n) => n.type === "table",
      at: editor.selection,
    });
    if (onTable) {
      shiftArrowSelection(event, editor, "vert", -1);
    }
  }

  if (isHotkey("Shift+ArrowDown", event)) {
    const onTable = Editor.above(editor, {
      match: (n) => n.type === "table",
      at: editor.selection,
    });
    if (onTable) {
      shiftArrowSelection(event, editor, "vert", 1);
    }
  }

  if (event.key === "ArrowDown") {
    const inTable = Editor.above(editor, {
      match: (n) => n.type === "table",
      at: editor.selection,
    });
    if (inTable) {
      arrowTraversal(event, editor, "vert", 1);
    }
  }

  if (event.key === "ArrowUp") {
    const inTable = Editor.above(editor, {
      match: (n) => n.type === "table",
      at: editor.selection,
    });
    if (inTable) {
      arrowTraversal(event, editor, "vert", -1);
    }
  }
}
