import { isHotkey } from "is-hotkey";
import { Transforms } from "slate";
import { shiftArrowSelection } from "../tables/utils/shiftArrowSelection";

export function onKeyDown(editor, event) {
  if (isHotkey("Shift+ArrowLeft", event)) {
    if (editor.selectedCells.length > 0) {
      event.preventDefault();
      Transforms.move(editor, {
        reverse: true,
        edge: "focus"
      });
      shiftArrowSelection(event, editor, "horiz", -1);
    }
  }

  if (isHotkey("Shift+ArrowRight", event)) {
    if (editor.selectedCells.length > 0) {
      shiftArrowSelection(event, editor, "horiz", 1);
    }
  }
}
