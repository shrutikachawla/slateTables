import logo from "./logo.svg";
import "./App.css";
import React from "react";
import {
  CssBaseline,
  MuiThemeProvider,
  Container,
  Card,
  CardContent,
  Typography,
} from "@material-ui/core";
import uniqid from "uniqid";
import { makeStyles } from "@material-ui/core/styles";
import theme from './theme';
import { Editor, Node } from './editor';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(4),
  },
  title: {
    margin: theme.spacing(0, 2, 2),
  },
  card: {
    marginBottom: theme.spacing(2),
  },
}));

const initialValue = [
  {
    type: "paragraph",
    id: uniqid(),
    children: [
      {
        text: "Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:\n\n",
      },
    ],
  },
  {
    type: "table",
    id: uniqid(),
    children: [
      {
        type: "table-row",
        id: uniqid(),
        children: [
          {
            type: "table-cell",
            id: uniqid(),
            colspan: 2,
            rowspan: 2,
            children: [{ text: "COLSPAN" }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Dog", bold: true }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Cat", bold: true }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Last Col 1", bold: true }],
          },
        ],
      },
      {
        type: "table-row",
        id: uniqid(),
        children: [
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "4" }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            rowspan: 2,
            children: [{ text: "4" }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Last Col 2", bold: true }],
          },
        ],
      },
      {
        type: "table-row",
        id: uniqid(),
        children: [
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "# of Lives", bold: true }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Shrutika" }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "1" }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Last Col 3", bold: true }],
          },
        ],
      },
      {
        type: "table-row",
        id: uniqid(),
        children: [
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Demo", bold: true }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Visibility" }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Shift+Arrow keys" }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Last Node" }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Last Col 4", bold: true }],
          },
        ],
      },
      {
        type: "table-row",
        id: uniqid(),
        children: [
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Demo 2", bold: true }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Visible" }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Keys test" }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Fine" }],
          },
          {
            type: "table-cell",
            id: uniqid(),
            children: [{ text: "Last Col 5", bold: true }],
          },
        ],
      },
    ],
  },
  {
    type: "paragraph",
    id: uniqid(),
    children: [
      {
        text: "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!",
      },
    ],
  },
];

function App() {
  const[value, setValue] = React.useState(initialValue);
  const s = useStyles();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Container className={s.root} maxWidth="sm">
        <Typography className={s.title} component="h1" variant="h5">
          Slate.js Tables
        </Typography>
        <Card className={s.card} elevation={0}>
          <CardContent>
            <Editor
              value={value}
              onChange={(x) => setValue(x)}
              placeholder="Write text here..."
              autoFocus={false}
              spellCheck
            />
          </CardContent>
        </Card>
      </Container>
    </MuiThemeProvider>
  );
}

export default App;
