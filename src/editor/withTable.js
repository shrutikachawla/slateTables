// import { Transforms, Node, Range, Point, Text, Editor, Path } from "slate";
// import { v4 as uuidv4 } from "uuid";
// //
// import uniqid from "uniqid";
// import { TableMap } from "../tables/table-map";

// export const withTables = (editor) => {
//   const { deleteBackward, deleteForward, normalizeNode } = editor;
//   window.Transforms = Transforms;

//   editor.normalizeNode = (nodeEntry) => {
//     const isRow = (n) => n.type === "table-row";
//     const isCell = (n) => n.type === "table-cell";
//     const countCells = (row) => row.children.filter(isCell).length;

//     const [node, path] = nodeEntry;
//     if (node.type === "table") {
//       // Check if the number of columns are same as number of cells in rows.
//       const rows = node.children.filter(isRow);
//       const maxColumns = Math.max(
//         // Minimum 1 column
//         1,
//         Math.max(...rows.map(countCells))
//       );
//       const tableMap = TableMap.get(node);

//       // In children that are table-rows, check if the number of cells are same as maxColumns
//       for (const [childRowNode, childRowPath] of Node.children(editor, path)) {
//         if (childRowNode.type === "table-row") {
//           //   if (
//           //     childRowNode.children.map(isCell).reduce((a, b) => a + b, 0) <
//           //     maxColumns
//           //   ) {
//           //     // insert nodes in table-row
//           //     const numberOfCellsToAdd =
//           //       maxColumns -
//           //       childRowNode.children.map(isCell).reduce((a, b) => a + b, 0);
//           //     const fragment = Array.from({ length: numberOfCellsToAdd }).map(
//           //       () => ({
//           //         type: "table-cell",
//           //         id: uuidv4(),
//           //         children: [{ text: "" }],
//           //       })
//           //     );
//           //     const atPath = childRowPath.concat(
//           //       childRowNode.children.length - 1
//           //     );

//           //     Editor.withoutNormalizing(editor, () => {
//           //       Transforms.insertNodes(editor, fragment, {
//           //         at: atPath,
//           //       });
//           //     });

//           //     return;
//           //   }

//           let rowWidth = 0;
//           for (const [childNode] of Node.children(editor, path)) {
//             rowWidth += childNode.colspan || 1;
//           }
//           if (rowWidth < tableMap.width) {
//             console.log("Row values", { rowWidth, tableWidth: tableMap.width });
//             for (let i = 0; i < rowWidth - tableMap.width; i++) {
//               const tablecellNode = {
//                 type: "table-cell",
//                 id: uniqid(),
//                 children: [{ text: "New Cell" }],
//               };
//               Transforms.insertNodes(editor, tablecellNode, {
//                 at: childRowPath.concat(childRowPath.children.length),
//               });
//             }
//           }
//         }
//       }

//       // Make sure all are table-rows
//     //   for (const [childNode, childPath] of Node.children(editor, path)) {
//     //     if (childNode.type !== "table-row") {
//     //       // Wrap it around 'table-row'
//     //       const wrapperNode = { type: "table-row", id: uuidv4(), children: [] };
//     //       Transforms.wrapNodes(editor, wrapperNode, { at: childPath });
//     //       return;
//     //     }
//     //   }

//       // Insert columnWidth prop if not present in table node
//       //   if (!node.columnWidths) {
//       //     const [tableRow] = Editor.nodes(editor, { at: path, match: isRow });
//       //     if (tableRow) {
//       //       const noOfCols = tableRow[0].children.length;
//       //       const columnWidths = Array.from({ length: noOfCols }).map(
//       //         () => 100 / noOfCols
//       //       );
//       //       Transforms.setNodes(editor, { columnWidths }, { at: path });
//       //       return;
//       //     }
//       //   } else {
//       //     // Reset the columnWidths array if
//       //     // 1. If no. of column widths are not equal to no. of columns or
//       //     // 2. if sum of column widths is not equal to 100,
//       //     const sumOfColumnWidths = node.columnWidths.reduce(
//       //       (partialSum, a) => partialSum + a,
//       //       0
//       //     );
//       //     const [tableRow] = Editor.nodes(editor, { at: path, match: isRow });
//       //     if (
//       //       Math.round(sumOfColumnWidths) != 100 ||
//       //       tableRow[0].children.length !== node.columnWidths.length
//       //     ) {
//       //       const noOfCols = tableRow[0].children.length;
//       //       const columnWidths = Array.from({ length: noOfCols }).map(
//       //         () => 100 / noOfCols
//       //       );
//       //       Transforms.setNodes(editor, { columnWidths }, { at: path });
//       //       return;
//       //     }
//       //   }
//       // }

