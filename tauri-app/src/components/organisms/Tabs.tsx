import React, { useState } from "react";

type Props = {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

const selectedTabStyle =
  "inline-block p-4 text-blue-600 rounded-t-lg border-b-2 border-blue-600 active dark:text-blue-500 dark:border-blue-500";
const unselectedTabStyle =
  "inline-block p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 text-gray-400";

const Tabs: React.FC<Props> = (props) => {
  return (
    <div className="text-sm font-medium text-center text-gray-400 border-b border-gray-700 mx-4">
      <ul className="flex flex-wrap -mb-px">
        {props.items.map((item, index) => (
          <li key={item} className="mr-2">
            <div
              className={
                props.selectedIndex === index
                  ? selectedTabStyle
                  : unselectedTabStyle
              }
              onClick={() => props.onSelect(index)}
            >
              {item}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tabs;
