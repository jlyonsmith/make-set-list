import parseArgs from "minimist"
import autobind from "autobind-decorator"
import * as version from "./version"
import tempy from "tempy"
import fs from "fs-extra"
import path from "path"

const pipeToPromise = (readable, writeable) => {
  const promise = new Promise((resolve, reject) => {
    readable.on("error", (error) => {
      reject(error)
    })
    writeable.on("error", (error) => {
      reject(error)
    })
    writeable.on("finish", (file) => {
      resolve(file)
    })
  })
  readable.pipe(writeable)
  return promise
}

@autobind
export class MakeSetListTool {
  constructor(container) {
    this.toolName = container.toolName
    this.log = container.log
    this.debug = !!container.debug
  }

  async run(argv) {
    const options = {
      boolean: ["debug", "help", "version"],
      string: [],
      alias: {},
    }

    const args = parseArgs(argv, options)

    this.debug = !!args.debug

    if (args.version) {
      this.log.info(version.fullVersion)
      return 0
    }

    if (args.help) {
      this.log.info(`
Usage: ${this.toolName} [options] <song-list-file> <pdf-root-dir>

Description:

Creates a set list from a collection of PDF files store in sub-directories.

Options:
  --help                        Shows this help.
  --version                     Shows the tool version.
`)
      return 0
    }

    const songListPath = args._[0]

    if (!songListPath) {
      throw new Error("A song list file must be given")
    }

    let pdfRootPath = args._[1]

    if (!pdfRootPath) {
      throw new Error("A PDF root directory must be given")
    }

    this.log.info("Done")

    return 0
  }
}
