import { useState, useCallback, useEffect } from "react";
import { ListItem, Paragraph, Text } from "mdast";
import { Node, visit } from "unist-util-visit";
import Markdown from "markdown-to-jsx";
import { unified, VFileWithOutput } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import Tabs from "./components/organisms/Tabs";
import dayjs from "./lib/dayjs";
import "./App.css";
import "./index.css";

type Task = {
  depth: number;
  text: string;
  checked: boolean;
  checkedAt: string | null;
};

var tasks: Task[] = JSON.parse(String(localStorage.getItem("taskList"))) || [];

const getTasks = (root: Node) => {
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
      text: "",
      depth: paragraph.position?.start?.column || 0,
      checked,
      checkedAt: null,
    };

    if (checked) {
      item.text = text.value.replace("[x]", "").trim();
    } else {
      item.text = text.value.replace("[ ]", "").trim();
    }

    const checkedAt = tasks.find(
      (v) => v.text.trim() === item.text.trim()
    )?.checkedAt;
    if (checkedAt) {
      item.checkedAt = checkedAt;
    }

    items.push(item);
  });

  return items;
};

function remarkTasks() {
  return (node: Node, file: VFileWithOutput<any>) => {
    file.data.taskList = getTasks(node);
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkStringify)
  .use(remarkTasks);

function App() {
  const [select, setSelect] = useState(0);
  const [markdown, setMarkdown] = useState(
    localStorage.getItem("markdown") || ""
  );

  const [history, setHistory] = useState(
    JSON.parse(String(localStorage.getItem("history"))) || []
  );

  const addHistoryValue = useCallback((tasks: Task[]) => {
    const h = tasks.filter((v) => {
      if (!v.checkedAt) {
        return false;
      }

      return dayjs().diff(dayjs(v.checkedAt), "hour") > 12;
    });

    if (h.length === 0) {
      return;
    }

    const items = [...(history ?? []), ...h];

    setHistory(items);
    localStorage.setItem("history", JSON.stringify(items));

    const historyTextList = h.map((v) => v.text);

    tasks = tasks.filter((v) => {
      return !historyTextList.includes(v.text);
    });
    localStorage.setItem("taskList", JSON.stringify(tasks));

    const m = markdown
      .split("\n")
      .filter((v) => {
        const ng = historyTextList.find((t) => v.includes(t));

        return !ng;
      })
      .join("\n");

    setMarkdown(m);
    localStorage.setItem("markdown", m);
  }, []);

  const setValue = useCallback((value: string) => {
    setMarkdown(value);
    localStorage.setItem("markdown", value);

    const file = processor.processSync(value);
    const ts = file.data.taskList as Task[];
    localStorage.setItem("taskList", JSON.stringify(ts));

    tasks = ts;
    addHistoryValue(tasks);
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
                                  tasks = tasks.map((v) => {
                                    if (v.text === taskText.trim()) {
                                      // この時点ではチェックが入っていないので、チェックが入っているときはチェックが入った日時を記録する
                                      if (!checked) {
                                        v.checkedAt = dayjs().toString();
                                      } else {
                                        v.checkedAt = null;
                                      }
                                    }

                                    return v;
                                  });

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
