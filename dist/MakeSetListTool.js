"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MakeSetListTool = void 0;

var _minimist = _interopRequireDefault(require("minimist"));

var _autobindDecorator = _interopRequireDefault(require("autobind-decorator"));

var version = _interopRequireWildcard(require("./version"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _readdirp = _interopRequireDefault(require("readdirp"));

var _promisifyChildProcess = require("promisify-child-process");

var _path = _interopRequireDefault(require("path"));

var _class;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pipeToPromise = (readable, writeable) => {
  const promise = new Promise((resolve, reject) => {
    readable.on("error", error => {
      reject(error);
    });
    writeable.on("error", error => {
      reject(error);
    });
    writeable.on("finish", file => {
      resolve(file);
    });
  });
  readable.pipe(writeable);
  return promise;
};

let MakeSetListTool = (0, _autobindDecorator.default)(_class = class MakeSetListTool {
  constructor(container) {
    this.toolName = container.toolName;
    this.log = container.log;
    this.debug = !!container.debug;
  }

  async run(argv) {
    const options = {
      boolean: ["debug", "help", "version"],
      string: ["output"],
      alias: {
        o: "output"
      }
    };
    const args = (0, _minimist.default)(argv, options);
    this.debug = !!args.debug;

    if (args.version) {
      this.log.info(version.fullVersion);
      return 0;
    }

    if (args.help) {
      this.log.info(`
Usage: ${this.toolName} [options] <song-list-file> <pdf-root-dir>

Description:

Creates a set list from a collection of PDF files storeh in sub-directories.

Options:
  --help                    Shows this help.
  --version                 Shows the tool version.
  --debug                   Output debug information.
  --output, -o <file>       Output file name.
`);
      return 0;
    }

    const songListPath = args._[0];

    if (!songListPath) {
      throw new Error("A song list file must be given");
    }

    let pdfRootPath = args._[1];

    if (!pdfRootPath) {
      throw new Error("A PDF root directory must be given");
    }

    const songList = await _fsExtra.default.readFile(songListPath, {
      encoding: "utf8"
    });
    const songMap = new Map();

    for (const title of songList.split("\n")) {
      songMap.set(title + ".pdf", []);
    }

    const entries = await _readdirp.default.promise(pdfRootPath, {
      fileFilter: Array.from(songMap.keys())
    });
    const outputPath = args.output || _path.default.basename(songListPath, _path.default.extname(songListPath)) + ".pdf";

    for (const entry of entries) {
      const files = songMap.get(entry.basename);

      if (files) {
        files.push(entry.fullPath);
      }
    }

    for (const [name, files] of songMap.entries()) {
      const title = name.slice(0, -4);

      if (files.length === 0) {
        this.log.warning(`Song '${title}' was not found`);
      } else if (files.length > 1) {
        this.log.warning(`Song '${title}' has ${files.length} copies: ${files.map(file => '"' + file + '"').join(", ")}`);
      }
    }

    const command = `pdf-o-rama concat -o ${outputPath} ${Array.from(songMap.values()).filter(files => files.length > 0).map(files => `"${files[0]}"`).join(" ")}`;

    if (this.debug) {
      this.log.info(command);
    }

    this.log.info(`Combining PDF's into ${outputPath}...`);

    try {
      await (0, _promisifyChildProcess.exec)(command);
    } catch (e) {
      throw new Error(`Unable to create PDF. ${result.stderr.trim()}`);
    }

    this.log.info("Done");
    return 0;
  }

}) || _class;

exports.MakeSetListTool = MakeSetListTool;
//# sourceMappingURL=MakeSetListTool.js.map