import { jsxs, jsx } from 'react/jsx-runtime';

const Loading = (props) => {
  const { message, positionStatic } = props;
  return /* @__PURE__ */ jsxs("div", { className: positionStatic ? "loader-static" : "", children: [
    /* @__PURE__ */ jsxs("div", { className: "bubbleContainer", children: [
      /* @__PURE__ */ jsx("div", { className: "bubble" }),
      /* @__PURE__ */ jsx("div", { className: "bubble" }),
      /* @__PURE__ */ jsx("div", { className: "bubble" }),
      /* @__PURE__ */ jsx("div", { className: "bubble" })
    ] }),
    message && /* @__PURE__ */ jsx("h3", { className: "loadingMessage", children: message })
  ] });
};

export { Loading as L };
//# sourceMappingURL=Loading-Df2nHO8-.mjs.map
