"use strict";

var _MakeSetListTool = require("./MakeSetListTool");

let container = null;
beforeEach(() => {
  container = {
    toolName: "make-set-list",
    log: {
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn()
    }
  };
});

const getOutput = fn => {
  const calls = fn.mock.calls;
  return calls.length > 0 && calls[0].length > 0 ? calls[0][0] : "";
};

test("--help", async () => {
  const tool = new _MakeSetListTool.MakeSetListTool(container);
  const exitCode = await tool.run(["--help"]);
  expect(exitCode).toBe(0);
  expect(getOutput(container.log.info)).toEqual(expect.stringContaining("--help"));
});
test("--version", async () => {
  const tool = new _MakeSetListTool.MakeSetListTool(container);
  const exitCode = await tool.run(["--version"]);
  expect(exitCode).toBe(0);
  expect(getOutput(container.log.info)).toEqual(expect.stringMatching(/\d\.\d\.\d/));
});
test("no args", async () => {
  const tool = new _MakeSetListTool.MakeSetListTool(container);
  await expect(tool.run([])).rejects.toThrow(Error);
});
//# sourceMappingURL=MakeSetListTool.test.js.map