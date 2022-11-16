import { useState, useCallback } from "react";
import { ListItem, Paragraph, Text } from "mdast";
import { Node, visit } from "unist-util-visit";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { unified, VFileWithOutput } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import Tabs from "./components/organisms/Tabs";
import "./App.css";
import "./index.css";

const text = `* [ ] todo
  * [ ] todo detail
* [x] done
`;

type Task = {
  depth: number;
  text: string;
  checked: boolean;
};

const tasks = (root: Node) => {
  const items: Task[] = [];

  visit(root, "listItem", (node: ListItem) => {
    const paragraph = node.children.find((v) => v.type === "paragraph");
    if (!paragraph) return;

    const text = (paragraph as Paragraph).children.find(
      (v) => v.type === "text"
    ) as Text;
    if (!text || !text.value) return;

    const checked = text.value.includes("[x]");

    const item: Task = {
      checked,
      text: "",
      depth: paragraph.position?.start?.column || 0,
    };

    if (checked) {
      item.text = text.value.replace("[x]", "");
    } else {
      item.text = text.value.replace("[ ]", "");
    }

    items.push(item);
  });

  return items;
};

function remarkTasks() {
  return (node: Node, file: VFileWithOutput<any>) => {
    file.data.taskList = tasks(node);
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkStringify)
  .use(remarkTasks);

function App() {
  const [select, setSelect] = useState(0);
  const [markdown, setMarkdown] = useState(text);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      const vfile = await processor.process(value);

      console.log(vfile.data);

      setMarkdown(value);
    },
    []
  );

  return (
    <div className="container max-w-screen-lg">
      <h1 className="text-3xl font-bold text-left px-4">TODO LIST</h1>
      <br />
      <Tabs
        items={["プレビュー", "編集"]}
        selectedIndex={select}
        onSelect={setSelect}
      />

      {select === 0 ? (
        <div className="border text-left px-5 py-4 mx-4 my-3 h-96">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      ) : (
        <div className="border text-left mx-4 my-3 h-96">
          <textarea
            className="bg-inherit w-full h-full px-4 py-4"
            aria-label="markdown"
            onChange={(e) => handleChange(e)}
            defaultValue={markdown}
          />
        </div>
      )}
    </div>
  );
}

export default App;
