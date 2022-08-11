import React from "react";
import { Editor } from "slate";

const TableElement = ({ attributes, children, slateElement }) => {
  window.Editor = Editor;
  return (
    <table
      style={{
        borderSpacing: 0,
        borderCollapse: "separate",
        width: "100%",
      }}
      draggable={false}
    >
      <tbody {...attributes}>{children}</tbody>
    </table>
  );
};

export default TableElement;
