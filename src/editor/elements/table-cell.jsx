import React, { useState, useEffect } from "react";
import styles from "./table-cell.less";
import { blendColors } from "../../utils/blendColors";
import { ReactEditor, useSlate } from "slate-react";
import { handleMouseDown } from "../../tables/onMouseDown";
import { Menu, Dropdown } from "antd";
import croveEmitter from "../../utils/crove";
import { onMenuItemSelect } from "../../tables/onMenuItemSelect";

const TableCellElement = ({ slateElement, attributes, children }) => {
  const editor = useSlate();
  const { colspan = 1 } = slateElement;
  const { rowspan = 1 } = slateElement;
  const [selected, setSelected] = useState(false);
  const [selectionColor, setSelectionColor] = useState("#B8B8B88C");
  const [selectedCells, setSelectedCells] = useState([]);
  const [menuSourceCellId, setMenuSourceCellId] = useState(null);

  const { id } = slateElement;
  const backgroundColor = slateElement.backgroundColor || "transparent";

  function checkSelectedCells(tableSelectionObj = null) {
    const selectedCellsArr = tableSelectionObj?.selectedCells || [];
    setSelectedCells(selectedCellsArr);
    if (selectedCellsArr?.length > 1) {
      if (selectedCellsArr?.find((value) => value === id)) {
        setSelected(true);
      } else {
        setSelected(false);
      }
    } else {
      setSelected(false);
    }
  }

  useEffect(() => {
    croveEmitter.on("changeTableSelection", checkSelectedCells);
    return () =>
      croveEmitter.removeListener("changeTableSelection", checkSelectedCells);
  }, []);

  useEffect(() => {
    if (backgroundColor !== "transparent") {
      setSelectionColor(blendColors(backgroundColor, 0.3));
    } else {
      setSelectionColor("#B8B8B88C");
    }
  }, [backgroundColor]);

  const menu = (
    <Menu
      onClick={(e) => {
        const { domEvent, key } = e;
        domEvent.preventDefault();
        onMenuItemSelect(editor, key, menuSourceCellId);
        ReactEditor.focus(editor);
      }}
      contentEditable={false}
    >
      <Menu.Item key="copy">Copy</Menu.Item>
      <Menu.Item key="paste">Paste</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="merge-cells" disabled={!(selectedCells.length > 1)}>
        Merge Cells
      </Menu.Item>
      <Menu.Item key="split-cells" disabled={selectedCells.length > 1}>
        Split Cells
      </Menu.Item>
      <Menu.Item key="insert-column-left">Insert Column Left</Menu.Item>
      <Menu.Item key="insert-column-right">Insert Column Right</Menu.Item>
      <Menu.Item key="insert-row-above">Insert Row Above</Menu.Item>
      <Menu.Item key="insert-row-below">Insert Row Below</Menu.Item>
      <Menu.Item key="delete-row">Delete Row</Menu.Item>
      <Menu.Item key="delete-column">Delete Column</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="table-settings">Table Properties</Menu.Item>
      <Menu.Item key="delete-table">Delete Table</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["contextMenu"]}>
      <td
        style={{
          border: "1px solid black",
          color: "black",
          background: selected ? selectionColor : backgroundColor,
        }}
        {...attributes}
        colSpan={colspan}
        rowSpan={rowspan}
        onDragStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={
          selectedCells.length > 1 ? styles.tableCell : styles.singleCell
        }
        onMouseDown={(event) => {
          const nativeEvent = event.nativeEvent;
          // If left mouse click
          if (nativeEvent.which === 1) {
            handleMouseDown(editor, nativeEvent);
          }
        }}
        onContextMenu={(e) => {
          setMenuSourceCellId(id);
        }}
      >
        {children}
      </td>
    </Dropdown>
  );
};

export default TableCellElement;