//     //   if (node.type === "table-row") {
//     //     // Children: Make sure all are table-cells
//     //     for (const [childNode, childPath] of Node.children(editor, path)) {
//     //       if (childNode.type !== "table-cell") {
//     //         // Wrap it around 'table-cell'
//     //         const wrapperNode = {
//     //           type: "table-cell",
//     //           id: uuidv4(),
//     //           children: [],
//     //         };
//     //         Transforms.wrapNodes(editor, wrapperNode, { at: childPath });
//     //         return;
//     //       }
//     //     }

//     //     // Parent: Make sure it's parent is table
//     //     const parentNode = Node.parent(editor, path);
//     //     if (parentNode.type !== "table") {
//     //       const wrapperNode = { type: "table", id: uuidv4(), children: [] };
//     //       Transforms.wrapNodes(editor, wrapperNode, { at: path });
//     //       return;
//     //     }
//     //   }

//     //   if (node.type === "table-cell") {
//     //     // Parent: Make sure it's parent is table-row
//     //     const parentNode = Node.parent(editor, path);
//     //     if (parentNode.type !== "table-row") {
//     //       const wrapperNode = { type: "table-row", id: uuidv4(), children: [] };
//     //       Transforms.wrapNodes(editor, wrapperNode, { at: path });
//     //       return;
//     //     }
//     //   }

//       // a table node should always be succeeded by a line
//       //   if (node.type === "table") {
//       //     const next = Editor.next(editor, {
//       //       at: path,
//       //       match: (n) =>
//       //         Text.isText(n) || n.type === "line" || n.type === "paragraph",
//       //     });
//       //     if (next) {
//       //       const parentOfNext = Editor.parent(editor, next[1], { depth: 3 });
//       //       const parentOfTable = Editor.parent(editor, path, { depth: 3 });
//       //       if (parentOfNext?.[0].type !== parentOfTable?.[0].type) {
//       //         const insertionPath = Path.next(path);
//       //         Transforms.insertNodes(editor, NODE_PARAGRAPH(), {
//       //           at: insertionPath,
//       //           mode: "lowest",
//       //         });
//       //         return;
//       //       }
//       //     }
//       //   }

//       // every cell must have atleast one 'line' element
//         // if (node.type === "table-cell") {
//         //   const lineNodes = Array.from(
//         //     Editor.nodes(editor, {
//         //       at: path,
//         //       match: (n) => n.type === "line" || n.type === "paragraph",
//         //     })
//         //   );
//         //   if (lineNodes.length == 0) {
//         //     const lineNode = { type: "line", id: uuidv4(), children: [] };
//         //     Transforms.insertNodes(editor, lineNode, { at: path.concat(0) });
//         //     return;
//         //   }
//         // }
//     }
//     normalizeNode(nodeEntry);
//   };

//   editor.deleteBackward = (unit) => {
//     const { selection } = editor;

//     //if selection is at the start of a table cell, prevent backspace
//     if (selection && Range.isCollapsed(selection)) {
//       const { selectedCells } = editor;
//       if (selectedCells?.length == 1) {
//         const [selectedCell] = selectedCells;
//         if (selectedCell) {
//           const [, cellPath] = selectedCell;
//           const start = Editor.start(editor, cellPath);
//           if (Point.equals(selection.anchor, start)) {
//             return;
//           }
//         }
//       }
//     }

//     deleteBackward(unit);
//   };

//   editor.deleteForward = (unit) => {
//     const { selection } = editor;

//     if (selection && Range.isCollapsed(selection)) {
//       const [cell] = Editor.nodes(editor, {
//         match: (n) => n.type === "table-cell",
//       });

//       if (cell) {
//         const [, cellPath] = cell;
//         const end = Editor.end(editor, cellPath);

//         if (Point.equals(selection.anchor, end)) {
//           return;
//         }

//         const [line] = Editor.nodes(editor, {
//           match: (n) => n.type === "line" || n.type === "paragraph",
//           mode: "lowest",
//         });

//         if (line) {
//           const [, linePath] = line;
//           const edges = Editor.edges(editor, linePath);

//           if (Point.equals(selection.anchor, edges[1])) {
//             return;
//           }
//         }
//       }
//     }
//     deleteForward(unit);
//   };

//   return editor;
// };
