import React, { useLayoutEffect } from "react";
import { useSlate } from "slate-react";

const TableSelectionWrapper = ({ children }) => {
  const editor = useSlate();

  return children;
};

export default TableSelectionWrapper;
