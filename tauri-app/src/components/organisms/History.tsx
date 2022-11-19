import React from "react";
import { Task } from "../../App";
import dayjs from "../../lib/dayjs";

type Props = {
  items: Task[];
};

const History: React.FC<Props> = (props) => {
  return (
    <div className="border text-left mx-4 my-3 h-96">
      {props.items.map((item, index) => (
        <div key={index} className="m-3 pt-1">
          <div className="text-xs p">
            {dayjs(item.checkedAt).format("YYYY年MM月DD日 HH:mm")}
          </div>
          <div className="text-base font-bold py-2">{item.text}</div>
          <div className="border-b pt-1" />
        </div>
      ))}
    </div>
  );
};

export default History;
