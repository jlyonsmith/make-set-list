#!/usr/bin/env node
"use strict";

var _MakeSetListTool = require("./MakeSetListTool");

var _chalk = _interopRequireDefault(require("chalk"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = {
  info: console.info,
  error: function () {
    console.error(_chalk.default.red("error:", [...arguments].join(" ")));
  },
  warning: function () {
    console.error(_chalk.default.yellow("warning:", [...arguments].join(" ")));
  }
};
const tool = new _MakeSetListTool.MakeSetListTool({
  toolName: _path.default.basename(process.argv[1], ".js"),
  log
});
tool.run(process.argv.slice(2)).then(exitCode => {
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}).catch(e => {
  if (tool.debug) {
    console.error(e);
  } else {
    log.error(e);
  }
});
//# sourceMappingURL=make-set-list.js.map