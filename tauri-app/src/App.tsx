import { useState, useCallback, useEffect } from "react";
import { ListItem, Paragraph, Text } from "mdast";
import { Node, visit } from "unist-util-visit";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import Markdown from "markdown-to-jsx";
import { unified, VFileWithOutput } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import Tabs from "./components/organisms/Tabs";
import dayjs from "./lib/dayjs";
import "./App.css";
import "./index.css";

const text = `* category A
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
    if (!checked) {
      if (!text.value.includes("[ ]")) return;
    }

    const item: Task = {
      checked,
      text: "",
      depth: paragraph.position?.start?.column || 0,
    };

    if (checked) {
      item.text = text.value.replace("[x]", "").trim();
    } else {
      item.text = text.value.replace("[ ]", "").trim();
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
  const [tasks, setTasks] = useState<Task[]>([]);

  const setValue = useCallback((value: string) => {
    setMarkdown(value);
    const file = processor.processSync(value);
    const ts = file.data.taskList as Task[];

    console.log(ts);

    setTasks(ts ?? []);
  }, []);

  useEffect(() => {
    setValue(markdown);
  }, [markdown]);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setValue(value);

      setMarkdown(value);
    },
    []
  );

  return (
    <div className="container max-w-screen-lg">
      <h1 className="text-3xl font-bold text-left px-4">TODO LIST</h1>
      <br />
      <Tabs
        items={["リスト", "編集"]}
        selectedIndex={select}
        onSelect={setSelect}
      />

      {select === 0 ? (
        <div className="border text-left px-5 py-4 mx-4 my-3 h-96">
          <Markdown
            options={{
              overrides: {
                li: {
                  component: (props) => {
                    if (!props.children) return null;
                    const c0 = props.children[0];

                    if (typeof c0 === "string") {
                      return <li>{props.children}</li>;
                    }

                    const checked = c0.props.checked;
                    const taskText = props.children[1];

                    return (
                      <li {...props}>
                        <label>
                          <div className="flex items-center">
                            <div className="pr-2 pt-1">
                              <input
                                type="checkbox"
                                defaultChecked={checked}
                                aria-labelledby="task item"
                                readOnly={false}
                                onChange={() => {
                                  const m = markdown
                                    .split("\n")
                                    .map((v) => {
                                      if (v.includes(taskText)) {
                                        if (checked) {
                                          return v.replace("[x]", "[ ]");
                                        } else {
                                          return v.replace("[ ]", "[x]");
                                        }
                                      }
                                      return v;
                                    })
                                    .join("\n");

                                  setMarkdown(m);
                                }}
                              />
                            </div>
                            <div>
                              <span>{taskText}</span>
                            </div>
                          </div>
                        </label>
                      </li>
                    );
                  },
                },
              },
            }}
          >
            {markdown}
          </Markdown>
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
