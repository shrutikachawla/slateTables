import React from "react";

const TableRowElement = ({ attributes, children, slateElement }) => {
  return <tr {...attributes}>{children}</tr>;
};

export default TableRowElement;
