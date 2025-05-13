import React from "react";
import DOMPurify from "dompurify";
import clsx from "clsx";

const EditorText = ({ htmlContent, classNames }) => {
  const sanitizedHTML = DOMPurify.sanitize(htmlContent);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      className={clsx(classNames, "text-justify")}
    />
  );
};

export default EditorText;
