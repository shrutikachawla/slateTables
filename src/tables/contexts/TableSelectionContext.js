import React from "react";
import { Editor, Range } from "slate";
import { computeMap } from "../utils";

const TableSelectionContext = React.createContext();
const TableSelectionContextDispatch = React.createContext();

function tableSelectionReducer(_state, action) {
  switch (action.type) {
    case "set-state":
      return getTableSelection(action.payload);
    default:
      return {};
  }
}

function getTableSelection({ editor, selectionRange, map }) {
  let tableSelection = {};
  if (selectionRange) {
    const { anchorCellPath, focusCellPath } = selectionRange;
    if (!anchorCellPath || !focusCellPath) return;
    const tableNode = Editor.above(editor, {
      at: anchorCellPath,
      match: (n) => n.type === "table",
    })?.[0];

    const anchorCellId = Editor.node(editor, anchorCellPath)?.[0]?.id;
    const focusCellId = Editor.node(editor, focusCellPath)?.[0]?.id;
    if (anchorCellId && focusCellId) {
      const rect = map.rectBetween(anchorCellId, focusCellId);
      tableSelection = rect;
    }
  }
  editor.tableSelection = tableSelection;
  return tableSelection;
}

function TableSelectionProvider({ editor, children }) {
  const [state, dispatch] = React.useReducer(tableSelectionReducer, {});
  window.tableSelection = state;
  return (
    <TableSelectionContext.Provider value={state}>
      <TableSelectionContextDispatch.Provider value={dispatch}>
        {children}
      </TableSelectionContextDispatch.Provider>
    </TableSelectionContext.Provider>
  );
}

function useTableSelectionState() {
  const context = React.useContext(TableSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useTableSelectionState must be used within a TableSelectionProvider"
    );
  }
  return context;
}

function useTableSelectionDispatchState() {
  const context = React.useContext(TableSelectionContextDispatch);
  if (context === undefined) {
    throw new Error(
      "useTableSelectionDispatchState must be used within a TableSelectionDispatchProvider"
    );
  }
  return context;
}

function useTableSelection() {
  return [useTableSelectionState(), useTableSelectionDispatchState()];
}

export {
  TableSelectionProvider,
  useTableSelectionDispatchState,
  useTableSelectionState,
  useTableSelection,
};
