import React from "react";

const NoDataFound = (props) => {
  const { image, text, action } = props;
  return (
    <div className={"flex flex-col items-center justify-center gap-4"}>
      {image && <div>{image}</div>}
      <p
        className={
          "text-content-400 align-center text-base text-center font-semibold"
        }
      >
        {text}
      </p>
      {action && action}
    </div>
  );
};

export default NoDataFound;
