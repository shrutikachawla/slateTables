/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useSlate } from "slate-react";
import { Transforms } from "slate";
import styles from "./styles.less";
import { TableMap } from "../../tables/table-map";

export default function TableElement({ attributes, element, children }) {
  const editor = useSlate();
  const [currentColumn, setCurrentColumn] = useState(0);
  const [draggingColumn, setDraggingColumn] = useState(false);
  const [columnWindows, setColumnWindows] = useState([0]);
  const [columnHoverPercentage, setColumnHoverPercentage] = useState(0);
  const [hintXOffset, setHintXOffset] = useState(0);
  const [containerRef, setContainerRef] = useState(null);
  const tableMap = TableMap.get(element);
  const tableId = element.id;
  const maxColumns = tableMap.width || 1;
  const columnWidths =
    element.columnWidths ||
    Array.from({ length: maxColumns }).map(() => 100 / maxColumns);
  /* eslint-disable */
  const cumulativeSum = (
    (sum) => (value) =>
      (sum += value)
  )(0);
  /* eslint-enable */
  const cumulativeColumnWidths = [0].concat(columnWidths.map(cumulativeSum));

  const getColumnWindows = () => {
    const result = [0];
    for (let index = 1; index < cumulativeColumnWidths.length; index++) {
      const col =
        cumulativeColumnWidths[index] - cumulativeColumnWidths[index - 1];
      result.push(cumulativeColumnWidths[index - 1] + col / 2);
    }
    result.push(100);
    return result;
  };

  useEffect(() => {
    setColumnWindows(getColumnWindows);
    console.log("Changing column widths", columnWidths);
  }, [JSON.stringify(columnWidths)]);

  function eventListener(e) {
    const bounds = containerRef.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const xPercent = (x / bounds.width) * 100;
    const newCumulativeColumnWidths = JSON.parse(
      JSON.stringify(cumulativeColumnWidths)
    );
    const newLeft = xPercent;
    newCumulativeColumnWidths[currentColumn] = newLeft;
    const newColumnWidths = [];
    for (let index = 1; index < newCumulativeColumnWidths.length; index++) {
      const curr = newCumulativeColumnWidths[index];
      const prev = newCumulativeColumnWidths[index - 1];
      newColumnWidths.push(curr - prev);
    }
    if (
      cumulativeColumnWidths[currentColumn - 1] * bounds.width * 0.01 + 6 < x &&
      x < cumulativeColumnWidths[currentColumn + 1] * 0.01 * bounds.width - 6
    ) {
      Transforms.setNodes(
        editor,
        { columnWidths: newColumnWidths },
        { at: [], match: (n) => n.id === tableId }
      );
    }
    setDraggingColumn(false);
  }

  useEffect(() => {
    if (draggingColumn) {
      window.addEventListener("mouseup", eventListener, true);
    }
    return () => {
      window.removeEventListener("mouseup", eventListener, true);
    };
  }, [draggingColumn]);

  const getColumnHoverIndex = (currentPercent, _columnWindows) => {
    for (let index = 0; index < _columnWindows.length - 1; index++) {
      const element = _columnWindows[index];
      const nextElement = _columnWindows[index + 1];
      if (currentPercent > element && currentPercent < nextElement) {
        return index;
      }
    }
    return _columnWindows.length - 1;
  };

  const getColumnHoverPercentage = (index) => cumulativeColumnWidths[index];

  return (
    <div style={{ position: "relative" }} ref={(el) => setContainerRef(el)}>
      <table
        style={{ width: "100%" }}
        onMouseMove={(e) => {
          if (containerRef) {
            const bounds = containerRef.getBoundingClientRect();
            const x = e.clientX - bounds.left;
            const xPercent = (x / bounds.width) * 100;
            const _currentColumn = getColumnHoverIndex(xPercent, columnWindows);
            if (
              cumulativeColumnWidths[currentColumn - 1] * bounds.width * 0.01 +
                6 <
                x &&
              x <
                cumulativeColumnWidths[currentColumn + 1] *
                  0.01 *
                  bounds.width -
                  6
            ) {
              setHintXOffset(xPercent);
            }
            if (!draggingColumn) {
              setCurrentColumn(_currentColumn);
              setColumnHoverPercentage(
                getColumnHoverPercentage(_currentColumn)
              );
            }
          }
        }}
      >
        <colgroup contentEditable={false} suppressContentEditableWarning>
          {columnWidths.map((width, idx) => (
            <col key={`${tableId}-col-${idx}`} style={{ width: `${width}%` }} />
          ))}
        </colgroup>
        <tbody {...attributes}>{children}</tbody>
      </table>
      <div
        contentEditable={false}
        suppressContentEditableWarning
        style={{
          left: `calc(${columnHoverPercentage}% - 2px)`,
          visibility: [0, cumulativeColumnWidths.length - 1].includes(
            currentColumn
          )
            ? "hidden"
            : "visible",
        }}
        className={styles.columnDragger}
        onMouseDown={(e) => {
          e.preventDefault();
          setDraggingColumn(true);
        }}
      />
      {draggingColumn && (
        <div
          contentEditable={false}
          suppressContentEditableWarning
          style={{
            left: `calc(${hintXOffset}% - 2px)`,
          }}
          className={styles.columnDraggerHint}
        />
      )}
    </div>
  );
}
