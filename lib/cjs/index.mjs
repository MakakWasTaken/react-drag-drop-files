import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import styled, { css } from 'styled-components';
import { useState, useCallback, useEffect, useRef } from 'react';

const primary = "#0658c2", darkGray = "#666", lightGray = "#999";
const defaultStyle = css`
  display: flex;
  align-items: center;
  min-width: 322px;
  max-width: 508px;
  height: 48px;
  border: dashed 2px ${primary};
  padding: 8px 16px 8px 8px;
  border-radius: 5px;
  cursor: pointer;
  flex-grow: 0;
`;
const UploaderWrapper = styled.label`
  position: relative;
  ${(props) => props.overRide ? "" : defaultStyle};
  &.is-disabled {
    border: dashed 2px ${darkGray};
    cursor: no-drop;
    svg {
      fill: ${darkGray};
      color: ${darkGray};
      path {
        fill: ${darkGray};
        color: ${darkGray};
      }
    }
  }
  & > input {
    display: none;
  }
`;
const HoverMsg = styled.div`
  border: dashed 2px ${darkGray};
  border-radius: 5px;
  background-color: ${lightGray};
  opacity: 0.5;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  & > span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
`;
const DescriptionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
  & > span {
    font-size: 12px;
    color: ${(props) => props.error ? "red" : darkGray};
  }
  .file-types {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 100px;
  }
`;
const Description = styled.span`
  font-size: 14px;
  color: ${darkGray};
  span {
    text-decoration: underline;
  }
