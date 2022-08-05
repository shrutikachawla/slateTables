import React from "react";

const SelectedCellsContext = React.createContext();
const SelectedCellsContextDispatch = React.createContext();

function selectedCellsReducer(state, action) {
  switch (action.type) {
    case "set-state":
      return getSelectedCells(action.payload);
    default:
      return [];
  }
}

function SelectedCellsProvider({ editor, children }) {
  const [state, dispatch] = React.useReducer(selectedCellsReducer, []);

  return (
    <SelectedCellsContext.Provider value={state}>
      <SelectedCellsContextDispatch.Provider value={dispatch}>
        {children}
      </SelectedCellsContextDispatch.Provider>
    </SelectedCellsContext.Provider>
  );
}

function useSelectedCellsState() {
  const context = React.useContext(SelectedCellsContext);
  if (context === undefined) {
    throw new Error(
      "useSelectedCellsState must be used within a SelectedCellsProvider"
    );
  }
  return context;
}

function useSelectedCellsDispatchState() {
  const context = React.useContext(SelectedCellsContextDispatch);
  if (context === undefined) {
    throw new Error(
      "useSelectedCellsDispatchState must be used within a SelectedCellsDispatchProvider"
    );
  }
  return context;
}

function useSelectedCells() {
  return [useSelectedCellsState(), useSelectedCellsDispatchState()];
}

function getSelectedCells({ tableSelection, editor, map }) {
  let selectedCells = [];
  if (!!tableSelection && Object.keys(tableSelection)?.length !== 0) {
    selectedCells = map.cellsInRect(tableSelection);
  }
  editor.selectedCells = selectedCells;
  return selectedCells;
}

export {
  SelectedCellsProvider,
  useSelectedCellsDispatchState,
  useSelectedCellsState,
  useSelectedCells
};
