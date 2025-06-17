import React from "react";

const CurrentMove = (props) => {
  if (!props.message) return null;
  console.log(props.message);
  return (
    <div className="mt-2 text-sm text-gray-700 font-semibold bg-yellow-100 rounded px-2 py-1 shadow-sm border border-yellow-300">
      {props.message}
    </div>
  );
};

export default CurrentMove;