`;

const getFileSizeMB = (size) => {
  return size / 1e3 / 1e3;
};
const checkType = (file, types) => {
  const extension = file.name.split(".").pop();
  const loweredTypes = types.map((type) => type.toLowerCase());
  return loweredTypes.includes(extension.toLowerCase());
};
const acceptedExt = (types) => {
  if (types === void 0)
    return "";
  return types.map((type) => `.${type.toLowerCase()}`).join(",");
};

const DrawTypes = ({ types, minSize, maxSize }) => {
  if (types) {
    const stringTypes = types.toString();
    let size = "";
    if (maxSize)
      size += `size >= ${maxSize}, `;
    if (minSize)
      size += `size <= ${minSize}, `;
    return /* @__PURE__ */ jsx("span", { title: `${size}types: ${stringTypes}`, className: "file-types", children: stringTypes });
  }
  return null;
};

function ImageAdd() {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width: "32",
      height: "32",
      viewBox: "0 0 32 32",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M5.33317 6.66667H22.6665V16H25.3332V6.66667C25.3332 5.196 24.1372 4 22.6665 4H5.33317C3.8625 4 2.6665 5.196 2.6665 6.66667V22.6667C2.6665 24.1373 3.8625 25.3333 5.33317 25.3333H15.9998V22.6667H5.33317V6.66667Z",
            fill: "#0658C2"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M10.6665 14.6667L6.6665 20H21.3332L15.9998 12L11.9998 17.3333L10.6665 14.6667Z",
            fill: "#0658C2"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M25.3332 18.6667H22.6665V22.6667H18.6665V25.3333H22.6665V29.3333H25.3332V25.3333H29.3332V22.6667H25.3332V18.6667Z",
            fill: "#0658C2"
          }
        )
      ]
    }
  );
}

let draggingCount = 0;
function useDragging({
  labelRef,
  inputRef,
  multiple,
  handleChanges,
  onDrop
}) {
  const [dragging, setDragging] = useState(false);
  const handleClick = useCallback(() => {
    inputRef.current.click();
  }, [inputRef]);
  const handleDragIn = useCallback((ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    draggingCount++;
    if (ev.dataTransfer.items && ev.dataTransfer.items.length !== 0) {
      setDragging(true);
    }
  }, []);
  const handleDragOut = useCallback((ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    draggingCount--;
    if (draggingCount > 0)
      return;
    setDragging(false);
  }, []);
  const handleDrag = useCallback((ev) => {
    ev.preventDefault();
    ev.stopPropagation();
  }, []);
  const handleDrop = useCallback(
    (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      setDragging(false);
      draggingCount = 0;
      const eventFiles = ev.dataTransfer.files;
      if (eventFiles && eventFiles.length > 0) {
        const files = multiple ? eventFiles : eventFiles[0];
        const success = handleChanges(files);
        if (onDrop && success)
          onDrop(files);
      }
    },
    [handleChanges]
  );
  useEffect(() => {
    const ele = labelRef.current;
    ele.addEventListener("click", handleClick);
    ele.addEventListener("dragenter", handleDragIn);
    ele.addEventListener("dragleave", handleDragOut);
    ele.addEventListener("dragover", handleDrag);
    ele.addEventListener("drop", handleDrop);
    return () => {
      ele.removeEventListener("click", handleClick);
      ele.removeEventListener("dragenter", handleDragIn);
      ele.removeEventListener("dragleave", handleDragOut);
      ele.removeEventListener("dragover", handleDrag);
      ele.removeEventListener("drop", handleDrop);
    };
  }, [
    handleClick,
    handleDragIn,
    handleDragOut,
    handleDrag,
    handleDrop,
    labelRef
  ]);
  return dragging;
}

const drawDescription = (currFile, uploaded, typeError, disabled, label) => {
  return typeError ? /* @__PURE__ */ jsx("span", { children: "File type/size error, Hovered on types!" }) : /* @__PURE__ */ jsx(Description, { children: disabled ? /* @__PURE__ */ jsx("span", { children: "Upload disabled" }) : !currFile && !uploaded ? /* @__PURE__ */ jsx(Fragment, { children: label ? /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { children: label.split(" ")[0] }),
    " ",
    label.substr(label.indexOf(" ") + 1)
  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { children: "Upload" }),
    " or drop a file right here"
  ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { children: "Uploaded Successfully!" }),
    " Upload another?"
  ] }) });
};
const FileUploader = (props) => {
  const {
    name,
    hoverTitle,
    types,
    handleChange,
    classes,
    children,
    maxSize,
    minSize,
    fileOrFiles,
    onSizeError,
    onTypeError,
    onSelect,
    onDrop,
    disabled,
    disableClicking,
    label,
    multiple,
    onDraggingStateChange,
    dropMessageStyle
  } = props;
  const labelRef = useRef(null);
  const inputRef = useRef(null);
  const [uploaded, setUploaded] = useState(false);
  const [currFiles, setFile] = useState(null);
  const [error, setError] = useState(false);
  const validateFile = (file) => {
    if (types && !checkType(file, types)) {
      setError(true);
      if (onTypeError)
        onTypeError("File type is not supported");
      return false;
    }
    if (maxSize && getFileSizeMB(file.size) > maxSize) {
      setError(true);
      if (onSizeError)
        onSizeError("File size is too big");
      return false;
    }
    if (minSize && getFileSizeMB(file.size) < minSize) {
      setError(true);
      if (onSizeError)
        onSizeError("File size is too small");
      return false;
    }
    return true;
  };
  const handleChanges = (files) => {
    let checkError = false;
    if (files) {
      if (files instanceof File) {
        checkError = !validateFile(files);
      } else {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          checkError = !validateFile(file) || checkError;
        }
      }
      if (checkError)
        return false;
      if (handleChange)
        handleChange(files);
      setFile(files);
      setUploaded(true);
      setError(false);
      return true;
    }
    return false;
  };
  const blockEvent = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
  };
  const handleClick = (ev) => {
    ev.stopPropagation();
    if (inputRef && inputRef.current && !disableClicking) {
      inputRef.current.click();
    }
  };
  const handleInputChange = (ev) => {
    const allFiles = ev.target.files;
    const files = multiple ? allFiles : allFiles[0];
    const success = handleChanges(files);
    if (onSelect && success)
      onSelect(files);
  };
  const dragging = useDragging({
    labelRef,
    inputRef,
    multiple,
    handleChanges,
    onDrop
  });
  useEffect(() => {
    onDraggingStateChange?.(dragging);
  }, [dragging]);
  useEffect(() => {
    if (fileOrFiles) {
      setUploaded(true);
      setFile(fileOrFiles);
    } else {
      if (inputRef.current)
        inputRef.current.value = "";
      setUploaded(false);
      setFile(null);
    }
  }, [fileOrFiles]);
  return /* @__PURE__ */ jsxs(
    UploaderWrapper,
    {
      overRide: children,
      className: `${classes || ""} ${disabled ? "is-disabled" : ""}`,
      ref: labelRef,
      htmlFor: name,
      onClick: blockEvent,
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            onClick: handleClick,
            onChange: handleInputChange,
            accept: acceptedExt(types),
            ref: inputRef,
            type: "file",
            name,
            disabled,
            multiple
          }
        ),
        dragging && /* @__PURE__ */ jsx(HoverMsg, { style: dropMessageStyle, children: /* @__PURE__ */ jsx("span", { children: hoverTitle || "Drop Here" }) }),
        !children && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(ImageAdd, {}),
          /* @__PURE__ */ jsxs(DescriptionWrapper, { error, children: [
            drawDescription(currFiles, uploaded, error, disabled, label),
            /* @__PURE__ */ jsx(DrawTypes, { types, minSize, maxSize })
          ] })
        ] }),
        children
      ]
    }
  );
};

export { FileUploader };
//# sourceMappingURL=index.mjs.map
