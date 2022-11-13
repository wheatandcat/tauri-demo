import { useState } from "react";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import Tabs from "./components/organisms/Tabs";
import "./App.css";
import "./index.css";

const text = `* [ ] todo
  * [ ] todo detail
* [x] done
`;

function App() {
  const [select, setSelect] = useState(0);
  const [markdown, setMarkdown] = useState(text);

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
            onChange={(e) => setMarkdown(e.target.value)}
            className="bg-inherit w-full h-full px-4 py-4"
          >
            {markdown}
          </textarea>
        </div>
      )}
    </div>
  );
}

export default App;
