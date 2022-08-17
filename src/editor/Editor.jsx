import React from "react";
import { createEditor, Node } from "slate";
import { Editable, withReact, Slate } from "slate-react";
import { DefaultElement } from "./elements";
import TableElement from "./elements/table";
import TableCellElement from "./elements/table-cell";
import TableRowElement from "./elements/table-row";
import { Toolbar } from "./Toolbar";
import { onKeyDown } from "./onKeyDown";
import { withTables } from "./withTable";
import { withHistory } from "slate-history";

function renderElement(props) {
  const { attributes, children, element } = props;
  switch (element.type) {
    case "table":
      return (
        <TableElement element={element} attributes={attributes}>
          {children}
        </TableElement>
      );
    case "table-row":
      return (
        <TableRowElement slateElement={element} attributes={attributes}>
          {children}
        </TableRowElement>
      );
    case "table-cell":
      return (
        <TableCellElement slateElement={element} attributes={attributes}>
          {children}
        </TableCellElement>
      );
    default:
      return <DefaultElement {...attributes}>{children}</DefaultElement>;
  }
}

function renderLeaf(props) {
  const { attributes, children } = props;
  return <span {...attributes}>{children}</span>;
}

// export interface EditorProps {
//   value: Node[];
//   onChange: (value: Node[]) => void;
//   placeholder?: string;
//   autoFocus?: boolean;
//   spellCheck?: boolean;
// }

export function Editor(props) {
  const { value, onChange, ...other } = props;
  const editor = React.useMemo(
    () => withTables(withHistory(withReact(createEditor()))),
    []
  );
  window.editor = editor;
  return (
    <Slate editor={editor} value={value} onChange={onChange}>
      <Toolbar open={true} />
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          onKeyDown(editor, event);
        }}
        {...other}
      />
    </Slate>
  );
}

export { Node };
