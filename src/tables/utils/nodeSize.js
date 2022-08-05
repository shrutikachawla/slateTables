import { Text } from "slate";

export function nodeSize(node) {
  if (Text.isText(node)) {
    return node.text.length + 2;
  }
  let size = 0;
  node.children.forEach((child) => {
    if (Text.isText(child)) {
      size += child.text.length + 2;
    } else if (child.type === "image") {
      size += 1;
    } else {
      size += nodeSize(child);
    }
  });
  return size;
}
