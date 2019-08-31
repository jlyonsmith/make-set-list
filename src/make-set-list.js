#!/usr/bin/env node
import { MakeSetListTool } from "./MakeSetListTool"
import chalk from "chalk"
import path from "path"

const log = {
  info: console.info,
  error: function() {
    console.error(chalk.red("error:", [...arguments].join(" ")))
  },
  warning: function() {
    console.error(chalk.yellow("warning:", [...arguments].join(" ")))
  },
}

const tool = new MakeSetListTool({
  toolName: path.basename(process.argv[1], ".js"),
  log,
})

tool
  .run(process.argv.slice(2))
  .then((exitCode) => {
    if (exitCode !== 0) {
      process.exit(exitCode)
    }
  })
  .catch((e) => {
    if (tool.debug) {
      console.error(e)
    } else {
      log.error(e)
    }
  })
