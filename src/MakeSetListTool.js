import parseArgs from "minimist"
import autobind from "autobind-decorator"
import * as version from "./version"
import fs from "fs-extra"
import readdirp from "readdirp"
import { exec } from "promisify-child-process"

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

    const songList = await fs.readFile(songListPath, { encoding: "utf8" })
    const songMap = new Map()

    for (const title of songList.split("\n")) {
      songMap.set(title + ".pdf", [])
    }

    const entries = await readdirp.promise(pdfRootPath, {
      fileFilter: Array.from(songMap.keys()),
    })
    const outputPath = "song-list.pdf"

    for (const entry of entries) {
      const files = songMap.get(entry.basename)

      if (files) {
        files.push(entry.fullPath)
      }
    }

    for (const [name, files] of songMap.entries()) {
      const title = name.slice(0, -4)

      if (files.length === 0) {
        this.log.warning(`Song '${title}' was not found`)
      } else if (files.length > 1) {
        this.log.warning(
          `Song '${title}' has ${files.length} copies: ${files
            .map((file) => '"' + file + '"')
            .join(", ")}`
        )
      }
    }
    const command = `pdf-o-rama concat -o ${outputPath} ${Array.from(
      songMap.values()
    )
      .filter((files) => `"${files[0]}"`)
      .join(" ")}`

    if (this.debug) {
      this.log.info(command)
    }

    this.log.info(`Combining ${outputPath} PDF's...`)

    try {
      await exec(command)
    } catch (e) {
      throw new Error(`Unable to create PDF. ${result.stderr.trim()}`)
    }

    this.log.info("Done")

    return 0
  }
}
