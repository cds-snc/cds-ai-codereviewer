require("./sourcemap-register.js");
/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = {
    /***/ 3109: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) {
      "use strict";

      var __createBinding =
        (this && this.__createBinding) ||
        (Object.create
          ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              var desc = Object.getOwnPropertyDescriptor(m, k);
              if (
                !desc ||
                ("get" in desc
                  ? !m.__esModule
                  : desc.writable || desc.configurable)
              ) {
                desc = {
                  enumerable: true,
                  get: function () {
                    return m[k];
                  },
                };
              }
              Object.defineProperty(o, k2, desc);
            }
          : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
            });
      var __setModuleDefault =
        (this && this.__setModuleDefault) ||
        (Object.create
          ? function (o, v) {
              Object.defineProperty(o, "default", {
                enumerable: true,
                value: v,
              });
            }
          : function (o, v) {
              o["default"] = v;
            });
      var __importStar =
        (this && this.__importStar) ||
        function (mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null)
            for (var k in mod)
              if (
                k !== "default" &&
                Object.prototype.hasOwnProperty.call(mod, k)
              )
                __createBinding(result, mod, k);
          __setModuleDefault(result, mod);
          return result;
        };
      var __awaiter =
        (this && this.__awaiter) ||
        function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P
              ? value
              : new P(function (resolve) {
                  resolve(value);
                });
          }
          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }
            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }
            function step(result) {
              result.done
                ? resolve(result.value)
                : adopt(result.value).then(fulfilled, rejected);
            }
            step(
              (generator = generator.apply(thisArg, _arguments || [])).next()
            );
          });
        };
      var __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        };
      Object.defineProperty(exports, "__esModule", { value: true });
      const fs_1 = __nccwpck_require__(7147);
      const core = __importStar(__nccwpck_require__(2186));
      const openai_1 = __importDefault(__nccwpck_require__(47));
      const rest_1 = __nccwpck_require__(5375);
      const parse_diff_1 = __importDefault(__nccwpck_require__(4833));
      const minimatch_1 = __importDefault(__nccwpck_require__(2002));
      const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
      const OPENAI_API_KEY = core.getInput("OPENAI_API_KEY");
      const OPENAI_API_MODEL = core.getInput("OPENAI_API_MODEL");
      const OPENAI_API_VERSION = core.getInput("OPENAI_API_VERSION");
      const OPENAI_BASE_URL = core.getInput("OPENAI_BASE_URL"); // Keep the default value as undefined instead of empty strings.
      // Supports HTTP requests debugging via an environment variable.
      const debugHttp = process.env.DEBUG_HTTP;
      if (debugHttp) {
        // Intercept all HTTP requests
        const nock = __nccwpck_require__(8437);
        nock.recorder.rec({
          output_objects: true,
          logging: (content) => {
            console.log("HTTP Request:", content);
          },
        });
        console.log("HTTP calls interception enabled");
      }
      const octokit = new rest_1.Octokit({ auth: GITHUB_TOKEN });
      const openai = new openai_1.default({
        apiKey: OPENAI_API_KEY,
        baseURL: OPENAI_BASE_URL,
        defaultQuery: { "api-version": OPENAI_API_VERSION },
        defaultHeaders: { "api-key": OPENAI_API_KEY },
      });
      function getPRDetails() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
          const { repository, number } = JSON.parse(
            (0, fs_1.readFileSync)(process.env.GITHUB_EVENT_PATH || "", "utf8")
          );
          const prResponse = yield octokit.pulls.get({
          });
          return {
            title:
              (_a = prResponse.data.title) !== null && _a !== void 0 ? _a : "",
            description:
              (_b = prResponse.data.body) !== null && _b !== void 0 ? _b : "",
          };
        });
      }
      function getDiff(owner, repo, pull_number) {
        return __awaiter(this, void 0, void 0, function* () {
          const response = yield octokit.pulls.get({
          });
          // @ts-expect-error - response.data is a string
          return response.data;
      }
      function analyzeCode(parsedDiff, prDetails) {
        return __awaiter(this, void 0, void 0, function* () {
          const comments = [];
          for (const file of parsedDiff) {
            if (file.to === "/dev/null") continue; // Ignore deleted files
              const prompt = createPrompt(file, chunk, prDetails);
              const aiResponse = yield getAIResponse(prompt);
              if (aiResponse) {
                const newComments = createComment(file, chunk, aiResponse);
                if (newComments) {
                  comments.push(...newComments);
              }
          }
          return comments;
        });
      }
      function createPrompt(file, chunk, prDetails) {
        return `Your task is to review pull requests. Instructions:
Review the following code diff in the file "${
          file.to
        }" and take the pull request title and description into account when writing the response.
  // @ts-expect-error - ln and ln2 exists where needed
  .map((c) => `${c.ln ? c.ln : c.ln2} ${c.content}`)
  .join("\n")}
      }
      function getAIResponse(prompt) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
          const queryConfig = {
          };
          try {
            const response = yield openai.chat.completions.create(
              Object.assign(
                Object.assign(
                  Object.assign({}, queryConfig),
                  OPENAI_API_MODEL === "gpt-4-1106-preview" ||
                    OPENAI_API_MODEL === "gpt-4o"
                    ? { response_format: { type: "json_object" } }
                    : {}
                ),
                {
                  messages: [
                      role: "system",
                      content: prompt,
                  ],
                }
              )
            );
            const res =
              ((_b =
                (_a = response.choices[0].message) === null || _a === void 0
                  ? void 0
                  : _a.content) === null || _b === void 0
                ? void 0
                : _b.trim()) || "{}";
          } catch (error) {
          }
        });
      }
      function createComment(file, chunk, aiResponses) {
        return aiResponses.flatMap((aiResponse) => {
          if (!file.to) {
          }
          return {
          };
        });
      }
      function createReviewComment(owner, repo, pull_number, comments) {
        return __awaiter(this, void 0, void 0, function* () {
          yield octokit.pulls.createReview({
          });
      }
      function main() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          const prDetails = yield getPRDetails();
          let diff;
          const eventData = JSON.parse(
            (0, fs_1.readFileSync)(
              (_a = process.env.GITHUB_EVENT_PATH) !== null && _a !== void 0
                ? _a
                : "",
              "utf8"
            )
          );
          if (eventData.action === "opened") {
            diff = yield getDiff(
              prDetails.owner,
              prDetails.repo,
              prDetails.pull_number
            );
          } else if (eventData.action === "synchronize") {
              headers: {
                accept: "application/vnd.github.v3.diff",
              },
              owner: prDetails.owner,
              repo: prDetails.repo,
              base: newBaseSha,
              head: newHeadSha,
          } else {
            console.log(
              `Unsupported event: action=${eventData.action}, process.env.GITHUB_EVENT_NAME=${process.env.GITHUB_EVENT_NAME}`
            );
          }
          if (!diff) {
          }
          const parsedDiff = (0, parse_diff_1.default)(diff);
          const excludePatterns = core
          const filteredDiff = parsedDiff.filter((file) => {
            return !excludePatterns.some((pattern) => {
              var _a;
              return (0, minimatch_1.default)(
                (_a = file.to) !== null && _a !== void 0 ? _a : "",
                pattern
              );
            });
          });
          const comments = yield analyzeCode(filteredDiff, prDetails);
          if (comments.length > 0) {
            // await createReviewComment(
            //   prDetails.owner,
            //   prDetails.repo,
            //   prDetails.pull_number,
            //   comments
            // );
            yield console.log("Comments:", comments);
          }
      }
      main().catch((error) => {
        console.error("Error:", error);
        process.exit(1);
      });

      /***/
    },

    /***/ 7351: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) {
      "use strict";

      var __createBinding =
        (this && this.__createBinding) ||
        (Object.create
          ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              Object.defineProperty(o, k2, {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              });
            }
          : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
            });
      var __setModuleDefault =
        (this && this.__setModuleDefault) ||
        (Object.create
          ? function (o, v) {
              Object.defineProperty(o, "default", {
                enumerable: true,
                value: v,
              });
            }
          : function (o, v) {
              o["default"] = v;
            });
      var __importStar =
        (this && this.__importStar) ||
        function (mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null)
            for (var k in mod)
              if (k !== "default" && Object.hasOwnProperty.call(mod, k))
                __createBinding(result, mod, k);
          __setModuleDefault(result, mod);
          return result;
        };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.issue = exports.issueCommand = void 0;
      const os = __importStar(__nccwpck_require__(2037));
      const utils_1 = __nccwpck_require__(5278);
      /**
       * Commands
       *
       * Command Format:
       *   ::name key=value,key=value::message
       *
       * Examples:
       *   ::warning::This is the message
       *   ::set-env name=MY_VAR::some value
       */
      function issueCommand(command, properties, message) {
        const cmd = new Command(command, properties, message);
        process.stdout.write(cmd.toString() + os.EOL);
      }
      exports.issueCommand = issueCommand;
      function issue(name, message = "") {
        issueCommand(name, {}, message);
      }
      exports.issue = issue;
      const CMD_STRING = "::";
      class Command {
        constructor(command, properties, message) {
          if (!command) {
            command = "missing.command";
          }
          this.command = command;
          this.properties = properties;
          this.message = message;
        }
        toString() {
          let cmdStr = CMD_STRING + this.command;
          if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += " ";
              if (this.properties.hasOwnProperty(key)) {
                const val = this.properties[key];
                if (val) {
                  if (first) {
                    first = false;
                  } else {
                    cmdStr += ",";
                  }
                  cmdStr += `${key}=${escapeProperty(val)}`;
              }
          }
          cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
          return cmdStr;
      }
      function escapeData(s) {
        return utils_1
          .toCommandValue(s)
          .replace(/%/g, "%25")
          .replace(/\r/g, "%0D")
          .replace(/\n/g, "%0A");
      }
      function escapeProperty(s) {
        return utils_1
          .toCommandValue(s)
          .replace(/%/g, "%25")
          .replace(/\r/g, "%0D")
          .replace(/\n/g, "%0A")
          .replace(/:/g, "%3A")
          .replace(/,/g, "%2C");
      }
      //# sourceMappingURL=command.js.map

      /***/
    },

    /***/ 2186: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) {
      "use strict";

      var __createBinding =
        (this && this.__createBinding) ||
        (Object.create
          ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              Object.defineProperty(o, k2, {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              });
            }
          : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
            });
      var __setModuleDefault =
        (this && this.__setModuleDefault) ||
        (Object.create
          ? function (o, v) {
              Object.defineProperty(o, "default", {
                enumerable: true,
                value: v,
              });
            }
          : function (o, v) {
              o["default"] = v;
            });
      var __importStar =
        (this && this.__importStar) ||
        function (mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null)
            for (var k in mod)
              if (k !== "default" && Object.hasOwnProperty.call(mod, k))
                __createBinding(result, mod, k);
          __setModuleDefault(result, mod);
          return result;
        };
      var __awaiter =
        (this && this.__awaiter) ||
        function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P
              ? value
              : new P(function (resolve) {
                  resolve(value);
                });
          }
          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }
            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }
            function step(result) {
              result.done
                ? resolve(result.value)
                : adopt(result.value).then(fulfilled, rejected);
            }
            step(
              (generator = generator.apply(thisArg, _arguments || [])).next()
            );
          });
        };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getIDToken =
        exports.getState =
        exports.saveState =
        exports.group =
        exports.endGroup =
        exports.startGroup =
        exports.info =
        exports.notice =
        exports.warning =
        exports.error =
        exports.debug =
        exports.isDebug =
        exports.setFailed =
        exports.setCommandEcho =
        exports.setOutput =
        exports.getBooleanInput =
        exports.getMultilineInput =
        exports.getInput =
        exports.addPath =
        exports.setSecret =
        exports.exportVariable =
        exports.ExitCode =
          void 0;
      const command_1 = __nccwpck_require__(7351);
      const file_command_1 = __nccwpck_require__(717);
      const utils_1 = __nccwpck_require__(5278);
      const os = __importStar(__nccwpck_require__(2037));
      const path = __importStar(__nccwpck_require__(1017));
      const oidc_utils_1 = __nccwpck_require__(8041);
      /**
       * The code to exit an action
       */
      var ExitCode;
      (function (ExitCode) {
        /**
         * A code indicating that the action was successful
         */
        ExitCode[(ExitCode["Success"] = 0)] = "Success";
        /**
         * A code indicating that the action was a failure
         */
        ExitCode[(ExitCode["Failure"] = 1)] = "Failure";
      })((ExitCode = exports.ExitCode || (exports.ExitCode = {})));
      //-----------------------------------------------------------------------
      // Variables
      //-----------------------------------------------------------------------
      /**
       * Sets env variable for this action and future actions in the job
       * @param name the name of the variable to set
       * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function exportVariable(name, val) {
        const convertedVal = utils_1.toCommandValue(val);
        process.env[name] = convertedVal;
        const filePath = process.env["GITHUB_ENV"] || "";
        if (filePath) {
          return file_command_1.issueFileCommand(
            "ENV",
            file_command_1.prepareKeyValueMessage(name, val)
          );
        }
        command_1.issueCommand("set-env", { name }, convertedVal);
      }
      exports.exportVariable = exportVariable;
      /**
       * Registers a secret which will get masked from logs
       * @param secret value of the secret
       */
      function setSecret(secret) {
        command_1.issueCommand("add-mask", {}, secret);
      }
      exports.setSecret = setSecret;
      /**
       * Prepends inputPath to the PATH (for this action and future actions)
       * @param inputPath
       */
      function addPath(inputPath) {
        const filePath = process.env["GITHUB_PATH"] || "";
        if (filePath) {
          file_command_1.issueFileCommand("PATH", inputPath);
        } else {
          command_1.issueCommand("add-path", {}, inputPath);
        process.env[
          "PATH"
        ] = `${inputPath}${path.delimiter}${process.env["PATH"]}`;
      }
      exports.addPath = addPath;
      /**
       * Gets the value of an input.
       * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
       * Returns an empty string if the value is not defined.
       *
       * @param     name     name of the input to get
       * @param     options  optional. See InputOptions.
       * @returns   string
       */
      function getInput(name, options) {
        const val =
          process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] || "";
        if (options && options.required && !val) {
          throw new Error(`Input required and not supplied: ${name}`);
        }
        if (options && options.trimWhitespace === false) {
          return val;
        }
        return val.trim();
      }
      exports.getInput = getInput;
      /**
       * Gets the values of an multiline input.  Each value is also trimmed.
       *
       * @param     name     name of the input to get
       * @param     options  optional. See InputOptions.
       * @returns   string[]
       *
       */
      function getMultilineInput(name, options) {
        const inputs = getInput(name, options)
          .split("\n")
          .filter((x) => x !== "");
        if (options && options.trimWhitespace === false) {
          return inputs;
        }
        return inputs.map((input) => input.trim());
      }
      exports.getMultilineInput = getMultilineInput;
      /**
       * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
       * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
       * The return value is also in boolean type.
       * ref: https://yaml.org/spec/1.2/spec.html#id2804923
       *
       * @param     name     name of the input to get
       * @param     options  optional. See InputOptions.
       * @returns   boolean
       */
      function getBooleanInput(name, options) {
        const trueValue = ["true", "True", "TRUE"];
        const falseValue = ["false", "False", "FALSE"];
        const val = getInput(name, options);
        if (trueValue.includes(val)) return true;
        if (falseValue.includes(val)) return false;
        throw new TypeError(
          `Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
            `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``
        );
      }
      exports.getBooleanInput = getBooleanInput;
      /**
       * Sets the value of an output.
       *
       * @param     name     name of the output to set
       * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function setOutput(name, value) {
        const filePath = process.env["GITHUB_OUTPUT"] || "";
        if (filePath) {
          return file_command_1.issueFileCommand(
            "OUTPUT",
            file_command_1.prepareKeyValueMessage(name, value)
          );
        }
        process.stdout.write(os.EOL);
        command_1.issueCommand(
          "set-output",
          { name },
          utils_1.toCommandValue(value)
        );
      }
      exports.setOutput = setOutput;
      /**
       * Enables or disables the echoing of commands into stdout for the rest of the step.
       * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
       *
       */
      function setCommandEcho(enabled) {
        command_1.issue("echo", enabled ? "on" : "off");
      }
      exports.setCommandEcho = setCommandEcho;
      //-----------------------------------------------------------------------
      // Results
      //-----------------------------------------------------------------------
      /**
       * Sets the action status to failed.
       * When the action exits it will be with an exit code of 1
       * @param message add error issue message
       */
      function setFailed(message) {
        process.exitCode = ExitCode.Failure;
        error(message);
      }
      exports.setFailed = setFailed;
      //-----------------------------------------------------------------------
      // Logging Commands
      //-----------------------------------------------------------------------
      /**
       * Gets whether Actions Step Debug is on or not
       */
      function isDebug() {
        return process.env["RUNNER_DEBUG"] === "1";
      }
      exports.isDebug = isDebug;
      /**
       * Writes debug message to user log
       * @param message debug message
       */
      function debug(message) {
        command_1.issueCommand("debug", {}, message);
      }
      exports.debug = debug;
      /**
       * Adds an error issue
       * @param message error issue message. Errors will be converted to string via toString()
       * @param properties optional properties to add to the annotation.
       */
      function error(message, properties = {}) {
        command_1.issueCommand(
          "error",
          utils_1.toCommandProperties(properties),
          message instanceof Error ? message.toString() : message
        );
      }
      exports.error = error;
      /**
       * Adds a warning issue
       * @param message warning issue message. Errors will be converted to string via toString()
       * @param properties optional properties to add to the annotation.
       */
      function warning(message, properties = {}) {
        command_1.issueCommand(
          "warning",
          utils_1.toCommandProperties(properties),
          message instanceof Error ? message.toString() : message
        );
      }
      exports.warning = warning;
      /**
       * Adds a notice issue
       * @param message notice issue message. Errors will be converted to string via toString()
       * @param properties optional properties to add to the annotation.
       */
      function notice(message, properties = {}) {
        command_1.issueCommand(
          "notice",
          utils_1.toCommandProperties(properties),
          message instanceof Error ? message.toString() : message
        );
      }
      exports.notice = notice;
      /**
       * Writes info to log with console.log.
       * @param message info message
       */
      function info(message) {
        process.stdout.write(message + os.EOL);
      }
      exports.info = info;
      /**
       * Begin an output group.
       *
       * Output until the next `groupEnd` will be foldable in this group
       *
       * @param name The name of the output group
       */
      function startGroup(name) {
        command_1.issue("group", name);
      }
      exports.startGroup = startGroup;
      /**
       * End an output group.
       */
      function endGroup() {
        command_1.issue("endgroup");
      }
      exports.endGroup = endGroup;
      /**
       * Wrap an asynchronous function call in a group.
       *
       * Returns the same type as the function itself.
       *
       * @param name The name of the group
       * @param fn The function to wrap in the group
       */
      function group(name, fn) {
        return __awaiter(this, void 0, void 0, function* () {
          startGroup(name);
          let result;
          try {
            result = yield fn();
          } finally {
          }
          return result;
        });
      }
      exports.group = group;
      //-----------------------------------------------------------------------
      // Wrapper action state
      //-----------------------------------------------------------------------
      /**
       * Saves state for current action, the state can only be retrieved by this action's post job execution.
       *
       * @param     name     name of the state to store
       * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function saveState(name, value) {
        const filePath = process.env["GITHUB_STATE"] || "";
        if (filePath) {
          return file_command_1.issueFileCommand(
            "STATE",
            file_command_1.prepareKeyValueMessage(name, value)
          );
        }
        command_1.issueCommand(
          "save-state",
          { name },
          utils_1.toCommandValue(value)
        );
      }
      exports.saveState = saveState;
      /**
       * Gets the value of an state set by this action's main execution.
       *
       * @param     name     name of the state to get
       * @returns   string
       */
      function getState(name) {
        return process.env[`STATE_${name}`] || "";
      }
      exports.getState = getState;
      function getIDToken(aud) {
        return __awaiter(this, void 0, void 0, function* () {
          return yield oidc_utils_1.OidcClient.getIDToken(aud);
        });
      }
      exports.getIDToken = getIDToken;
      /**
       * Summary exports
       */
      var summary_1 = __nccwpck_require__(1327);
      Object.defineProperty(exports, "summary", {
        enumerable: true,
        get: function () {
          return summary_1.summary;
        },
      });
      /**
       * @deprecated use core.summary
       */
      var summary_2 = __nccwpck_require__(1327);
      Object.defineProperty(exports, "markdownSummary", {
        enumerable: true,
        get: function () {
          return summary_2.markdownSummary;
        },
      });
      /**
       * Path exports
       */
      var path_utils_1 = __nccwpck_require__(2981);
      Object.defineProperty(exports, "toPosixPath", {
        enumerable: true,
        get: function () {
          return path_utils_1.toPosixPath;
        },
      });
      Object.defineProperty(exports, "toWin32Path", {
        enumerable: true,
        get: function () {
          return path_utils_1.toWin32Path;
        },
      });
      Object.defineProperty(exports, "toPlatformPath", {
        enumerable: true,
        get: function () {
          return path_utils_1.toPlatformPath;
        },
      });
      //# sourceMappingURL=core.js.map
      /***/
    },
    /***/ 717: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) {
      "use strict";

      // For internal use, subject to change.
      var __createBinding =
        (this && this.__createBinding) ||
        (Object.create
          ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              Object.defineProperty(o, k2, {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              });
            }
          : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
            });
      var __setModuleDefault =
        (this && this.__setModuleDefault) ||
        (Object.create
          ? function (o, v) {
              Object.defineProperty(o, "default", {
                enumerable: true,
                value: v,
              });
            }
          : function (o, v) {
              o["default"] = v;
            });
      var __importStar =
        (this && this.__importStar) ||
        function (mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null)
            for (var k in mod)
              if (k !== "default" && Object.hasOwnProperty.call(mod, k))
                __createBinding(result, mod, k);
          __setModuleDefault(result, mod);
          return result;
        };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.prepareKeyValueMessage = exports.issueFileCommand = void 0;
      // We use any as a valid input type
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const fs = __importStar(__nccwpck_require__(7147));
      const os = __importStar(__nccwpck_require__(2037));
      const uuid_1 = __nccwpck_require__(5840);
      const utils_1 = __nccwpck_require__(5278);
      function issueFileCommand(command, message) {
        const filePath = process.env[`GITHUB_${command}`];
        if (!filePath) {
          throw new Error(
            `Unable to find environment variable for file command ${command}`
          );
        }
        if (!fs.existsSync(filePath)) {
          throw new Error(`Missing file at path: ${filePath}`);
        }
        fs.appendFileSync(
          filePath,
          `${utils_1.toCommandValue(message)}${os.EOL}`,
          {
            encoding: "utf8",
          }
        );
      }
      exports.issueFileCommand = issueFileCommand;
      function prepareKeyValueMessage(key, value) {
        const delimiter = `ghadelimiter_${uuid_1.v4()}`;
        const convertedValue = utils_1.toCommandValue(value);
        // These should realistically never happen, but just in case someone finds a
        // way to exploit uuid generation let's not allow keys or values that contain
        // the delimiter.
        if (key.includes(delimiter)) {
          throw new Error(
            `Unexpected input: name should not contain the delimiter "${delimiter}"`
          );
        }
        if (convertedValue.includes(delimiter)) {
          throw new Error(
            `Unexpected input: value should not contain the delimiter "${delimiter}"`
          );
        }
        return `${key}<<${delimiter}${os.EOL}${convertedValue}${os.EOL}${delimiter}`;
      }
      exports.prepareKeyValueMessage = prepareKeyValueMessage;
      //# sourceMappingURL=file-command.js.map
      /***/
    },
    /***/ 8041: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) {
      "use strict";

      var __awaiter =
        (this && this.__awaiter) ||
        function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P
              ? value
              : new P(function (resolve) {
                  resolve(value);
                });
          }
          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }
            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }
            function step(result) {
              result.done
                ? resolve(result.value)
                : adopt(result.value).then(fulfilled, rejected);
            }
            step(
              (generator = generator.apply(thisArg, _arguments || [])).next()
            );
          });
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.OidcClient = void 0;
      const http_client_1 = __nccwpck_require__(6255);
      const auth_1 = __nccwpck_require__(5526);
      const core_1 = __nccwpck_require__(2186);
      class OidcClient {
        static createHttpClient(allowRetry = true, maxRetry = 10) {
          const requestOptions = {
            allowRetries: allowRetry,
            maxRetries: maxRetry,
          };
          return new http_client_1.HttpClient(
            "actions/oidc-client",
            [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())],
            requestOptions
          );
        }
        static getRequestToken() {
          const token = process.env["ACTIONS_ID_TOKEN_REQUEST_TOKEN"];
          if (!token) {
            throw new Error(
              "Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable"
            );
          }
          return token;
        static getIDTokenUrl() {
          const runtimeUrl = process.env["ACTIONS_ID_TOKEN_REQUEST_URL"];
          if (!runtimeUrl) {
            throw new Error(
              "Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable"
            );
          }
          return runtimeUrl;
        static getCall(id_token_url) {
          var _a;
          return __awaiter(this, void 0, void 0, function* () {
              .getJson(id_token_url)
              .catch((error) => {
              });
            const id_token =
              (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
              throw new Error("Response json body do not have ID Token field");
          });
        }
        static getIDToken(audience) {
          return __awaiter(this, void 0, void 0, function* () {
              // New ID Token is requested from action service
              let id_token_url = OidcClient.getIDTokenUrl();
              if (audience) {
                const encodedAudience = encodeURIComponent(audience);
                id_token_url = `${id_token_url}&audience=${encodedAudience}`;
              }
              core_1.debug(`ID token url is ${id_token_url}`);
              const id_token = yield OidcClient.getCall(id_token_url);
              core_1.setSecret(id_token);
              return id_token;
            } catch (error) {
              throw new Error(`Error message: ${error.message}`);
          });
        }
      }
      exports.OidcClient = OidcClient;
      //# sourceMappingURL=oidc-utils.js.map

      /***/
    },

    /***/ 2981: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) {
      "use strict";

      var __createBinding =
        (this && this.__createBinding) ||
        (Object.create
          ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              Object.defineProperty(o, k2, {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              });
          : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
            });
      var __setModuleDefault =
        (this && this.__setModuleDefault) ||
        (Object.create
          ? function (o, v) {
              Object.defineProperty(o, "default", {
                enumerable: true,
                value: v,
              });
            }
          : function (o, v) {
              o["default"] = v;
            });
      var __importStar =
        (this && this.__importStar) ||
        function (mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null)
            for (var k in mod)
              if (k !== "default" && Object.hasOwnProperty.call(mod, k))
                __createBinding(result, mod, k);
          __setModuleDefault(result, mod);
          return result;
        };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.toPlatformPath =
        exports.toWin32Path =
        exports.toPosixPath =
          void 0;
      const path = __importStar(__nccwpck_require__(1017));
      /**
       * toPosixPath converts the given path to the posix form. On Windows, \\ will be
       * replaced with /.
       *
       * @param pth. Path to transform.
       * @return string Posix path.
       */
      function toPosixPath(pth) {
        return pth.replace(/[\\]/g, "/");
      }
      exports.toPosixPath = toPosixPath;
      /**
       * toWin32Path converts the given path to the win32 form. On Linux, / will be
       * replaced with \\.
       *
       * @param pth. Path to transform.
       * @return string Win32 path.
       */
      function toWin32Path(pth) {
        return pth.replace(/[/]/g, "\\");
      }
      exports.toWin32Path = toWin32Path;
      /**
       * toPlatformPath converts the given path to a platform-specific path. It does
       * this by replacing instances of / and \ with the platform-specific path
       * separator.
       *
       * @param pth The path to platformize.
       * @return string The platform-specific path.
       */
      function toPlatformPath(pth) {
        return pth.replace(/[/\\]/g, path.sep);
      }
      exports.toPlatformPath = toPlatformPath;
      //# sourceMappingURL=path-utils.js.map

      /***/
    },

    /***/ 1327: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) {
      "use strict";

      var __awaiter =
        (this && this.__awaiter) ||
        function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P
              ? value
              : new P(function (resolve) {
                  resolve(value);
                });
          }
          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }
            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }
            function step(result) {
              result.done
                ? resolve(result.value)
                : adopt(result.value).then(fulfilled, rejected);
            }
            step(
              (generator = generator.apply(thisArg, _arguments || [])).next()
            );
          });
        };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.summary =
        exports.markdownSummary =
        exports.SUMMARY_DOCS_URL =
        exports.SUMMARY_ENV_VAR =
          void 0;
      const os_1 = __nccwpck_require__(2037);
      const fs_1 = __nccwpck_require__(7147);
      const { access, appendFile, writeFile } = fs_1.promises;
      exports.SUMMARY_ENV_VAR = "GITHUB_STEP_SUMMARY";
      exports.SUMMARY_DOCS_URL =
        "https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary";
      class Summary {
        constructor() {
          this._buffer = "";
        }
        /**
         * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
         * Also checks r/w permissions.
         *
         * @returns step summary file path
         */
        filePath() {
          return __awaiter(this, void 0, void 0, function* () {
              return this._filePath;
              throw new Error(
                `Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`
              );
              yield access(
                pathFromEnv,
                fs_1.constants.R_OK | fs_1.constants.W_OK
              );
            } catch (_a) {
              throw new Error(
                `Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`
              );
          });
        }
        /**
         * Wraps content in an HTML tag, adding any HTML attributes
         *
         * @param {string} tag HTML tag to wrap
         * @param {string | null} content content within the tag
         * @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
         *
         * @returns {string} content wrapped in HTML element
         */
        wrap(tag, content, attrs = {}) {
          const htmlAttrs = Object.entries(attrs)
            .join("");
          if (!content) {
          }
          return `<${tag}${htmlAttrs}>${content}</${tag}>`;
        /**
         * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
         *
         * @param {SummaryWriteOptions} [options] (optional) options for write operation
         *
         * @returns {Promise<Summary>} summary instance
         */
        write(options) {
          return __awaiter(this, void 0, void 0, function* () {
            const overwrite = !!(options === null || options === void 0
              ? void 0
              : options.overwrite);
            yield writeFunc(filePath, this._buffer, { encoding: "utf8" });
          });
        }
        /**
         * Clears the summary buffer and wipes the summary file
         *
         * @returns {Summary} summary instance
         */
        clear() {
          return __awaiter(this, void 0, void 0, function* () {
          });
        }
        /**
         * Returns the current summary buffer as a string
         *
         * @returns {string} string of summary buffer
         */
        stringify() {
          return this._buffer;
        }
        /**
         * If the summary buffer is empty
         *
         * @returns {boolen} true if the buffer is empty
         */
        isEmptyBuffer() {
          return this._buffer.length === 0;
        }
        /**
         * Resets the summary buffer without writing to summary file
         *
         * @returns {Summary} summary instance
         */
        emptyBuffer() {
          this._buffer = "";
          return this;
        }
        /**
         * Adds raw text to the summary buffer
         *
         * @param {string} text content to add
         * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
         *
         * @returns {Summary} summary instance
         */
        addRaw(text, addEOL = false) {
          this._buffer += text;
          return addEOL ? this.addEOL() : this;
        }
        /**
         * Adds the operating system-specific end-of-line marker to the buffer
         *
         * @returns {Summary} summary instance
         */
        addEOL() {
          return this.addRaw(os_1.EOL);
        }
        /**
         * Adds an HTML codeblock to the summary buffer
         *
         * @param {string} code content to render within fenced code block
         * @param {string} lang (optional) language to syntax highlight code
         *
         * @returns {Summary} summary instance
         */
        addCodeBlock(code, lang) {
          const attrs = Object.assign({}, lang && { lang });
          const element = this.wrap("pre", this.wrap("code", code), attrs);
          return this.addRaw(element).addEOL();
        }
        /**
         * Adds an HTML list to the summary buffer
         *
         * @param {string[]} items list of items to render
         * @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
         *
         * @returns {Summary} summary instance
         */
        addList(items, ordered = false) {
          const tag = ordered ? "ol" : "ul";
          const listItems = items.map((item) => this.wrap("li", item)).join("");
          const element = this.wrap(tag, listItems);
          return this.addRaw(element).addEOL();
        }
        /**
         * Adds an HTML table to the summary buffer
         *
         * @param {SummaryTableCell[]} rows table rows
         *
         * @returns {Summary} summary instance
         */
        addTable(rows) {
          const tableBody = rows
            .map((row) => {
              const cells = row
                .map((cell) => {
                  if (typeof cell === "string") {
                    return this.wrap("td", cell);
                  }
                  const { header, data, colspan, rowspan } = cell;
                  const tag = header ? "th" : "td";
                  const attrs = Object.assign(
                    Object.assign({}, colspan && { colspan }),
                    rowspan && { rowspan }
                  );
                  return this.wrap(tag, data, attrs);
                })
                .join("");
              return this.wrap("tr", cells);
            .join("");
          const element = this.wrap("table", tableBody);
          return this.addRaw(element).addEOL();
        }
        /**
         * Adds a collapsable HTML details element to the summary buffer
         *
         * @param {string} label text for the closed state
         * @param {string} content collapsable content
         *
         * @returns {Summary} summary instance
         */
        addDetails(label, content) {
          const element = this.wrap(
            "details",
            this.wrap("summary", label) + content
          );
          return this.addRaw(element).addEOL();
        }
        /**
         * Adds an HTML image tag to the summary buffer
         *
         * @param {string} src path to the image you to embed
         * @param {string} alt text description of the image
         * @param {SummaryImageOptions} options (optional) addition image attributes
         *
         * @returns {Summary} summary instance
         */
        addImage(src, alt, options) {
          const { width, height } = options || {};
          const attrs = Object.assign(
            Object.assign({}, width && { width }),
            height && { height }
          );
          const element = this.wrap(
            "img",
            null,
            Object.assign({ src, alt }, attrs)
          );
          return this.addRaw(element).addEOL();
        }
        /**
         * Adds an HTML section heading element
         *
         * @param {string} text heading text
         * @param {number | string} [level=1] (optional) the heading level, default: 1
         *
         * @returns {Summary} summary instance
         */
        addHeading(text, level) {
          const tag = `h${level}`;
          const allowedTag = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)
            : "h1";
          const element = this.wrap(allowedTag, text);
          return this.addRaw(element).addEOL();
        }
        /**
         * Adds an HTML thematic break (<hr>) to the summary buffer
         *
         * @returns {Summary} summary instance
         */
        addSeparator() {
          const element = this.wrap("hr", null);
          return this.addRaw(element).addEOL();
        }
        /**
         * Adds an HTML line break (<br>) to the summary buffer
         *
         * @returns {Summary} summary instance
         */
        addBreak() {
          const element = this.wrap("br", null);
          return this.addRaw(element).addEOL();
        }
        /**
         * Adds an HTML blockquote to the summary buffer
         *
         * @param {string} text quote text
         * @param {string} cite (optional) citation url
         *
         * @returns {Summary} summary instance
         */
        addQuote(text, cite) {
          const attrs = Object.assign({}, cite && { cite });
          const element = this.wrap("blockquote", text, attrs);
          return this.addRaw(element).addEOL();
        }
        /**
         * Adds an HTML anchor tag to the summary buffer
         *
         * @param {string} text link text/content
         * @param {string} href hyperlink
         *
         * @returns {Summary} summary instance
         */
        addLink(text, href) {
          const element = this.wrap("a", text, { href });
          return this.addRaw(element).addEOL();
        }
      }
      const _summary = new Summary();
      /**
       * @deprecated use `core.summary`
       */
      exports.markdownSummary = _summary;
      exports.summary = _summary;
      //# sourceMappingURL=summary.js.map

      /***/
    },
    /***/ 5278: /***/ (__unused_webpack_module, exports) => {
      "use strict";

      // We use any as a valid input type
      /* eslint-disable @typescript-eslint/no-explicit-any */
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.toCommandProperties = exports.toCommandValue = void 0;
      /**
       * Sanitizes an input into a string so it can be passed into issueCommand safely
       * @param input input to sanitize into a string
       */
      function toCommandValue(input) {
        if (input === null || input === undefined) {
          return "";
        } else if (typeof input === "string" || input instanceof String) {
          return input;
        }
        return JSON.stringify(input);
      }
      exports.toCommandValue = toCommandValue;
      /**
       *
       * @param annotationProperties
       * @returns The command properties to send with the actual annotation command
       * See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
       */
      function toCommandProperties(annotationProperties) {
        if (!Object.keys(annotationProperties).length) {
          return {};
        }
        return {
          title: annotationProperties.title,
          file: annotationProperties.file,
          line: annotationProperties.startLine,
          endLine: annotationProperties.endLine,
          col: annotationProperties.startColumn,
          endColumn: annotationProperties.endColumn,
        };
      }
      exports.toCommandProperties = toCommandProperties;
      //# sourceMappingURL=utils.js.map
      /***/
    },
    /***/ 5526: /***/ function (__unused_webpack_module, exports) {
      "use strict";

      var __awaiter =
        (this && this.__awaiter) ||
        function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P
              ? value
              : new P(function (resolve) {
                  resolve(value);
                });
          }
          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }
            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }
            function step(result) {
              result.done
                ? resolve(result.value)
                : adopt(result.value).then(fulfilled, rejected);
            }
            step(
              (generator = generator.apply(thisArg, _arguments || [])).next()
            );
          });
        };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.PersonalAccessTokenCredentialHandler =
        exports.BearerCredentialHandler =
        exports.BasicCredentialHandler =
          void 0;
      class BasicCredentialHandler {
        constructor(username, password) {
          this.username = username;
          this.password = password;
        }
        prepareRequest(options) {
          if (!options.headers) {
            throw Error("The request has no headers");
          }
          options.headers["Authorization"] = `Basic ${Buffer.from(
            `${this.username}:${this.password}`
          ).toString("base64")}`;
        // This handler cannot handle 401
        canHandleAuthentication() {
          return false;
        handleAuthentication() {
          return __awaiter(this, void 0, void 0, function* () {
            throw new Error("not implemented");
          });
      }
      exports.BasicCredentialHandler = BasicCredentialHandler;
      class BearerCredentialHandler {
        constructor(token) {
          this.token = token;
        }
        // currently implements pre-authorization
        // TODO: support preAuth = false where it hooks on 401
        prepareRequest(options) {
          if (!options.headers) {
            throw Error("The request has no headers");
          }
          options.headers["Authorization"] = `Bearer ${this.token}`;
        }
        // This handler cannot handle 401
        canHandleAuthentication() {
          return false;
        }
        handleAuthentication() {
          return __awaiter(this, void 0, void 0, function* () {
            throw new Error("not implemented");
          });
        }
      }
      exports.BearerCredentialHandler = BearerCredentialHandler;
      class PersonalAccessTokenCredentialHandler {
        constructor(token) {
          this.token = token;
        }
        // currently implements pre-authorization
        // TODO: support preAuth = false where it hooks on 401
        prepareRequest(options) {
          if (!options.headers) {
            throw Error("The request has no headers");
          }
          options.headers["Authorization"] = `Basic ${Buffer.from(
            `PAT:${this.token}`
          ).toString("base64")}`;
        }
        // This handler cannot handle 401
        canHandleAuthentication() {
          return false;
        }
        handleAuthentication() {
          return __awaiter(this, void 0, void 0, function* () {
            throw new Error("not implemented");
          });
        }
      }
      exports.PersonalAccessTokenCredentialHandler =
        PersonalAccessTokenCredentialHandler;
      //# sourceMappingURL=auth.js.map

      /***/
    },

    /***/ 6255: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) {
      "use strict";

      /* eslint-disable @typescript-eslint/no-explicit-any */
      var __createBinding =
        (this && this.__createBinding) ||
        (Object.create
          ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              Object.defineProperty(o, k2, {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              });
            }
          : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
            });
      var __setModuleDefault =
        (this && this.__setModuleDefault) ||
        (Object.create
          ? function (o, v) {
              Object.defineProperty(o, "default", {
                enumerable: true,
                value: v,
              });
            }
          : function (o, v) {
              o["default"] = v;
            });
      var __importStar =
        (this && this.__importStar) ||
        function (mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null)
            for (var k in mod)
              if (k !== "default" && Object.hasOwnProperty.call(mod, k))
                __createBinding(result, mod, k);
          __setModuleDefault(result, mod);
          return result;
        };
      var __awaiter =
        (this && this.__awaiter) ||
        function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P
              ? value
              : new P(function (resolve) {
                  resolve(value);
                });
          }
          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }
            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }
            function step(result) {
              result.done
                ? resolve(result.value)
                : adopt(result.value).then(fulfilled, rejected);
            }
            step(
              (generator = generator.apply(thisArg, _arguments || [])).next()
            );
          });
        };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.HttpClient =
        exports.isHttps =
        exports.HttpClientResponse =
        exports.HttpClientError =
        exports.getProxyUrl =
        exports.MediaTypes =
        exports.Headers =
        exports.HttpCodes =
          void 0;
      const http = __importStar(__nccwpck_require__(3685));
      const https = __importStar(__nccwpck_require__(5687));
      const pm = __importStar(__nccwpck_require__(9835));
      const tunnel = __importStar(__nccwpck_require__(4294));
      var HttpCodes;
      (function (HttpCodes) {
        HttpCodes[(HttpCodes["OK"] = 200)] = "OK";
        HttpCodes[(HttpCodes["MultipleChoices"] = 300)] = "MultipleChoices";
        HttpCodes[(HttpCodes["MovedPermanently"] = 301)] = "MovedPermanently";
        HttpCodes[(HttpCodes["ResourceMoved"] = 302)] = "ResourceMoved";
        HttpCodes[(HttpCodes["SeeOther"] = 303)] = "SeeOther";
        HttpCodes[(HttpCodes["NotModified"] = 304)] = "NotModified";
        HttpCodes[(HttpCodes["UseProxy"] = 305)] = "UseProxy";
        HttpCodes[(HttpCodes["SwitchProxy"] = 306)] = "SwitchProxy";
        HttpCodes[(HttpCodes["TemporaryRedirect"] = 307)] = "TemporaryRedirect";
        HttpCodes[(HttpCodes["PermanentRedirect"] = 308)] = "PermanentRedirect";
        HttpCodes[(HttpCodes["BadRequest"] = 400)] = "BadRequest";
        HttpCodes[(HttpCodes["Unauthorized"] = 401)] = "Unauthorized";
        HttpCodes[(HttpCodes["PaymentRequired"] = 402)] = "PaymentRequired";
        HttpCodes[(HttpCodes["Forbidden"] = 403)] = "Forbidden";
        HttpCodes[(HttpCodes["NotFound"] = 404)] = "NotFound";
        HttpCodes[(HttpCodes["MethodNotAllowed"] = 405)] = "MethodNotAllowed";
        HttpCodes[(HttpCodes["NotAcceptable"] = 406)] = "NotAcceptable";
        HttpCodes[(HttpCodes["ProxyAuthenticationRequired"] = 407)] =
          "ProxyAuthenticationRequired";
        HttpCodes[(HttpCodes["RequestTimeout"] = 408)] = "RequestTimeout";
        HttpCodes[(HttpCodes["Conflict"] = 409)] = "Conflict";
        HttpCodes[(HttpCodes["Gone"] = 410)] = "Gone";
        HttpCodes[(HttpCodes["TooManyRequests"] = 429)] = "TooManyRequests";
        HttpCodes[(HttpCodes["InternalServerError"] = 500)] =
          "InternalServerError";
        HttpCodes[(HttpCodes["NotImplemented"] = 501)] = "NotImplemented";
        HttpCodes[(HttpCodes["BadGateway"] = 502)] = "BadGateway";
        HttpCodes[(HttpCodes["ServiceUnavailable"] = 503)] =
          "ServiceUnavailable";
        HttpCodes[(HttpCodes["GatewayTimeout"] = 504)] = "GatewayTimeout";
      })((HttpCodes = exports.HttpCodes || (exports.HttpCodes = {})));
      var Headers;
      (function (Headers) {
        Headers["Accept"] = "accept";
        Headers["ContentType"] = "content-type";
      })((Headers = exports.Headers || (exports.Headers = {})));
      var MediaTypes;
      (function (MediaTypes) {
        MediaTypes["ApplicationJson"] = "application/json";
      })((MediaTypes = exports.MediaTypes || (exports.MediaTypes = {})));
      /**
       * Returns the proxy URL, depending upon the supplied url and proxy environment variables.
       * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
       */
      function getProxyUrl(serverUrl) {
        const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
        return proxyUrl ? proxyUrl.href : "";
      }
      exports.getProxyUrl = getProxyUrl;
      const HttpRedirectCodes = [
        HttpCodes.MovedPermanently,
        HttpCodes.ResourceMoved,
        HttpCodes.SeeOther,
        HttpCodes.TemporaryRedirect,
        HttpCodes.PermanentRedirect,
      ];
      const HttpResponseRetryCodes = [
        HttpCodes.BadGateway,
        HttpCodes.ServiceUnavailable,
        HttpCodes.GatewayTimeout,
      ];
      const RetryableHttpVerbs = ["OPTIONS", "GET", "DELETE", "HEAD"];
      const ExponentialBackoffCeiling = 10;
      const ExponentialBackoffTimeSlice = 5;
      class HttpClientError extends Error {
        constructor(message, statusCode) {
          super(message);
          this.name = "HttpClientError";
          this.statusCode = statusCode;
          Object.setPrototypeOf(this, HttpClientError.prototype);
        }
      }
      exports.HttpClientError = HttpClientError;
      class HttpClientResponse {
        constructor(message) {
          this.message = message;
        }
        readBody() {
          return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) =>
              __awaiter(this, void 0, void 0, function* () {
                this.message.on("data", (chunk) => {
                  output = Buffer.concat([output, chunk]);
                this.message.on("end", () => {
                  resolve(output.toString());
              })
            );
          });
        }
      }
      exports.HttpClientResponse = HttpClientResponse;
      function isHttps(requestUrl) {
        const parsedUrl = new URL(requestUrl);
        return parsedUrl.protocol === "https:";
      }
      exports.isHttps = isHttps;
      class HttpClient {
        constructor(userAgent, handlers, requestOptions) {
          this._ignoreSslError = false;
          this._allowRedirects = true;
          this._allowRedirectDowngrade = false;
          this._maxRedirects = 50;
          this._allowRetries = false;
          this._maxRetries = 1;
          this._keepAlive = false;
          this._disposed = false;
          this.userAgent = userAgent;
          this.handlers = handlers || [];
          this.requestOptions = requestOptions;
          if (requestOptions) {
              this._ignoreSslError = requestOptions.ignoreSslError;
              this._allowRedirects = requestOptions.allowRedirects;
              this._allowRedirectDowngrade =
                requestOptions.allowRedirectDowngrade;
              this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
              this._keepAlive = requestOptions.keepAlive;
              this._allowRetries = requestOptions.allowRetries;
              this._maxRetries = requestOptions.maxRetries;
          }
        options(requestUrl, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
            return this.request(
              "OPTIONS",
              requestUrl,
              null,
              additionalHeaders || {}
            );
          });
        }
        get(requestUrl, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
            return this.request(
              "GET",
              requestUrl,
              null,
              additionalHeaders || {}
            );
          });
        }
        del(requestUrl, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
            return this.request(
              "DELETE",
              requestUrl,
              null,
              additionalHeaders || {}
            );
          });
        }
        post(requestUrl, data, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
            return this.request(
              "POST",
              requestUrl,
              data,
              additionalHeaders || {}
            );
          });
        }
        patch(requestUrl, data, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
            return this.request(
              "PATCH",
              requestUrl,
              data,
              additionalHeaders || {}
            );
          });
        }
        put(requestUrl, data, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
            return this.request(
              "PUT",
              requestUrl,
              data,
              additionalHeaders || {}
            );
          });
        }
        head(requestUrl, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
            return this.request(
              "HEAD",
              requestUrl,
              null,
              additionalHeaders || {}
            );
          });
        }
        sendStream(verb, requestUrl, stream, additionalHeaders) {
          return __awaiter(this, void 0, void 0, function* () {
          });
        }
        /**
         * Gets a typed object from an endpoint
         * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
         */
        getJson(requestUrl, additionalHeaders = {}) {
          return __awaiter(this, void 0, void 0, function* () {
            additionalHeaders[Headers.Accept] =
              this._getExistingOrDefaultHeader(
                additionalHeaders,
                Headers.Accept,
                MediaTypes.ApplicationJson
              );
          });
        }
        postJson(requestUrl, obj, additionalHeaders = {}) {
          return __awaiter(this, void 0, void 0, function* () {
            additionalHeaders[Headers.Accept] =
              this._getExistingOrDefaultHeader(
                additionalHeaders,
                Headers.Accept,
                MediaTypes.ApplicationJson
              );
            additionalHeaders[Headers.ContentType] =
              this._getExistingOrDefaultHeader(
                additionalHeaders,
                Headers.ContentType,
                MediaTypes.ApplicationJson
              );
          });
        }
        putJson(requestUrl, obj, additionalHeaders = {}) {
          return __awaiter(this, void 0, void 0, function* () {
            additionalHeaders[Headers.Accept] =
              this._getExistingOrDefaultHeader(
                additionalHeaders,
                Headers.Accept,
                MediaTypes.ApplicationJson
              );
            additionalHeaders[Headers.ContentType] =
              this._getExistingOrDefaultHeader(
                additionalHeaders,
                Headers.ContentType,
                MediaTypes.ApplicationJson
              );
          });
        }
        patchJson(requestUrl, obj, additionalHeaders = {}) {
          return __awaiter(this, void 0, void 0, function* () {
            additionalHeaders[Headers.Accept] =
              this._getExistingOrDefaultHeader(
                additionalHeaders,
                Headers.Accept,
                MediaTypes.ApplicationJson
              );
            additionalHeaders[Headers.ContentType] =
              this._getExistingOrDefaultHeader(
                additionalHeaders,
                Headers.ContentType,
                MediaTypes.ApplicationJson
              );
          });
        }
        /**
         * Makes a raw http request.
         * All other methods such as get, post, patch, and request ultimately call this.
         * Prefer get, del, post and patch
         */
        request(verb, requestUrl, data, headers) {
          return __awaiter(this, void 0, void 0, function* () {
              throw new Error("Client has already been disposed.");
            const maxTries =
              this._allowRetries && RetryableHttpVerbs.includes(verb)
              response = yield this.requestRaw(info, data);
              // Check if it's an authentication challenge
              if (
                response &&
                response.message &&
                response.message.statusCode === HttpCodes.Unauthorized
              ) {
                let authenticationHandler;
                for (const handler of this.handlers) {
                  if (handler.canHandleAuthentication(response)) {
                    authenticationHandler = handler;
                    break;
                  }
                if (authenticationHandler) {
                  return authenticationHandler.handleAuthentication(
                    this,
                    info,
                    data
                  );
                } else {
                  // We have received an unauthorized response but have no handlers to handle it.
                  // Let the response return to the caller.
                  return response;
              }
              let redirectsRemaining = this._maxRedirects;
              while (
                response.message.statusCode &&
                HttpRedirectCodes.includes(response.message.statusCode) &&
                this._allowRedirects &&
                redirectsRemaining > 0
              ) {
                const redirectUrl = response.message.headers["location"];
                if (!redirectUrl) {
                  // if there's no location to redirect to, we won't
                  break;
                const parsedRedirectUrl = new URL(redirectUrl);
                if (
                  parsedUrl.protocol === "https:" &&
                  parsedUrl.protocol !== parsedRedirectUrl.protocol &&
                  !this._allowRedirectDowngrade
                ) {
                  throw new Error(
                    "Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true."
                  );
                // we need to finish reading the response before reassigning response
                // which will leak the open socket.
                yield response.readBody();
                // strip authorization header if redirected to a different hostname
                if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                  for (const header in headers) {
                    // header names are case insensitive
                    if (header.toLowerCase() === "authorization") {
                      delete headers[header];
                    }
                  }
                }
                // let's make the request with the new redirectUrl
                info = this._prepareRequest(verb, parsedRedirectUrl, headers);
                response = yield this.requestRaw(info, data);
                redirectsRemaining--;
              }
              if (
                !response.message.statusCode ||
                !HttpResponseRetryCodes.includes(response.message.statusCode)
              ) {
                // If not a retry code, return immediately instead of retrying
                return response;
              }
              numTries += 1;
              if (numTries < maxTries) {
                yield response.readBody();
                yield this._performExponentialBackoff(numTries);
              }
          });
        }
        /**
         * Needs to be called if keepAlive is set to true in request options.
         */
        dispose() {
          if (this._agent) {
          }
          this._disposed = true;
        /**
         * Raw request.
         * @param info
         * @param data
         */
        requestRaw(info, data) {
          return __awaiter(this, void 0, void 0, function* () {
              function callbackForResult(err, res) {
                if (err) {
                  reject(err);
                } else if (!res) {
                  // If `err` is not passed, then `res` must be passed.
                  reject(new Error("Unknown error"));
                } else {
                  resolve(res);
              }
              this.requestRawWithCallback(info, data, callbackForResult);
          });
        }
        /**
         * Raw request with callback.
         * @param info
         * @param data
         * @param onResult
         */
        requestRawWithCallback(info, data, onResult) {
          if (typeof data === "string") {
              info.options.headers = {};
            info.options.headers["Content-Length"] = Buffer.byteLength(
              data,
              "utf8"
            );
          }
          let callbackCalled = false;
          function handleResult(err, res) {
              callbackCalled = true;
              onResult(err, res);
          }
          const req = info.httpModule.request(info.options, (msg) => {
          });
          let socket;
          req.on("socket", (sock) => {
          });
          // If we ever get disconnected, we want the socket to timeout eventually
          req.setTimeout(this._socketTimeout || 3 * 60000, () => {
              socket.end();
          });
          req.on("error", function (err) {
          });
          if (data && typeof data === "string") {
            req.write(data, "utf8");
          }
          if (data && typeof data !== "string") {
            data.on("close", function () {
              req.end();
          } else {
          }
        /**
         * Gets an http agent. This function is useful when you need an http agent that handles
         * routing through a proxy server - depending upon the url and proxy environment variables.
         * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
         */
        getAgent(serverUrl) {
          const parsedUrl = new URL(serverUrl);
          return this._getAgent(parsedUrl);
        }
        _prepareRequest(method, requestUrl, headers) {
          const info = {};
          info.parsedUrl = requestUrl;
          const usingSsl = info.parsedUrl.protocol === "https:";
          info.httpModule = usingSsl ? https : http;
          const defaultPort = usingSsl ? 443 : 80;
          info.options = {};
          info.options.host = info.parsedUrl.hostname;
          info.options.port = info.parsedUrl.port
          info.options.path =
            (info.parsedUrl.pathname || "") + (info.parsedUrl.search || "");
          info.options.method = method;
          info.options.headers = this._mergeHeaders(headers);
          if (this.userAgent != null) {
            info.options.headers["user-agent"] = this.userAgent;
          }
          info.options.agent = this._getAgent(info.parsedUrl);
          // gives handlers an opportunity to participate
          if (this.handlers) {
              handler.prepareRequest(info.options);
          }
          return info;
        }
        _mergeHeaders(headers) {
          if (this.requestOptions && this.requestOptions.headers) {
            return Object.assign(
              {},
              lowercaseKeys(this.requestOptions.headers),
              lowercaseKeys(headers || {})
            );
          }
          return lowercaseKeys(headers || {});
        _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
          let clientHeader;
          if (this.requestOptions && this.requestOptions.headers) {
          }
          return additionalHeaders[header] || clientHeader || _default;
        _getAgent(parsedUrl) {
          let agent;
          const proxyUrl = pm.getProxyUrl(parsedUrl);
          const useProxy = proxyUrl && proxyUrl.hostname;
          if (this._keepAlive && useProxy) {
          }
          if (this._keepAlive && !useProxy) {
          }
          // if agent is already assigned use that agent.
          if (agent) {
          }
          const usingSsl = parsedUrl.protocol === "https:";
          let maxSockets = 100;
          if (this.requestOptions) {
            maxSockets =
              this.requestOptions.maxSockets || http.globalAgent.maxSockets;
          }
          // This is `useProxy` again, but we need to check `proxyURl` directly for TypeScripts's flow analysis.
          if (proxyUrl && proxyUrl.hostname) {
              maxSockets,
              keepAlive: this._keepAlive,
              proxy: Object.assign(
                Object.assign(
                  {},
                  (proxyUrl.username || proxyUrl.password) && {
                    proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`,
                  }
                ),
                { host: proxyUrl.hostname, port: proxyUrl.port }
              ),
            const overHttps = proxyUrl.protocol === "https:";
              tunnelAgent = overHttps
                ? tunnel.httpsOverHttps
                : tunnel.httpsOverHttp;
            } else {
              tunnelAgent = overHttps
                ? tunnel.httpOverHttps
                : tunnel.httpOverHttp;
          }
          // if reusing agent across request and tunneling agent isn't assigned create a new agent
          if (this._keepAlive && !agent) {
            agent = usingSsl
              ? new https.Agent(options)
              : new http.Agent(options);
          }
          // if not using private agent and tunnel agent isn't setup then use global agent
          if (!agent) {
          }
          if (usingSsl && this._ignoreSslError) {
              rejectUnauthorized: false,
          }
          return agent;
        _performExponentialBackoff(retryNumber) {
          return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => setTimeout(() => resolve(), ms));
          });
        }
        _processResponse(res, options) {
          return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) =>
              __awaiter(this, void 0, void 0, function* () {
                  statusCode,
                  result: null,
                  headers: {},
                  resolve(response);
                  if (typeof value === "string") {
                    const a = new Date(value);
                    if (!isNaN(a.valueOf())) {
                      return a;
                  }
                  return value;
                  contents = yield res.readBody();
                  if (contents && contents.length > 0) {
                    if (options && options.deserializeDates) {
                      obj = JSON.parse(contents, dateTimeDeserializer);
                    } else {
                      obj = JSON.parse(contents);
                    response.result = obj;
                  }
                  response.headers = res.message.headers;
                } catch (err) {
                  // Invalid resource (contents not json);  leaving result obj null
                  let msg;
                  // if exception/error in body, attempt to get better error
                  if (obj && obj.message) {
                    msg = obj.message;
                  } else if (contents && contents.length > 0) {
                    // it may be the case that the exception is in the body message as string
                    msg = contents;
                  } else {
                    msg = `Failed request: (${statusCode})`;
                  }
                  const err = new HttpClientError(msg, statusCode);
                  err.result = response.result;
                  reject(err);
                } else {
                  resolve(response);
              })
            );
          });
        }
      }
      exports.HttpClient = HttpClient;
      const lowercaseKeys = (obj) =>
        Object.keys(obj).reduce(
          (c, k) => ((c[k.toLowerCase()] = obj[k]), c),
          {}
        );
      //# sourceMappingURL=index.js.map

      /***/
    },
    /***/ 9835: /***/ (__unused_webpack_module, exports) => {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.checkBypass = exports.getProxyUrl = void 0;
      function getProxyUrl(reqUrl) {
        const usingSsl = reqUrl.protocol === "https:";
        if (checkBypass(reqUrl)) {
          return undefined;
        const proxyVar = (() => {
          if (usingSsl) {
            return process.env["https_proxy"] || process.env["HTTPS_PROXY"];
          } else {
            return process.env["http_proxy"] || process.env["HTTP_PROXY"];
          }
        })();
        if (proxyVar) {
          return new URL(proxyVar);
        } else {
          return undefined;
      }
      exports.getProxyUrl = getProxyUrl;
      function checkBypass(reqUrl) {
        if (!reqUrl.hostname) {
          return false;
        }
        const reqHost = reqUrl.hostname;
        if (isLoopbackAddress(reqHost)) {
          return true;
        }
        const noProxy =
          process.env["no_proxy"] || process.env["NO_PROXY"] || "";
        if (!noProxy) {
          return false;
        }
        // Determine the request port
        let reqPort;
        if (reqUrl.port) {
          reqPort = Number(reqUrl.port);
        } else if (reqUrl.protocol === "http:") {
          reqPort = 80;
        } else if (reqUrl.protocol === "https:") {
          reqPort = 443;
        }
        // Format the request hostname and hostname with port
        const upperReqHosts = [reqUrl.hostname.toUpperCase()];
        if (typeof reqPort === "number") {
          upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
        }
        // Compare request host against noproxy
        for (const upperNoProxyItem of noProxy
          .split(",")
          .map((x) => x.trim().toUpperCase())
          .filter((x) => x)) {
          if (
            upperNoProxyItem === "*" ||
            upperReqHosts.some(
              (x) =>
                x === upperNoProxyItem ||
                (upperNoProxyItem.startsWith(".") &&
                  x.endsWith(`${upperNoProxyItem}`))
            )
          ) {
          }
        return false;
      }
      exports.checkBypass = checkBypass;
      function isLoopbackAddress(host) {
        const hostLower = host.toLowerCase();
        return (
          hostLower === "localhost" ||
          hostLower.startsWith("127.") ||
          hostLower.startsWith("[::1]") ||
          hostLower.startsWith("[0:0:0:0:0:0:0:1]")
        );
      }
      //# sourceMappingURL=proxy.js.map
      /***/
    },
    /***/ 334: /***/ (__unused_webpack_module, exports) => {
      "use strict";

      Object.defineProperty(exports, "__esModule", { value: true });

      const REGEX_IS_INSTALLATION_LEGACY = /^v1\./;
      const REGEX_IS_INSTALLATION = /^ghs_/;
      const REGEX_IS_USER_TO_SERVER = /^ghu_/;
      async function auth(token) {
        const isApp = token.split(/\./).length === 3;
        const isInstallation =
          REGEX_IS_INSTALLATION_LEGACY.test(token) ||
          REGEX_IS_INSTALLATION.test(token);
        const isUserToServer = REGEX_IS_USER_TO_SERVER.test(token);
        const tokenType = isApp
          ? "app"
          : isInstallation
          ? "installation"
          : isUserToServer
          ? "user-to-server"
          : "oauth";
        return {
          type: "token",
          token: token,
          tokenType,
        };
      }
      /**
       * Prefix token for usage in the Authorization header
       *
       * @param token OAuth token or JSON Web Token
       */
      function withAuthorizationPrefix(token) {
        if (token.split(/\./).length === 3) {
          return `bearer ${token}`;
        }
        return `token ${token}`;
      }
      async function hook(token, request, route, parameters) {
        const endpoint = request.endpoint.merge(route, parameters);
        endpoint.headers.authorization = withAuthorizationPrefix(token);
        return request(endpoint);
      }
      const createTokenAuth = function createTokenAuth(token) {
        if (!token) {
          throw new Error(
            "[@octokit/auth-token] No token passed to createTokenAuth"
          );
        }
        if (typeof token !== "string") {
          throw new Error(
            "[@octokit/auth-token] Token passed to createTokenAuth is not a string"
          );
        }
        token = token.replace(/^(token|bearer) +/i, "");
        return Object.assign(auth.bind(null, token), {
          hook: hook.bind(null, token),
        });
      };
      exports.createTokenAuth = createTokenAuth;
      //# sourceMappingURL=index.js.map
      /***/
    },
    /***/ 6762: /***/ (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) => {
      "use strict";

      Object.defineProperty(exports, "__esModule", { value: true });

      var universalUserAgent = __nccwpck_require__(5030);
      var beforeAfterHook = __nccwpck_require__(3682);
      var request = __nccwpck_require__(6234);
      var graphql = __nccwpck_require__(8467);
      var authToken = __nccwpck_require__(334);

      const VERSION = "4.2.0";

      class Octokit {
        constructor(options = {}) {
          const hook = new beforeAfterHook.Collection();
          const requestDefaults = {
            baseUrl: request.request.endpoint.DEFAULTS.baseUrl,
            headers: {},
            request: Object.assign({}, options.request, {
              // @ts-ignore internal usage only, no need to type
              hook: hook.bind(null, "request"),
            }),
            mediaType: {
              previews: [],
              format: "",
            },
          }; // prepend default user agent with `options.userAgent` if set
          requestDefaults.headers["user-agent"] = [
            options.userAgent,
            `octokit-core.js/${VERSION} ${universalUserAgent.getUserAgent()}`,
          ]
            .filter(Boolean)
            .join(" ");
          if (options.baseUrl) {
            requestDefaults.baseUrl = options.baseUrl;
          }
          if (options.previews) {
            requestDefaults.mediaType.previews = options.previews;
          }
          if (options.timeZone) {
            requestDefaults.headers["time-zone"] = options.timeZone;
          }
          this.request = request.request.defaults(requestDefaults);
          this.graphql = graphql
            .withCustomRequest(this.request)
            .defaults(requestDefaults);
          this.log = Object.assign(
            {
              debug: () => {},
              info: () => {},
              warn: console.warn.bind(console),
              error: console.error.bind(console),
            },
            options.log
          );
          this.hook = hook; // (1) If neither `options.authStrategy` nor `options.auth` are set, the `octokit` instance
          //     is unauthenticated. The `this.auth()` method is a no-op and no request hook is registered.
          // (2) If only `options.auth` is set, use the default token authentication strategy.
          // (3) If `options.authStrategy` is set then use it and pass in `options.auth`. Always pass own request as many strategies accept a custom request instance.
          // TODO: type `options.auth` based on `options.authStrategy`.

          if (!options.authStrategy) {
            if (!options.auth) {
              // (1)
              this.auth = async () => ({
                type: "unauthenticated",
              });
            } else {
              // (2)
              const auth = authToken.createTokenAuth(options.auth); // @ts-ignore  ¯\_(ツ)_/¯
              hook.wrap("request", auth.hook);
              this.auth = auth;
            }
          } else {
            const { authStrategy, ...otherOptions } = options;
            const auth = authStrategy(
              Object.assign(
                {
                  request: this.request,
                  log: this.log,
                  // we pass the current octokit instance as well as its constructor options
                  // to allow for authentication strategies that return a new octokit instance
                  // that shares the same internal state as the current one. The original
                  // requirement for this was the "event-octokit" authentication strategy
                  // of https://github.com/probot/octokit-auth-probot.
                  octokit: this,
                  octokitOptions: otherOptions,
                },
                options.auth
              )
            ); // @ts-ignore  ¯\_(ツ)_/¯

            hook.wrap("request", auth.hook);
            this.auth = auth;
          } // apply plugins
          // https://stackoverflow.com/a/16345172

          const classConstructor = this.constructor;
          classConstructor.plugins.forEach((plugin) => {
            Object.assign(this, plugin(this, options));
          });
        }
        static defaults(defaults) {
          const OctokitWithDefaults = class extends this {
            constructor(...args) {
              const options = args[0] || {};
              if (typeof defaults === "function") {
                super(defaults(options));
                return;
              }

              super(
                Object.assign(
                  {},
                  defaults,
                  options,
                  options.userAgent && defaults.userAgent
                    ? {
                        userAgent: `${options.userAgent} ${defaults.userAgent}`,
                      }
                    : null
                )
              );
            }
          };
          return OctokitWithDefaults;
        }
        /**
         * Attach a plugin (or many) to your Octokit instance.
         *
         * @example
         * const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
         */
        static plugin(...newPlugins) {
          var _a;
          const currentPlugins = this.plugins;
          const NewOctokit =
            ((_a = class extends this {}),
            (_a.plugins = currentPlugins.concat(
              newPlugins.filter((plugin) => !currentPlugins.includes(plugin))
            )),
            _a);
          return NewOctokit;
      Octokit.VERSION = VERSION;
      Octokit.plugins = [];
      exports.Octokit = Octokit;
      //# sourceMappingURL=index.js.map
      /***/
    },
    /***/ 9440: /***/ (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) => {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var isPlainObject = __nccwpck_require__(3287);
      var universalUserAgent = __nccwpck_require__(5030);
      function lowercaseKeys(object) {
        if (!object) {
          return {};
        }
        return Object.keys(object).reduce((newObj, key) => {
          newObj[key.toLowerCase()] = object[key];
          return newObj;
        }, {});
      }
      function mergeDeep(defaults, options) {
        const result = Object.assign({}, defaults);
        Object.keys(options).forEach((key) => {
          if (isPlainObject.isPlainObject(options[key])) {
            if (!(key in defaults))
              Object.assign(result, {
                [key]: options[key],
              });
            else result[key] = mergeDeep(defaults[key], options[key]);
          } else {
            Object.assign(result, {
              [key]: options[key],
            });
          }
        });
        return result;
      }
      function removeUndefinedProperties(obj) {
        for (const key in obj) {
          if (obj[key] === undefined) {
            delete obj[key];
          }
        }
        return obj;
      }
      function merge(defaults, route, options) {
        if (typeof route === "string") {
          let [method, url] = route.split(" ");
          options = Object.assign(
            url
              ? {
                  method,
                  url,
                }
              : {
                  url: method,
                },
            options
          );
        } else {
          options = Object.assign({}, route);
        }
        // lowercase header names before merging with defaults to avoid duplicates
        options.headers = lowercaseKeys(options.headers);
        // remove properties with undefined values before merging
        removeUndefinedProperties(options);
        removeUndefinedProperties(options.headers);
        const mergedOptions = mergeDeep(defaults || {}, options);
        // mediaType.previews arrays are merged, instead of overwritten
        if (defaults && defaults.mediaType.previews.length) {
          mergedOptions.mediaType.previews = defaults.mediaType.previews
            .filter(
              (preview) => !mergedOptions.mediaType.previews.includes(preview)
            )
            .concat(mergedOptions.mediaType.previews);
        }
        mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map(
          (preview) => preview.replace(/-preview/, "")
        );
        return mergedOptions;
      }
      function addQueryParameters(url, parameters) {
        const separator = /\?/.test(url) ? "&" : "?";
        const names = Object.keys(parameters);
        if (names.length === 0) {
          return url;
        }
        return (
          url +
          separator +
          names
            .map((name) => {
              if (name === "q") {
                return (
                  "q=" +
                  parameters.q.split("+").map(encodeURIComponent).join("+")
                );
              }
              return `${name}=${encodeURIComponent(parameters[name])}`;
            })
            .join("&")
        );
      }
      const urlVariableRegex = /\{[^}]+\}/g;
      function removeNonChars(variableName) {
        return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
      }
      function extractUrlVariableNames(url) {
        const matches = url.match(urlVariableRegex);
        if (!matches) {
          return [];
        }
        return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
      }
      function omit(object, keysToOmit) {
        return Object.keys(object)
          .filter((option) => !keysToOmit.includes(option))
          .reduce((obj, key) => {
            obj[key] = object[key];
            return obj;
          }, {});
      }
      // Based on https://github.com/bramstein/url-template, licensed under BSD
      // TODO: create separate package.
      //
      // Copyright (c) 2012-2014, Bram Stein
      // All rights reserved.
      // Redistribution and use in source and binary forms, with or without
      // modification, are permitted provided that the following conditions
      // are met:
      //  1. Redistributions of source code must retain the above copyright
      //     notice, this list of conditions and the following disclaimer.
      //  2. Redistributions in binary form must reproduce the above copyright
      //     notice, this list of conditions and the following disclaimer in the
      //     documentation and/or other materials provided with the distribution.
      //  3. The name of the author may not be used to endorse or promote products
      //     derived from this software without specific prior written permission.
      // THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED
      // WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
      // MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
      // EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
      // INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
      // BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
      // DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
      // OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
      // NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
      // EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
      /* istanbul ignore file */
      function encodeReserved(str) {
        return str
          .split(/(%[0-9A-Fa-f]{2})/g)
          .map(function (part) {
            if (!/%[0-9A-Fa-f]/.test(part)) {
              part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
            }
            return part;
          })
          .join("");
      }
      function encodeUnreserved(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
          return "%" + c.charCodeAt(0).toString(16).toUpperCase();
        });
      }
      function encodeValue(operator, value, key) {
        value =
          operator === "+" || operator === "#"
            ? encodeReserved(value)
            : encodeUnreserved(value);
        if (key) {
          return encodeUnreserved(key) + "=" + value;
          return value;
      }
      function isDefined(value) {
        return value !== undefined && value !== null;
      }
      function isKeyOperator(operator) {
        return operator === ";" || operator === "&" || operator === "?";
      }
      function getValues(context, operator, key, modifier) {
        var value = context[key],
          result = [];
        if (isDefined(value) && value !== "") {
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            value = value.toString();
            if (modifier && modifier !== "*") {
              value = value.substring(0, parseInt(modifier, 10));
            }
            result.push(
              encodeValue(operator, value, isKeyOperator(operator) ? key : "")
            );
          } else {
            if (modifier === "*") {
              if (Array.isArray(value)) {
                value.filter(isDefined).forEach(function (value) {
                  result.push(
                    encodeValue(
                      operator,
                      value,
                      isKeyOperator(operator) ? key : ""
                    )
                  );
                });
              } else {
                Object.keys(value).forEach(function (k) {
                  if (isDefined(value[k])) {
                    result.push(encodeValue(operator, value[k], k));
                  }
                });
              }
            } else {
              const tmp = [];
              if (Array.isArray(value)) {
                value.filter(isDefined).forEach(function (value) {
                  tmp.push(encodeValue(operator, value));
                });
              } else {
                Object.keys(value).forEach(function (k) {
                  if (isDefined(value[k])) {
                    tmp.push(encodeUnreserved(k));
                    tmp.push(encodeValue(operator, value[k].toString()));
                  }
                });
              }
              if (isKeyOperator(operator)) {
                result.push(encodeUnreserved(key) + "=" + tmp.join(","));
              } else if (tmp.length !== 0) {
                result.push(tmp.join(","));
              }
          }
        } else {
          if (operator === ";") {
            if (isDefined(value)) {
              result.push(encodeUnreserved(key));
            }
          } else if (value === "" && (operator === "&" || operator === "?")) {
            result.push(encodeUnreserved(key) + "=");
          } else if (value === "") {
            result.push("");
          }
        return result;
      function parseUrl(template) {
        return {
          expand: expand.bind(null, template),
        };
      function expand(template, context) {
        var operators = ["+", "#", ".", "/", ";", "?", "&"];
        return template.replace(
          /\{([^\{\}]+)\}|([^\{\}]+)/g,
          function (_, expression, literal) {
            if (expression) {
              let operator = "";
              const values = [];
              if (operators.indexOf(expression.charAt(0)) !== -1) {
                operator = expression.charAt(0);
                expression = expression.substr(1);
              }
              expression.split(/,/g).forEach(function (variable) {
                var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
                values.push(
                  getValues(context, operator, tmp[1], tmp[2] || tmp[3])
                );
              });
              if (operator && operator !== "+") {
                var separator = ",";
                if (operator === "?") {
                  separator = "&";
                } else if (operator !== "#") {
                  separator = operator;
                }
                return (
                  (values.length !== 0 ? operator : "") + values.join(separator)
                );
              } else {
                return values.join(",");
              }
            } else {
              return encodeReserved(literal);
            }
          }
        );
      function parse(options) {
        // https://fetch.spec.whatwg.org/#methods
        let method = options.method.toUpperCase();
        // replace :varname with {varname} to make it RFC 6570 compatible
        let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
        let headers = Object.assign({}, options.headers);
        let body;
        let parameters = omit(options, [
          "method",
          "baseUrl",
          "url",
          "headers",
          "request",
          "mediaType",
        ]);
        // extract variable names from URL to calculate remaining variables later
        const urlVariableNames = extractUrlVariableNames(url);
        url = parseUrl(url).expand(parameters);
        if (!/^http/.test(url)) {
          url = options.baseUrl + url;
        }
        const omittedParameters = Object.keys(options)
          .filter((option) => urlVariableNames.includes(option))
          .concat("baseUrl");
        const remainingParameters = omit(parameters, omittedParameters);
        const isBinaryRequest = /application\/octet-stream/i.test(
          headers.accept
        );
        if (!isBinaryRequest) {
          if (options.mediaType.format) {
            // e.g. application/vnd.github.v3+json => application/vnd.github.v3.raw
            headers.accept = headers.accept
              .split(/,/)
              .map((preview) =>
                preview.replace(
                  /application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/,
                  `application/vnd$1$2.${options.mediaType.format}`
                )
              )
              .join(",");
          }
          if (options.mediaType.previews.length) {
            const previewsFromAcceptHeader =
              headers.accept.match(/[\w-]+(?=-preview)/g) || [];
            headers.accept = previewsFromAcceptHeader
              .concat(options.mediaType.previews)
              .map((preview) => {
                const format = options.mediaType.format
                  ? `.${options.mediaType.format}`
                  : "+json";
                return `application/vnd.github.${preview}-preview${format}`;
              })
              .join(",");
          }
        }
        // for GET/HEAD requests, set URL query parameters from remaining parameters
        // for PATCH/POST/PUT/DELETE requests, set request body from remaining parameters
        if (["GET", "HEAD"].includes(method)) {
          url = addQueryParameters(url, remainingParameters);
        } else {
          if ("data" in remainingParameters) {
            body = remainingParameters.data;
          } else {
            if (Object.keys(remainingParameters).length) {
              body = remainingParameters;
          }
        // default content-type for JSON if body is set
        if (!headers["content-type"] && typeof body !== "undefined") {
          headers["content-type"] = "application/json; charset=utf-8";
        }
        // GitHub expects 'content-length: 0' header for PUT/PATCH requests without body.
        // fetch does not allow to set `content-length` header, but we can set body to an empty string
        if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
          body = "";
        }
        // Only return body/request keys if present
        return Object.assign(
          {
            method,
            url,
            headers,
          },
          typeof body !== "undefined"
            ? {
                body,
              }
            : null,
          options.request
            ? {
                request: options.request,
              }
            : null
        );
      function endpointWithDefaults(defaults, route, options) {
        return parse(merge(defaults, route, options));
      }
      function withDefaults(oldDefaults, newDefaults) {
        const DEFAULTS = merge(oldDefaults, newDefaults);
        const endpoint = endpointWithDefaults.bind(null, DEFAULTS);
        return Object.assign(endpoint, {
          DEFAULTS,
          defaults: withDefaults.bind(null, DEFAULTS),
          merge: merge.bind(null, DEFAULTS),
          parse,
        });
      }
      const VERSION = "7.0.5";

      const userAgent = `octokit-endpoint.js/${VERSION} ${universalUserAgent.getUserAgent()}`;
      // DEFAULTS has all properties set that EndpointOptions has, except url.
      // So we use RequestParameters and add method as additional required property.
      const DEFAULTS = {
        method: "GET",
        baseUrl: "https://api.github.com",
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent,
        },
        mediaType: {
          format: "",
          previews: [],
        },
      };
      const endpoint = withDefaults(null, DEFAULTS);
      exports.endpoint = endpoint;
      //# sourceMappingURL=index.js.map
      /***/
    },
    /***/ 8467: /***/ (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) => {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var request = __nccwpck_require__(6234);
      var universalUserAgent = __nccwpck_require__(5030);
      const VERSION = "5.0.5";
      function _buildMessageForResponseErrors(data) {
        return (
          `Request failed due to following response errors:\n` +
          data.errors.map((e) => ` - ${e.message}`).join("\n")
        );
      }
      class GraphqlResponseError extends Error {
        constructor(request, headers, response) {
          super(_buildMessageForResponseErrors(response));
          this.request = request;
          this.headers = headers;
          this.response = response;
          this.name = "GraphqlResponseError";
          // Expose the errors and response data in their shorthand properties.
          this.errors = response.errors;
          this.data = response.data;
          // Maintains proper stack trace (only available on V8)
          /* istanbul ignore next */
          if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
      const NON_VARIABLE_OPTIONS = [
        "method",
        "baseUrl",
        "url",
        "headers",
        "request",
        "query",
        "mediaType",
      ];
      const FORBIDDEN_VARIABLE_OPTIONS = ["query", "method", "url"];
      const GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
      function graphql(request, query, options) {
        if (options) {
          if (typeof query === "string" && "query" in options) {
            return Promise.reject(
              new Error(
                `[@octokit/graphql] "query" cannot be used as variable name`
              )
            );
          }
          for (const key in options) {
            if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key)) continue;
            return Promise.reject(
              new Error(
                `[@octokit/graphql] "${key}" cannot be used as variable name`
              )
            );
          }
        }
        const parsedOptions =
          typeof query === "string"
            ? Object.assign(
                {
                  query,
                },
                options
              )
            : query;
        const requestOptions = Object.keys(parsedOptions).reduce(
          (result, key) => {
            if (NON_VARIABLE_OPTIONS.includes(key)) {
              result[key] = parsedOptions[key];
              return result;
            }
            if (!result.variables) {
              result.variables = {};
            }
            result.variables[key] = parsedOptions[key];
            return result;
          },
          {}
        );
        // workaround for GitHub Enterprise baseUrl set with /api/v3 suffix
        // https://github.com/octokit/auth-app.js/issues/111#issuecomment-657610451
        const baseUrl =
          parsedOptions.baseUrl || request.endpoint.DEFAULTS.baseUrl;
        if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
          requestOptions.url = baseUrl.replace(
            GHES_V3_SUFFIX_REGEX,
            "/api/graphql"
          );
        }
        return request(requestOptions).then((response) => {
          if (response.data.errors) {
            const headers = {};
            for (const key of Object.keys(response.headers)) {
              headers[key] = response.headers[key];
            }
            throw new GraphqlResponseError(
              requestOptions,
              headers,
              response.data
            );
          }
          return response.data.data;
        });
      }
      function withDefaults(request, newDefaults) {
        const newRequest = request.defaults(newDefaults);
        const newApi = (query, options) => {
          return graphql(newRequest, query, options);
        };
        return Object.assign(newApi, {
          defaults: withDefaults.bind(null, newRequest),
          endpoint: newRequest.endpoint,
        });
      }
      const graphql$1 = withDefaults(request.request, {
        headers: {
          "user-agent": `octokit-graphql.js/${VERSION} ${universalUserAgent.getUserAgent()}`,
        },
        method: "POST",
        url: "/graphql",
      });
      function withCustomRequest(customRequest) {
        return withDefaults(customRequest, {
          method: "POST",
          url: "/graphql",
        });
      }
      exports.GraphqlResponseError = GraphqlResponseError;
      exports.graphql = graphql$1;
      exports.withCustomRequest = withCustomRequest;
      //# sourceMappingURL=index.js.map
      /***/
    },
    /***/ 4193: /***/ (__unused_webpack_module, exports) => {
      "use strict";

      Object.defineProperty(exports, "__esModule", { value: true });

      const VERSION = "6.0.0";

      /**
       * Some “list” response that can be paginated have a different response structure
       *
       * They have a `total_count` key in the response (search also has `incomplete_results`,
       * /installation/repositories also has `repository_selection`), as well as a key with
       * the list of the items which name varies from endpoint to endpoint.
       *
       * Octokit normalizes these responses so that paginated results are always returned following
       * the same structure. One challenge is that if the list response has only one page, no Link
       * header is provided, so this header alone is not sufficient to check wether a response is
       * paginated or not.
       *
       * We check if a "total_count" key is present in the response data, but also make sure that
       * a "url" property is not, as the "Get the combined status for a specific ref" endpoint would
       * otherwise match: https://developer.github.com/v3/repos/statuses/#get-the-combined-status-for-a-specific-ref
       */
      function normalizePaginatedListResponse(response) {
        // endpoints can respond with 204 if repository is empty
        if (!response.data) {
          return {
            ...response,
            data: [],
          };
        }
        const responseNeedsNormalization =
          "total_count" in response.data && !("url" in response.data);
        if (!responseNeedsNormalization) return response;
        // keep the additional properties intact as there is currently no other way
        // to retrieve the same information.
        const incompleteResults = response.data.incomplete_results;
        const repositorySelection = response.data.repository_selection;
        const totalCount = response.data.total_count;
        delete response.data.incomplete_results;
        delete response.data.repository_selection;
        delete response.data.total_count;
        const namespaceKey = Object.keys(response.data)[0];
        const data = response.data[namespaceKey];
        response.data = data;
        if (typeof incompleteResults !== "undefined") {
          response.data.incomplete_results = incompleteResults;
        }
        if (typeof repositorySelection !== "undefined") {
          response.data.repository_selection = repositorySelection;
        }
        response.data.total_count = totalCount;
        return response;
      }
      function iterator(octokit, route, parameters) {
        const options =
          typeof route === "function"
            ? route.endpoint(parameters)
            : octokit.request.endpoint(route, parameters);
        const requestMethod =
          typeof route === "function" ? route : octokit.request;
        const method = options.method;
        const headers = options.headers;
        let url = options.url;
        return {
          [Symbol.asyncIterator]: () => ({
            async next() {
              if (!url)
                return {
                  done: true,
                };
              try {
                const response = await requestMethod({
                  method,
                  url,
                  headers,
                });
                const normalizedResponse =
                  normalizePaginatedListResponse(response);
                // `response.headers.link` format:
                // '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
                // sets `url` to undefined if "next" URL is not present or `link` header is not set
                url = ((normalizedResponse.headers.link || "").match(
                  /<([^>]+)>;\s*rel="next"/
                ) || [])[1];
                return {
                  value: normalizedResponse,
                };
              } catch (error) {
                if (error.status !== 409) throw error;
                url = "";
                return {
                  value: {
                    status: 200,
                    headers: {},
                    data: [],
                  },
                };
              }
            },
          }),
        };
      }
      function paginate(octokit, route, parameters, mapFn) {
        if (typeof parameters === "function") {
          mapFn = parameters;
          parameters = undefined;
        }
        return gather(
          octokit,
          [],
          iterator(octokit, route, parameters)[Symbol.asyncIterator](),
          mapFn
        );
      function gather(octokit, results, iterator, mapFn) {
        return iterator.next().then((result) => {
          if (result.done) {
            return results;
          }
          let earlyExit = false;
          function done() {
            earlyExit = true;
          }
          results = results.concat(
            mapFn ? mapFn(result.value, done) : result.value.data
          );
          if (earlyExit) {
            return results;
          }
          return gather(octokit, results, iterator, mapFn);
        });
      const composePaginateRest = Object.assign(paginate, {
        iterator,
      });
      const paginatingEndpoints = [
        "GET /app/hook/deliveries",
        "GET /app/installations",
        "GET /enterprises/{enterprise}/actions/runner-groups",
        "GET /enterprises/{enterprise}/dependabot/alerts",
        "GET /enterprises/{enterprise}/secret-scanning/alerts",
        "GET /events",
        "GET /gists",
        "GET /gists/public",
        "GET /gists/starred",
        "GET /gists/{gist_id}/comments",
        "GET /gists/{gist_id}/commits",
        "GET /gists/{gist_id}/forks",
        "GET /installation/repositories",
        "GET /issues",
        "GET /licenses",
        "GET /marketplace_listing/plans",
        "GET /marketplace_listing/plans/{plan_id}/accounts",
        "GET /marketplace_listing/stubbed/plans",
        "GET /marketplace_listing/stubbed/plans/{plan_id}/accounts",
        "GET /networks/{owner}/{repo}/events",
        "GET /notifications",
        "GET /organizations",
        "GET /orgs/{org}/actions/cache/usage-by-repository",
        "GET /orgs/{org}/actions/permissions/repositories",
        "GET /orgs/{org}/actions/required_workflows",
        "GET /orgs/{org}/actions/runner-groups",
        "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories",
        "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/runners",
        "GET /orgs/{org}/actions/runners",
        "GET /orgs/{org}/actions/secrets",
        "GET /orgs/{org}/actions/secrets/{secret_name}/repositories",
        "GET /orgs/{org}/actions/variables",
        "GET /orgs/{org}/actions/variables/{name}/repositories",
        "GET /orgs/{org}/blocks",
        "GET /orgs/{org}/code-scanning/alerts",
        "GET /orgs/{org}/codespaces",
        "GET /orgs/{org}/codespaces/secrets",
        "GET /orgs/{org}/codespaces/secrets/{secret_name}/repositories",
        "GET /orgs/{org}/dependabot/alerts",
        "GET /orgs/{org}/dependabot/secrets",
        "GET /orgs/{org}/dependabot/secrets/{secret_name}/repositories",
        "GET /orgs/{org}/events",
        "GET /orgs/{org}/failed_invitations",
        "GET /orgs/{org}/hooks",
        "GET /orgs/{org}/hooks/{hook_id}/deliveries",
        "GET /orgs/{org}/installations",
        "GET /orgs/{org}/invitations",
        "GET /orgs/{org}/invitations/{invitation_id}/teams",
        "GET /orgs/{org}/issues",
        "GET /orgs/{org}/members",
        "GET /orgs/{org}/members/{username}/codespaces",
        "GET /orgs/{org}/migrations",
        "GET /orgs/{org}/migrations/{migration_id}/repositories",
        "GET /orgs/{org}/outside_collaborators",
        "GET /orgs/{org}/packages",
        "GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
        "GET /orgs/{org}/projects",
        "GET /orgs/{org}/public_members",
        "GET /orgs/{org}/repos",
        "GET /orgs/{org}/secret-scanning/alerts",
        "GET /orgs/{org}/teams",
        "GET /orgs/{org}/teams/{team_slug}/discussions",
        "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments",
        "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions",
        "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions",
        "GET /orgs/{org}/teams/{team_slug}/invitations",
        "GET /orgs/{org}/teams/{team_slug}/members",
        "GET /orgs/{org}/teams/{team_slug}/projects",
        "GET /orgs/{org}/teams/{team_slug}/repos",
        "GET /orgs/{org}/teams/{team_slug}/teams",
        "GET /projects/columns/{column_id}/cards",
        "GET /projects/{project_id}/collaborators",
        "GET /projects/{project_id}/columns",
        "GET /repos/{org}/{repo}/actions/required_workflows",
        "GET /repos/{owner}/{repo}/actions/artifacts",
        "GET /repos/{owner}/{repo}/actions/caches",
        "GET /repos/{owner}/{repo}/actions/required_workflows/{required_workflow_id_for_repo}/runs",
        "GET /repos/{owner}/{repo}/actions/runners",
        "GET /repos/{owner}/{repo}/actions/runs",
        "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts",
        "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs",
        "GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs",
        "GET /repos/{owner}/{repo}/actions/secrets",
        "GET /repos/{owner}/{repo}/actions/variables",
        "GET /repos/{owner}/{repo}/actions/workflows",
        "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs",
        "GET /repos/{owner}/{repo}/assignees",
        "GET /repos/{owner}/{repo}/branches",
        "GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations",
        "GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs",
        "GET /repos/{owner}/{repo}/code-scanning/alerts",
        "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
        "GET /repos/{owner}/{repo}/code-scanning/analyses",
        "GET /repos/{owner}/{repo}/codespaces",
        "GET /repos/{owner}/{repo}/codespaces/devcontainers",
        "GET /repos/{owner}/{repo}/codespaces/secrets",
        "GET /repos/{owner}/{repo}/collaborators",
        "GET /repos/{owner}/{repo}/comments",
        "GET /repos/{owner}/{repo}/comments/{comment_id}/reactions",
        "GET /repos/{owner}/{repo}/commits",
        "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments",
        "GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls",
        "GET /repos/{owner}/{repo}/commits/{ref}/check-runs",
        "GET /repos/{owner}/{repo}/commits/{ref}/check-suites",
        "GET /repos/{owner}/{repo}/commits/{ref}/status",
        "GET /repos/{owner}/{repo}/commits/{ref}/statuses",
        "GET /repos/{owner}/{repo}/contributors",
        "GET /repos/{owner}/{repo}/dependabot/alerts",
        "GET /repos/{owner}/{repo}/dependabot/secrets",
        "GET /repos/{owner}/{repo}/deployments",
        "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses",
        "GET /repos/{owner}/{repo}/environments",
        "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies",
        "GET /repos/{owner}/{repo}/events",
        "GET /repos/{owner}/{repo}/forks",
        "GET /repos/{owner}/{repo}/hooks",
        "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries",
        "GET /repos/{owner}/{repo}/invitations",
        "GET /repos/{owner}/{repo}/issues",
        "GET /repos/{owner}/{repo}/issues/comments",
        "GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions",
        "GET /repos/{owner}/{repo}/issues/events",
        "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
        "GET /repos/{owner}/{repo}/issues/{issue_number}/events",
        "GET /repos/{owner}/{repo}/issues/{issue_number}/labels",
        "GET /repos/{owner}/{repo}/issues/{issue_number}/reactions",
        "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline",
        "GET /repos/{owner}/{repo}/keys",
        "GET /repos/{owner}/{repo}/labels",
        "GET /repos/{owner}/{repo}/milestones",
        "GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels",
        "GET /repos/{owner}/{repo}/notifications",
        "GET /repos/{owner}/{repo}/pages/builds",
        "GET /repos/{owner}/{repo}/projects",
        "GET /repos/{owner}/{repo}/pulls",
        "GET /repos/{owner}/{repo}/pulls/comments",
        "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions",
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments",
        "GET /repos/{owner}/{repo}/releases",
        "GET /repos/{owner}/{repo}/releases/{release_id}/assets",
        "GET /repos/{owner}/{repo}/releases/{release_id}/reactions",
        "GET /repos/{owner}/{repo}/secret-scanning/alerts",
        "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations",
        "GET /repos/{owner}/{repo}/stargazers",
        "GET /repos/{owner}/{repo}/subscribers",
        "GET /repos/{owner}/{repo}/tags",
        "GET /repos/{owner}/{repo}/teams",
        "GET /repos/{owner}/{repo}/topics",
        "GET /repositories",
        "GET /repositories/{repository_id}/environments/{environment_name}/secrets",
        "GET /repositories/{repository_id}/environments/{environment_name}/variables",
        "GET /search/code",
        "GET /search/commits",
        "GET /search/issues",
        "GET /search/labels",
        "GET /search/repositories",
        "GET /search/topics",
        "GET /search/users",
        "GET /teams/{team_id}/discussions",
        "GET /teams/{team_id}/discussions/{discussion_number}/comments",
        "GET /teams/{team_id}/discussions/{discussion_number}/comments/{comment_number}/reactions",
        "GET /teams/{team_id}/discussions/{discussion_number}/reactions",
        "GET /teams/{team_id}/invitations",
        "GET /teams/{team_id}/members",
        "GET /teams/{team_id}/projects",
        "GET /teams/{team_id}/repos",
        "GET /teams/{team_id}/teams",
        "GET /user/blocks",
        "GET /user/codespaces",
        "GET /user/codespaces/secrets",
        "GET /user/emails",
        "GET /user/followers",
        "GET /user/following",
        "GET /user/gpg_keys",
        "GET /user/installations",
        "GET /user/installations/{installation_id}/repositories",
        "GET /user/issues",
        "GET /user/keys",
        "GET /user/marketplace_purchases",
        "GET /user/marketplace_purchases/stubbed",
        "GET /user/memberships/orgs",
        "GET /user/migrations",
        "GET /user/migrations/{migration_id}/repositories",
        "GET /user/orgs",
        "GET /user/packages",
        "GET /user/packages/{package_type}/{package_name}/versions",
        "GET /user/public_emails",
        "GET /user/repos",
        "GET /user/repository_invitations",
        "GET /user/ssh_signing_keys",
        "GET /user/starred",
        "GET /user/subscriptions",
        "GET /user/teams",
        "GET /users",
        "GET /users/{username}/events",
        "GET /users/{username}/events/orgs/{org}",
        "GET /users/{username}/events/public",
        "GET /users/{username}/followers",
        "GET /users/{username}/following",
        "GET /users/{username}/gists",
        "GET /users/{username}/gpg_keys",
        "GET /users/{username}/keys",
        "GET /users/{username}/orgs",
        "GET /users/{username}/packages",
        "GET /users/{username}/projects",
        "GET /users/{username}/received_events",
        "GET /users/{username}/received_events/public",
        "GET /users/{username}/repos",
        "GET /users/{username}/ssh_signing_keys",
        "GET /users/{username}/starred",
        "GET /users/{username}/subscriptions",
      ];

      function isPaginatingEndpoint(arg) {
        if (typeof arg === "string") {
          return paginatingEndpoints.includes(arg);
        } else {
          return false;
        }
      }
      /**
       * @param octokit Octokit instance
       * @param options Options passed to Octokit constructor
       */
      function paginateRest(octokit) {
        return {
          paginate: Object.assign(paginate.bind(null, octokit), {
            iterator: iterator.bind(null, octokit),
          }),
        };
      }
      paginateRest.VERSION = VERSION;
      exports.composePaginateRest = composePaginateRest;
      exports.isPaginatingEndpoint = isPaginatingEndpoint;
      exports.paginateRest = paginateRest;
      exports.paginatingEndpoints = paginatingEndpoints;
      //# sourceMappingURL=index.js.map
      /***/
    },
    /***/ 8883: /***/ (__unused_webpack_module, exports) => {
      "use strict";

      Object.defineProperty(exports, "__esModule", { value: true });

      const VERSION = "1.0.4";

      /**
       * @param octokit Octokit instance
       * @param options Options passed to Octokit constructor
       */

      function requestLog(octokit) {
        octokit.hook.wrap("request", (request, options) => {
          octokit.log.debug("request", options);
          const start = Date.now();
          const requestOptions = octokit.request.endpoint.parse(options);
          const path = requestOptions.url.replace(options.baseUrl, "");
          return request(options)
            .then((response) => {
              octokit.log.info(
                `${requestOptions.method} ${path} - ${response.status} in ${
                  Date.now() - start
                }ms`
              );
              return response;
            })
            .catch((error) => {
              octokit.log.info(
                `${requestOptions.method} ${path} - ${error.status} in ${
                  Date.now() - start
                }ms`
              );
              throw error;
            });
        });
      }
      requestLog.VERSION = VERSION;
      exports.requestLog = requestLog;
      //# sourceMappingURL=index.js.map
      /***/
    },
    /***/ 3044: /***/ (__unused_webpack_module, exports) => {
      "use strict";

      Object.defineProperty(exports, "__esModule", { value: true });

      const Endpoints = {
        actions: {
          addCustomLabelsToSelfHostedRunnerForOrg: [
            "POST /orgs/{org}/actions/runners/{runner_id}/labels",
          ],
          addCustomLabelsToSelfHostedRunnerForRepo: [
            "POST /repos/{owner}/{repo}/actions/runners/{runner_id}/labels",
          ],
          addSelectedRepoToOrgSecret: [
            "PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}",
          ],
          addSelectedRepoToOrgVariable: [
            "PUT /orgs/{org}/actions/variables/{name}/repositories/{repository_id}",
          ],
          addSelectedRepoToRequiredWorkflow: [
            "PUT /orgs/{org}/actions/required_workflows/{required_workflow_id}/repositories/{repository_id}",
          ],
          approveWorkflowRun: [
            "POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve",
          ],
          cancelWorkflowRun: [
            "POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel",
          ],
          createEnvironmentVariable: [
            "POST /repositories/{repository_id}/environments/{environment_name}/variables",
          ],
          createOrUpdateEnvironmentSecret: [
            "PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}",
          ],
          createOrUpdateOrgSecret: [
            "PUT /orgs/{org}/actions/secrets/{secret_name}",
          ],
          createOrUpdateRepoSecret: [
            "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}",
          ],
          createOrgVariable: ["POST /orgs/{org}/actions/variables"],
          createRegistrationTokenForOrg: [
            "POST /orgs/{org}/actions/runners/registration-token",
          ],
          createRegistrationTokenForRepo: [
            "POST /repos/{owner}/{repo}/actions/runners/registration-token",
          ],
          createRemoveTokenForOrg: [
            "POST /orgs/{org}/actions/runners/remove-token",
          ],
          createRemoveTokenForRepo: [
            "POST /repos/{owner}/{repo}/actions/runners/remove-token",
          ],
          createRepoVariable: ["POST /repos/{owner}/{repo}/actions/variables"],
          createRequiredWorkflow: [
            "POST /orgs/{org}/actions/required_workflows",
          ],
          createWorkflowDispatch: [
            "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
          ],
          deleteActionsCacheById: [
            "DELETE /repos/{owner}/{repo}/actions/caches/{cache_id}",
          ],
          deleteActionsCacheByKey: [
            "DELETE /repos/{owner}/{repo}/actions/caches{?key,ref}",
          ],
          deleteArtifact: [
            "DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}",
          ],
          deleteEnvironmentSecret: [
            "DELETE /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}",
          ],
          deleteEnvironmentVariable: [
            "DELETE /repositories/{repository_id}/environments/{environment_name}/variables/{name}",
          ],
          deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
          deleteOrgVariable: ["DELETE /orgs/{org}/actions/variables/{name}"],
          deleteRepoSecret: [
            "DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}",
          ],
          deleteRepoVariable: [
            "DELETE /repos/{owner}/{repo}/actions/variables/{name}",
          ],
          deleteRequiredWorkflow: [
            "DELETE /orgs/{org}/actions/required_workflows/{required_workflow_id}",
          ],
          deleteSelfHostedRunnerFromOrg: [
            "DELETE /orgs/{org}/actions/runners/{runner_id}",
          ],
          deleteSelfHostedRunnerFromRepo: [
            "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}",
          ],
          deleteWorkflowRun: [
            "DELETE /repos/{owner}/{repo}/actions/runs/{run_id}",
          ],
          deleteWorkflowRunLogs: [
            "DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs",
          ],
          disableSelectedRepositoryGithubActionsOrganization: [
            "DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}",
          ],
          disableWorkflow: [
            "PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable",
          ],
          downloadArtifact: [
            "GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}",
          ],
          downloadJobLogsForWorkflowRun: [
            "GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs",
          ],
          downloadWorkflowRunAttemptLogs: [
            "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/logs",
          ],
          downloadWorkflowRunLogs: [
            "GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs",
          ],
          enableSelectedRepositoryGithubActionsOrganization: [
            "PUT /orgs/{org}/actions/permissions/repositories/{repository_id}",
          ],
          enableWorkflow: [
            "PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable",
          ],
          getActionsCacheList: ["GET /repos/{owner}/{repo}/actions/caches"],
          getActionsCacheUsage: [
            "GET /repos/{owner}/{repo}/actions/cache/usage",
          ],
          getActionsCacheUsageByRepoForOrg: [
            "GET /orgs/{org}/actions/cache/usage-by-repository",
          ],
          getActionsCacheUsageForOrg: ["GET /orgs/{org}/actions/cache/usage"],
          getAllowedActionsOrganization: [
            "GET /orgs/{org}/actions/permissions/selected-actions",
          ],
          getAllowedActionsRepository: [
            "GET /repos/{owner}/{repo}/actions/permissions/selected-actions",
          ],
          getArtifact: [
            "GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}",
          ],
          getEnvironmentPublicKey: [
            "GET /repositories/{repository_id}/environments/{environment_name}/secrets/public-key",
          ],
          getEnvironmentSecret: [
            "GET /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}",
          ],
          getEnvironmentVariable: [
            "GET /repositories/{repository_id}/environments/{environment_name}/variables/{name}",
          ],
          getGithubActionsDefaultWorkflowPermissionsOrganization: [
            "GET /orgs/{org}/actions/permissions/workflow",
          ],
          getGithubActionsDefaultWorkflowPermissionsRepository: [
            "GET /repos/{owner}/{repo}/actions/permissions/workflow",
          ],
          getGithubActionsPermissionsOrganization: [
            "GET /orgs/{org}/actions/permissions",
          ],
          getGithubActionsPermissionsRepository: [
            "GET /repos/{owner}/{repo}/actions/permissions",
          ],
          getJobForWorkflowRun: [
            "GET /repos/{owner}/{repo}/actions/jobs/{job_id}",
          ],
          getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
          getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
          getOrgVariable: ["GET /orgs/{org}/actions/variables/{name}"],
          getPendingDeploymentsForRun: [
            "GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments",
          ],
          getRepoPermissions: [
            "GET /repos/{owner}/{repo}/actions/permissions",
            {},
            {
              renamed: ["actions", "getGithubActionsPermissionsRepository"],
            },
          ],
          getRepoPublicKey: [
            "GET /repos/{owner}/{repo}/actions/secrets/public-key",
          ],
          getRepoRequiredWorkflow: [
            "GET /repos/{org}/{repo}/actions/required_workflows/{required_workflow_id_for_repo}",
          ],
          getRepoRequiredWorkflowUsage: [
            "GET /repos/{org}/{repo}/actions/required_workflows/{required_workflow_id_for_repo}/timing",
          ],
          getRepoSecret: [
            "GET /repos/{owner}/{repo}/actions/secrets/{secret_name}",
          ],
          getRepoVariable: [
            "GET /repos/{owner}/{repo}/actions/variables/{name}",
          ],
          getRequiredWorkflow: [
            "GET /orgs/{org}/actions/required_workflows/{required_workflow_id}",
          ],
          getReviewsForRun: [
            "GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals",
          ],
          getSelfHostedRunnerForOrg: [
            "GET /orgs/{org}/actions/runners/{runner_id}",
          ],
          getSelfHostedRunnerForRepo: [
            "GET /repos/{owner}/{repo}/actions/runners/{runner_id}",
          ],
          getWorkflow: [
            "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}",
          ],
          getWorkflowAccessToRepository: [
            "GET /repos/{owner}/{repo}/actions/permissions/access",
          ],
          getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
          getWorkflowRunAttempt: [
            "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}",
          ],
          getWorkflowRunUsage: [
            "GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing",
          ],
          getWorkflowUsage: [
            "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing",
          ],
          listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
          listEnvironmentSecrets: [
            "GET /repositories/{repository_id}/environments/{environment_name}/secrets",
          ],
          listEnvironmentVariables: [
            "GET /repositories/{repository_id}/environments/{environment_name}/variables",
          ],
          listJobsForWorkflowRun: [
            "GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs",
          ],
          listJobsForWorkflowRunAttempt: [
            "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs",
          ],
          listLabelsForSelfHostedRunnerForOrg: [
            "GET /orgs/{org}/actions/runners/{runner_id}/labels",
          ],
          listLabelsForSelfHostedRunnerForRepo: [
            "GET /repos/{owner}/{repo}/actions/runners/{runner_id}/labels",
          ],
          listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
          listOrgVariables: ["GET /orgs/{org}/actions/variables"],
          listRepoRequiredWorkflows: [
            "GET /repos/{org}/{repo}/actions/required_workflows",
          ],
          listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
          listRepoVariables: ["GET /repos/{owner}/{repo}/actions/variables"],
          listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
          listRequiredWorkflowRuns: [
            "GET /repos/{owner}/{repo}/actions/required_workflows/{required_workflow_id_for_repo}/runs",
          ],
          listRequiredWorkflows: ["GET /orgs/{org}/actions/required_workflows"],
          listRunnerApplicationsForOrg: [
            "GET /orgs/{org}/actions/runners/downloads",
          ],
          listRunnerApplicationsForRepo: [
            "GET /repos/{owner}/{repo}/actions/runners/downloads",
          ],
          listSelectedReposForOrgSecret: [
            "GET /orgs/{org}/actions/secrets/{secret_name}/repositories",
          ],
          listSelectedReposForOrgVariable: [
            "GET /orgs/{org}/actions/variables/{name}/repositories",
          ],
          listSelectedRepositoriesEnabledGithubActionsOrganization: [
            "GET /orgs/{org}/actions/permissions/repositories",
          ],
          listSelectedRepositoriesRequiredWorkflow: [
            "GET /orgs/{org}/actions/required_workflows/{required_workflow_id}/repositories",
          ],
          listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
          listSelfHostedRunnersForRepo: [
            "GET /repos/{owner}/{repo}/actions/runners",
          ],
          listWorkflowRunArtifacts: [
            "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts",
          ],
          listWorkflowRuns: [
            "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs",
          ],
          listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
          reRunJobForWorkflowRun: [
            "POST /repos/{owner}/{repo}/actions/jobs/{job_id}/rerun",
          ],
          reRunWorkflow: [
            "POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun",
          ],
          reRunWorkflowFailedJobs: [
            "POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun-failed-jobs",
          ],
          removeAllCustomLabelsFromSelfHostedRunnerForOrg: [
            "DELETE /orgs/{org}/actions/runners/{runner_id}/labels",
          ],
          removeAllCustomLabelsFromSelfHostedRunnerForRepo: [
            "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels",
          ],
          removeCustomLabelFromSelfHostedRunnerForOrg: [
            "DELETE /orgs/{org}/actions/runners/{runner_id}/labels/{name}",
          ],
          removeCustomLabelFromSelfHostedRunnerForRepo: [
            "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels/{name}",
          ],
          removeSelectedRepoFromOrgSecret: [
            "DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}",
          ],
          removeSelectedRepoFromOrgVariable: [
            "DELETE /orgs/{org}/actions/variables/{name}/repositories/{repository_id}",
          ],
          removeSelectedRepoFromRequiredWorkflow: [
            "DELETE /orgs/{org}/actions/required_workflows/{required_workflow_id}/repositories/{repository_id}",
          ],
          reviewPendingDeploymentsForRun: [
            "POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments",
          ],
          setAllowedActionsOrganization: [
            "PUT /orgs/{org}/actions/permissions/selected-actions",
          ],
          setAllowedActionsRepository: [
            "PUT /repos/{owner}/{repo}/actions/permissions/selected-actions",
          ],
          setCustomLabelsForSelfHostedRunnerForOrg: [
            "PUT /orgs/{org}/actions/runners/{runner_id}/labels",
          ],
          setCustomLabelsForSelfHostedRunnerForRepo: [
            "PUT /repos/{owner}/{repo}/actions/runners/{runner_id}/labels",
          ],
          setGithubActionsDefaultWorkflowPermissionsOrganization: [
            "PUT /orgs/{org}/actions/permissions/workflow",
          ],
          setGithubActionsDefaultWorkflowPermissionsRepository: [
            "PUT /repos/{owner}/{repo}/actions/permissions/workflow",
          ],
          setGithubActionsPermissionsOrganization: [
            "PUT /orgs/{org}/actions/permissions",
          ],
          setGithubActionsPermissionsRepository: [
            "PUT /repos/{owner}/{repo}/actions/permissions",
          ],
          setSelectedReposForOrgSecret: [
            "PUT /orgs/{org}/actions/secrets/{secret_name}/repositories",
          ],
          setSelectedReposForOrgVariable: [
            "PUT /orgs/{org}/actions/variables/{name}/repositories",
          ],
          setSelectedReposToRequiredWorkflow: [
            "PUT /orgs/{org}/actions/required_workflows/{required_workflow_id}/repositories",
          ],
          setSelectedRepositoriesEnabledGithubActionsOrganization: [
            "PUT /orgs/{org}/actions/permissions/repositories",
          ],
          setWorkflowAccessToRepository: [
            "PUT /repos/{owner}/{repo}/actions/permissions/access",
          ],
          updateEnvironmentVariable: [
            "PATCH /repositories/{repository_id}/environments/{environment_name}/variables/{name}",
          ],
          updateOrgVariable: ["PATCH /orgs/{org}/actions/variables/{name}"],
          updateRepoVariable: [
            "PATCH /repos/{owner}/{repo}/actions/variables/{name}",
          ],
          updateRequiredWorkflow: [
            "PATCH /orgs/{org}/actions/required_workflows/{required_workflow_id}",
          ],
        activity: {
          checkRepoIsStarredByAuthenticatedUser: [
            "GET /user/starred/{owner}/{repo}",
          ],
          deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
          deleteThreadSubscription: [
            "DELETE /notifications/threads/{thread_id}/subscription",
          ],
          getFeeds: ["GET /feeds"],
          getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
          getThread: ["GET /notifications/threads/{thread_id}"],
          getThreadSubscriptionForAuthenticatedUser: [
            "GET /notifications/threads/{thread_id}/subscription",
          ],
          listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
          listNotificationsForAuthenticatedUser: ["GET /notifications"],
          listOrgEventsForAuthenticatedUser: [
            "GET /users/{username}/events/orgs/{org}",
          ],
          listPublicEvents: ["GET /events"],
          listPublicEventsForRepoNetwork: [
            "GET /networks/{owner}/{repo}/events",
          ],
          listPublicEventsForUser: ["GET /users/{username}/events/public"],
          listPublicOrgEvents: ["GET /orgs/{org}/events"],
          listReceivedEventsForUser: ["GET /users/{username}/received_events"],
          listReceivedPublicEventsForUser: [
            "GET /users/{username}/received_events/public",
          ],
          listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
          listRepoNotificationsForAuthenticatedUser: [
            "GET /repos/{owner}/{repo}/notifications",
          ],
          listReposStarredByAuthenticatedUser: ["GET /user/starred"],
          listReposStarredByUser: ["GET /users/{username}/starred"],
          listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
          listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
          listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
          listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
          markNotificationsAsRead: ["PUT /notifications"],
          markRepoNotificationsAsRead: [
            "PUT /repos/{owner}/{repo}/notifications",
          ],
          markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
          setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
          setThreadSubscription: [
            "PUT /notifications/threads/{thread_id}/subscription",
          ],
          starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
          unstarRepoForAuthenticatedUser: [
            "DELETE /user/starred/{owner}/{repo}",
          ],
        apps: {
          addRepoToInstallation: [
            "PUT /user/installations/{installation_id}/repositories/{repository_id}",
            {},
            {
              renamed: ["apps", "addRepoToInstallationForAuthenticatedUser"],
            },
          ],
          addRepoToInstallationForAuthenticatedUser: [
            "PUT /user/installations/{installation_id}/repositories/{repository_id}",
          ],
          checkToken: ["POST /applications/{client_id}/token"],
          createFromManifest: ["POST /app-manifests/{code}/conversions"],
          createInstallationAccessToken: [
            "POST /app/installations/{installation_id}/access_tokens",
          ],
          deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
          deleteInstallation: ["DELETE /app/installations/{installation_id}"],
          deleteToken: ["DELETE /applications/{client_id}/token"],
          getAuthenticated: ["GET /app"],
          getBySlug: ["GET /apps/{app_slug}"],
          getInstallation: ["GET /app/installations/{installation_id}"],
          getOrgInstallation: ["GET /orgs/{org}/installation"],
          getRepoInstallation: ["GET /repos/{owner}/{repo}/installation"],
          getSubscriptionPlanForAccount: [
            "GET /marketplace_listing/accounts/{account_id}",
          ],
          getSubscriptionPlanForAccountStubbed: [
            "GET /marketplace_listing/stubbed/accounts/{account_id}",
          ],
          getUserInstallation: ["GET /users/{username}/installation"],
          getWebhookConfigForApp: ["GET /app/hook/config"],
          getWebhookDelivery: ["GET /app/hook/deliveries/{delivery_id}"],
          listAccountsForPlan: [
            "GET /marketplace_listing/plans/{plan_id}/accounts",
          ],
          listAccountsForPlanStubbed: [
            "GET /marketplace_listing/stubbed/plans/{plan_id}/accounts",
          ],
          listInstallationReposForAuthenticatedUser: [
            "GET /user/installations/{installation_id}/repositories",
          ],
          listInstallations: ["GET /app/installations"],
          listInstallationsForAuthenticatedUser: ["GET /user/installations"],
          listPlans: ["GET /marketplace_listing/plans"],
          listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
          listReposAccessibleToInstallation: ["GET /installation/repositories"],
          listSubscriptionsForAuthenticatedUser: [
            "GET /user/marketplace_purchases",
          ],
          listSubscriptionsForAuthenticatedUserStubbed: [
            "GET /user/marketplace_purchases/stubbed",
          ],
          listWebhookDeliveries: ["GET /app/hook/deliveries"],
          redeliverWebhookDelivery: [
            "POST /app/hook/deliveries/{delivery_id}/attempts",
          ],
          removeRepoFromInstallation: [
            "DELETE /user/installations/{installation_id}/repositories/{repository_id}",
            {},
            {
              renamed: [
                "apps",
                "removeRepoFromInstallationForAuthenticatedUser",
              ],
            },
          ],
          removeRepoFromInstallationForAuthenticatedUser: [
            "DELETE /user/installations/{installation_id}/repositories/{repository_id}",
          ],
          resetToken: ["PATCH /applications/{client_id}/token"],
          revokeInstallationAccessToken: ["DELETE /installation/token"],
          scopeToken: ["POST /applications/{client_id}/token/scoped"],
          suspendInstallation: [
            "PUT /app/installations/{installation_id}/suspended",
          ],
          unsuspendInstallation: [
            "DELETE /app/installations/{installation_id}/suspended",
          ],
          updateWebhookConfigForApp: ["PATCH /app/hook/config"],
        billing: {
          getGithubActionsBillingOrg: [
            "GET /orgs/{org}/settings/billing/actions",
          ],
          getGithubActionsBillingUser: [
            "GET /users/{username}/settings/billing/actions",
          ],
          getGithubPackagesBillingOrg: [
            "GET /orgs/{org}/settings/billing/packages",
          ],
          getGithubPackagesBillingUser: [
            "GET /users/{username}/settings/billing/packages",
          ],
          getSharedStorageBillingOrg: [
            "GET /orgs/{org}/settings/billing/shared-storage",
          ],
          getSharedStorageBillingUser: [
            "GET /users/{username}/settings/billing/shared-storage",
          ],
        },
        checks: {
          create: ["POST /repos/{owner}/{repo}/check-runs"],
          createSuite: ["POST /repos/{owner}/{repo}/check-suites"],
          get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}"],
          getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}"],
          listAnnotations: [
            "GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations",
          ],
          listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs"],
          listForSuite: [
            "GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs",
          ],
          listSuitesForRef: [
            "GET /repos/{owner}/{repo}/commits/{ref}/check-suites",
          ],
          rerequestRun: [
            "POST /repos/{owner}/{repo}/check-runs/{check_run_id}/rerequest",
          ],
          rerequestSuite: [
            "POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest",
          ],
          setSuitesPreferences: [
            "PATCH /repos/{owner}/{repo}/check-suites/preferences",
          ],
          update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}"],
        },
        codeScanning: {
          deleteAnalysis: [
            "DELETE /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}{?confirm_delete}",
          ],
          getAlert: [
            "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}",
            {},
            {
              renamedParameters: {
                alert_id: "alert_number",
              },
            },
          ],
          getAnalysis: [
            "GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}",
          ],
          getCodeqlDatabase: [
            "GET /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}",
          ],
          getSarif: [
            "GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}",
          ],
          listAlertInstances: [
            "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
          ],
          listAlertsForOrg: ["GET /orgs/{org}/code-scanning/alerts"],
          listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"],
          listAlertsInstances: [
            "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
            {},
            {
              renamed: ["codeScanning", "listAlertInstances"],
            },
          ],
          listCodeqlDatabases: [
            "GET /repos/{owner}/{repo}/code-scanning/codeql/databases",
          ],
          listRecentAnalyses: [
            "GET /repos/{owner}/{repo}/code-scanning/analyses",
          ],
          updateAlert: [
            "PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}",
          ],
          uploadSarif: ["POST /repos/{owner}/{repo}/code-scanning/sarifs"],
        },
        codesOfConduct: {
          getAllCodesOfConduct: ["GET /codes_of_conduct"],
          getConductCode: ["GET /codes_of_conduct/{key}"],
        },
        codespaces: {
          addRepositoryForSecretForAuthenticatedUser: [
            "PUT /user/codespaces/secrets/{secret_name}/repositories/{repository_id}",
          ],
          addSelectedRepoToOrgSecret: [
            "PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}",
          ],
          codespaceMachinesForAuthenticatedUser: [
            "GET /user/codespaces/{codespace_name}/machines",
          ],
          createForAuthenticatedUser: ["POST /user/codespaces"],
          createOrUpdateOrgSecret: [
            "PUT /orgs/{org}/codespaces/secrets/{secret_name}",
          ],
          createOrUpdateRepoSecret: [
            "PUT /repos/{owner}/{repo}/codespaces/secrets/{secret_name}",
          ],
          createOrUpdateSecretForAuthenticatedUser: [
            "PUT /user/codespaces/secrets/{secret_name}",
          ],
          createWithPrForAuthenticatedUser: [
            "POST /repos/{owner}/{repo}/pulls/{pull_number}/codespaces",
          ],
          createWithRepoForAuthenticatedUser: [
            "POST /repos/{owner}/{repo}/codespaces",
          ],
          deleteForAuthenticatedUser: [
            "DELETE /user/codespaces/{codespace_name}",
          ],
          deleteFromOrganization: [
            "DELETE /orgs/{org}/members/{username}/codespaces/{codespace_name}",
          ],
          deleteOrgSecret: [
            "DELETE /orgs/{org}/codespaces/secrets/{secret_name}",
          ],
          deleteRepoSecret: [
            "DELETE /repos/{owner}/{repo}/codespaces/secrets/{secret_name}",
          ],
          deleteSecretForAuthenticatedUser: [
            "DELETE /user/codespaces/secrets/{secret_name}",
          ],
          exportForAuthenticatedUser: [
            "POST /user/codespaces/{codespace_name}/exports",
          ],
          getCodespacesForUserInOrg: [
            "GET /orgs/{org}/members/{username}/codespaces",
          ],
          getExportDetailsForAuthenticatedUser: [
            "GET /user/codespaces/{codespace_name}/exports/{export_id}",
          ],
          getForAuthenticatedUser: ["GET /user/codespaces/{codespace_name}"],
          getOrgPublicKey: ["GET /orgs/{org}/codespaces/secrets/public-key"],
          getOrgSecret: ["GET /orgs/{org}/codespaces/secrets/{secret_name}"],
          getPublicKeyForAuthenticatedUser: [
            "GET /user/codespaces/secrets/public-key",
          ],
          getRepoPublicKey: [
            "GET /repos/{owner}/{repo}/codespaces/secrets/public-key",
          ],
          getRepoSecret: [
            "GET /repos/{owner}/{repo}/codespaces/secrets/{secret_name}",
          ],
          getSecretForAuthenticatedUser: [
            "GET /user/codespaces/secrets/{secret_name}",
          ],
          listDevcontainersInRepositoryForAuthenticatedUser: [
            "GET /repos/{owner}/{repo}/codespaces/devcontainers",
          ],
          listForAuthenticatedUser: ["GET /user/codespaces"],
          listInOrganization: [
            "GET /orgs/{org}/codespaces",
            {},
            {
              renamedParameters: {
                org_id: "org",
              },
            },
          ],
          listInRepositoryForAuthenticatedUser: [
            "GET /repos/{owner}/{repo}/codespaces",
          ],
          listOrgSecrets: ["GET /orgs/{org}/codespaces/secrets"],
          listRepoSecrets: ["GET /repos/{owner}/{repo}/codespaces/secrets"],
          listRepositoriesForSecretForAuthenticatedUser: [
            "GET /user/codespaces/secrets/{secret_name}/repositories",
          ],
          listSecretsForAuthenticatedUser: ["GET /user/codespaces/secrets"],
          listSelectedReposForOrgSecret: [
            "GET /orgs/{org}/codespaces/secrets/{secret_name}/repositories",
          ],
          preFlightWithRepoForAuthenticatedUser: [
            "GET /repos/{owner}/{repo}/codespaces/new",
          ],
          publishForAuthenticatedUser: [
            "POST /user/codespaces/{codespace_name}/publish",
          ],
          removeRepositoryForSecretForAuthenticatedUser: [
            "DELETE /user/codespaces/secrets/{secret_name}/repositories/{repository_id}",
          ],
          removeSelectedRepoFromOrgSecret: [
            "DELETE /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}",
          ],
          repoMachinesForAuthenticatedUser: [
            "GET /repos/{owner}/{repo}/codespaces/machines",
          ],
          setCodespacesBilling: ["PUT /orgs/{org}/codespaces/billing"],
          setRepositoriesForSecretForAuthenticatedUser: [
            "PUT /user/codespaces/secrets/{secret_name}/repositories",
          ],
          setSelectedReposForOrgSecret: [
            "PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories",
          ],
          startForAuthenticatedUser: [
            "POST /user/codespaces/{codespace_name}/start",
          ],
          stopForAuthenticatedUser: [
            "POST /user/codespaces/{codespace_name}/stop",
          ],
          stopInOrganization: [
            "POST /orgs/{org}/members/{username}/codespaces/{codespace_name}/stop",
          ],
          updateForAuthenticatedUser: [
            "PATCH /user/codespaces/{codespace_name}",
          ],
        },
        dependabot: {
          addSelectedRepoToOrgSecret: [
            "PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}",
          ],
          createOrUpdateOrgSecret: [
            "PUT /orgs/{org}/dependabot/secrets/{secret_name}",
          ],
          createOrUpdateRepoSecret: [
            "PUT /repos/{owner}/{repo}/dependabot/secrets/{secret_name}",
          ],
          deleteOrgSecret: [
            "DELETE /orgs/{org}/dependabot/secrets/{secret_name}",
          ],
          deleteRepoSecret: [
            "DELETE /repos/{owner}/{repo}/dependabot/secrets/{secret_name}",
          ],
          getAlert: [
            "GET /repos/{owner}/{repo}/dependabot/alerts/{alert_number}",
          ],
          getOrgPublicKey: ["GET /orgs/{org}/dependabot/secrets/public-key"],
          getOrgSecret: ["GET /orgs/{org}/dependabot/secrets/{secret_name}"],
          getRepoPublicKey: [
            "GET /repos/{owner}/{repo}/dependabot/secrets/public-key",
          ],
          getRepoSecret: [
            "GET /repos/{owner}/{repo}/dependabot/secrets/{secret_name}",
          ],
          listAlertsForEnterprise: [
            "GET /enterprises/{enterprise}/dependabot/alerts",
          ],
          listAlertsForOrg: ["GET /orgs/{org}/dependabot/alerts"],
          listAlertsForRepo: ["GET /repos/{owner}/{repo}/dependabot/alerts"],
          listOrgSecrets: ["GET /orgs/{org}/dependabot/secrets"],
          listRepoSecrets: ["GET /repos/{owner}/{repo}/dependabot/secrets"],
          listSelectedReposForOrgSecret: [
            "GET /orgs/{org}/dependabot/secrets/{secret_name}/repositories",
          ],
          removeSelectedRepoFromOrgSecret: [
            "DELETE /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}",
          ],
          setSelectedReposForOrgSecret: [
            "PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories",
          ],
          updateAlert: [
            "PATCH /repos/{owner}/{repo}/dependabot/alerts/{alert_number}",
          ],
        },
        dependencyGraph: {
          createRepositorySnapshot: [
            "POST /repos/{owner}/{repo}/dependency-graph/snapshots",
          ],
          diffRange: [
            "GET /repos/{owner}/{repo}/dependency-graph/compare/{basehead}",
          ],
        },
        emojis: {
          get: ["GET /emojis"],
        },
        enterpriseAdmin: {
          addCustomLabelsToSelfHostedRunnerForEnterprise: [
            "POST /enterprises/{enterprise}/actions/runners/{runner_id}/labels",
          ],
          enableSelectedOrganizationGithubActionsEnterprise: [
            "PUT /enterprises/{enterprise}/actions/permissions/organizations/{org_id}",
          ],
          listLabelsForSelfHostedRunnerForEnterprise: [
            "GET /enterprises/{enterprise}/actions/runners/{runner_id}/labels",
          ],
        },
        gists: {
          checkIsStarred: ["GET /gists/{gist_id}/star"],
          create: ["POST /gists"],
          createComment: ["POST /gists/{gist_id}/comments"],
          delete: ["DELETE /gists/{gist_id}"],
          deleteComment: ["DELETE /gists/{gist_id}/comments/{comment_id}"],
          fork: ["POST /gists/{gist_id}/forks"],
          get: ["GET /gists/{gist_id}"],
          getComment: ["GET /gists/{gist_id}/comments/{comment_id}"],
          getRevision: ["GET /gists/{gist_id}/{sha}"],
          list: ["GET /gists"],
          listComments: ["GET /gists/{gist_id}/comments"],
          listCommits: ["GET /gists/{gist_id}/commits"],
          listForUser: ["GET /users/{username}/gists"],
          listForks: ["GET /gists/{gist_id}/forks"],
          listPublic: ["GET /gists/public"],
          listStarred: ["GET /gists/starred"],
          star: ["PUT /gists/{gist_id}/star"],
          unstar: ["DELETE /gists/{gist_id}/star"],
          update: ["PATCH /gists/{gist_id}"],
          updateComment: ["PATCH /gists/{gist_id}/comments/{comment_id}"],
        },
        git: {
          createBlob: ["POST /repos/{owner}/{repo}/git/blobs"],
          createCommit: ["POST /repos/{owner}/{repo}/git/commits"],
          createRef: ["POST /repos/{owner}/{repo}/git/refs"],
          createTag: ["POST /repos/{owner}/{repo}/git/tags"],
          createTree: ["POST /repos/{owner}/{repo}/git/trees"],
          deleteRef: ["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],
          getBlob: ["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],
          getCommit: ["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],
          getRef: ["GET /repos/{owner}/{repo}/git/ref/{ref}"],
          getTag: ["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],
          getTree: ["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],
          listMatchingRefs: [
            "GET /repos/{owner}/{repo}/git/matching-refs/{ref}",
          ],
          updateRef: ["PATCH /repos/{owner}/{repo}/git/refs/{ref}"],
        },
        gitignore: {
          getAllTemplates: ["GET /gitignore/templates"],
          getTemplate: ["GET /gitignore/templates/{name}"],
        },
        interactions: {
          getRestrictionsForAuthenticatedUser: ["GET /user/interaction-limits"],
          getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits"],
          getRestrictionsForRepo: [
            "GET /repos/{owner}/{repo}/interaction-limits",
          ],
          getRestrictionsForYourPublicRepos: [
            "GET /user/interaction-limits",
            {},
            {
              renamed: ["interactions", "getRestrictionsForAuthenticatedUser"],
            },
          ],
          removeRestrictionsForAuthenticatedUser: [
            "DELETE /user/interaction-limits",
          ],
          removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits"],
          removeRestrictionsForRepo: [
            "DELETE /repos/{owner}/{repo}/interaction-limits",
          ],
          removeRestrictionsForYourPublicRepos: [
            "DELETE /user/interaction-limits",
            {},
            {
              renamed: [
                "interactions",
                "removeRestrictionsForAuthenticatedUser",
              ],
            },
          ],
          setRestrictionsForAuthenticatedUser: ["PUT /user/interaction-limits"],
          setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits"],
          setRestrictionsForRepo: [
            "PUT /repos/{owner}/{repo}/interaction-limits",
          ],
          setRestrictionsForYourPublicRepos: [
            "PUT /user/interaction-limits",
            {},
            {
              renamed: ["interactions", "setRestrictionsForAuthenticatedUser"],
            },
          ],
        },
        issues: {
          addAssignees: [
            "POST /repos/{owner}/{repo}/issues/{issue_number}/assignees",
          ],
          addLabels: [
            "POST /repos/{owner}/{repo}/issues/{issue_number}/labels",
          ],
          checkUserCanBeAssigned: [
            "GET /repos/{owner}/{repo}/assignees/{assignee}",
          ],
          checkUserCanBeAssignedToIssue: [
            "GET /repos/{owner}/{repo}/issues/{issue_number}/assignees/{assignee}",
          ],
          create: ["POST /repos/{owner}/{repo}/issues"],
          createComment: [
            "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
          ],
          createLabel: ["POST /repos/{owner}/{repo}/labels"],
          createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
          deleteComment: [
            "DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}",
          ],
          deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
          deleteMilestone: [
            "DELETE /repos/{owner}/{repo}/milestones/{milestone_number}",
          ],
          get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
          getComment: [
            "GET /repos/{owner}/{repo}/issues/comments/{comment_id}",
          ],
          getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
          getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
          getMilestone: [
            "GET /repos/{owner}/{repo}/milestones/{milestone_number}",
          ],
          list: ["GET /issues"],
          listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
          listComments: [
            "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
          ],
          listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
          listEvents: [
            "GET /repos/{owner}/{repo}/issues/{issue_number}/events",
          ],
          listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
          listEventsForTimeline: [
            "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline",
          ],
          listForAuthenticatedUser: ["GET /user/issues"],
          listForOrg: ["GET /orgs/{org}/issues"],
          listForRepo: ["GET /repos/{owner}/{repo}/issues"],
          listLabelsForMilestone: [
            "GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels",
          ],
          listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
          listLabelsOnIssue: [
            "GET /repos/{owner}/{repo}/issues/{issue_number}/labels",
          ],
          listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
          lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
          removeAllLabels: [
            "DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels",
          ],
          removeAssignees: [
            "DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees",
          ],
          removeLabel: [
            "DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}",
          ],
          setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
          unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
          update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
          updateComment: [
            "PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}",
          ],
          updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
          updateMilestone: [
            "PATCH /repos/{owner}/{repo}/milestones/{milestone_number}",
          ],
        },
        licenses: {
          get: ["GET /licenses/{license}"],
          getAllCommonlyUsed: ["GET /licenses"],
          getForRepo: ["GET /repos/{owner}/{repo}/license"],
        },
        markdown: {
          render: ["POST /markdown"],
          renderRaw: [
            "POST /markdown/raw",
            {
              headers: {
                "content-type": "text/plain; charset=utf-8",
              },
            },
          ],
        },
        meta: {
          get: ["GET /meta"],
          getAllVersions: ["GET /versions"],
          getOctocat: ["GET /octocat"],
          getZen: ["GET /zen"],
          root: ["GET /"],
        },
        migrations: {
          cancelImport: ["DELETE /repos/{owner}/{repo}/import"],
          deleteArchiveForAuthenticatedUser: [
            "DELETE /user/migrations/{migration_id}/archive",
          ],
          deleteArchiveForOrg: [
            "DELETE /orgs/{org}/migrations/{migration_id}/archive",
          ],
          downloadArchiveForOrg: [
            "GET /orgs/{org}/migrations/{migration_id}/archive",
          ],
          getArchiveForAuthenticatedUser: [
            "GET /user/migrations/{migration_id}/archive",
          ],
          getCommitAuthors: ["GET /repos/{owner}/{repo}/import/authors"],
          getImportStatus: ["GET /repos/{owner}/{repo}/import"],
          getLargeFiles: ["GET /repos/{owner}/{repo}/import/large_files"],
          getStatusForAuthenticatedUser: [
            "GET /user/migrations/{migration_id}",
          ],
          getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}"],
          listForAuthenticatedUser: ["GET /user/migrations"],
          listForOrg: ["GET /orgs/{org}/migrations"],
          listReposForAuthenticatedUser: [
            "GET /user/migrations/{migration_id}/repositories",
          ],
          listReposForOrg: [
            "GET /orgs/{org}/migrations/{migration_id}/repositories",
          ],
          listReposForUser: [
            "GET /user/migrations/{migration_id}/repositories",
            {},
            {
              renamed: ["migrations", "listReposForAuthenticatedUser"],
            },
          ],
          mapCommitAuthor: [
            "PATCH /repos/{owner}/{repo}/import/authors/{author_id}",
          ],
          setLfsPreference: ["PATCH /repos/{owner}/{repo}/import/lfs"],
          startForAuthenticatedUser: ["POST /user/migrations"],
          startForOrg: ["POST /orgs/{org}/migrations"],
          startImport: ["PUT /repos/{owner}/{repo}/import"],
          unlockRepoForAuthenticatedUser: [
            "DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock",
          ],
          unlockRepoForOrg: [
            "DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock",
          ],
          updateImport: ["PATCH /repos/{owner}/{repo}/import"],
        },
        orgs: {
          addSecurityManagerTeam: [
            "PUT /orgs/{org}/security-managers/teams/{team_slug}",
          ],
          blockUser: ["PUT /orgs/{org}/blocks/{username}"],
          cancelInvitation: ["DELETE /orgs/{org}/invitations/{invitation_id}"],
          checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
          checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
          checkPublicMembershipForUser: [
            "GET /orgs/{org}/public_members/{username}",
          ],
          convertMemberToOutsideCollaborator: [
            "PUT /orgs/{org}/outside_collaborators/{username}",
          ],
          createInvitation: ["POST /orgs/{org}/invitations"],
          createWebhook: ["POST /orgs/{org}/hooks"],
          deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
          enableOrDisableSecurityProductOnAllOrgRepos: [
            "POST /orgs/{org}/{security_product}/{enablement}",
          ],
          get: ["GET /orgs/{org}"],
          getMembershipForAuthenticatedUser: [
            "GET /user/memberships/orgs/{org}",
          ],
          getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
          getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
          getWebhookConfigForOrg: ["GET /orgs/{org}/hooks/{hook_id}/config"],
          getWebhookDelivery: [
            "GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}",
          ],
          list: ["GET /organizations"],
          listAppInstallations: ["GET /orgs/{org}/installations"],
          listBlockedUsers: ["GET /orgs/{org}/blocks"],
          listFailedInvitations: ["GET /orgs/{org}/failed_invitations"],
          listForAuthenticatedUser: ["GET /user/orgs"],
          listForUser: ["GET /users/{username}/orgs"],
          listInvitationTeams: [
            "GET /orgs/{org}/invitations/{invitation_id}/teams",
          ],
          listMembers: ["GET /orgs/{org}/members"],
          listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
          listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
          listPendingInvitations: ["GET /orgs/{org}/invitations"],
          listPublicMembers: ["GET /orgs/{org}/public_members"],
          listSecurityManagerTeams: ["GET /orgs/{org}/security-managers"],
          listWebhookDeliveries: ["GET /orgs/{org}/hooks/{hook_id}/deliveries"],
          listWebhooks: ["GET /orgs/{org}/hooks"],
          pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
          redeliverWebhookDelivery: [
            "POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts",
          ],
          removeMember: ["DELETE /orgs/{org}/members/{username}"],
          removeMembershipForUser: [
            "DELETE /orgs/{org}/memberships/{username}",
          ],
          removeOutsideCollaborator: [
            "DELETE /orgs/{org}/outside_collaborators/{username}",
          ],
          removePublicMembershipForAuthenticatedUser: [
            "DELETE /orgs/{org}/public_members/{username}",
          ],
          removeSecurityManagerTeam: [
            "DELETE /orgs/{org}/security-managers/teams/{team_slug}",
          ],
          setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
          setPublicMembershipForAuthenticatedUser: [
            "PUT /orgs/{org}/public_members/{username}",
          ],
          unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
          update: ["PATCH /orgs/{org}"],
          updateMembershipForAuthenticatedUser: [
            "PATCH /user/memberships/orgs/{org}",
          ],
          updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"],
          updateWebhookConfigForOrg: [
            "PATCH /orgs/{org}/hooks/{hook_id}/config",
          ],
        },
        packages: {
          deletePackageForAuthenticatedUser: [
            "DELETE /user/packages/{package_type}/{package_name}",
          ],
          deletePackageForOrg: [
            "DELETE /orgs/{org}/packages/{package_type}/{package_name}",
          ],
          deletePackageForUser: [
            "DELETE /users/{username}/packages/{package_type}/{package_name}",
          ],
          deletePackageVersionForAuthenticatedUser: [
            "DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}",
          ],
          deletePackageVersionForOrg: [
            "DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}",
          ],
          deletePackageVersionForUser: [
            "DELETE /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}",
          ],
          getAllPackageVersionsForAPackageOwnedByAnOrg: [
            "GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
            {},
            {
              renamed: [
                "packages",
                "getAllPackageVersionsForPackageOwnedByOrg",
              ],
            },
          ],
          getAllPackageVersionsForAPackageOwnedByTheAuthenticatedUser: [
            "GET /user/packages/{package_type}/{package_name}/versions",
            {},
            {
              renamed: [
                "packages",
                "getAllPackageVersionsForPackageOwnedByAuthenticatedUser",
              ],
            },
          ],
          getAllPackageVersionsForPackageOwnedByAuthenticatedUser: [
            "GET /user/packages/{package_type}/{package_name}/versions",
          ],
          getAllPackageVersionsForPackageOwnedByOrg: [
            "GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
          ],
          getAllPackageVersionsForPackageOwnedByUser: [
            "GET /users/{username}/packages/{package_type}/{package_name}/versions",
          ],
          getPackageForAuthenticatedUser: [
            "GET /user/packages/{package_type}/{package_name}",
          ],
          getPackageForOrganization: [
            "GET /orgs/{org}/packages/{package_type}/{package_name}",
          ],
          getPackageForUser: [
            "GET /users/{username}/packages/{package_type}/{package_name}",
          ],
          getPackageVersionForAuthenticatedUser: [
            "GET /user/packages/{package_type}/{package_name}/versions/{package_version_id}",
          ],
          getPackageVersionForOrganization: [
            "GET /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}",
          ],
          getPackageVersionForUser: [
            "GET /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}",
          ],
          listPackagesForAuthenticatedUser: ["GET /user/packages"],
          listPackagesForOrganization: ["GET /orgs/{org}/packages"],
          listPackagesForUser: ["GET /users/{username}/packages"],
          restorePackageForAuthenticatedUser: [
            "POST /user/packages/{package_type}/{package_name}/restore{?token}",
          ],
          restorePackageForOrg: [
            "POST /orgs/{org}/packages/{package_type}/{package_name}/restore{?token}",
          ],
          restorePackageForUser: [
            "POST /users/{username}/packages/{package_type}/{package_name}/restore{?token}",
          ],
          restorePackageVersionForAuthenticatedUser: [
            "POST /user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore",
          ],
          restorePackageVersionForOrg: [
            "POST /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore",
          ],
          restorePackageVersionForUser: [
            "POST /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore",
          ],
        },
        projects: {
          addCollaborator: [
            "PUT /projects/{project_id}/collaborators/{username}",
          ],
          createCard: ["POST /projects/columns/{column_id}/cards"],
          createColumn: ["POST /projects/{project_id}/columns"],
          createForAuthenticatedUser: ["POST /user/projects"],
          createForOrg: ["POST /orgs/{org}/projects"],
          createForRepo: ["POST /repos/{owner}/{repo}/projects"],
          delete: ["DELETE /projects/{project_id}"],
          deleteCard: ["DELETE /projects/columns/cards/{card_id}"],
          deleteColumn: ["DELETE /projects/columns/{column_id}"],
          get: ["GET /projects/{project_id}"],
          getCard: ["GET /projects/columns/cards/{card_id}"],
          getColumn: ["GET /projects/columns/{column_id}"],
          getPermissionForUser: [
            "GET /projects/{project_id}/collaborators/{username}/permission",
          ],
          listCards: ["GET /projects/columns/{column_id}/cards"],
          listCollaborators: ["GET /projects/{project_id}/collaborators"],
          listColumns: ["GET /projects/{project_id}/columns"],
          listForOrg: ["GET /orgs/{org}/projects"],
          listForRepo: ["GET /repos/{owner}/{repo}/projects"],
          listForUser: ["GET /users/{username}/projects"],
          moveCard: ["POST /projects/columns/cards/{card_id}/moves"],
          moveColumn: ["POST /projects/columns/{column_id}/moves"],
          removeCollaborator: [
            "DELETE /projects/{project_id}/collaborators/{username}",
          ],
          update: ["PATCH /projects/{project_id}"],
          updateCard: ["PATCH /projects/columns/cards/{card_id}"],
          updateColumn: ["PATCH /projects/columns/{column_id}"],
        },
        pulls: {
          checkIfMerged: [
            "GET /repos/{owner}/{repo}/pulls/{pull_number}/merge",
          ],
          create: ["POST /repos/{owner}/{repo}/pulls"],
          createReplyForReviewComment: [
            "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies",
          ],
          createReview: [
            "POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
          ],
          createReviewComment: [
            "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
          ],
          deletePendingReview: [
            "DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}",
          ],
          deleteReviewComment: [
            "DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}",
          ],
          dismissReview: [
            "PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals",
          ],
          get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
          getReview: [
            "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}",
          ],
          getReviewComment: [
            "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}",
          ],
          list: ["GET /repos/{owner}/{repo}/pulls"],
          listCommentsForReview: [
            "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments",
          ],
          listCommits: [
            "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
          ],
          listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
          listRequestedReviewers: [
            "GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
          ],
          listReviewComments: [
            "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
          ],
          listReviewCommentsForRepo: [
            "GET /repos/{owner}/{repo}/pulls/comments",
          ],
          listReviews: [
            "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
          ],
          merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
          removeRequestedReviewers: [
            "DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
          ],
          requestReviewers: [
            "POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
          ],
          submitReview: [
            "POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events",
          ],
          update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
          updateBranch: [
            "PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch",
          ],
          updateReview: [
            "PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}",
          ],
          updateReviewComment: [
            "PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}",
          ],
        },
        rateLimit: {
          get: ["GET /rate_limit"],
        },
        reactions: {
          createForCommitComment: [
            "POST /repos/{owner}/{repo}/comments/{comment_id}/reactions",
          ],
          createForIssue: [
            "POST /repos/{owner}/{repo}/issues/{issue_number}/reactions",
          ],
          createForIssueComment: [
            "POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions",
          ],
          createForPullRequestReviewComment: [
            "POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions",
          ],
          createForRelease: [
            "POST /repos/{owner}/{repo}/releases/{release_id}/reactions",
          ],
          createForTeamDiscussionCommentInOrg: [
            "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions",
          ],
          createForTeamDiscussionInOrg: [
            "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions",
          ],
          deleteForCommitComment: [
            "DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}",
          ],
          deleteForIssue: [
            "DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}",
          ],
          deleteForIssueComment: [
            "DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}",
          ],
          deleteForPullRequestComment: [
            "DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}",
          ],
          deleteForRelease: [
            "DELETE /repos/{owner}/{repo}/releases/{release_id}/reactions/{reaction_id}",
          ],
          deleteForTeamDiscussion: [
            "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}",
          ],
          deleteForTeamDiscussionComment: [
            "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}",
          ],
          listForCommitComment: [
            "GET /repos/{owner}/{repo}/comments/{comment_id}/reactions",
          ],
          listForIssue: [
            "GET /repos/{owner}/{repo}/issues/{issue_number}/reactions",
          ],
          listForIssueComment: [
            "GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions",
          ],
          listForPullRequestReviewComment: [
            "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions",
          ],
          listForRelease: [
            "GET /repos/{owner}/{repo}/releases/{release_id}/reactions",
          ],
          listForTeamDiscussionCommentInOrg: [
            "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions",
          ],
          listForTeamDiscussionInOrg: [
            "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions",
          ],
        },
        repos: {
          acceptInvitation: [
            "PATCH /user/repository_invitations/{invitation_id}",
            {},
            {
              renamed: ["repos", "acceptInvitationForAuthenticatedUser"],
            },
          ],
          acceptInvitationForAuthenticatedUser: [
            "PATCH /user/repository_invitations/{invitation_id}",
          ],
          addAppAccessRestrictions: [
            "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
            {},
            {
              mapToData: "apps",
            },
          ],
          addCollaborator: [
            "PUT /repos/{owner}/{repo}/collaborators/{username}",
          ],
          addStatusCheckContexts: [
            "POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
            {},
            {
              mapToData: "contexts",
            },
          ],
          addTeamAccessRestrictions: [
            "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
            {},
            {
              mapToData: "teams",
            },
          ],
          addUserAccessRestrictions: [
            "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
            {},
            {
              mapToData: "users",
            },
          ],
          checkCollaborator: [
            "GET /repos/{owner}/{repo}/collaborators/{username}",
          ],
          checkVulnerabilityAlerts: [
            "GET /repos/{owner}/{repo}/vulnerability-alerts",
          ],
          codeownersErrors: ["GET /repos/{owner}/{repo}/codeowners/errors"],
          compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
          compareCommitsWithBasehead: [
            "GET /repos/{owner}/{repo}/compare/{basehead}",
          ],
          createAutolink: ["POST /repos/{owner}/{repo}/autolinks"],
          createCommitComment: [
            "POST /repos/{owner}/{repo}/commits/{commit_sha}/comments",
          ],
          createCommitSignatureProtection: [
            "POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures",
          ],
          createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
          createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
          createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
          createDeploymentBranchPolicy: [
            "POST /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies",
          ],
          createDeploymentStatus: [
            "POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses",
          ],
          createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
          createForAuthenticatedUser: ["POST /user/repos"],
          createFork: ["POST /repos/{owner}/{repo}/forks"],
          createInOrg: ["POST /orgs/{org}/repos"],
          createOrUpdateEnvironment: [
            "PUT /repos/{owner}/{repo}/environments/{environment_name}",
          ],
          createOrUpdateFileContents: [
            "PUT /repos/{owner}/{repo}/contents/{path}",
          ],
          createPagesDeployment: [
            "POST /repos/{owner}/{repo}/pages/deployment",
          ],
          createPagesSite: ["POST /repos/{owner}/{repo}/pages"],
          createRelease: ["POST /repos/{owner}/{repo}/releases"],
          createTagProtection: ["POST /repos/{owner}/{repo}/tags/protection"],
          createUsingTemplate: [
            "POST /repos/{template_owner}/{template_repo}/generate",
          ],
          createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
          declineInvitation: [
            "DELETE /user/repository_invitations/{invitation_id}",
            {},
            {
              renamed: ["repos", "declineInvitationForAuthenticatedUser"],
            },
          ],
          declineInvitationForAuthenticatedUser: [
            "DELETE /user/repository_invitations/{invitation_id}",
          ],
          delete: ["DELETE /repos/{owner}/{repo}"],
          deleteAccessRestrictions: [
            "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions",
          ],
          deleteAdminBranchProtection: [
            "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins",
          ],
          deleteAnEnvironment: [
            "DELETE /repos/{owner}/{repo}/environments/{environment_name}",
          ],
          deleteAutolink: [
            "DELETE /repos/{owner}/{repo}/autolinks/{autolink_id}",
          ],
          deleteBranchProtection: [
            "DELETE /repos/{owner}/{repo}/branches/{branch}/protection",
          ],
          deleteCommitComment: [
            "DELETE /repos/{owner}/{repo}/comments/{comment_id}",
          ],
          deleteCommitSignatureProtection: [
            "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures",
          ],
          deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
          deleteDeployment: [
            "DELETE /repos/{owner}/{repo}/deployments/{deployment_id}",
          ],
          deleteDeploymentBranchPolicy: [
            "DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}",
          ],
          deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
          deleteInvitation: [
            "DELETE /repos/{owner}/{repo}/invitations/{invitation_id}",
          ],
          deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages"],
          deletePullRequestReviewProtection: [
            "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews",
          ],
          deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
          deleteReleaseAsset: [
            "DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}",
          ],
          deleteTagProtection: [
            "DELETE /repos/{owner}/{repo}/tags/protection/{tag_protection_id}",
          ],
          deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
          disableAutomatedSecurityFixes: [
            "DELETE /repos/{owner}/{repo}/automated-security-fixes",
          ],
          disableLfsForRepo: ["DELETE /repos/{owner}/{repo}/lfs"],
          disableVulnerabilityAlerts: [
            "DELETE /repos/{owner}/{repo}/vulnerability-alerts",
          ],
          downloadArchive: [
            "GET /repos/{owner}/{repo}/zipball/{ref}",
            {},
            {
              renamed: ["repos", "downloadZipballArchive"],
            },
          ],
          downloadTarballArchive: ["GET /repos/{owner}/{repo}/tarball/{ref}"],
          downloadZipballArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}"],
          enableAutomatedSecurityFixes: [
            "PUT /repos/{owner}/{repo}/automated-security-fixes",
          ],
          enableLfsForRepo: ["PUT /repos/{owner}/{repo}/lfs"],
          enableVulnerabilityAlerts: [
            "PUT /repos/{owner}/{repo}/vulnerability-alerts",
          ],
          generateReleaseNotes: [
            "POST /repos/{owner}/{repo}/releases/generate-notes",
          ],
          get: ["GET /repos/{owner}/{repo}"],
          getAccessRestrictions: [
            "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions",
          ],
          getAdminBranchProtection: [
            "GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins",
          ],
          getAllEnvironments: ["GET /repos/{owner}/{repo}/environments"],
          getAllStatusCheckContexts: [
            "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
          ],
          getAllTopics: ["GET /repos/{owner}/{repo}/topics"],
          getAppsWithAccessToProtectedBranch: [
            "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
          ],
          getAutolink: ["GET /repos/{owner}/{repo}/autolinks/{autolink_id}"],
          getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
          getBranchProtection: [
            "GET /repos/{owner}/{repo}/branches/{branch}/protection",
          ],
          getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
          getCodeFrequencyStats: [
            "GET /repos/{owner}/{repo}/stats/code_frequency",
          ],
          getCollaboratorPermissionLevel: [
            "GET /repos/{owner}/{repo}/collaborators/{username}/permission",
          ],
          getCombinedStatusForRef: [
            "GET /repos/{owner}/{repo}/commits/{ref}/status",
          ],
          getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
          getCommitActivityStats: [
            "GET /repos/{owner}/{repo}/stats/commit_activity",
          ],
          getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
          getCommitSignatureProtection: [
            "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures",
          ],
          getCommunityProfileMetrics: [
            "GET /repos/{owner}/{repo}/community/profile",
          ],
          getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
          getContributorsStats: [
            "GET /repos/{owner}/{repo}/stats/contributors",
          ],
          getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
          getDeployment: [
            "GET /repos/{owner}/{repo}/deployments/{deployment_id}",
          ],
          getDeploymentBranchPolicy: [
            "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}",
          ],
          getDeploymentStatus: [
            "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}",
          ],
          getEnvironment: [
            "GET /repos/{owner}/{repo}/environments/{environment_name}",
          ],
          getLatestPagesBuild: [
            "GET /repos/{owner}/{repo}/pages/builds/latest",
          ],
          getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
          getPages: ["GET /repos/{owner}/{repo}/pages"],
          getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
          getPagesHealthCheck: ["GET /repos/{owner}/{repo}/pages/health"],
          getParticipationStats: [
            "GET /repos/{owner}/{repo}/stats/participation",
          ],
          getPullRequestReviewProtection: [
            "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews",
          ],
          getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
          getReadme: ["GET /repos/{owner}/{repo}/readme"],
          getReadmeInDirectory: ["GET /repos/{owner}/{repo}/readme/{dir}"],
          getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
          getReleaseAsset: [
            "GET /repos/{owner}/{repo}/releases/assets/{asset_id}",
          ],
          getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
          getStatusChecksProtection: [
            "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
          ],
          getTeamsWithAccessToProtectedBranch: [
            "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
          ],
          getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
          getTopReferrers: [
            "GET /repos/{owner}/{repo}/traffic/popular/referrers",
          ],
          getUsersWithAccessToProtectedBranch: [
            "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
          ],
          getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
          getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
          getWebhookConfigForRepo: [
            "GET /repos/{owner}/{repo}/hooks/{hook_id}/config",
          ],
          getWebhookDelivery: [
            "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}",
          ],
          listAutolinks: ["GET /repos/{owner}/{repo}/autolinks"],
          listBranches: ["GET /repos/{owner}/{repo}/branches"],
          listBranchesForHeadCommit: [
            "GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head",
          ],
          listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
          listCommentsForCommit: [
            "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments",
          ],
          listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
          listCommitStatusesForRef: [
            "GET /repos/{owner}/{repo}/commits/{ref}/statuses",
          ],
          listCommits: ["GET /repos/{owner}/{repo}/commits"],
          listContributors: ["GET /repos/{owner}/{repo}/contributors"],
          listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
          listDeploymentBranchPolicies: [
            "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies",
          ],
          listDeploymentStatuses: [
            "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses",
          ],
          listDeployments: ["GET /repos/{owner}/{repo}/deployments"],
          listForAuthenticatedUser: ["GET /user/repos"],
          listForOrg: ["GET /orgs/{org}/repos"],
          listForUser: ["GET /users/{username}/repos"],
          listForks: ["GET /repos/{owner}/{repo}/forks"],
          listInvitations: ["GET /repos/{owner}/{repo}/invitations"],
          listInvitationsForAuthenticatedUser: [
            "GET /user/repository_invitations",
          ],
          listLanguages: ["GET /repos/{owner}/{repo}/languages"],
          listPagesBuilds: ["GET /repos/{owner}/{repo}/pages/builds"],
          listPublic: ["GET /repositories"],
          listPullRequestsAssociatedWithCommit: [
            "GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls",
          ],
          listReleaseAssets: [
            "GET /repos/{owner}/{repo}/releases/{release_id}/assets",
          ],
          listReleases: ["GET /repos/{owner}/{repo}/releases"],
          listTagProtection: ["GET /repos/{owner}/{repo}/tags/protection"],
          listTags: ["GET /repos/{owner}/{repo}/tags"],
          listTeams: ["GET /repos/{owner}/{repo}/teams"],
          listWebhookDeliveries: [
            "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries",
          ],
          listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
          merge: ["POST /repos/{owner}/{repo}/merges"],
          mergeUpstream: ["POST /repos/{owner}/{repo}/merge-upstream"],
          pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
          redeliverWebhookDelivery: [
            "POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts",
          ],
          removeAppAccessRestrictions: [
            "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
            {},
            {
              mapToData: "apps",
            },
          ],
          removeCollaborator: [
            "DELETE /repos/{owner}/{repo}/collaborators/{username}",
          ],
          removeStatusCheckContexts: [
            "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
            {},
            {
              mapToData: "contexts",
            },
          ],
          removeStatusCheckProtection: [
            "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
          ],
          removeTeamAccessRestrictions: [
            "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
            {},
            {
              mapToData: "teams",
            },
          ],
          removeUserAccessRestrictions: [
            "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
            {},
            {
              mapToData: "users",
            },
          ],
          renameBranch: ["POST /repos/{owner}/{repo}/branches/{branch}/rename"],
          replaceAllTopics: ["PUT /repos/{owner}/{repo}/topics"],
          requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
          setAdminBranchProtection: [
            "POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins",
          ],
          setAppAccessRestrictions: [
            "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
            {},
            {
              mapToData: "apps",
            },
          ],
          setStatusCheckContexts: [
            "PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
            {},
            {
              mapToData: "contexts",
            },
          ],
          setTeamAccessRestrictions: [
            "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
            {},
            {
              mapToData: "teams",
            },
          ],
          setUserAccessRestrictions: [
            "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
            {},
            {
              mapToData: "users",
            },
          ],
          testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
          transfer: ["POST /repos/{owner}/{repo}/transfer"],
          update: ["PATCH /repos/{owner}/{repo}"],
          updateBranchProtection: [
            "PUT /repos/{owner}/{repo}/branches/{branch}/protection",
          ],
          updateCommitComment: [
            "PATCH /repos/{owner}/{repo}/comments/{comment_id}",
          ],
          updateDeploymentBranchPolicy: [
            "PUT /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}",
          ],
          updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
          updateInvitation: [
            "PATCH /repos/{owner}/{repo}/invitations/{invitation_id}",
          ],
          updatePullRequestReviewProtection: [
            "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews",
          ],
          updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
          updateReleaseAsset: [
            "PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}",
          ],
          updateStatusCheckPotection: [
            "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
            {},
            {
              renamed: ["repos", "updateStatusCheckProtection"],
            },
          ],
          updateStatusCheckProtection: [
            "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
          ],
          updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
          updateWebhookConfigForRepo: [
            "PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config",
          ],
          uploadReleaseAsset: [
            "POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}",
            {
              baseUrl: "https://uploads.github.com",
            },
          ],
        },
        search: {
          code: ["GET /search/code"],
          commits: ["GET /search/commits"],
          issuesAndPullRequests: ["GET /search/issues"],
          labels: ["GET /search/labels"],
          repos: ["GET /search/repositories"],
          topics: ["GET /search/topics"],
          users: ["GET /search/users"],
        },
        secretScanning: {
          getAlert: [
            "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}",
          ],
          getSecurityAnalysisSettingsForEnterprise: [
            "GET /enterprises/{enterprise}/code_security_and_analysis",
          ],
          listAlertsForEnterprise: [
            "GET /enterprises/{enterprise}/secret-scanning/alerts",
          ],
          listAlertsForOrg: ["GET /orgs/{org}/secret-scanning/alerts"],
          listAlertsForRepo: [
            "GET /repos/{owner}/{repo}/secret-scanning/alerts",
          ],
          listLocationsForAlert: [
            "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations",
          ],
          patchSecurityAnalysisSettingsForEnterprise: [
            "PATCH /enterprises/{enterprise}/code_security_and_analysis",
          ],
          postSecurityProductEnablementForEnterprise: [
            "POST /enterprises/{enterprise}/{security_product}/{enablement}",
          ],
          updateAlert: [
            "PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}",
          ],
        },
        teams: {
          addOrUpdateMembershipForUserInOrg: [
            "PUT /orgs/{org}/teams/{team_slug}/memberships/{username}",
          ],
          addOrUpdateProjectPermissionsInOrg: [
            "PUT /orgs/{org}/teams/{team_slug}/projects/{project_id}",
          ],
          addOrUpdateRepoPermissionsInOrg: [
            "PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}",
          ],
          checkPermissionsForProjectInOrg: [
            "GET /orgs/{org}/teams/{team_slug}/projects/{project_id}",
          ],
          checkPermissionsForRepoInOrg: [
            "GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}",
          ],
          create: ["POST /orgs/{org}/teams"],
          createDiscussionCommentInOrg: [
            "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments",
          ],
          createDiscussionInOrg: [
            "POST /orgs/{org}/teams/{team_slug}/discussions",
          ],
          deleteDiscussionCommentInOrg: [
            "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}",
          ],
          deleteDiscussionInOrg: [
            "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}",
          ],
          deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
          getByName: ["GET /orgs/{org}/teams/{team_slug}"],
          getDiscussionCommentInOrg: [
            "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}",
          ],
          getDiscussionInOrg: [
            "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}",
          ],
          getMembershipForUserInOrg: [
            "GET /orgs/{org}/teams/{team_slug}/memberships/{username}",
          ],
          list: ["GET /orgs/{org}/teams"],
          listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
          listDiscussionCommentsInOrg: [
            "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments",
          ],
          listDiscussionsInOrg: [
            "GET /orgs/{org}/teams/{team_slug}/discussions",
          ],
          listForAuthenticatedUser: ["GET /user/teams"],
          listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
          listPendingInvitationsInOrg: [
            "GET /orgs/{org}/teams/{team_slug}/invitations",
          ],
          listProjectsInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects"],
          listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
          removeMembershipForUserInOrg: [
            "DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}",
          ],
          removeProjectInOrg: [
            "DELETE /orgs/{org}/teams/{team_slug}/projects/{project_id}",
          ],
          removeRepoInOrg: [
            "DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}",
          ],
          updateDiscussionCommentInOrg: [
            "PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}",
          ],
          updateDiscussionInOrg: [
            "PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}",
          ],
          updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"],
        },
        users: {
          addEmailForAuthenticated: [
            "POST /user/emails",
            {},
            {
              renamed: ["users", "addEmailForAuthenticatedUser"],
            },
          ],
          addEmailForAuthenticatedUser: ["POST /user/emails"],
          block: ["PUT /user/blocks/{username}"],
          checkBlocked: ["GET /user/blocks/{username}"],
          checkFollowingForUser: [
            "GET /users/{username}/following/{target_user}",
          ],
          checkPersonIsFollowedByAuthenticated: [
            "GET /user/following/{username}",
          ],
          createGpgKeyForAuthenticated: [
            "POST /user/gpg_keys",
            {},
            {
              renamed: ["users", "createGpgKeyForAuthenticatedUser"],
            },
          ],
          createGpgKeyForAuthenticatedUser: ["POST /user/gpg_keys"],
          createPublicSshKeyForAuthenticated: [
            "POST /user/keys",
            {},
            {
              renamed: ["users", "createPublicSshKeyForAuthenticatedUser"],
            },
          ],
          createPublicSshKeyForAuthenticatedUser: ["POST /user/keys"],
          createSshSigningKeyForAuthenticatedUser: [
            "POST /user/ssh_signing_keys",
          ],
          deleteEmailForAuthenticated: [
            "DELETE /user/emails",
            {},
            {
              renamed: ["users", "deleteEmailForAuthenticatedUser"],
            },
          ],
          deleteEmailForAuthenticatedUser: ["DELETE /user/emails"],
          deleteGpgKeyForAuthenticated: [
            "DELETE /user/gpg_keys/{gpg_key_id}",
            {},
            {
              renamed: ["users", "deleteGpgKeyForAuthenticatedUser"],
            },
          ],
          deleteGpgKeyForAuthenticatedUser: [
            "DELETE /user/gpg_keys/{gpg_key_id}",
          ],
          deletePublicSshKeyForAuthenticated: [
            "DELETE /user/keys/{key_id}",
            {},
            {
              renamed: ["users", "deletePublicSshKeyForAuthenticatedUser"],
            },
          ],
          deletePublicSshKeyForAuthenticatedUser: [
            "DELETE /user/keys/{key_id}",
          ],
          deleteSshSigningKeyForAuthenticatedUser: [
            "DELETE /user/ssh_signing_keys/{ssh_signing_key_id}",
          ],
          follow: ["PUT /user/following/{username}"],
          getAuthenticated: ["GET /user"],
          getByUsername: ["GET /users/{username}"],
          getContextForUser: ["GET /users/{username}/hovercard"],
          getGpgKeyForAuthenticated: [
            "GET /user/gpg_keys/{gpg_key_id}",
            {},
            {
              renamed: ["users", "getGpgKeyForAuthenticatedUser"],
            },
          ],
          getGpgKeyForAuthenticatedUser: ["GET /user/gpg_keys/{gpg_key_id}"],
          getPublicSshKeyForAuthenticated: [
            "GET /user/keys/{key_id}",
            {},
            {
              renamed: ["users", "getPublicSshKeyForAuthenticatedUser"],
            },
          ],
          getPublicSshKeyForAuthenticatedUser: ["GET /user/keys/{key_id}"],
          getSshSigningKeyForAuthenticatedUser: [
            "GET /user/ssh_signing_keys/{ssh_signing_key_id}",
          ],
          list: ["GET /users"],
          listBlockedByAuthenticated: [
            "GET /user/blocks",
            {},
            {
              renamed: ["users", "listBlockedByAuthenticatedUser"],
            },
          ],
          listBlockedByAuthenticatedUser: ["GET /user/blocks"],
          listEmailsForAuthenticated: [
            "GET /user/emails",
            {},
            {
              renamed: ["users", "listEmailsForAuthenticatedUser"],
            },
          ],
          listEmailsForAuthenticatedUser: ["GET /user/emails"],
          listFollowedByAuthenticated: [
            "GET /user/following",
            {},
            {
              renamed: ["users", "listFollowedByAuthenticatedUser"],
            },
          ],
          listFollowedByAuthenticatedUser: ["GET /user/following"],
          listFollowersForAuthenticatedUser: ["GET /user/followers"],
          listFollowersForUser: ["GET /users/{username}/followers"],
          listFollowingForUser: ["GET /users/{username}/following"],
          listGpgKeysForAuthenticated: [
            "GET /user/gpg_keys",
            {},
            {
              renamed: ["users", "listGpgKeysForAuthenticatedUser"],
            },
          ],
          listGpgKeysForAuthenticatedUser: ["GET /user/gpg_keys"],
          listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
          listPublicEmailsForAuthenticated: [
            "GET /user/public_emails",
            {},
            {
              renamed: ["users", "listPublicEmailsForAuthenticatedUser"],
            },
          ],
          listPublicEmailsForAuthenticatedUser: ["GET /user/public_emails"],
          listPublicKeysForUser: ["GET /users/{username}/keys"],
          listPublicSshKeysForAuthenticated: [
            "GET /user/keys",
            {},
            {
              renamed: ["users", "listPublicSshKeysForAuthenticatedUser"],
            },
          ],
          listPublicSshKeysForAuthenticatedUser: ["GET /user/keys"],
          listSshSigningKeysForAuthenticatedUser: [
            "GET /user/ssh_signing_keys",
          ],
          listSshSigningKeysForUser: ["GET /users/{username}/ssh_signing_keys"],
          setPrimaryEmailVisibilityForAuthenticated: [
            "PATCH /user/email/visibility",
            {},
            {
              renamed: [
                "users",
                "setPrimaryEmailVisibilityForAuthenticatedUser",
              ],
            },
          ],
          setPrimaryEmailVisibilityForAuthenticatedUser: [
            "PATCH /user/email/visibility",
          ],
          unblock: ["DELETE /user/blocks/{username}"],
          unfollow: ["DELETE /user/following/{username}"],
          updateAuthenticated: ["PATCH /user"],
        },
      };

      const VERSION = "7.0.1";

      function endpointsToMethods(octokit, endpointsMap) {
        const newMethods = {};
        for (const [scope, endpoints] of Object.entries(endpointsMap)) {
          for (const [methodName, endpoint] of Object.entries(endpoints)) {
            const [route, defaults, decorations] = endpoint;
            const [method, url] = route.split(/ /);
            const endpointDefaults = Object.assign(
              {
                method,
                url,
              },
              defaults
            );
            if (!newMethods[scope]) {
              newMethods[scope] = {};
            }
            const scopeMethods = newMethods[scope];
            if (decorations) {
              scopeMethods[methodName] = decorate(
                octokit,
                scope,
                methodName,
                endpointDefaults,
                decorations
              );
              continue;
            }
            scopeMethods[methodName] =
              octokit.request.defaults(endpointDefaults);
          }
        }
        return newMethods;
      }
      function decorate(octokit, scope, methodName, defaults, decorations) {
        const requestWithDefaults = octokit.request.defaults(defaults);
        /* istanbul ignore next */
        function withDecorations(...args) {
          // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
          let options = requestWithDefaults.endpoint.merge(...args);
          // There are currently no other decorations than `.mapToData`
          if (decorations.mapToData) {
            options = Object.assign({}, options, {
              data: options[decorations.mapToData],
              [decorations.mapToData]: undefined,
            });
            return requestWithDefaults(options);
          }
          if (decorations.renamed) {
            const [newScope, newMethodName] = decorations.renamed;
            octokit.log.warn(
              `octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`
            );
          }
          if (decorations.deprecated) {
            octokit.log.warn(decorations.deprecated);
          }
          if (decorations.renamedParameters) {
            // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
            const options = requestWithDefaults.endpoint.merge(...args);
            for (const [name, alias] of Object.entries(
              decorations.renamedParameters
            )) {
              if (name in options) {
                octokit.log.warn(
                  `"${name}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`
                );
                if (!(alias in options)) {
                  options[alias] = options[name];
                }
                delete options[name];
              }
            }
            return requestWithDefaults(options);
          }
          // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
          return requestWithDefaults(...args);
        }
        return Object.assign(withDecorations, requestWithDefaults);
      }
      function restEndpointMethods(octokit) {
        const api = endpointsToMethods(octokit, Endpoints);
        return {
          rest: api,
        };
      }
      restEndpointMethods.VERSION = VERSION;
      function legacyRestEndpointMethods(octokit) {
        const api = endpointsToMethods(octokit, Endpoints);
        return {
          ...api,
          rest: api,
        };
      }
      legacyRestEndpointMethods.VERSION = VERSION;
      exports.legacyRestEndpointMethods = legacyRestEndpointMethods;
      exports.restEndpointMethods = restEndpointMethods;
      //# sourceMappingURL=index.js.map
      /***/
    },
    /***/ 537: /***/ (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) => {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      function _interopDefault(ex) {
        return ex && typeof ex === "object" && "default" in ex
          ? ex["default"]
          : ex;
      }
      var deprecation = __nccwpck_require__(8932);
      var once = _interopDefault(__nccwpck_require__(1223));

      const logOnceCode = once((deprecation) => console.warn(deprecation));
      const logOnceHeaders = once((deprecation) => console.warn(deprecation));
      /**
       * Error with extra properties to help with debugging
       */
      class RequestError extends Error {
        constructor(message, statusCode, options) {
          super(message);
          // Maintains proper stack trace (only available on V8)
          /* istanbul ignore next */
          if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
          }
          this.name = "HttpError";
          this.status = statusCode;
          let headers;
          if ("headers" in options && typeof options.headers !== "undefined") {
            headers = options.headers;
          }
          if ("response" in options) {
            this.response = options.response;
            headers = options.response.headers;
          }
          // redact request credentials without mutating original request options
          const requestCopy = Object.assign({}, options.request);
          if (options.request.headers.authorization) {
            requestCopy.headers = Object.assign({}, options.request.headers, {
              authorization: options.request.headers.authorization.replace(
                / .*$/,
                " [REDACTED]"
              ),
            });
          }
          requestCopy.url = requestCopy.url
            // client_id & client_secret can be passed as URL query parameters to increase rate limit
            // see https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
            .replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]")
            // OAuth tokens can be passed as URL query parameters, although it is not recommended
            // see https://developer.github.com/v3/#oauth2-token-sent-in-a-header
            .replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
          this.request = requestCopy;
          // deprecations
          Object.defineProperty(this, "code", {
            get() {
              logOnceCode(
                new deprecation.Deprecation(
                  "[@octokit/request-error] `error.code` is deprecated, use `error.status`."
                )
              );
              return statusCode;
            },
          });
          Object.defineProperty(this, "headers", {
            get() {
              logOnceHeaders(
                new deprecation.Deprecation(
                  "[@octokit/request-error] `error.headers` is deprecated, use `error.response.headers`."
                )
              );
              return headers || {};
            },
          });
        }
      }
      exports.RequestError = RequestError;
      //# sourceMappingURL=index.js.map
      /***/
    },
    /***/ 6234: /***/ (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) => {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      function _interopDefault(ex) {
        return ex && typeof ex === "object" && "default" in ex
          ? ex["default"]
          : ex;
      }
      var endpoint = __nccwpck_require__(9440);
      var universalUserAgent = __nccwpck_require__(5030);
      var isPlainObject = __nccwpck_require__(3287);
      var nodeFetch = _interopDefault(__nccwpck_require__(467));
      var requestError = __nccwpck_require__(537);
      const VERSION = "6.2.3";
      function getBufferResponse(response) {
        return response.arrayBuffer();
      }
      function fetchWrapper(requestOptions) {
        const log =
          requestOptions.request && requestOptions.request.log
            ? requestOptions.request.log
            : console;
        if (
          isPlainObject.isPlainObject(requestOptions.body) ||
          Array.isArray(requestOptions.body)
        ) {
          requestOptions.body = JSON.stringify(requestOptions.body);
        }
        let headers = {};
        let status;
        let url;
        const fetch =
          (requestOptions.request && requestOptions.request.fetch) ||
          globalThis.fetch ||
          /* istanbul ignore next */ nodeFetch;
        return fetch(
          requestOptions.url,
          Object.assign(
            {
              method: requestOptions.method,
              body: requestOptions.body,
              headers: requestOptions.headers,
              redirect: requestOptions.redirect,
            },
            // `requestOptions.request.agent` type is incompatible
            // see https://github.com/octokit/types.ts/pull/264
            requestOptions.request
          )
        )
          .then(async (response) => {
            url = response.url;
            status = response.status;
            for (const keyAndValue of response.headers) {
              headers[keyAndValue[0]] = keyAndValue[1];
            }
            if ("deprecation" in headers) {
              const matches =
                headers.link &&
                headers.link.match(/<([^>]+)>; rel="deprecation"/);
              const deprecationLink = matches && matches.pop();
              log.warn(
                `[@octokit/request] "${requestOptions.method} ${
                  requestOptions.url
                }" is deprecated. It is scheduled to be removed on ${
                  headers.sunset
                }${deprecationLink ? `. See ${deprecationLink}` : ""}`
              );
            }
            if (status === 204 || status === 205) {
              return;
            }
            // GitHub API returns 200 for HEAD requests
            if (requestOptions.method === "HEAD") {
              if (status < 400) {
                return;
              }
              throw new requestError.RequestError(response.statusText, status, {
                response: {
                  url,
                  status,
                  headers,
                  data: undefined,
                },
                request: requestOptions,
              });
            }
            if (status === 304) {
              throw new requestError.RequestError("Not modified", status, {
                response: {
                  url,
                  status,
                  headers,
                  data: await getResponseData(response),
                },
                request: requestOptions,
              });
            }
            if (status >= 400) {
              const data = await getResponseData(response);
              const error = new requestError.RequestError(
                toErrorMessage(data),
                status,
                {
                  response: {
                    url,
                    status,
                    headers,
                    data,
                  },
                  request: requestOptions,
                }
              );
              throw error;
            }
            return getResponseData(response);
          })
          .then((data) => {
            return {
              status,
              url,
              headers,
              data,
            };
          })
          .catch((error) => {
            if (error instanceof requestError.RequestError) throw error;
            else if (error.name === "AbortError") throw error;
            throw new requestError.RequestError(error.message, 500, {
              request: requestOptions,
            });
          });
      }
      async function getResponseData(response) {
        const contentType = response.headers.get("content-type");
        if (/application\/json/.test(contentType)) {
          return response.json();
        }
        if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
          return response.text();
        }
        return getBufferResponse(response);
      }
      function toErrorMessage(data) {
        if (typeof data === "string") return data;
        // istanbul ignore else - just in case
        if ("message" in data) {
          if (Array.isArray(data.errors)) {
            return `${data.message}: ${data.errors
              .map(JSON.stringify)
              .join(", ")}`;
          }
          return data.message;
        }
        // istanbul ignore next - just in case
        return `Unknown error: ${JSON.stringify(data)}`;
      }
      function withDefaults(oldEndpoint, newDefaults) {
        const endpoint = oldEndpoint.defaults(newDefaults);
        const newApi = function (route, parameters) {
          const endpointOptions = endpoint.merge(route, parameters);
          if (!endpointOptions.request || !endpointOptions.request.hook) {
            return fetchWrapper(endpoint.parse(endpointOptions));
          }
          const request = (route, parameters) => {
            return fetchWrapper(
              endpoint.parse(endpoint.merge(route, parameters))
            );
          };
          Object.assign(request, {
            endpoint,
            defaults: withDefaults.bind(null, endpoint),
          });
          return endpointOptions.request.hook(request, endpointOptions);
        };
        return Object.assign(newApi, {
          endpoint,
          defaults: withDefaults.bind(null, endpoint),
        });
      }
      const request = withDefaults(endpoint.endpoint, {
        headers: {
          "user-agent": `octokit-request.js/${VERSION} ${universalUserAgent.getUserAgent()}`,
        },
      });
      exports.request = request;
      //# sourceMappingURL=index.js.map
      /***/
    },
    /***/ 5375: /***/ (
      __unused_webpack_module,
      exports,
      __nccwpck_require__
    ) => {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var core = __nccwpck_require__(6762);
      var pluginRequestLog = __nccwpck_require__(8883);
      var pluginPaginateRest = __nccwpck_require__(4193);
      var pluginRestEndpointMethods = __nccwpck_require__(3044);
      const VERSION = "19.0.7";
      const Octokit = core.Octokit.plugin(
        pluginRequestLog.requestLog,
        pluginRestEndpointMethods.legacyRestEndpointMethods,
        pluginPaginateRest.paginateRest
      ).defaults({
        userAgent: `octokit-rest.js/${VERSION}`,
      });
      exports.Octokit = Octokit;
      //# sourceMappingURL=index.js.map
      /***/
    },
    /***/ 1659: /***/ (module, exports, __nccwpck_require__) => {
      "use strict";
      /**
       * @author Toru Nagashima <https://github.com/mysticatea>
       * See LICENSE file in root directory for full license.
       */
      Object.defineProperty(exports, "__esModule", { value: true });
      var eventTargetShim = __nccwpck_require__(4697);
      /**
       * The signal class.
       * @see https://dom.spec.whatwg.org/#abortsignal
       */
      class AbortSignal extends eventTargetShim.EventTarget {
        /**
         * AbortSignal cannot be constructed directly.
         */
        constructor() {
          super();
          throw new TypeError("AbortSignal cannot be constructed directly");
        }
        /**
         * Returns `true` if this `AbortSignal`'s `AbortController` has signaled to abort, and `false` otherwise.
         */
        get aborted() {
          const aborted = abortedFlags.get(this);
          if (typeof aborted !== "boolean") {
            throw new TypeError(
              `Expected 'this' to be an 'AbortSignal' object, but got ${
                this === null ? "null" : typeof this
              }`
            );
          }
          return aborted;
        }
      }
      eventTargetShim.defineEventAttribute(AbortSignal.prototype, "abort");
      /**
       * Create an AbortSignal object.
       */
      function createAbortSignal() {
        const signal = Object.create(AbortSignal.prototype);
        eventTargetShim.EventTarget.call(signal);
        abortedFlags.set(signal, false);
        return signal;
      }
      /**
       * Abort a given signal.
       */
      function abortSignal(signal) {
        if (abortedFlags.get(signal) !== false) {
          return;
        }
        abortedFlags.set(signal, true);
        signal.dispatchEvent({ type: "abort" });
      }
      /**
       * Aborted flag for each instances.
       */
      const abortedFlags = new WeakMap();
      // Properties should be enumerable.
      Object.defineProperties(AbortSignal.prototype, {
        aborted: { enumerable: true },
      });
      // `toString()` should return `"[object AbortSignal]"`
      if (
        typeof Symbol === "function" &&
        typeof Symbol.toStringTag === "symbol"
      ) {
        Object.defineProperty(AbortSignal.prototype, Symbol.toStringTag, {
          configurable: true,
          value: "AbortSignal",
        });
      }
      /**
       * The AbortController.
       * @see https://dom.spec.whatwg.org/#abortcontroller
       */
      class AbortController {
        /**
         * Initialize this controller.
         */
        constructor() {
          signals.set(this, createAbortSignal());
        }
        /**
         * Returns the `AbortSignal` object associated with this object.
         */
        get signal() {
          return getSignal(this);
        }
        /**
         * Abort and signal to any observers that the associated activity is to be aborted.
         */
        abort() {
          abortSignal(getSignal(this));
        }
      }
      /**
       * Associated signals.
       */
      const signals = new WeakMap();
      /**
       * Get the associated signal of a given controller.
       */
      function getSignal(controller) {
        const signal = signals.get(controller);
        if (signal == null) {
          throw new TypeError(
            `Expected 'this' to be an 'AbortController' object, but got ${
              controller === null ? "null" : typeof controller
            }`
          );
        }
        return signal;
      }
      // Properties should be enumerable.
      Object.defineProperties(AbortController.prototype, {
        signal: { enumerable: true },
        abort: { enumerable: true },
      });
      if (
        typeof Symbol === "function" &&
        typeof Symbol.toStringTag === "symbol"
      ) {
        Object.defineProperty(AbortController.prototype, Symbol.toStringTag, {
          configurable: true,
          value: "AbortController",
        });
      }
      exports.AbortController = AbortController;
      exports.AbortSignal = AbortSignal;
      exports["default"] = AbortController;
      module.exports = AbortController;
      module.exports.AbortController = module.exports["default"] =
        AbortController;
      module.exports.AbortSignal = AbortSignal;
      //# sourceMappingURL=abort-controller.js.map
      /***/
    },
    /***/ 4623: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";
      module.exports = __nccwpck_require__(5006);
      module.exports.HttpsAgent = __nccwpck_require__(5500);
      module.exports.constants = __nccwpck_require__(7757);
      /***/
    },
    /***/ 5006: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";
      const OriginalAgent = __nccwpck_require__(3685).Agent;
      const ms = __nccwpck_require__(845);
      const debug = __nccwpck_require__(3837).debuglog("agentkeepalive");
      const {
        INIT_SOCKET,
        CURRENT_ID,
        CREATE_ID,
        SOCKET_CREATED_TIME,
        SOCKET_NAME,
        SOCKET_REQUEST_COUNT,
        SOCKET_REQUEST_FINISHED_COUNT,
      } = __nccwpck_require__(7757);

      // OriginalAgent come from
      // - https://github.com/nodejs/node/blob/v8.12.0/lib/_http_agent.js
      // - https://github.com/nodejs/node/blob/v10.12.0/lib/_http_agent.js

      // node <= 10
      let defaultTimeoutListenerCount = 1;
      const majorVersion = parseInt(
        process.version.split(".", 1)[0].substring(1)
      );
      if (majorVersion >= 11 && majorVersion <= 12) {
        defaultTimeoutListenerCount = 2;
      } else if (majorVersion >= 13) {
        defaultTimeoutListenerCount = 3;
      }
      function deprecate(message) {
        console.log("[agentkeepalive:deprecated] %s", message);
      }
      class Agent extends OriginalAgent {
        constructor(options) {
          options = options || {};
          options.keepAlive = options.keepAlive !== false;
          // default is keep-alive and 4s free socket timeout
          // see https://medium.com/ssense-tech/reduce-networking-errors-in-nodejs-23b4eb9f2d83
          if (options.freeSocketTimeout === undefined) {
            options.freeSocketTimeout = 4000;
          }
          // Legacy API: keepAliveTimeout should be rename to `freeSocketTimeout`
          if (options.keepAliveTimeout) {
            deprecate(
              "options.keepAliveTimeout is deprecated, please use options.freeSocketTimeout instead"
            );
            options.freeSocketTimeout = options.keepAliveTimeout;
            delete options.keepAliveTimeout;
          }
          // Legacy API: freeSocketKeepAliveTimeout should be rename to `freeSocketTimeout`
          if (options.freeSocketKeepAliveTimeout) {
            deprecate(
              "options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead"
            );
            options.freeSocketTimeout = options.freeSocketKeepAliveTimeout;
            delete options.freeSocketKeepAliveTimeout;
          }
          // Sets the socket to timeout after timeout milliseconds of inactivity on the socket.
          // By default is double free socket timeout.
          if (options.timeout === undefined) {
            // make sure socket default inactivity timeout >= 8s
            options.timeout = Math.max(options.freeSocketTimeout * 2, 8000);
          }
          // support humanize format
          options.timeout = ms(options.timeout);
          options.freeSocketTimeout = ms(options.freeSocketTimeout);
          options.socketActiveTTL = options.socketActiveTTL
            ? ms(options.socketActiveTTL)
            : 0;
          super(options);
          this[CURRENT_ID] = 0;
          // create socket success counter
          this.createSocketCount = 0;
          this.createSocketCountLastCheck = 0;
          this.createSocketErrorCount = 0;
          this.createSocketErrorCountLastCheck = 0;
          this.closeSocketCount = 0;
          this.closeSocketCountLastCheck = 0;
          // socket error event count
          this.errorSocketCount = 0;
          this.errorSocketCountLastCheck = 0;
          // request finished counter
          this.requestCount = 0;
          this.requestCountLastCheck = 0;
          // including free socket timeout counter
          this.timeoutSocketCount = 0;
          this.timeoutSocketCountLastCheck = 0;
          this.on("free", (socket) => {
            // https://github.com/nodejs/node/pull/32000
            // Node.js native agent will check socket timeout eqs agent.options.timeout.
            // Use the ttl or freeSocketTimeout to overwrite.
            const timeout = this.calcSocketTimeout(socket);
            if (timeout > 0 && socket.timeout !== timeout) {
              socket.setTimeout(timeout);
            }
          });
        }
        get freeSocketKeepAliveTimeout() {
          deprecate(
            "agent.freeSocketKeepAliveTimeout is deprecated, please use agent.options.freeSocketTimeout instead"
          );
          return this.options.freeSocketTimeout;
        }
        get timeout() {
          deprecate(
            "agent.timeout is deprecated, please use agent.options.timeout instead"
          );
          return this.options.timeout;
        }
        get socketActiveTTL() {
          deprecate(
            "agent.socketActiveTTL is deprecated, please use agent.options.socketActiveTTL instead"
          );
          return this.options.socketActiveTTL;
        }
        calcSocketTimeout(socket) {
          /**
           * return <= 0: should free socket
           * return > 0: should update socket timeout
           * return undefined: not find custom timeout
           */
          let freeSocketTimeout = this.options.freeSocketTimeout;
          const socketActiveTTL = this.options.socketActiveTTL;
          if (socketActiveTTL) {
            // check socketActiveTTL
            const aliveTime = Date.now() - socket[SOCKET_CREATED_TIME];
            const diff = socketActiveTTL - aliveTime;
            if (diff <= 0) {
              return diff;
            }
            if (freeSocketTimeout && diff < freeSocketTimeout) {
              freeSocketTimeout = diff;
            }
          }
          // set freeSocketTimeout
          if (freeSocketTimeout) {
            // set free keepalive timer
            // try to use socket custom freeSocketTimeout first, support headers['keep-alive']
            // https://github.com/node-modules/urllib/blob/b76053020923f4d99a1c93cf2e16e0c5ba10bacf/lib/urllib.js#L498
            const customFreeSocketTimeout =
              socket.freeSocketTimeout || socket.freeSocketKeepAliveTimeout;
            return customFreeSocketTimeout || freeSocketTimeout;
          }
        }
        keepSocketAlive(socket) {
          const result = super.keepSocketAlive(socket);
          // should not keepAlive, do nothing
          if (!result) return result;
          const customTimeout = this.calcSocketTimeout(socket);
          if (typeof customTimeout === "undefined") {
            return true;
          }
          if (customTimeout <= 0) {
            debug(
              "%s(requests: %s, finished: %s) free but need to destroy by TTL, request count %s, diff is %s",
              socket[SOCKET_NAME],
              socket[SOCKET_REQUEST_COUNT],
              socket[SOCKET_REQUEST_FINISHED_COUNT],
              customTimeout
            );
            return false;
          }
          if (socket.timeout !== customTimeout) {
            socket.setTimeout(customTimeout);
          }
          return true;
        }

        // only call on addRequest
        reuseSocket(...args) {
          // reuseSocket(socket, req)
          super.reuseSocket(...args);
          const socket = args[0];
          const req = args[1];
          req.reusedSocket = true;
          const agentTimeout = this.options.timeout;
          if (getSocketTimeout(socket) !== agentTimeout) {
            // reset timeout before use
            socket.setTimeout(agentTimeout);
            debug(
              "%s reset timeout to %sms",
              socket[SOCKET_NAME],
              agentTimeout
            );
          }
          socket[SOCKET_REQUEST_COUNT]++;
          debug(
            "%s(requests: %s, finished: %s) reuse on addRequest, timeout %sms",
            socket[SOCKET_NAME],
            socket[SOCKET_REQUEST_COUNT],
            socket[SOCKET_REQUEST_FINISHED_COUNT],
            getSocketTimeout(socket)
          );
        }

        [CREATE_ID]() {
          const id = this[CURRENT_ID]++;
          if (this[CURRENT_ID] === Number.MAX_SAFE_INTEGER)
            this[CURRENT_ID] = 0;
          return id;
        }

        [INIT_SOCKET](socket, options) {
          // bugfix here.
          // https on node 8, 10 won't set agent.options.timeout by default
          // TODO: need to fix on node itself
          if (options.timeout) {
            const timeout = getSocketTimeout(socket);
            if (!timeout) {
              socket.setTimeout(options.timeout);
            }
          }

          if (this.options.keepAlive) {
            // Disable Nagle's algorithm: http://blog.caustik.com/2012/04/08/scaling-node-js-to-100k-concurrent-connections/
            // https://fengmk2.com/benchmark/nagle-algorithm-delayed-ack-mock.html
            socket.setNoDelay(true);
          }
          this.createSocketCount++;
          if (this.options.socketActiveTTL) {
            socket[SOCKET_CREATED_TIME] = Date.now();
          }
          // don't show the hole '-----BEGIN CERTIFICATE----' key string
          socket[SOCKET_NAME] = `sock[${this[CREATE_ID]()}#${
            options._agentKey
          }]`.split("-----BEGIN", 1)[0];
          socket[SOCKET_REQUEST_COUNT] = 1;
          socket[SOCKET_REQUEST_FINISHED_COUNT] = 0;
          installListeners(this, socket, options);
        }

        createConnection(options, oncreate) {
          let called = false;
          const onNewCreate = (err, socket) => {
            if (called) return;
            called = true;

            if (err) {
              this.createSocketErrorCount++;
              return oncreate(err);
            }
            this[INIT_SOCKET](socket, options);
            oncreate(err, socket);
          };
          const newSocket = super.createConnection(options, onNewCreate);
          if (newSocket) onNewCreate(null, newSocket);
          return newSocket;
        }

        get statusChanged() {
          const changed =
            this.createSocketCount !== this.createSocketCountLastCheck ||
            this.createSocketErrorCount !==
              this.createSocketErrorCountLastCheck ||
            this.closeSocketCount !== this.closeSocketCountLastCheck ||
            this.errorSocketCount !== this.errorSocketCountLastCheck ||
            this.timeoutSocketCount !== this.timeoutSocketCountLastCheck ||
            this.requestCount !== this.requestCountLastCheck;
          if (changed) {
            this.createSocketCountLastCheck = this.createSocketCount;
            this.createSocketErrorCountLastCheck = this.createSocketErrorCount;
            this.closeSocketCountLastCheck = this.closeSocketCount;
            this.errorSocketCountLastCheck = this.errorSocketCount;
            this.timeoutSocketCountLastCheck = this.timeoutSocketCount;
            this.requestCountLastCheck = this.requestCount;
          }
          return changed;
        }
        getCurrentStatus() {
          return {
            createSocketCount: this.createSocketCount,
            createSocketErrorCount: this.createSocketErrorCount,
            closeSocketCount: this.closeSocketCount,
            errorSocketCount: this.errorSocketCount,
            timeoutSocketCount: this.timeoutSocketCount,
            requestCount: this.requestCount,
            freeSockets: inspect(this.freeSockets),
            sockets: inspect(this.sockets),
            requests: inspect(this.requests),
          };
        }
      // node 8 don't has timeout attribute on socket
      // https://github.com/nodejs/node/pull/21204/files#diff-e6ef024c3775d787c38487a6309e491dR408
      function getSocketTimeout(socket) {
        return socket.timeout || socket._idleTimeout;
      }
      function installListeners(agent, socket, options) {
        debug(
          "%s create, timeout %sms",
          socket[SOCKET_NAME],
          getSocketTimeout(socket)
        );

        // listener socket events: close, timeout, error, free
        function onFree() {
          // create and socket.emit('free') logic
          // https://github.com/nodejs/node/blob/master/lib/_http_agent.js#L311
          // no req on the socket, it should be the new socket
          if (!socket._httpMessage && socket[SOCKET_REQUEST_COUNT] === 1)
            return;
          socket[SOCKET_REQUEST_FINISHED_COUNT]++;
          agent.requestCount++;
          debug(
            "%s(requests: %s, finished: %s) free",
            socket[SOCKET_NAME],
            socket[SOCKET_REQUEST_COUNT],
            socket[SOCKET_REQUEST_FINISHED_COUNT]
          );

          // should reuse on pedding requests?
          const name = agent.getName(options);
          if (
            socket.writable &&
            agent.requests[name] &&
            agent.requests[name].length
          ) {
            // will be reuse on agent free listener
            socket[SOCKET_REQUEST_COUNT]++;
            debug(
              "%s(requests: %s, finished: %s) will be reuse on agent free event",
              socket[SOCKET_NAME],
              socket[SOCKET_REQUEST_COUNT],
              socket[SOCKET_REQUEST_FINISHED_COUNT]
            );
          }
        }
        socket.on("free", onFree);

        function onClose(isError) {
          debug(
            "%s(requests: %s, finished: %s) close, isError: %s",
            socket[SOCKET_NAME],
            socket[SOCKET_REQUEST_COUNT],
            socket[SOCKET_REQUEST_FINISHED_COUNT],
            isError
          );
          agent.closeSocketCount++;
        }
        socket.on("close", onClose);

        // start socket timeout handler
        function onTimeout() {
          // onTimeout and emitRequestTimeout(_http_client.js)
          // https://github.com/nodejs/node/blob/v12.x/lib/_http_client.js#L711
          const listenerCount = socket.listeners("timeout").length;
          // node <= 10, default listenerCount is 1, onTimeout
          // 11 < node <= 12, default listenerCount is 2, onTimeout and emitRequestTimeout
          // node >= 13, default listenerCount is 3, onTimeout,
          //   onTimeout(https://github.com/nodejs/node/pull/32000/files#diff-5f7fb0850412c6be189faeddea6c5359R333)
          //   and emitRequestTimeout
          const timeout = getSocketTimeout(socket);
          const req = socket._httpMessage;
          const reqTimeoutListenerCount =
            (req && req.listeners("timeout").length) || 0;
          debug(
            "%s(requests: %s, finished: %s) timeout after %sms, listeners %s, defaultTimeoutListenerCount %s, hasHttpRequest %s, HttpRequest timeoutListenerCount %s",
            socket[SOCKET_NAME],
            socket[SOCKET_REQUEST_COUNT],
            socket[SOCKET_REQUEST_FINISHED_COUNT],
            timeout,
            listenerCount,
            defaultTimeoutListenerCount,
            !!req,
            reqTimeoutListenerCount
          );
          if (debug.enabled) {
            debug(
              "timeout listeners: %s",
              socket
                .listeners("timeout")
                .map((f) => f.name)
                .join(", ")
            );
          }
          agent.timeoutSocketCount++;
          const name = agent.getName(options);
          if (
            agent.freeSockets[name] &&
            agent.freeSockets[name].indexOf(socket) !== -1
          ) {
            // free socket timeout, destroy quietly
            socket.destroy();
            // Remove it from freeSockets list immediately to prevent new requests
            // from being sent through this socket.
            agent.removeSocket(socket, options);
            debug("%s is free, destroy quietly", socket[SOCKET_NAME]);
          } else {
            // if there is no any request socket timeout handler,
            // agent need to handle socket timeout itself.
            //
            // custom request socket timeout handle logic must follow these rules:
            //  1. Destroy socket first
            //  2. Must emit socket 'agentRemove' event tell agent remove socket
            //     from freeSockets list immediately.
            //     Otherise you may be get 'socket hang up' error when reuse
            //     free socket and timeout happen in the same time.
            if (reqTimeoutListenerCount === 0) {
              const error = new Error("Socket timeout");
              error.code = "ERR_SOCKET_TIMEOUT";
              error.timeout = timeout;
              // must manually call socket.end() or socket.destroy() to end the connection.
              // https://nodejs.org/dist/latest-v10.x/docs/api/net.html#net_socket_settimeout_timeout_callback
              socket.destroy(error);
              agent.removeSocket(socket, options);
              debug("%s destroy with timeout error", socket[SOCKET_NAME]);
            }
          }
        }
        socket.on("timeout", onTimeout);

        function onError(err) {
          const listenerCount = socket.listeners("error").length;
          debug(
            "%s(requests: %s, finished: %s) error: %s, listenerCount: %s",
            socket[SOCKET_NAME],
            socket[SOCKET_REQUEST_COUNT],
            socket[SOCKET_REQUEST_FINISHED_COUNT],
            err,
            listenerCount
          );
          agent.errorSocketCount++;
          if (listenerCount === 1) {
            // if socket don't contain error event handler, don't catch it, emit it again
            debug("%s emit uncaught error event", socket[SOCKET_NAME]);
            socket.removeListener("error", onError);
            socket.emit("error", err);
          }
        }
        socket.on("error", onError);

        function onRemove() {
          debug(
            "%s(requests: %s, finished: %s) agentRemove",
            socket[SOCKET_NAME],
            socket[SOCKET_REQUEST_COUNT],
            socket[SOCKET_REQUEST_FINISHED_COUNT]
          );
          // We need this function for cases like HTTP 'upgrade'
          // (defined by WebSockets) where we need to remove a socket from the
          // pool because it'll be locked up indefinitely
          socket.removeListener("close", onClose);
          socket.removeListener("error", onError);
          socket.removeListener("free", onFree);
          socket.removeListener("timeout", onTimeout);
          socket.removeListener("agentRemove", onRemove);
        }
        socket.on("agentRemove", onRemove);
      }
      module.exports = Agent;

      function inspect(obj) {
        const res = {};
        for (const key in obj) {
          res[key] = obj[key].length;
        }
        return res;
      /***/
    },
    /***/ 7757: /***/ (module) => {
      "use strict";

      module.exports = {
        // agent
        CURRENT_ID: Symbol("agentkeepalive#currentId"),
        CREATE_ID: Symbol("agentkeepalive#createId"),
        INIT_SOCKET: Symbol("agentkeepalive#initSocket"),
        CREATE_HTTPS_CONNECTION: Symbol("agentkeepalive#createHttpsConnection"),
        // socket
        SOCKET_CREATED_TIME: Symbol("agentkeepalive#socketCreatedTime"),
        SOCKET_NAME: Symbol("agentkeepalive#socketName"),
        SOCKET_REQUEST_COUNT: Symbol("agentkeepalive#socketRequestCount"),
        SOCKET_REQUEST_FINISHED_COUNT: Symbol(
          "agentkeepalive#socketRequestFinishedCount"
        ),
      };

      /***/
    },
    /***/ 5500: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";
      const OriginalHttpsAgent = __nccwpck_require__(5687).Agent;
      const HttpAgent = __nccwpck_require__(5006);
      const { INIT_SOCKET, CREATE_HTTPS_CONNECTION } =
        __nccwpck_require__(7757);
      class HttpsAgent extends HttpAgent {
        constructor(options) {
          super(options);

          this.defaultPort = 443;
          this.protocol = "https:";
          this.maxCachedSessions = this.options.maxCachedSessions;
          /* istanbul ignore next */
          if (this.maxCachedSessions === undefined) {
            this.maxCachedSessions = 100;
          }
          this._sessionCache = {
            map: {},
            list: [],
          };
        }
        createConnection(options, oncreate) {
          const socket = this[CREATE_HTTPS_CONNECTION](options, oncreate);
          this[INIT_SOCKET](socket, options);
          return socket;
        }
      }
      // https://github.com/nodejs/node/blob/master/lib/https.js#L89
      HttpsAgent.prototype[CREATE_HTTPS_CONNECTION] =
        OriginalHttpsAgent.prototype.createConnection;

      [
        "getName",
        "_getSession",
        "_cacheSession",
        // https://github.com/nodejs/node/pull/4982
        "_evictSession",
      ].forEach(function (method) {
        /* istanbul ignore next */
        if (typeof OriginalHttpsAgent.prototype[method] === "function") {
          HttpsAgent.prototype[method] = OriginalHttpsAgent.prototype[method];
        }
      });
      module.exports = HttpsAgent;
      /***/
    },
    /***/ 9417: /***/ (module) => {
      "use strict";
      module.exports = balanced;
      function balanced(a, b, str) {
        if (a instanceof RegExp) a = maybeMatch(a, str);
        if (b instanceof RegExp) b = maybeMatch(b, str);
        var r = range(a, b, str);
        return (
          r && {
            start: r[0],
            end: r[1],
            pre: str.slice(0, r[0]),
            body: str.slice(r[0] + a.length, r[1]),
            post: str.slice(r[1] + b.length),
          }
        );
      }
      function maybeMatch(reg, str) {
        var m = str.match(reg);
        return m ? m[0] : null;
      }
      balanced.range = range;
      function range(a, b, str) {
        var begs, beg, left, right, result;
        var ai = str.indexOf(a);
        var bi = str.indexOf(b, ai + 1);
        var i = ai;
        if (ai >= 0 && bi > 0) {
          if (a === b) {
            return [ai, bi];
          }
          begs = [];
          left = str.length;

          while (i >= 0 && !result) {
            if (i == ai) {
              begs.push(i);
              ai = str.indexOf(a, i + 1);
            } else if (begs.length == 1) {
              result = [begs.pop(), bi];
            } else {
              beg = begs.pop();
              if (beg < left) {
                left = beg;
                right = bi;
              }
              bi = str.indexOf(b, i + 1);
            }
            i = ai < bi && ai >= 0 ? ai : bi;
          }
          if (begs.length) {
            result = [left, right];
          }
        }
        return result;
      }
      /***/
    },
    /***/ 3682: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      var register = __nccwpck_require__(4670);
      var addHook = __nccwpck_require__(5549);
      var removeHook = __nccwpck_require__(6819);

      // bind with array of arguments: https://stackoverflow.com/a/21792913
      var bind = Function.bind;
      var bindable = bind.bind(bind);

      function bindApi(hook, state, name) {
        var removeHookRef = bindable(removeHook, null).apply(
          null,
          name ? [state, name] : [state]
        );
        hook.api = { remove: removeHookRef };
        hook.remove = removeHookRef;
        ["before", "error", "after", "wrap"].forEach(function (kind) {
          var args = name ? [state, kind, name] : [state, kind];
          hook[kind] = hook.api[kind] = bindable(addHook, null).apply(
            null,
            args
          );
        });
      }
      function HookSingular() {
        var singularHookName = "h";
        var singularHookState = {
          registry: {},
        };
        var singularHook = register.bind(
          null,
          singularHookState,
          singularHookName
        );
        bindApi(singularHook, singularHookState, singularHookName);
        return singularHook;
      }
      function HookCollection() {
        var state = {
          registry: {},
        };
        var hook = register.bind(null, state);
        bindApi(hook, state);
        return hook;
      var collectionHookDeprecationMessageDisplayed = false;
      function Hook() {
        if (!collectionHookDeprecationMessageDisplayed) {
          console.warn(
            '[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4'
          );
          collectionHookDeprecationMessageDisplayed = true;
        }
        return HookCollection();
      }
      Hook.Singular = HookSingular.bind();
      Hook.Collection = HookCollection.bind();
      module.exports = Hook;
      // expose constructors as a named property for TypeScript
      module.exports.Hook = Hook;
      module.exports.Singular = Hook.Singular;
      module.exports.Collection = Hook.Collection;
      /***/
    },
    /***/ 5549: /***/ (module) => {
      module.exports = addHook;
      function addHook(state, kind, name, hook) {
        var orig = hook;
        if (!state.registry[name]) {
          state.registry[name] = [];
        }
        if (kind === "before") {
          hook = function (method, options) {
            return Promise.resolve()
              .then(orig.bind(null, options))
              .then(method.bind(null, options));
          };
        }
        if (kind === "after") {
          hook = function (method, options) {
            var result;
            return Promise.resolve()
              .then(method.bind(null, options))
              .then(function (result_) {
                result = result_;
                return orig(result, options);
              })
              .then(function () {
                return result;
              });
          };
        }
        if (kind === "error") {
          hook = function (method, options) {
            return Promise.resolve()
              .then(method.bind(null, options))
              .catch(function (error) {
                return orig(error, options);
              });
          };
        }
        state.registry[name].push({
          hook: hook,
          orig: orig,
        });
      }
      /***/
    },
    /***/ 4670: /***/ (module) => {
      module.exports = register;
      function register(state, name, method, options) {
        if (typeof method !== "function") {
          throw new Error("method for before hook must be a function");
        }
        if (!options) {
          options = {};
        }
        if (Array.isArray(name)) {
          return name.reverse().reduce(function (callback, name) {
            return register.bind(null, state, name, callback, options);
          }, method)();
        }
        return Promise.resolve().then(function () {
          if (!state.registry[name]) {
            return method(options);
          }
          return state.registry[name].reduce(function (method, registered) {
            return registered.hook.bind(null, method, options);
          }, method)();
        });
      }
      /***/
    },
    /***/ 6819: /***/ (module) => {
      module.exports = removeHook;
      function removeHook(state, name, method) {
        if (!state.registry[name]) {
          return;
        }
        var index = state.registry[name]
          .map(function (registered) {
            return registered.orig;
          })
          .indexOf(method);
        if (index === -1) {
          return;
        }
        state.registry[name].splice(index, 1);
      }
      /***/
    },
    /***/ 3717: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      var balanced = __nccwpck_require__(9417);
      module.exports = expandTop;
      var escSlash = "\0SLASH" + Math.random() + "\0";
      var escOpen = "\0OPEN" + Math.random() + "\0";
      var escClose = "\0CLOSE" + Math.random() + "\0";
      var escComma = "\0COMMA" + Math.random() + "\0";
      var escPeriod = "\0PERIOD" + Math.random() + "\0";
      function numeric(str) {
        return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
      }
      function escapeBraces(str) {
        return str
          .split("\\\\")
          .join(escSlash)
          .split("\\{")
          .join(escOpen)
          .split("\\}")
          .join(escClose)
          .split("\\,")
          .join(escComma)
          .split("\\.")
          .join(escPeriod);
      }
      function unescapeBraces(str) {
        return str
          .split(escSlash)
          .join("\\")
          .split(escOpen)
          .join("{")
          .split(escClose)
          .join("}")
          .split(escComma)
          .join(",")
          .split(escPeriod)
          .join(".");
      }
      // Basically just str.split(","), but handling cases
      // where we have nested braced sections, which should be
      // treated as individual members, like {a,{b,c},d}
      function parseCommaParts(str) {
        if (!str) return [""];
        var parts = [];
        var m = balanced("{", "}", str);
        if (!m) return str.split(",");
        var pre = m.pre;
        var body = m.body;
        var post = m.post;
        var p = pre.split(",");
        p[p.length - 1] += "{" + body + "}";
        var postParts = parseCommaParts(post);
        if (post.length) {
          p[p.length - 1] += postParts.shift();
          p.push.apply(p, postParts);
        }
        parts.push.apply(parts, p);
        return parts;
      }
      function expandTop(str) {
        if (!str) return [];
        // I don't know why Bash 4.3 does this, but it does.
        // Anything starting with {} will have the first two bytes preserved
        // but *only* at the top level, so {},a}b will not expand to anything,
        // but a{},b}c will be expanded to [a}c,abc].
        // One could argue that this is a bug in Bash, but since the goal of
        // this module is to match Bash's rules, we escape a leading {}
        if (str.substr(0, 2) === "{}") {
          str = "\\{\\}" + str.substr(2);
        }
        return expand(escapeBraces(str), true).map(unescapeBraces);
      }
      function embrace(str) {
        return "{" + str + "}";
      }
      function isPadded(el) {
        return /^-?0\d/.test(el);
      }
      function lte(i, y) {
        return i <= y;
      }
      function gte(i, y) {
        return i >= y;
      }
      function expand(str, isTop) {
        var expansions = [];
        var m = balanced("{", "}", str);
        if (!m) return [str];
        // no need to expand pre, since it is guaranteed to be free of brace-sets
        var pre = m.pre;
        var post = m.post.length ? expand(m.post, false) : [""];
        if (/\$$/.test(m.pre)) {
          for (var k = 0; k < post.length; k++) {
            var expansion = pre + "{" + m.body + "}" + post[k];
            expansions.push(expansion);
          }
        } else {
          var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
          var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(
            m.body
          );
          var isSequence = isNumericSequence || isAlphaSequence;
          var isOptions = m.body.indexOf(",") >= 0;
          if (!isSequence && !isOptions) {
            // {a},b}
            if (m.post.match(/,.*\}/)) {
              str = m.pre + "{" + m.body + escClose + m.post;
              return expand(str);
            }
            return [str];
          }
          var n;
          if (isSequence) {
            n = m.body.split(/\.\./);
          } else {
            n = parseCommaParts(m.body);
            if (n.length === 1) {
              // x{{a,b}}y ==> x{a}y x{b}y
              n = expand(n[0], false).map(embrace);
              if (n.length === 1) {
                return post.map(function (p) {
                  return m.pre + n[0] + p;
                });
              }
            }
          }
          // at this point, n is the parts, and we know it's not a comma set
          // with a single entry.
          var N;

          if (isSequence) {
            var x = numeric(n[0]);
            var y = numeric(n[1]);
            var width = Math.max(n[0].length, n[1].length);
            var incr = n.length == 3 ? Math.abs(numeric(n[2])) : 1;
            var test = lte;
            var reverse = y < x;
            if (reverse) {
              incr *= -1;
              test = gte;
            }
            var pad = n.some(isPadded);

            N = [];

            for (var i = x; test(i, y); i += incr) {
              var c;
              if (isAlphaSequence) {
                c = String.fromCharCode(i);
                if (c === "\\") c = "";
              } else {
                c = String(i);
                if (pad) {
                  var need = width - c.length;
                  if (need > 0) {
                    var z = new Array(need + 1).join("0");
                    if (i < 0) c = "-" + z + c.slice(1);
                    else c = z + c;
                  }
                }
              }
              N.push(c);
            }
          } else {
            N = [];
            for (var j = 0; j < n.length; j++) {
              N.push.apply(N, expand(n[j], false));
            }
          }
          for (var j = 0; j < N.length; j++) {
            for (var k = 0; k < post.length; k++) {
              var expansion = pre + N[j] + post[k];
              if (!isTop || isSequence || expansion) expansions.push(expansion);
            }
          }
        }
        return expansions;
      }
      /***/
    },
    /***/ 2028: /***/ (module) => {
      /**
       * Helpers.
       */

      var s = 1000;
      var m = s * 60;
      var h = m * 60;
      var d = h * 24;
      var w = d * 7;
      var y = d * 365.25;

      /**
       * Parse or format the given `val`.
       *
       * Options:
       *
       *  - `long` verbose formatting [false]
       *
       * @param {String|Number} val
       * @param {Object} [options]
       * @throws {Error} throw an error if val is not a non-empty string or a number
       * @return {String|Number}
       * @api public
       */

      module.exports = function (val, options) {
        options = options || {};
        var type = typeof val;
        if (type === "string" && val.length > 0) {
          return parse(val);
        } else if (type === "number" && isFinite(val)) {
          return options.long ? fmtLong(val) : fmtShort(val);
        }
        throw new Error(
          "val is not a non-empty string or a valid number. val=" +
            JSON.stringify(val)
        );
      };

      /**
       * Parse the given `str` and return milliseconds.
       *
       * @param {String} str
       * @return {Number}
       * @api private
       */

      function parse(str) {
        str = String(str);
        if (str.length > 100) {
          return;
        }
        var match =
          /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
            str
          );
        if (!match) {
          return;
        }
        var n = parseFloat(match[1]);
        var type = (match[2] || "ms").toLowerCase();
        switch (type) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return n * y;
          case "weeks":
          case "week":
          case "w":
            return n * w;
          case "days":
          case "day":
          case "d":
            return n * d;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return n * h;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return n * m;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return n * s;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return n;
          default:
            return undefined;
        }
      }
      /**
       * Short format for `ms`.
       *
       * @param {Number} ms
       * @return {String}
       * @api private
       */
      function fmtShort(ms) {
        var msAbs = Math.abs(ms);
        if (msAbs >= d) {
          return Math.round(ms / d) + "d";
        }
        if (msAbs >= h) {
          return Math.round(ms / h) + "h";
        }
        if (msAbs >= m) {
          return Math.round(ms / m) + "m";
        }
        if (msAbs >= s) {
          return Math.round(ms / s) + "s";
        }
        return ms + "ms";
      }
      /**
       * Long format for `ms`.
       *
       * @param {Number} ms
       * @return {String}
       * @api private
       */
      function fmtLong(ms) {
        var msAbs = Math.abs(ms);
        if (msAbs >= d) {
          return plural(ms, msAbs, d, "day");
        }
        if (msAbs >= h) {
          return plural(ms, msAbs, h, "hour");
        }
        if (msAbs >= m) {
          return plural(ms, msAbs, m, "minute");
        }
        if (msAbs >= s) {
          return plural(ms, msAbs, s, "second");
        }
        return ms + " ms";
      }
      /**
       * Pluralization helper.
       */
      function plural(ms, msAbs, n, name) {
        var isPlural = msAbs >= n * 1.5;
        return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
      }
      /***/
    },
    /***/ 8222: /***/ (module, exports, __nccwpck_require__) => {
      /* eslint-env browser */

      /**
       * This is the web browser implementation of `debug()`.
       */

      exports.formatArgs = formatArgs;
      exports.save = save;
      exports.load = load;
      exports.useColors = useColors;
      exports.storage = localstorage();
      exports.destroy = (() => {
        let warned = false;

        return () => {
          if (!warned) {
            warned = true;
            console.warn(
              "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
            );
          }
        };
      })();

      /**
       * Colors.
       */

      exports.colors = [
        "#0000CC",
        "#0000FF",
        "#0033CC",
        "#0033FF",
        "#0066CC",
        "#0066FF",
        "#0099CC",
        "#0099FF",
        "#00CC00",
        "#00CC33",
        "#00CC66",
        "#00CC99",
        "#00CCCC",
        "#00CCFF",
        "#3300CC",
        "#3300FF",
        "#3333CC",
        "#3333FF",
        "#3366CC",
        "#3366FF",
        "#3399CC",
        "#3399FF",
        "#33CC00",
        "#33CC33",
        "#33CC66",
        "#33CC99",
        "#33CCCC",
        "#33CCFF",
        "#6600CC",
        "#6600FF",
        "#6633CC",
        "#6633FF",
        "#66CC00",
        "#66CC33",
        "#9900CC",
        "#9900FF",
        "#9933CC",
        "#9933FF",
        "#99CC00",
        "#99CC33",
        "#CC0000",
        "#CC0033",
        "#CC0066",
        "#CC0099",
        "#CC00CC",
        "#CC00FF",
        "#CC3300",
        "#CC3333",
        "#CC3366",
        "#CC3399",
        "#CC33CC",
        "#CC33FF",
        "#CC6600",
        "#CC6633",
        "#CC9900",
        "#CC9933",
        "#CCCC00",
        "#CCCC33",
        "#FF0000",
        "#FF0033",
        "#FF0066",
        "#FF0099",
        "#FF00CC",
        "#FF00FF",
        "#FF3300",
        "#FF3333",
        "#FF3366",
        "#FF3399",
        "#FF33CC",
        "#FF33FF",
        "#FF6600",
        "#FF6633",
        "#FF9900",
        "#FF9933",
        "#FFCC00",
        "#FFCC33",
      ];

      /**
       * Currently only WebKit-based Web Inspectors, Firefox >= v31,
       * and the Firebug extension (any Firefox version) are known
       * to support "%c" CSS customizations.
       *
       * TODO: add a `localStorage` variable to explicitly enable/disable colors
       */

      // eslint-disable-next-line complexity
      function useColors() {
        // NB: In an Electron preload script, document will be defined but not fully
        // initialized. Since we know we're in Chrome, we'll just detect this case
        // explicitly
        if (
          typeof window !== "undefined" &&
          window.process &&
          (window.process.type === "renderer" || window.process.__nwjs)
        ) {
          return true;
        }
        // Internet Explorer and Edge do not support colors.
        if (
          typeof navigator !== "undefined" &&
          navigator.userAgent &&
          navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)
        ) {
          return false;

        let m;

        // Is webkit? http://stackoverflow.com/a/16459606/376773
        // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
        return (
          (typeof document !== "undefined" &&
            document.documentElement &&
            document.documentElement.style &&
            document.documentElement.style.WebkitAppearance) ||
          // Is firebug? http://stackoverflow.com/a/398120/376773
          (typeof window !== "undefined" &&
            window.console &&
            (window.console.firebug ||
              (window.console.exception && window.console.table))) ||
          // Is firefox >= v31?
          // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
          (typeof navigator !== "undefined" &&
            navigator.userAgent &&
            (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) &&
            parseInt(m[1], 10) >= 31) ||
          // Double check webkit in userAgent just in case we are in a worker
          (typeof navigator !== "undefined" &&
            navigator.userAgent &&
            navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))
        );
      /**
       * Colorize log arguments if enabled.
       *
       * @api public
       */

      function formatArgs(args) {
        args[0] =
          (this.useColors ? "%c" : "") +
          this.namespace +
          (this.useColors ? " %c" : " ") +
          args[0] +
          (this.useColors ? "%c " : " ") +
          "+" +
          module.exports.humanize(this.diff);

        if (!this.useColors) {
          return;
        const c = "color: " + this.color;
        args.splice(1, 0, c, "color: inherit");

        // The final "%c" is somewhat tricky, because there could be other
        // arguments passed either before or after the %c, so we need to
        // figure out the correct index to insert the CSS into
        let index = 0;
        let lastC = 0;
        args[0].replace(/%[a-zA-Z%]/g, (match) => {
          if (match === "%%") {
            return;
          }
          index++;
          if (match === "%c") {
            // We only are interested in the *last* %c
            // (the user may have provided their own)
            lastC = index;
          }
        });

        args.splice(lastC, 0, c);
      /**
       * Invokes `console.debug()` when available.
       * No-op when `console.debug` is not a "function".
       * If `console.debug` is not available, falls back
       * to `console.log`.
       *
       * @api public
       */
      exports.log = console.debug || console.log || (() => {});

      /**
       * Save `namespaces`.
       *
       * @param {String} namespaces
       * @api private
       */
      function save(namespaces) {
        try {
          if (namespaces) {
            exports.storage.setItem("debug", namespaces);
          } else {
            exports.storage.removeItem("debug");
          }
        } catch (error) {
          // Swallow
          // XXX (@Qix-) should we be logging these?
        }
      /**
       * Load `namespaces`.
       *
       * @return {String} returns the previously persisted debug modes
       * @api private
       */
      function load() {
        let r;
        try {
          r = exports.storage.getItem("debug");
        } catch (error) {
          // Swallow
          // XXX (@Qix-) should we be logging these?
        }
        // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
        if (!r && typeof process !== "undefined" && "env" in process) {
          r = process.env.DEBUG;
        }
        return r;
      }
      /**
       * Localstorage attempts to return the localstorage.
       *
       * This is necessary because safari throws
       * when a user disables cookies/localstorage
       * and you attempt to access it.
       *
       * @return {LocalStorage}
       * @api private
       */

      function localstorage() {
        try {
          // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
          // The Browser also has localStorage in the global context.
          return localStorage;
        } catch (error) {
          // Swallow
          // XXX (@Qix-) should we be logging these?
        }
      }
      module.exports = __nccwpck_require__(6243)(exports);
      const { formatters } = module.exports;
      /**
       * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
       */
      formatters.j = function (v) {
        try {
          return JSON.stringify(v);
        } catch (error) {
          return "[UnexpectedJSONParseError]: " + error.message;
        }
      };
      /***/
    },
    /***/ 6243: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      /**
       * This is the common logic for both the Node.js and web browser
       * implementations of `debug()`.
       */

      function setup(env) {
        createDebug.debug = createDebug;
        createDebug.default = createDebug;
        createDebug.coerce = coerce;
        createDebug.disable = disable;
        createDebug.enable = enable;
        createDebug.enabled = enabled;
        createDebug.humanize = __nccwpck_require__(2028);
        createDebug.destroy = destroy;

        Object.keys(env).forEach((key) => {
          createDebug[key] = env[key];
        });
        /**
         * The currently active debug mode names, and names to skip.
         */
        createDebug.names = [];
        createDebug.skips = [];
        /**
         * Map of special "%n" handling functions, for the debug "format" argument.
         *
         * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
         */
        createDebug.formatters = {};
        /**
         * Selects a color for a debug namespace
         * @param {String} namespace The namespace string for the debug instance to be colored
         * @return {Number|String} An ANSI color code for the given namespace
         * @api private
         */
        function selectColor(namespace) {
          let hash = 0;
          for (let i = 0; i < namespace.length; i++) {
            hash = (hash << 5) - hash + namespace.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
          }
          return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
        }
        createDebug.selectColor = selectColor;
        /**
         * Create a debugger with the given `namespace`.
         *
         * @param {String} namespace
         * @return {Function}
         * @api public
         */
        function createDebug(namespace) {
          let prevTime;
          let enableOverride = null;
          let namespacesCache;
          let enabledCache;

          function debug(...args) {
            // Disabled?
            if (!debug.enabled) {
              return;
            }

            const self = debug;

            // Set `diff` timestamp
            const curr = Number(new Date());
            const ms = curr - (prevTime || curr);
            self.diff = ms;
            self.prev = prevTime;
            self.curr = curr;
            prevTime = curr;

            args[0] = createDebug.coerce(args[0]);

            if (typeof args[0] !== "string") {
              // Anything else let's inspect with %O
              args.unshift("%O");
            }

            // Apply any `formatters` transformations
            let index = 0;
            args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
              // If we encounter an escaped % then don't increase the array index
              if (match === "%%") {
                return "%";
              }
              index++;
              const formatter = createDebug.formatters[format];
              if (typeof formatter === "function") {
                const val = args[index];
                match = formatter.call(self, val);

                // Now we need to remove `args[index]` since it's inlined in the `format`
                args.splice(index, 1);
                index--;
              }
              return match;
            });
            // Apply env-specific formatting (colors, etc.)
            createDebug.formatArgs.call(self, args);
            const logFn = self.log || createDebug.log;
            logFn.apply(self, args);
          }
          debug.namespace = namespace;
          debug.useColors = createDebug.useColors();
          debug.color = createDebug.selectColor(namespace);
          debug.extend = extend;
          debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

          Object.defineProperty(debug, "enabled", {
            enumerable: true,
            configurable: false,
            get: () => {
              if (enableOverride !== null) {
                return enableOverride;
              }
              if (namespacesCache !== createDebug.namespaces) {
                namespacesCache = createDebug.namespaces;
                enabledCache = createDebug.enabled(namespace);
              }

              return enabledCache;
            },
            set: (v) => {
              enableOverride = v;
            },
          });
          // Env-specific initialization logic for debug instances
          if (typeof createDebug.init === "function") {
            createDebug.init(debug);
          }
          return debug;
        function extend(namespace, delimiter) {
          const newDebug = createDebug(
            this.namespace +
              (typeof delimiter === "undefined" ? ":" : delimiter) +
              namespace
          );
          newDebug.log = this.log;
          return newDebug;
        }
        /**
         * Enables a debug mode by namespaces. This can include modes
         * separated by a colon and wildcards.
         *
         * @param {String} namespaces
         * @api public
         */
        function enable(namespaces) {
          createDebug.save(namespaces);
          createDebug.namespaces = namespaces;
          createDebug.names = [];
          createDebug.skips = [];
          let i;
          const split = (
            typeof namespaces === "string" ? namespaces : ""
          ).split(/[\s,]+/);
          const len = split.length;
          for (i = 0; i < len; i++) {
            if (!split[i]) {
              // ignore empty strings
              continue;
            }
            namespaces = split[i].replace(/\*/g, ".*?");
            if (namespaces[0] === "-") {
              createDebug.skips.push(
                new RegExp("^" + namespaces.slice(1) + "$")
              );
            } else {
              createDebug.names.push(new RegExp("^" + namespaces + "$"));
            }
          }
        /**
         * Disable debug output.
         *
         * @return {String} namespaces
         * @api public
         */
        function disable() {
          const namespaces = [
            ...createDebug.names.map(toNamespace),
            ...createDebug.skips
              .map(toNamespace)
              .map((namespace) => "-" + namespace),
          ].join(",");
          createDebug.enable("");
          return namespaces;
        }
        /**
         * Returns true if the given mode name is enabled, false otherwise.
         *
         * @param {String} name
         * @return {Boolean}
         * @api public
         */
        function enabled(name) {
          if (name[name.length - 1] === "*") {
            return true;
          }
          let i;
          let len;
          for (i = 0, len = createDebug.skips.length; i < len; i++) {
            if (createDebug.skips[i].test(name)) {
              return false;
            }
          }
          for (i = 0, len = createDebug.names.length; i < len; i++) {
            if (createDebug.names[i].test(name)) {
              return true;
            }
          }
          return false;
        /**
         * Convert regexp to namespace
         *
         * @param {RegExp} regxep
         * @return {String} namespace
         * @api private
         */
        function toNamespace(regexp) {
          return regexp
            .toString()
            .substring(2, regexp.toString().length - 2)
            .replace(/\.\*\?$/, "*");
        /**
         * Coerce `val`.
         *
         * @param {Mixed} val
         * @return {Mixed}
         * @api private
         */
        function coerce(val) {
          if (val instanceof Error) {
            return val.stack || val.message;
          }
          return val;
        }
        /**
         * XXX DO NOT USE. This is a temporary stub function.
         * XXX It WILL be removed in the next major release.
         */
        function destroy() {
          console.warn(
            "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
          );
        }
        createDebug.enable(createDebug.load());
        return createDebug;
      }
      module.exports = setup;
      /***/
    /***/ 8237: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      /**
       * Detect Electron renderer / nwjs process, which is node, but we should
       * treat as a browser.
       */

      if (
        typeof process === "undefined" ||
        process.type === "renderer" ||
        process.browser === true ||
        process.__nwjs
      ) {
        module.exports = __nccwpck_require__(8222);
      } else {
        module.exports = __nccwpck_require__(4874);
      }
      /***/
    /***/ 4874: /***/ (module, exports, __nccwpck_require__) => {
      /**
       * Module dependencies.
       */
      const tty = __nccwpck_require__(6224);
      const util = __nccwpck_require__(3837);
      /**
       * This is the Node.js implementation of `debug()`.
       */
      exports.init = init;
      exports.log = log;
      exports.formatArgs = formatArgs;
      exports.save = save;
      exports.load = load;
      exports.useColors = useColors;
      exports.destroy = util.deprecate(() => {},
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      /**
       * Colors.
       */
      exports.colors = [6, 2, 3, 4, 5, 1];
      try {
        // Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
        // eslint-disable-next-line import/no-extraneous-dependencies
        const supportsColor = __nccwpck_require__(132);
        if (
          supportsColor &&
          (supportsColor.stderr || supportsColor).level >= 2
        ) {
          exports.colors = [
            20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62,
            63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112,
            113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165,
            166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196,
            197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209,
            214, 215, 220, 221,
          ];
        }
      } catch (error) {
        // Swallow - we only care if `supports-color` is available; it doesn't have to be.
      }
      /**
       * Build up the default `inspectOpts` object from the environment variables.
       *
       *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
       */
      exports.inspectOpts = Object.keys(process.env)
        .filter((key) => {
          return /^debug_/i.test(key);
        })
        .reduce((obj, key) => {
          // Camel-case
          const prop = key
            .substring(6)
            .toLowerCase()
            .replace(/_([a-z])/g, (_, k) => {
              return k.toUpperCase();
            });
          // Coerce string value into JS value
          let val = process.env[key];
          if (/^(yes|on|true|enabled)$/i.test(val)) {
            val = true;
          } else if (/^(no|off|false|disabled)$/i.test(val)) {
            val = false;
          } else if (val === "null") {
            val = null;
          } else {
            val = Number(val);
          }
          obj[prop] = val;
          return obj;
        }, {});
      /**
       * Is stdout a TTY? Colored output is enabled when `true`.
       */
      function useColors() {
        return "colors" in exports.inspectOpts
          ? Boolean(exports.inspectOpts.colors)
          : tty.isatty(process.stderr.fd);
      }
      /**
       * Adds ANSI color escape codes if enabled.
       *
       * @api public
       */
      function formatArgs(args) {
        const { namespace: name, useColors } = this;
        if (useColors) {
          const c = this.color;
          const colorCode = "\u001B[3" + (c < 8 ? c : "8;5;" + c);
          const prefix = `  ${colorCode};1m${name} \u001B[0m`;
          args[0] = prefix + args[0].split("\n").join("\n" + prefix);
          args.push(
            colorCode + "m+" + module.exports.humanize(this.diff) + "\u001B[0m"
          );
        } else {
          args[0] = getDate() + name + " " + args[0];
      }
      function getDate() {
        if (exports.inspectOpts.hideDate) {
          return "";
        return new Date().toISOString() + " ";
      }
      /**
       * Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
       */
      function log(...args) {
        return process.stderr.write(
          util.formatWithOptions(exports.inspectOpts, ...args) + "\n"
        );
      }
      /**
       * Save `namespaces`.
       *
       * @param {String} namespaces
       * @api private
       */
      function save(namespaces) {
        if (namespaces) {
          process.env.DEBUG = namespaces;
        } else {
          // If you set a process.env field to null or undefined, it gets cast to the
          // string 'null' or 'undefined'. Just delete instead.
          delete process.env.DEBUG;
      }
      /**
       * Load `namespaces`.
       *
       * @return {String} returns the previously persisted debug modes
       * @api private
       */
      function load() {
        return process.env.DEBUG;
      }
      /**
       * Init logic for `debug` instances.
       *
       * Create a new `inspectOpts` object in case `useColors` is set
       * differently for a particular `debug` instance.
       */
      function init(debug) {
        debug.inspectOpts = {};
        const keys = Object.keys(exports.inspectOpts);
        for (let i = 0; i < keys.length; i++) {
          debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
      module.exports = __nccwpck_require__(6243)(exports);
      const { formatters } = module.exports;
      /**
       * Map %o to `util.inspect()`, all on a single line.
       */
      formatters.o = function (v) {
        this.inspectOpts.colors = this.useColors;
        return util
          .inspect(v, this.inspectOpts)
          .split("\n")
          .map((str) => str.trim())
          .join(" ");
      };
      /**
       * Map %O to `util.inspect()`, allowing multiple lines if needed.
       */
      formatters.O = function (v) {
        this.inspectOpts.colors = this.useColors;
        return util.inspect(v, this.inspectOpts);
      };
      /***/
    },
    /***/ 8932: /***/ (__unused_webpack_module, exports) => {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class Deprecation extends Error {
        constructor(message) {
          super(message); // Maintains proper stack trace (only available on V8)
          /* istanbul ignore next */
          if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
          }
          this.name = "Deprecation";
        }
      }
      exports.Deprecation = Deprecation;
      /***/
    },
    /***/ 4697: /***/ (module, exports) => {
      "use strict";
      /**
       * @author Toru Nagashima <https://github.com/mysticatea>
       * @copyright 2015 Toru Nagashima. All rights reserved.
       * See LICENSE file in root directory for full license.
       */

      Object.defineProperty(exports, "__esModule", { value: true });

      /**
       * @typedef {object} PrivateData
       * @property {EventTarget} eventTarget The event target.
       * @property {{type:string}} event The original event object.
       * @property {number} eventPhase The current event phase.
       * @property {EventTarget|null} currentTarget The current event target.
       * @property {boolean} canceled The flag to prevent default.
       * @property {boolean} stopped The flag to stop propagation.
       * @property {boolean} immediateStopped The flag to stop propagation immediately.
       * @property {Function|null} passiveListener The listener if the current listener is passive. Otherwise this is null.
       * @property {number} timeStamp The unix time.
       * @private
       */

      /**
       * Private data for event wrappers.
       * @type {WeakMap<Event, PrivateData>}
       * @private
       */
      const privateData = new WeakMap();

      /**
       * Cache for wrapper classes.
       * @type {WeakMap<Object, Function>}
       * @private
       */
      const wrappers = new WeakMap();

      /**
       * Get private data.
       * @param {Event} event The event object to get private data.
       * @returns {PrivateData} The private data of the event.
       * @private
       */
      function pd(event) {
        const retv = privateData.get(event);
        console.assert(
          retv != null,
          "'this' is expected an Event object, but got",
          event
        );
        return retv;
      }
      /**
       * https://dom.spec.whatwg.org/#set-the-canceled-flag
       * @param data {PrivateData} private data.
       */
      function setCancelFlag(data) {
        if (data.passiveListener != null) {
          if (
            typeof console !== "undefined" &&
            typeof console.error === "function"
          ) {
            console.error(
              "Unable to preventDefault inside passive event listener invocation.",
              data.passiveListener
            );
          }
          return;
        }
        if (!data.event.cancelable) {
          return;
        }
        data.canceled = true;
        if (typeof data.event.preventDefault === "function") {
          data.event.preventDefault();
        }
      }
      /**
       * @see https://dom.spec.whatwg.org/#interface-event
       * @private
       */
      /**
       * The event wrapper.
       * @constructor
       * @param {EventTarget} eventTarget The event target of this dispatching.
       * @param {Event|{type:string}} event The original event to wrap.
       */
      function Event(eventTarget, event) {
        privateData.set(this, {
          eventTarget,
          event,
          eventPhase: 2,
          currentTarget: eventTarget,
          canceled: false,
          stopped: false,
          immediateStopped: false,
          passiveListener: null,
          timeStamp: event.timeStamp || Date.now(),
        });
        // https://heycam.github.io/webidl/#Unforgeable
        Object.defineProperty(this, "isTrusted", {
          value: false,
          enumerable: true,
        });
        // Define accessors
        const keys = Object.keys(event);
        for (let i = 0; i < keys.length; ++i) {
          const key = keys[i];
          if (!(key in this)) {
            Object.defineProperty(this, key, defineRedirectDescriptor(key));
          }
        }
      }
      // Should be enumerable, but class methods are not enumerable.
      Event.prototype = {
        /**
         * The type of this event.
         * @type {string}
         */
        get type() {
          return pd(this).event.type;
        },
        /**
         * The target of this event.
         * @type {EventTarget}
         */
        get target() {
          return pd(this).eventTarget;
        },
        /**
         * The target of this event.
         * @type {EventTarget}
         */
        get currentTarget() {
          return pd(this).currentTarget;
        },
        /**
         * @returns {EventTarget[]} The composed path of this event.
         */
        composedPath() {
          const currentTarget = pd(this).currentTarget;
          if (currentTarget == null) {
            return [];
          }
          return [currentTarget];
        },
        /**
         * Constant of NONE.
         * @type {number}
         */
        get NONE() {
          return 0;
        },
        /**
         * Constant of CAPTURING_PHASE.
         * @type {number}
         */
        get CAPTURING_PHASE() {
          return 1;
        },
        /**
         * Constant of AT_TARGET.
         * @type {number}
         */
        get AT_TARGET() {
          return 2;
        },
        /**
         * Constant of BUBBLING_PHASE.
         * @type {number}
         */
        get BUBBLING_PHASE() {
          return 3;
        },
        /**
         * The target of this event.
         * @type {number}
         */
        get eventPhase() {
          return pd(this).eventPhase;
        },
        /**
         * Stop event bubbling.
         * @returns {void}
         */
        stopPropagation() {
          const data = pd(this);
          data.stopped = true;
          if (typeof data.event.stopPropagation === "function") {
            data.event.stopPropagation();
          }
        },
        /**
         * Stop event bubbling.
         * @returns {void}
         */
        stopImmediatePropagation() {
          const data = pd(this);
          data.stopped = true;
          data.immediateStopped = true;
          if (typeof data.event.stopImmediatePropagation === "function") {
            data.event.stopImmediatePropagation();
          }
        },
        /**
         * The flag to be bubbling.
         * @type {boolean}
         */
        get bubbles() {
          return Boolean(pd(this).event.bubbles);
        },
        /**
         * The flag to be cancelable.
         * @type {boolean}
         */
        get cancelable() {
          return Boolean(pd(this).event.cancelable);
        },
        /**
         * Cancel this event.
         * @returns {void}
         */
        preventDefault() {
          setCancelFlag(pd(this));
        },
        /**
         * The flag to indicate cancellation state.
         * @type {boolean}
         */
        get defaultPrevented() {
          return pd(this).canceled;
        },
        /**
         * The flag to be composed.
         * @type {boolean}
         */
        get composed() {
          return Boolean(pd(this).event.composed);
        },
        /**
         * The unix time of this event.
         * @type {number}
         */
        get timeStamp() {
          return pd(this).timeStamp;
        },
        /**
         * The target of this event.
         * @type {EventTarget}
         * @deprecated
         */
        get srcElement() {
          return pd(this).eventTarget;
        },
        /**
         * The flag to stop event bubbling.
         * @type {boolean}
         * @deprecated
         */
        get cancelBubble() {
          return pd(this).stopped;
        },
        set cancelBubble(value) {
          if (!value) {
            return;
          }
          const data = pd(this);
          data.stopped = true;
          if (typeof data.event.cancelBubble === "boolean") {
            data.event.cancelBubble = true;
          }
        },
        /**
         * The flag to indicate cancellation state.
         * @type {boolean}
         * @deprecated
         */
        get returnValue() {
          return !pd(this).canceled;
        },
        set returnValue(value) {
          if (!value) {
            setCancelFlag(pd(this));
          }
        },
        /**
         * Initialize this event object. But do nothing under event dispatching.
         * @param {string} type The event type.
         * @param {boolean} [bubbles=false] The flag to be possible to bubble up.
         * @param {boolean} [cancelable=false] The flag to be possible to cancel.
         * @deprecated
         */
        initEvent() {
          // Do nothing.
        },
      };
      // `constructor` is not enumerable.
      Object.defineProperty(Event.prototype, "constructor", {
        value: Event,
        configurable: true,
        writable: true,
      });
      // Ensure `event instanceof window.Event` is `true`.
      if (
        typeof window !== "undefined" &&
        typeof window.Event !== "undefined"
      ) {
        Object.setPrototypeOf(Event.prototype, window.Event.prototype);
        // Make association for wrappers.
        wrappers.set(window.Event.prototype, Event);
      }
      /**
       * Get the property descriptor to redirect a given property.
       * @param {string} key Property name to define property descriptor.
       * @returns {PropertyDescriptor} The property descriptor to redirect the property.
       * @private
       */
      function defineRedirectDescriptor(key) {
        return {
          get() {
            return pd(this).event[key];
          },
          set(value) {
            pd(this).event[key] = value;
          },
          configurable: true,
          enumerable: true,
        };
      }
      /**
       * Get the property descriptor to call a given method property.
       * @param {string} key Property name to define property descriptor.
       * @returns {PropertyDescriptor} The property descriptor to call the method property.
       * @private
       */
      function defineCallDescriptor(key) {
        return {
          value() {
            const event = pd(this).event;
            return event[key].apply(event, arguments);
          },
          configurable: true,
          enumerable: true,
        };
      }
      /**
       * Define new wrapper class.
       * @param {Function} BaseEvent The base wrapper class.
       * @param {Object} proto The prototype of the original event.
       * @returns {Function} The defined wrapper class.
       * @private
       */
      function defineWrapper(BaseEvent, proto) {
        const keys = Object.keys(proto);
        if (keys.length === 0) {
          return BaseEvent;
        }
        /** CustomEvent */
        function CustomEvent(eventTarget, event) {
          BaseEvent.call(this, eventTarget, event);
        }
        CustomEvent.prototype = Object.create(BaseEvent.prototype, {
          constructor: {
            value: CustomEvent,
            configurable: true,
            writable: true,
          },
        });
        // Define accessors.
        for (let i = 0; i < keys.length; ++i) {
          const key = keys[i];
          if (!(key in BaseEvent.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, key);
            const isFunc = typeof descriptor.value === "function";
            Object.defineProperty(
              CustomEvent.prototype,
              key,
              isFunc ? defineCallDescriptor(key) : defineRedirectDescriptor(key)
            );
          }
        }
        return CustomEvent;
      }
      /**
       * Get the wrapper class of a given prototype.
       * @param {Object} proto The prototype of the original event to get its wrapper.
       * @returns {Function} The wrapper class.
       * @private
       */
      function getWrapper(proto) {
        if (proto == null || proto === Object.prototype) {
          return Event;
        }

        let wrapper = wrappers.get(proto);
        if (wrapper == null) {
          wrapper = defineWrapper(
            getWrapper(Object.getPrototypeOf(proto)),
            proto
          );
          wrappers.set(proto, wrapper);
        }
        return wrapper;
      }
      /**
       * Wrap a given event to management a dispatching.
       * @param {EventTarget} eventTarget The event target of this dispatching.
       * @param {Object} event The event to wrap.
       * @returns {Event} The wrapper instance.
       * @private
       */
      function wrapEvent(eventTarget, event) {
        const Wrapper = getWrapper(Object.getPrototypeOf(event));
        return new Wrapper(eventTarget, event);
      }
      /**
       * Get the immediateStopped flag of a given event.
       * @param {Event} event The event to get.
       * @returns {boolean} The flag to stop propagation immediately.
       * @private
       */
      function isStopped(event) {
        return pd(event).immediateStopped;
      }
      /**
       * Set the current event phase of a given event.
       * @param {Event} event The event to set current target.
       * @param {number} eventPhase New event phase.
       * @returns {void}
       * @private
       */
      function setEventPhase(event, eventPhase) {
        pd(event).eventPhase = eventPhase;
      }
      /**
       * Set the current target of a given event.
       * @param {Event} event The event to set current target.
       * @param {EventTarget|null} currentTarget New current target.
       * @returns {void}
       * @private
       */
      function setCurrentTarget(event, currentTarget) {
        pd(event).currentTarget = currentTarget;
      }
      /**
       * Set a passive listener of a given event.
       * @param {Event} event The event to set current target.
       * @param {Function|null} passiveListener New passive listener.
       * @returns {void}
       * @private
       */
      function setPassiveListener(event, passiveListener) {
        pd(event).passiveListener = passiveListener;
      }
      /**
       * @typedef {object} ListenerNode
       * @property {Function} listener
       * @property {1|2|3} listenerType
       * @property {boolean} passive
       * @property {boolean} once
       * @property {ListenerNode|null} next
       * @private
       */

      /**
       * @type {WeakMap<object, Map<string, ListenerNode>>}
       * @private
       */
      const listenersMap = new WeakMap();

      // Listener types
      const CAPTURE = 1;
      const BUBBLE = 2;
      const ATTRIBUTE = 3;

      /**
       * Check whether a given value is an object or not.
       * @param {any} x The value to check.
       * @returns {boolean} `true` if the value is an object.
       */
      function isObject(x) {
        return x !== null && typeof x === "object"; //eslint-disable-line no-restricted-syntax
      }
      /**
       * Get listeners.
       * @param {EventTarget} eventTarget The event target to get.
       * @returns {Map<string, ListenerNode>} The listeners.
       * @private
       */
      function getListeners(eventTarget) {
        const listeners = listenersMap.get(eventTarget);
        if (listeners == null) {
          throw new TypeError(
            "'this' is expected an EventTarget object, but got another value."
          );
        }
        return listeners;
      }
      /**
       * Get the property descriptor for the event attribute of a given event.
       * @param {string} eventName The event name to get property descriptor.
       * @returns {PropertyDescriptor} The property descriptor.
       * @private
       */
      function defineEventAttributeDescriptor(eventName) {
        return {
          get() {
            const listeners = getListeners(this);
            let node = listeners.get(eventName);
            while (node != null) {
              if (node.listenerType === ATTRIBUTE) {
                return node.listener;
              }
              node = node.next;
            }
            return null;
          },
          set(listener) {
            if (typeof listener !== "function" && !isObject(listener)) {
              listener = null; // eslint-disable-line no-param-reassign
            }
            const listeners = getListeners(this);
            // Traverse to the tail while removing old value.
            let prev = null;
            let node = listeners.get(eventName);
            while (node != null) {
              if (node.listenerType === ATTRIBUTE) {
                // Remove old value.
                if (prev !== null) {
                  prev.next = node.next;
                } else if (node.next !== null) {
                  listeners.set(eventName, node.next);
                } else {
                  listeners.delete(eventName);
                }
              } else {
                prev = node;
              }
              node = node.next;
            }
            // Add new value.
            if (listener !== null) {
              const newNode = {
                listener,
                listenerType: ATTRIBUTE,
                passive: false,
                once: false,
                next: null,
              };
              if (prev === null) {
                listeners.set(eventName, newNode);
              } else {
                prev.next = newNode;
              }
            }
          },
          configurable: true,
          enumerable: true,
        };
      }
      /**
       * Define an event attribute (e.g. `eventTarget.onclick`).
       * @param {Object} eventTargetPrototype The event target prototype to define an event attrbite.
       * @param {string} eventName The event name to define.
       * @returns {void}
       */
      function defineEventAttribute(eventTargetPrototype, eventName) {
        Object.defineProperty(
          eventTargetPrototype,
          `on${eventName}`,
          defineEventAttributeDescriptor(eventName)
        );
      }
      /**
       * Define a custom EventTarget with event attributes.
       * @param {string[]} eventNames Event names for event attributes.
       * @returns {EventTarget} The custom EventTarget.
       * @private
       */
      function defineCustomEventTarget(eventNames) {
        /** CustomEventTarget */
        function CustomEventTarget() {
          EventTarget.call(this);
        }
        CustomEventTarget.prototype = Object.create(EventTarget.prototype, {
          constructor: {
            value: CustomEventTarget,
            configurable: true,
            writable: true,
          },
        });
        for (let i = 0; i < eventNames.length; ++i) {
          defineEventAttribute(CustomEventTarget.prototype, eventNames[i]);
        }
        return CustomEventTarget;
      }
      /**
       * EventTarget.
       *
       * - This is constructor if no arguments.
       * - This is a function which returns a CustomEventTarget constructor if there are arguments.
       *
       * For example:
       *
       *     class A extends EventTarget {}
       *     class B extends EventTarget("message") {}
       *     class C extends EventTarget("message", "error") {}
       *     class D extends EventTarget(["message", "error"]) {}
       */
      function EventTarget() {
        /*eslint-disable consistent-return */
        if (this instanceof EventTarget) {
          listenersMap.set(this, new Map());
          return;
        }
        if (arguments.length === 1 && Array.isArray(arguments[0])) {
          return defineCustomEventTarget(arguments[0]);
        }
        if (arguments.length > 0) {
          const types = new Array(arguments.length);
          for (let i = 0; i < arguments.length; ++i) {
            types[i] = arguments[i];
          }
          return defineCustomEventTarget(types);
        }
        throw new TypeError("Cannot call a class as a function");
        /*eslint-enable consistent-return */
      }
      // Should be enumerable, but class methods are not enumerable.
      EventTarget.prototype = {
        /**
         * Add a given listener to this event target.
         * @param {string} eventName The event name to add.
         * @param {Function} listener The listener to add.
         * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
         * @returns {void}
         */
        addEventListener(eventName, listener, options) {
          if (listener == null) {
            return;
          }
          if (typeof listener !== "function" && !isObject(listener)) {
            throw new TypeError(
              "'listener' should be a function or an object."
            );
          }
          const listeners = getListeners(this);
          const optionsIsObj = isObject(options);
          const capture = optionsIsObj
            ? Boolean(options.capture)
            : Boolean(options);
          const listenerType = capture ? CAPTURE : BUBBLE;
          const newNode = {
            listener,
            listenerType,
            passive: optionsIsObj && Boolean(options.passive),
            once: optionsIsObj && Boolean(options.once),
            next: null,
          };
          // Set it as the first node if the first node is null.
          let node = listeners.get(eventName);
          if (node === undefined) {
            listeners.set(eventName, newNode);
            return;
          }
          // Traverse to the tail while checking duplication..
          let prev = null;
          while (node != null) {
            if (
              node.listener === listener &&
              node.listenerType === listenerType
            ) {
              // Should ignore duplication.
              return;
            }
            prev = node;
            node = node.next;
          }
          // Add it.
          prev.next = newNode;
        },
        /**
         * Remove a given listener from this event target.
         * @param {string} eventName The event name to remove.
         * @param {Function} listener The listener to remove.
         * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
         * @returns {void}
         */
        removeEventListener(eventName, listener, options) {
          if (listener == null) {
            return;
          }
          const listeners = getListeners(this);
          const capture = isObject(options)
            ? Boolean(options.capture)
            : Boolean(options);
          const listenerType = capture ? CAPTURE : BUBBLE;
          let prev = null;
          let node = listeners.get(eventName);
          while (node != null) {
            if (
              node.listener === listener &&
              node.listenerType === listenerType
            ) {
              if (prev !== null) {
                prev.next = node.next;
              } else if (node.next !== null) {
                listeners.set(eventName, node.next);
              } else {
                listeners.delete(eventName);
              }
              return;
            }

            prev = node;
            node = node.next;
          }
        },

        /**
         * Dispatch a given event.
         * @param {Event|{type:string}} event The event to dispatch.
         * @returns {boolean} `false` if canceled.
         */
        dispatchEvent(event) {
          if (event == null || typeof event.type !== "string") {
            throw new TypeError('"event.type" should be a string.');
          }

          // If listeners aren't registered, terminate.
          const listeners = getListeners(this);
          const eventName = event.type;
          let node = listeners.get(eventName);
          if (node == null) {
            return true;
          }

          // Since we cannot rewrite several properties, so wrap object.
          const wrappedEvent = wrapEvent(this, event);

          // This doesn't process capturing phase and bubbling phase.
          // This isn't participating in a tree.
          let prev = null;
          while (node != null) {
            // Remove this listener if it's once
            if (node.once) {
              if (prev !== null) {
                prev.next = node.next;
              } else if (node.next !== null) {
                listeners.set(eventName, node.next);
              } else {
                listeners.delete(eventName);
              }
            } else {
              prev = node;
            }

            // Call this listener
            setPassiveListener(
              wrappedEvent,
              node.passive ? node.listener : null
            );
            if (typeof node.listener === "function") {
              try {
                node.listener.call(this, wrappedEvent);
              } catch (err) {
                if (
                  typeof console !== "undefined" &&
                  typeof console.error === "function"
                ) {
                  console.error(err);
                }
              }
            } else if (
              node.listenerType !== ATTRIBUTE &&
              typeof node.listener.handleEvent === "function"
            ) {
              node.listener.handleEvent(wrappedEvent);
            }

            // Break if `event.stopImmediatePropagation` was called.
            if (isStopped(wrappedEvent)) {
              break;
            }

            node = node.next;
          }
          setPassiveListener(wrappedEvent, null);
          setEventPhase(wrappedEvent, 0);
          setCurrentTarget(wrappedEvent, null);

          return !wrappedEvent.defaultPrevented;
        },
      };

      // `constructor` is not enumerable.
      Object.defineProperty(EventTarget.prototype, "constructor", {
        value: EventTarget,
        configurable: true,
        writable: true,
      });

      // Ensure `eventTarget instanceof window.EventTarget` is `true`.
      if (
        typeof window !== "undefined" &&
        typeof window.EventTarget !== "undefined"
      ) {
        Object.setPrototypeOf(
          EventTarget.prototype,
          window.EventTarget.prototype
        );
      }

      exports.defineEventAttribute = defineEventAttribute;
      exports.EventTarget = EventTarget;
      exports["default"] = EventTarget;

      module.exports = EventTarget;
      module.exports.EventTarget = module.exports["default"] = EventTarget;
      module.exports.defineEventAttribute = defineEventAttribute;
      //# sourceMappingURL=event-target-shim.js.map

      /***/
    },

    /***/ 6993: /***/ function (__unused_webpack_module, exports) {
      /**
       * @license
       * web-streams-polyfill v4.0.0-beta.3
       * Copyright 2021 Mattias Buelens, Diwank Singh Tomer and other contributors.
       * This code is released under the MIT license.
       * SPDX-License-Identifier: MIT
       */
      !(function (e, t) {
        true ? t(exports) : 0;
      })(this, function (e) {
        "use strict";
        const t =
          "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
            ? Symbol
            : (e) => `Symbol(${e})`;
        function r() {}
        function o(e) {
          return ("object" == typeof e && null !== e) || "function" == typeof e;
        }
        const n = r;
        function a(e, t) {
          try {
            Object.defineProperty(e, "name", { value: t, configurable: !0 });
          } catch (e) {}
        }
        const i = Promise,
          l = Promise.prototype.then,
          s = Promise.resolve.bind(i),
          u = Promise.reject.bind(i);
        function c(e) {
          return new i(e);
        }
        function d(e) {
          return s(e);
        }
        function f(e) {
          return u(e);
        }
        function b(e, t, r) {
          return l.call(e, t, r);
        }
        function h(e, t, r) {
          b(b(e, t, r), void 0, n);
        }
        function _(e, t) {
          h(e, t);
        }
        function p(e, t) {
          h(e, void 0, t);
        }
        function m(e, t, r) {
          return b(e, t, r);
        }
        function y(e) {
          b(e, void 0, n);
        }
        let g = (e) => {
          if ("function" == typeof queueMicrotask) g = queueMicrotask;
          else {
            const e = d(void 0);
            g = (t) => b(e, t);
          }
          return g(e);
        };
        function S(e, t, r) {
          if ("function" != typeof e)
            throw new TypeError("Argument is not a function");
          return Function.prototype.apply.call(e, t, r);
        }
        function w(e, t, r) {
          try {
            return d(S(e, t, r));
          } catch (e) {
            return f(e);
          }
        }
        class v {
          constructor() {
            (this._cursor = 0),
              (this._size = 0),
              (this._front = { _elements: [], _next: void 0 }),
              (this._back = this._front),
              (this._cursor = 0),
              (this._size = 0);
          }
          get length() {
            return this._size;
          }
          push(e) {
            const t = this._back;
            let r = t;
            16383 === t._elements.length &&
              (r = { _elements: [], _next: void 0 }),
              t._elements.push(e),
              r !== t && ((this._back = r), (t._next = r)),
              ++this._size;
          }
          shift() {
            const e = this._front;
            let t = e;
            const r = this._cursor;
            let o = r + 1;
            const n = e._elements,
              a = n[r];
            return (
              16384 === o && ((t = e._next), (o = 0)),
              --this._size,
              (this._cursor = o),
              e !== t && (this._front = t),
              (n[r] = void 0),
              a
            );
          }
          forEach(e) {
            let t = this._cursor,
              r = this._front,
              o = r._elements;
            for (
              ;
              !(
                (t === o.length && void 0 === r._next) ||
                (t === o.length &&
                  ((r = r._next), (o = r._elements), (t = 0), 0 === o.length))
              );

            )
              e(o[t]), ++t;
          }
          peek() {
            const e = this._front,
              t = this._cursor;
            return e._elements[t];
          }
        }
        const R = t("[[AbortSteps]]"),
          T = t("[[ErrorSteps]]"),
          q = t("[[CancelSteps]]"),
          C = t("[[PullSteps]]"),
          P = t("[[ReleaseSteps]]");
        function E(e, t) {
          (e._ownerReadableStream = t),
            (t._reader = e),
            "readable" === t._state
              ? B(e)
              : "closed" === t._state
              ? (function (e) {
                  B(e), z(e);
                })(e)
              : A(e, t._storedError);
        }
        function W(e, t) {
          return Xt(e._ownerReadableStream, t);
        }
        function O(e) {
          const t = e._ownerReadableStream;
          "readable" === t._state
            ? j(
                e,
                new TypeError(
                  "Reader was released and can no longer be used to monitor the stream's closedness"
                )
              )
            : (function (e, t) {
                A(e, t);
              })(
                e,
                new TypeError(
                  "Reader was released and can no longer be used to monitor the stream's closedness"
                )
              ),
            t._readableStreamController[P](),
            (t._reader = void 0),
            (e._ownerReadableStream = void 0);
        }
        function k(e) {
          return new TypeError(
            "Cannot " + e + " a stream using a released reader"
          );
        }
        function B(e) {
          e._closedPromise = c((t, r) => {
            (e._closedPromise_resolve = t), (e._closedPromise_reject = r);
          });
        }
        function A(e, t) {
          B(e), j(e, t);
        }
        function j(e, t) {
          void 0 !== e._closedPromise_reject &&
            (y(e._closedPromise),
            e._closedPromise_reject(t),
            (e._closedPromise_resolve = void 0),
            (e._closedPromise_reject = void 0));
        }
        function z(e) {
          void 0 !== e._closedPromise_resolve &&
            (e._closedPromise_resolve(void 0),
            (e._closedPromise_resolve = void 0),
            (e._closedPromise_reject = void 0));
        }
        const L =
            Number.isFinite ||
            function (e) {
              return "number" == typeof e && isFinite(e);
            },
          F =
            Math.trunc ||
            function (e) {
              return e < 0 ? Math.ceil(e) : Math.floor(e);
            };
        function D(e, t) {
          if (
            void 0 !== e &&
            "object" != typeof (r = e) &&
            "function" != typeof r
          )
            throw new TypeError(`${t} is not an object.`);
          var r;
        }
        function I(e, t) {
          if ("function" != typeof e)
            throw new TypeError(`${t} is not a function.`);
        }
        function $(e, t) {
          if (
            !(function (e) {
              return (
                ("object" == typeof e && null !== e) || "function" == typeof e
              );
            })(e)
          )
            throw new TypeError(`${t} is not an object.`);
        }
        function M(e, t, r) {
          if (void 0 === e)
            throw new TypeError(`Parameter ${t} is required in '${r}'.`);
        }
        function Y(e, t, r) {
          if (void 0 === e) throw new TypeError(`${t} is required in '${r}'.`);
        }
        function Q(e) {
          return Number(e);
        }
        function N(e) {
          return 0 === e ? 0 : e;
        }
        function x(e, t) {
          const r = Number.MAX_SAFE_INTEGER;
          let o = Number(e);
          if (((o = N(o)), !L(o)))
            throw new TypeError(`${t} is not a finite number`);
          if (
            ((o = (function (e) {
              return N(F(e));
            })(o)),
            o < 0 || o > r)
          )
            throw new TypeError(
              `${t} is outside the accepted range of 0 to ${r}, inclusive`
            );
          return L(o) && 0 !== o ? o : 0;
        }
        function H(e) {
          if (!o(e)) return !1;
          if ("function" != typeof e.getReader) return !1;
          try {
            return "boolean" == typeof e.locked;
          } catch (e) {
            return !1;
          }
        }
        function V(e) {
          if (!o(e)) return !1;
          if ("function" != typeof e.getWriter) return !1;
          try {
            return "boolean" == typeof e.locked;
          } catch (e) {
            return !1;
          }
        }
        function U(e, t) {
          if (!Ut(e)) throw new TypeError(`${t} is not a ReadableStream.`);
        }
        function G(e, t) {
          e._reader._readRequests.push(t);
        }
        function X(e, t, r) {
          const o = e._reader._readRequests.shift();
          r ? o._closeSteps() : o._chunkSteps(t);
        }
        function J(e) {
          return e._reader._readRequests.length;
        }
        function K(e) {
          const t = e._reader;
          return void 0 !== t && !!Z(t);
        }
        class ReadableStreamDefaultReader {
          constructor(e) {
            if (
              (M(e, 1, "ReadableStreamDefaultReader"),
              U(e, "First parameter"),
              Gt(e))
            )
              throw new TypeError(
                "This stream has already been locked for exclusive reading by another reader"
              );
            E(this, e), (this._readRequests = new v());
          }
          get closed() {
            return Z(this) ? this._closedPromise : f(te("closed"));
          }
          cancel(e) {
            return Z(this)
              ? void 0 === this._ownerReadableStream
                ? f(k("cancel"))
                : W(this, e)
              : f(te("cancel"));
          }
          read() {
            if (!Z(this)) return f(te("read"));
            if (void 0 === this._ownerReadableStream) return f(k("read from"));
            let e, t;
            const r = c((r, o) => {
              (e = r), (t = o);
            });
            return (
              (function (e, t) {
                const r = e._ownerReadableStream;
                (r._disturbed = !0),
                  "closed" === r._state
                    ? t._closeSteps()
                    : "errored" === r._state
                    ? t._errorSteps(r._storedError)
                    : r._readableStreamController[C](t);
              })(this, {
                _chunkSteps: (t) => e({ value: t, done: !1 }),
                _closeSteps: () => e({ value: void 0, done: !0 }),
                _errorSteps: (e) => t(e),
              }),
              r
            );
          }
          releaseLock() {
            if (!Z(this)) throw te("releaseLock");
            void 0 !== this._ownerReadableStream &&
              (function (e) {
                O(e);
                const t = new TypeError("Reader was released");
                ee(e, t);
              })(this);
          }
        }
        function Z(e) {
          return (
            !!o(e) &&
            !!Object.prototype.hasOwnProperty.call(e, "_readRequests") &&
            e instanceof ReadableStreamDefaultReader
          );
        }
        function ee(e, t) {
          const r = e._readRequests;
          (e._readRequests = new v()),
            r.forEach((e) => {
              e._errorSteps(t);
            });
        }
        function te(e) {
          return new TypeError(
            `ReadableStreamDefaultReader.prototype.${e} can only be used on a ReadableStreamDefaultReader`
          );
        }
        Object.defineProperties(ReadableStreamDefaultReader.prototype, {
          cancel: { enumerable: !0 },
          read: { enumerable: !0 },
          releaseLock: { enumerable: !0 },
          closed: { enumerable: !0 },
        }),
          a(ReadableStreamDefaultReader.prototype.cancel, "cancel"),
          a(ReadableStreamDefaultReader.prototype.read, "read"),
          a(ReadableStreamDefaultReader.prototype.releaseLock, "releaseLock"),
          "symbol" == typeof t.toStringTag &&
            Object.defineProperty(
              ReadableStreamDefaultReader.prototype,
              t.toStringTag,
              { value: "ReadableStreamDefaultReader", configurable: !0 }
            );
        class re {
          constructor(e, t) {
            (this._ongoingPromise = void 0),
              (this._isFinished = !1),
              (this._reader = e),
              (this._preventCancel = t);
          }
          next() {
            const e = () => this._nextSteps();
            return (
              (this._ongoingPromise = this._ongoingPromise
                ? m(this._ongoingPromise, e, e)
                : e()),
              this._ongoingPromise
            );
          }
          return(e) {
            const t = () => this._returnSteps(e);
            return this._ongoingPromise ? m(this._ongoingPromise, t, t) : t();
          }
          _nextSteps() {
            if (this._isFinished)
              return Promise.resolve({ value: void 0, done: !0 });
            const e = this._reader;
            return void 0 === e
              ? f(k("iterate"))
              : b(
                  e.read(),
                  (e) => {
                    var t;
                    return (
                      (this._ongoingPromise = void 0),
                      e.done &&
                        ((this._isFinished = !0),
                        null === (t = this._reader) ||
                          void 0 === t ||
                          t.releaseLock(),
                        (this._reader = void 0)),
                      e
                    );
                  },
                  (e) => {
                    var t;
                    throw (
                      ((this._ongoingPromise = void 0),
                      (this._isFinished = !0),
                      null === (t = this._reader) ||
                        void 0 === t ||
                        t.releaseLock(),
                      (this._reader = void 0),
                      e)
                    );
                  }
                );
          }
          _returnSteps(e) {
            if (this._isFinished)
              return Promise.resolve({ value: e, done: !0 });
            this._isFinished = !0;
            const t = this._reader;
            if (void 0 === t) return f(k("finish iterating"));
            if (((this._reader = void 0), !this._preventCancel)) {
              const r = t.cancel(e);
              return t.releaseLock(), m(r, () => ({ value: e, done: !0 }));
            }
            return t.releaseLock(), d({ value: e, done: !0 });
          }
        }
        const oe = {
          next() {
            return ne(this) ? this._asyncIteratorImpl.next() : f(ae("next"));
          },
          return(e) {
            return ne(this)
              ? this._asyncIteratorImpl.return(e)
              : f(ae("return"));
          },
        };
        function ne(e) {
          if (!o(e)) return !1;
          if (!Object.prototype.hasOwnProperty.call(e, "_asyncIteratorImpl"))
            return !1;
          try {
            return e._asyncIteratorImpl instanceof re;
          } catch (e) {
            return !1;
          }
        }
        function ae(e) {
          return new TypeError(
            `ReadableStreamAsyncIterator.${e} can only be used on a ReadableSteamAsyncIterator`
          );
        }
        "symbol" == typeof t.asyncIterator &&
          Object.defineProperty(oe, t.asyncIterator, {
            value() {
              return this;
            },
            writable: !0,
            configurable: !0,
          });
        const ie =
          Number.isNaN ||
          function (e) {
            return e != e;
          };
        function le(e, t, r, o, n) {
          new Uint8Array(e).set(new Uint8Array(r, o, n), t);
        }
        function se(e) {
          const t = (function (e, t, r) {
            if (e.slice) return e.slice(t, r);
            const o = r - t,
              n = new ArrayBuffer(o);
            return le(n, 0, e, t, o), n;
          })(e.buffer, e.byteOffset, e.byteOffset + e.byteLength);
          return new Uint8Array(t);
        }
        function ue(e) {
          const t = e._queue.shift();
          return (
            (e._queueTotalSize -= t.size),
            e._queueTotalSize < 0 && (e._queueTotalSize = 0),
            t.value
          );
        }
        function ce(e, t, r) {
          if ("number" != typeof (o = r) || ie(o) || o < 0 || r === 1 / 0)
            throw new RangeError(
              "Size must be a finite, non-NaN, non-negative number."
            );
          var o;
          e._queue.push({ value: t, size: r }), (e._queueTotalSize += r);
        }
        function de(e) {
          (e._queue = new v()), (e._queueTotalSize = 0);
        }
        class ReadableStreamBYOBRequest {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get view() {
            if (!be(this)) throw Ae("view");
            return this._view;
          }
          respond(e) {
            if (!be(this)) throw Ae("respond");
            if (
              (M(e, 1, "respond"),
              (e = x(e, "First parameter")),
              void 0 === this._associatedReadableByteStreamController)
            )
              throw new TypeError("This BYOB request has been invalidated");
            this._view.buffer,
              (function (e, t) {
                const r = e._pendingPullIntos.peek();
                if ("closed" === e._controlledReadableByteStream._state) {
                  if (0 !== t)
                    throw new TypeError(
                      "bytesWritten must be 0 when calling respond() on a closed stream"
                    );
                } else {
                  if (0 === t)
                    throw new TypeError(
                      "bytesWritten must be greater than 0 when calling respond() on a readable stream"
                    );
                  if (r.bytesFilled + t > r.byteLength)
                    throw new RangeError("bytesWritten out of range");
                }
                (r.buffer = r.buffer), Ce(e, t);
              })(this._associatedReadableByteStreamController, e);
          }
          respondWithNewView(e) {
            if (!be(this)) throw Ae("respondWithNewView");
            if ((M(e, 1, "respondWithNewView"), !ArrayBuffer.isView(e)))
              throw new TypeError(
                "You can only respond with array buffer views"
              );
            if (void 0 === this._associatedReadableByteStreamController)
              throw new TypeError("This BYOB request has been invalidated");
            e.buffer,
              (function (e, t) {
                const r = e._pendingPullIntos.peek();
                if ("closed" === e._controlledReadableByteStream._state) {
                  if (0 !== t.byteLength)
                    throw new TypeError(
                      "The view's length must be 0 when calling respondWithNewView() on a closed stream"
                    );
                } else if (0 === t.byteLength)
                  throw new TypeError(
                    "The view's length must be greater than 0 when calling respondWithNewView() on a readable stream"
                  );
                if (r.byteOffset + r.bytesFilled !== t.byteOffset)
                  throw new RangeError(
                    "The region specified by view does not match byobRequest"
                  );
                if (r.bufferByteLength !== t.buffer.byteLength)
                  throw new RangeError(
                    "The buffer of view has different capacity than byobRequest"
                  );
                if (r.bytesFilled + t.byteLength > r.byteLength)
                  throw new RangeError(
                    "The region specified by view is larger than byobRequest"
                  );
                const o = t.byteLength;
                (r.buffer = t.buffer), Ce(e, o);
              })(this._associatedReadableByteStreamController, e);
          }
        }
        Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
          respond: { enumerable: !0 },
          respondWithNewView: { enumerable: !0 },
          view: { enumerable: !0 },
        }),
          a(ReadableStreamBYOBRequest.prototype.respond, "respond"),
          a(
            ReadableStreamBYOBRequest.prototype.respondWithNewView,
            "respondWithNewView"
          ),
          "symbol" == typeof t.toStringTag &&
            Object.defineProperty(
              ReadableStreamBYOBRequest.prototype,
              t.toStringTag,
              { value: "ReadableStreamBYOBRequest", configurable: !0 }
            );
        class ReadableByteStreamController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get byobRequest() {
            if (!fe(this)) throw je("byobRequest");
            return (function (e) {
              if (null === e._byobRequest && e._pendingPullIntos.length > 0) {
                const t = e._pendingPullIntos.peek(),
                  r = new Uint8Array(
                    t.buffer,
                    t.byteOffset + t.bytesFilled,
                    t.byteLength - t.bytesFilled
                  ),
                  o = Object.create(ReadableStreamBYOBRequest.prototype);
                !(function (e, t, r) {
                  (e._associatedReadableByteStreamController = t),
                    (e._view = r);
                })(o, e, r),
                  (e._byobRequest = o);
              }
              return e._byobRequest;
            })(this);
          }
          get desiredSize() {
            if (!fe(this)) throw je("desiredSize");
            return ke(this);
          }
          close() {
            if (!fe(this)) throw je("close");
            if (this._closeRequested)
              throw new TypeError(
                "The stream has already been closed; do not close it again!"
              );
            const e = this._controlledReadableByteStream._state;
            if ("readable" !== e)
              throw new TypeError(
                `The stream (in ${e} state) is not in the readable state and cannot be closed`
              );
            !(function (e) {
              const t = e._controlledReadableByteStream;
              if (e._closeRequested || "readable" !== t._state) return;
              if (e._queueTotalSize > 0) return void (e._closeRequested = !0);
              if (e._pendingPullIntos.length > 0) {
                if (e._pendingPullIntos.peek().bytesFilled > 0) {
                  const t = new TypeError(
                    "Insufficient bytes to fill elements in the given buffer"
                  );
                  throw (We(e, t), t);
                }
              }
              Ee(e), Jt(t);
            })(this);
          }
          enqueue(e) {
            if (!fe(this)) throw je("enqueue");
            if ((M(e, 1, "enqueue"), !ArrayBuffer.isView(e)))
              throw new TypeError("chunk must be an array buffer view");
            if (0 === e.byteLength)
              throw new TypeError("chunk must have non-zero byteLength");
            if (0 === e.buffer.byteLength)
              throw new TypeError(
                "chunk's buffer must have non-zero byteLength"
              );
            if (this._closeRequested)
              throw new TypeError("stream is closed or draining");
            const t = this._controlledReadableByteStream._state;
            if ("readable" !== t)
              throw new TypeError(
                `The stream (in ${t} state) is not in the readable state and cannot be enqueued to`
              );
            !(function (e, t) {
              const r = e._controlledReadableByteStream;
              if (e._closeRequested || "readable" !== r._state) return;
              const o = t.buffer,
                n = t.byteOffset,
                a = t.byteLength,
                i = o;
              if (e._pendingPullIntos.length > 0) {
                const t = e._pendingPullIntos.peek();
                t.buffer,
                  0,
                  Te(e),
                  (t.buffer = t.buffer),
                  "none" === t.readerType && Se(e, t);
              }
              if (K(r))
                if (
                  ((function (e) {
                    const t = e._controlledReadableByteStream._reader;
                    for (; t._readRequests.length > 0; ) {
                      if (0 === e._queueTotalSize) return;
                      Oe(e, t._readRequests.shift());
                    }
                  })(e),
                  0 === J(r))
                )
                  ye(e, i, n, a);
                else {
                  e._pendingPullIntos.length > 0 && Pe(e);
                  X(r, new Uint8Array(i, n, a), !1);
                }
              else Fe(r) ? (ye(e, i, n, a), qe(e)) : ye(e, i, n, a);
              he(e);
            })(this, e);
          }
          error(e) {
            if (!fe(this)) throw je("error");
            We(this, e);
          }
          [q](e) {
            _e(this), de(this);
            const t = this._cancelAlgorithm(e);
            return Ee(this), t;
          }
          [C](e) {
            const t = this._controlledReadableByteStream;
            if (this._queueTotalSize > 0) return void Oe(this, e);
            const r = this._autoAllocateChunkSize;
            if (void 0 !== r) {
              let t;
              try {
                t = new ArrayBuffer(r);
              } catch (t) {
                return void e._errorSteps(t);
              }
              const o = {
                buffer: t,
                bufferByteLength: r,
                byteOffset: 0,
                byteLength: r,
                bytesFilled: 0,
                elementSize: 1,
                viewConstructor: Uint8Array,
                readerType: "default",
              };
              this._pendingPullIntos.push(o);
            }
            G(t, e), he(this);
          }
          [P]() {
            if (this._pendingPullIntos.length > 0) {
              const e = this._pendingPullIntos.peek();
              (e.readerType = "none"),
                (this._pendingPullIntos = new v()),
                this._pendingPullIntos.push(e);
            }
          }
        }
        function fe(e) {
          return (
            !!o(e) &&
            !!Object.prototype.hasOwnProperty.call(
              e,
              "_controlledReadableByteStream"
            ) &&
            e instanceof ReadableByteStreamController
          );
        }
        function be(e) {
          return (
            !!o(e) &&
            !!Object.prototype.hasOwnProperty.call(
              e,
              "_associatedReadableByteStreamController"
            ) &&
            e instanceof ReadableStreamBYOBRequest
          );
        }
        function he(e) {
          const t = (function (e) {
            const t = e._controlledReadableByteStream;
            if ("readable" !== t._state) return !1;
            if (e._closeRequested) return !1;
            if (!e._started) return !1;
            if (K(t) && J(t) > 0) return !0;
            if (Fe(t) && Le(t) > 0) return !0;
            if (ke(e) > 0) return !0;
            return !1;
          })(e);
          if (!t) return;
          if (e._pulling) return void (e._pullAgain = !0);
          e._pulling = !0;
          h(
            e._pullAlgorithm(),
            () => (
              (e._pulling = !1),
              e._pullAgain && ((e._pullAgain = !1), he(e)),
              null
            ),
            (t) => (We(e, t), null)
          );
        }
        function _e(e) {
          Te(e), (e._pendingPullIntos = new v());
        }
        function pe(e, t) {
          let r = !1;
          "closed" === e._state && (r = !0);
          const o = me(t);
          "default" === t.readerType
            ? X(e, o, r)
            : (function (e, t, r) {
                const o = e._reader._readIntoRequests.shift();
                r ? o._closeSteps(t) : o._chunkSteps(t);
              })(e, o, r);
        }
        function me(e) {
          const t = e.bytesFilled,
            r = e.elementSize;
          return new e.viewConstructor(e.buffer, e.byteOffset, t / r);
        }
        function ye(e, t, r, o) {
          e._queue.push({ buffer: t, byteOffset: r, byteLength: o }),
            (e._queueTotalSize += o);
        }
        function ge(e, t, r, o) {
          let n;
          try {
            n = t.slice(r, r + o);
          } catch (t) {
            throw (We(e, t), t);
          }
          ye(e, n, 0, o);
        }
        function Se(e, t) {
          t.bytesFilled > 0 && ge(e, t.buffer, t.byteOffset, t.bytesFilled),
            Pe(e);
        }
        function we(e, t) {
          const r = t.elementSize,
            o = t.bytesFilled - (t.bytesFilled % r),
            n = Math.min(e._queueTotalSize, t.byteLength - t.bytesFilled),
            a = t.bytesFilled + n,
            i = a - (a % r);
          let l = n,
            s = !1;
          i > o && ((l = i - t.bytesFilled), (s = !0));
          const u = e._queue;
          for (; l > 0; ) {
            const r = u.peek(),
              o = Math.min(l, r.byteLength),
              n = t.byteOffset + t.bytesFilled;
            le(t.buffer, n, r.buffer, r.byteOffset, o),
              r.byteLength === o
                ? u.shift()
                : ((r.byteOffset += o), (r.byteLength -= o)),
              (e._queueTotalSize -= o),
              ve(e, o, t),
              (l -= o);
          }
          return s;
        }
        function ve(e, t, r) {
          r.bytesFilled += t;
        }
        function Re(e) {
          0 === e._queueTotalSize && e._closeRequested
            ? (Ee(e), Jt(e._controlledReadableByteStream))
            : he(e);
        }
        function Te(e) {
          null !== e._byobRequest &&
            ((e._byobRequest._associatedReadableByteStreamController = void 0),
            (e._byobRequest._view = null),
            (e._byobRequest = null));
        }
        function qe(e) {
          for (; e._pendingPullIntos.length > 0; ) {
            if (0 === e._queueTotalSize) return;
            const t = e._pendingPullIntos.peek();
            we(e, t) && (Pe(e), pe(e._controlledReadableByteStream, t));
          }
        }
        function Ce(e, t) {
          const r = e._pendingPullIntos.peek();
          Te(e);
          "closed" === e._controlledReadableByteStream._state
            ? (function (e, t) {
                "none" === t.readerType && Pe(e);
                const r = e._controlledReadableByteStream;
                if (Fe(r)) for (; Le(r) > 0; ) pe(r, Pe(e));
              })(e, r)
            : (function (e, t, r) {
                if ((ve(0, t, r), "none" === r.readerType))
                  return Se(e, r), void qe(e);
                if (r.bytesFilled < r.elementSize) return;
                Pe(e);
                const o = r.bytesFilled % r.elementSize;
                if (o > 0) {
                  const t = r.byteOffset + r.bytesFilled;
                  ge(e, r.buffer, t - o, o);
                }
                (r.bytesFilled -= o),
                  pe(e._controlledReadableByteStream, r),
                  qe(e);
              })(e, t, r),
            he(e);
        }
        function Pe(e) {
          return e._pendingPullIntos.shift();
        }
        function Ee(e) {
          (e._pullAlgorithm = void 0), (e._cancelAlgorithm = void 0);
        }
        function We(e, t) {
          const r = e._controlledReadableByteStream;
          "readable" === r._state && (_e(e), de(e), Ee(e), Kt(r, t));
        }
        function Oe(e, t) {
          const r = e._queue.shift();
          (e._queueTotalSize -= r.byteLength), Re(e);
          const o = new Uint8Array(r.buffer, r.byteOffset, r.byteLength);
          t._chunkSteps(o);
        }
        function ke(e) {
          const t = e._controlledReadableByteStream._state;
          return "errored" === t
            ? null
            : "closed" === t
            ? 0
            : e._strategyHWM - e._queueTotalSize;
        }
        function Be(e, t, r) {
          const o = Object.create(ReadableByteStreamController.prototype);
          let n, a, i;
          (n = void 0 !== t.start ? () => t.start(o) : () => {}),
            (a = void 0 !== t.pull ? () => t.pull(o) : () => d(void 0)),
            (i = void 0 !== t.cancel ? (e) => t.cancel(e) : () => d(void 0));
          const l = t.autoAllocateChunkSize;
          if (0 === l)
            throw new TypeError("autoAllocateChunkSize must be greater than 0");
          !(function (e, t, r, o, n, a, i) {
            (t._controlledReadableByteStream = e),
              (t._pullAgain = !1),
              (t._pulling = !1),
              (t._byobRequest = null),
              (t._queue = t._queueTotalSize = void 0),
              de(t),
              (t._closeRequested = !1),
              (t._started = !1),
              (t._strategyHWM = a),
              (t._pullAlgorithm = o),
              (t._cancelAlgorithm = n),
              (t._autoAllocateChunkSize = i),
              (t._pendingPullIntos = new v()),
              (e._readableStreamController = t),
              h(
                d(r()),
                () => ((t._started = !0), he(t), null),
                (e) => (We(t, e), null)
              );
          })(e, o, n, a, i, r, l);
        }
        function Ae(e) {
          return new TypeError(
            `ReadableStreamBYOBRequest.prototype.${e} can only be used on a ReadableStreamBYOBRequest`
          );
        }
        function je(e) {
          return new TypeError(
            `ReadableByteStreamController.prototype.${e} can only be used on a ReadableByteStreamController`
          );
        }
        function ze(e, t) {
          e._reader._readIntoRequests.push(t);
        }
        function Le(e) {
          return e._reader._readIntoRequests.length;
        }
        function Fe(e) {
          const t = e._reader;
          return void 0 !== t && !!De(t);
        }
        Object.defineProperties(ReadableByteStreamController.prototype, {
          close: { enumerable: !0 },
          enqueue: { enumerable: !0 },
          error: { enumerable: !0 },
          byobRequest: { enumerable: !0 },
          desiredSize: { enumerable: !0 },
        }),
          a(ReadableByteStreamController.prototype.close, "close"),
          a(ReadableByteStreamController.prototype.enqueue, "enqueue"),
          a(ReadableByteStreamController.prototype.error, "error"),
          "symbol" == typeof t.toStringTag &&
            Object.defineProperty(
              ReadableByteStreamController.prototype,
              t.toStringTag,
              { value: "ReadableByteStreamController", configurable: !0 }
            );
        class ReadableStreamBYOBReader {
          constructor(e) {
            if (
              (M(e, 1, "ReadableStreamBYOBReader"),
              U(e, "First parameter"),
              Gt(e))
            )
              throw new TypeError(
                "This stream has already been locked for exclusive reading by another reader"
              );
            if (!fe(e._readableStreamController))
              throw new TypeError(
                "Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source"
              );
            E(this, e), (this._readIntoRequests = new v());
          }
          get closed() {
            return De(this) ? this._closedPromise : f($e("closed"));
          }
          cancel(e) {
            return De(this)
              ? void 0 === this._ownerReadableStream
                ? f(k("cancel"))
                : W(this, e)
              : f($e("cancel"));
          }
          read(e) {
            if (!De(this)) return f($e("read"));
            if (!ArrayBuffer.isView(e))
              return f(new TypeError("view must be an array buffer view"));
            if (0 === e.byteLength)
              return f(new TypeError("view must have non-zero byteLength"));
            if (0 === e.buffer.byteLength)
              return f(
                new TypeError("view's buffer must have non-zero byteLength")
              );
            if ((e.buffer, void 0 === this._ownerReadableStream))
              return f(k("read from"));
            let t, r;
            const o = c((e, o) => {
              (t = e), (r = o);
            });
            return (
              (function (e, t, r) {
                const o = e._ownerReadableStream;
                (o._disturbed = !0),
                  "errored" === o._state
                    ? r._errorSteps(o._storedError)
                    : (function (e, t, r) {
                        const o = e._controlledReadableByteStream;
                        let n = 1;
                        t.constructor !== DataView &&
                          (n = t.constructor.BYTES_PER_ELEMENT);
                        const a = t.constructor,
                          i = t.buffer,
                          l = {
                            buffer: i,
                            bufferByteLength: i.byteLength,
                            byteOffset: t.byteOffset,
                            byteLength: t.byteLength,
                            bytesFilled: 0,
                            elementSize: n,
                            viewConstructor: a,
                            readerType: "byob",
                          };
                        if (e._pendingPullIntos.length > 0)
                          return e._pendingPullIntos.push(l), void ze(o, r);
                        if ("closed" !== o._state) {
                          if (e._queueTotalSize > 0) {
                            if (we(e, l)) {
                              const t = me(l);
                              return Re(e), void r._chunkSteps(t);
                            }
                            if (e._closeRequested) {
                              const t = new TypeError(
                                "Insufficient bytes to fill elements in the given buffer"
                              );
                              return We(e, t), void r._errorSteps(t);
                            }
                          }
                          e._pendingPullIntos.push(l), ze(o, r), he(e);
                        } else {
                          const e = new a(l.buffer, l.byteOffset, 0);
                          r._closeSteps(e);
                        }
                      })(o._readableStreamController, t, r);
              })(this, e, {
                _chunkSteps: (e) => t({ value: e, done: !1 }),
                _closeSteps: (e) => t({ value: e, done: !0 }),
                _errorSteps: (e) => r(e),
              }),
              o
            );
          }
          releaseLock() {
            if (!De(this)) throw $e("releaseLock");
            void 0 !== this._ownerReadableStream &&
              (function (e) {
                O(e);
                const t = new TypeError("Reader was released");
                Ie(e, t);
              })(this);
          }
        }
        function De(e) {
          return (
            !!o(e) &&
            !!Object.prototype.hasOwnProperty.call(e, "_readIntoRequests") &&
            e instanceof ReadableStreamBYOBReader
          );
        }
        function Ie(e, t) {
          const r = e._readIntoRequests;
          (e._readIntoRequests = new v()),
            r.forEach((e) => {
              e._errorSteps(t);
            });
        }
        function $e(e) {
          return new TypeError(
            `ReadableStreamBYOBReader.prototype.${e} can only be used on a ReadableStreamBYOBReader`
          );
        }
        function Me(e, t) {
          const { highWaterMark: r } = e;
          if (void 0 === r) return t;
          if (ie(r) || r < 0) throw new RangeError("Invalid highWaterMark");
          return r;
        }
        function Ye(e) {
          const { size: t } = e;
          return t || (() => 1);
        }
        function Qe(e, t) {
          D(e, t);
          const r = null == e ? void 0 : e.highWaterMark,
            o = null == e ? void 0 : e.size;
          return {
            highWaterMark: void 0 === r ? void 0 : Q(r),
            size: void 0 === o ? void 0 : Ne(o, `${t} has member 'size' that`),
          };
        }
        function Ne(e, t) {
          return I(e, t), (t) => Q(e(t));
        }
        function xe(e, t, r) {
          return I(e, r), (r) => w(e, t, [r]);
        }
        function He(e, t, r) {
          return I(e, r), () => w(e, t, []);
        }
        function Ve(e, t, r) {
          return I(e, r), (r) => S(e, t, [r]);
        }
        function Ue(e, t, r) {
          return I(e, r), (r, o) => w(e, t, [r, o]);
        }
        Object.defineProperties(ReadableStreamBYOBReader.prototype, {
          cancel: { enumerable: !0 },
          read: { enumerable: !0 },
          releaseLock: { enumerable: !0 },
          closed: { enumerable: !0 },
        }),
          a(ReadableStreamBYOBReader.prototype.cancel, "cancel"),
          a(ReadableStreamBYOBReader.prototype.read, "read"),
          a(ReadableStreamBYOBReader.prototype.releaseLock, "releaseLock"),
          "symbol" == typeof t.toStringTag &&
            Object.defineProperty(
              ReadableStreamBYOBReader.prototype,
              t.toStringTag,
              { value: "ReadableStreamBYOBReader", configurable: !0 }
            );
        const Ge = "function" == typeof AbortController;
        class WritableStream {
          constructor(e = {}, t = {}) {
            void 0 === e ? (e = null) : $(e, "First parameter");
            const r = Qe(t, "Second parameter"),
              o = (function (e, t) {
                D(e, t);
                const r = null == e ? void 0 : e.abort,
                  o = null == e ? void 0 : e.close,
                  n = null == e ? void 0 : e.start,
                  a = null == e ? void 0 : e.type,
                  i = null == e ? void 0 : e.write;
                return {
                  abort:
                    void 0 === r
                      ? void 0
                      : xe(r, e, `${t} has member 'abort' that`),
                  close:
                    void 0 === o
                      ? void 0
                      : He(o, e, `${t} has member 'close' that`),
                  start:
                    void 0 === n
                      ? void 0
                      : Ve(n, e, `${t} has member 'start' that`),
                  write:
                    void 0 === i
                      ? void 0
                      : Ue(i, e, `${t} has member 'write' that`),
                  type: a,
                };
              })(e, "First parameter");
            var n;
            ((n = this)._state = "writable"),
              (n._storedError = void 0),
              (n._writer = void 0),
              (n._writableStreamController = void 0),
              (n._writeRequests = new v()),
              (n._inFlightWriteRequest = void 0),
              (n._closeRequest = void 0),
              (n._inFlightCloseRequest = void 0),
              (n._pendingAbortRequest = void 0),
              (n._backpressure = !1);
            if (void 0 !== o.type)
              throw new RangeError("Invalid type is specified");
            const a = Ye(r);
            !(function (e, t, r, o) {
              const n = Object.create(
                WritableStreamDefaultController.prototype
              );
              let a, i, l, s;
              a = void 0 !== t.start ? () => t.start(n) : () => {};
              i = void 0 !== t.write ? (e) => t.write(e, n) : () => d(void 0);
              l = void 0 !== t.close ? () => t.close() : () => d(void 0);
              s = void 0 !== t.abort ? (e) => t.abort(e) : () => d(void 0);
              !(function (e, t, r, o, n, a, i, l) {
                (t._controlledWritableStream = e),
                  (e._writableStreamController = t),
                  (t._queue = void 0),
                  (t._queueTotalSize = void 0),
                  de(t),
                  (t._abortReason = void 0),
                  (t._abortController = (function () {
                    if (Ge) return new AbortController();
                  })()),
                  (t._started = !1),
                  (t._strategySizeAlgorithm = l),
                  (t._strategyHWM = i),
                  (t._writeAlgorithm = o),
                  (t._closeAlgorithm = n),
                  (t._abortAlgorithm = a);
                const s = ht(t);
                at(e, s);
                const u = r();
                h(
                  d(u),
                  () => ((t._started = !0), ft(t), null),
                  (r) => ((t._started = !0), et(e, r), null)
                );
              })(e, n, a, i, l, s, r, o);
            })(this, o, Me(r, 1), a);
          }
          get locked() {
            if (!Xe(this)) throw pt("locked");
            return Je(this);
          }
          abort(e) {
            return Xe(this)
              ? Je(this)
                ? f(
                    new TypeError(
                      "Cannot abort a stream that already has a writer"
                    )
                  )
                : Ke(this, e)
              : f(pt("abort"));
          }
          close() {
            return Xe(this)
              ? Je(this)
                ? f(
                    new TypeError(
                      "Cannot close a stream that already has a writer"
                    )
                  )
                : ot(this)
                ? f(new TypeError("Cannot close an already-closing stream"))
                : Ze(this)
              : f(pt("close"));
          }
          getWriter() {
            if (!Xe(this)) throw pt("getWriter");
            return new WritableStreamDefaultWriter(this);
          }
        }
        function Xe(e) {
          return (
            !!o(e) &&
            !!Object.prototype.hasOwnProperty.call(
              e,
              "_writableStreamController"
            ) &&
            e instanceof WritableStream
          );
        }
        function Je(e) {
          return void 0 !== e._writer;
        }
        function Ke(e, t) {
          var r;
          if ("closed" === e._state || "errored" === e._state) return d(void 0);
          (e._writableStreamController._abortReason = t),
            null === (r = e._writableStreamController._abortController) ||
              void 0 === r ||
              r.abort(t);
          const o = e._state;
          if ("closed" === o || "errored" === o) return d(void 0);
          if (void 0 !== e._pendingAbortRequest)
            return e._pendingAbortRequest._promise;
          let n = !1;
          "erroring" === o && ((n = !0), (t = void 0));
          const a = c((r, o) => {
            e._pendingAbortRequest = {
              _promise: void 0,
              _resolve: r,
              _reject: o,
              _reason: t,
              _wasAlreadyErroring: n,
            };
          });
          return (e._pendingAbortRequest._promise = a), n || tt(e, t), a;
        }
        function Ze(e) {
          const t = e._state;
          if ("closed" === t || "errored" === t)
            return f(
              new TypeError(
                `The stream (in ${t} state) is not in the writable state and cannot be closed`
              )
            );
          const r = c((t, r) => {
              const o = { _resolve: t, _reject: r };
              e._closeRequest = o;
            }),
            o = e._writer;
          var n;
          return (
            void 0 !== o && e._backpressure && "writable" === t && Et(o),
            ce((n = e._writableStreamController), st, 0),
            ft(n),
            r
          );
        }
        function et(e, t) {
          "writable" !== e._state ? rt(e) : tt(e, t);
        }
        function tt(e, t) {
          const r = e._writableStreamController;
          (e._state = "erroring"), (e._storedError = t);
          const o = e._writer;
          void 0 !== o && lt(o, t),
            !(function (e) {
              if (
                void 0 === e._inFlightWriteRequest &&
                void 0 === e._inFlightCloseRequest
              )
                return !1;
              return !0;
            })(e) &&
              r._started &&
              rt(e);
        }
        function rt(e) {
          (e._state = "errored"), e._writableStreamController[T]();
          const t = e._storedError;
          if (
            (e._writeRequests.forEach((e) => {
              e._reject(t);
            }),
            (e._writeRequests = new v()),
            void 0 === e._pendingAbortRequest)
          )
            return void nt(e);
          const r = e._pendingAbortRequest;
          if (((e._pendingAbortRequest = void 0), r._wasAlreadyErroring))
            return r._reject(t), void nt(e);
          h(
            e._writableStreamController[R](r._reason),
            () => (r._resolve(), nt(e), null),
            (t) => (r._reject(t), nt(e), null)
          );
        }
        function ot(e) {
          return (
            void 0 !== e._closeRequest || void 0 !== e._inFlightCloseRequest
          );
        }
        function nt(e) {
          void 0 !== e._closeRequest &&
            (e._closeRequest._reject(e._storedError),
            (e._closeRequest = void 0));
          const t = e._writer;
          void 0 !== t && vt(t, e._storedError);
        }
        function at(e, t) {
          const r = e._writer;
          void 0 !== r &&
            t !== e._backpressure &&
            (t
              ? (function (e) {
                  Tt(e);
                })(r)
              : Et(r)),
            (e._backpressure = t);
        }
        Object.defineProperties(WritableStream.prototype, {
          abort: { enumerable: !0 },
          close: { enumerable: !0 },
          getWriter: { enumerable: !0 },
          locked: { enumerable: !0 },
        }),
          a(WritableStream.prototype.abort, "abort"),
          a(WritableStream.prototype.close, "close"),
          a(WritableStream.prototype.getWriter, "getWriter"),
          "symbol" == typeof t.toStringTag &&
            Object.defineProperty(WritableStream.prototype, t.toStringTag, {
              value: "WritableStream",
              configurable: !0,
            });
        class WritableStreamDefaultWriter {
          constructor(e) {
            if (
              (M(e, 1, "WritableStreamDefaultWriter"),
              (function (e, t) {
                if (!Xe(e))
                  throw new TypeError(`${t} is not a WritableStream.`);
              })(e, "First parameter"),
              Je(e))
            )
              throw new TypeError(
                "This stream has already been locked for exclusive writing by another writer"
              );
            (this._ownerWritableStream = e), (e._writer = this);
            const t = e._state;
            if ("writable" === t)
              !ot(e) && e._backpressure ? Tt(this) : Ct(this), St(this);
            else if ("erroring" === t) qt(this, e._storedError), St(this);
            else if ("closed" === t) Ct(this), St((r = this)), Rt(r);
            else {
              const t = e._storedError;
              qt(this, t), wt(this, t);
            }
            var r;
          }
          get closed() {
            return it(this) ? this._closedPromise : f(yt("closed"));
          }
          get desiredSize() {
            if (!it(this)) throw yt("desiredSize");
            if (void 0 === this._ownerWritableStream) throw gt("desiredSize");
            return (function (e) {
              const t = e._ownerWritableStream,
                r = t._state;
              if ("errored" === r || "erroring" === r) return null;
              if ("closed" === r) return 0;
              return dt(t._writableStreamController);
            })(this);
          }
          get ready() {
            return it(this) ? this._readyPromise : f(yt("ready"));
          }
          abort(e) {
            return it(this)
              ? void 0 === this._ownerWritableStream
                ? f(gt("abort"))
                : (function (e, t) {
                    return Ke(e._ownerWritableStream, t);
                  })(this, e)
              : f(yt("abort"));
          }
          close() {
            if (!it(this)) return f(yt("close"));
            const e = this._ownerWritableStream;
            return void 0 === e
              ? f(gt("close"))
              : ot(e)
              ? f(new TypeError("Cannot close an already-closing stream"))
              : Ze(this._ownerWritableStream);
          }
          releaseLock() {
            if (!it(this)) throw yt("releaseLock");
            void 0 !== this._ownerWritableStream &&
              (function (e) {
                const t = e._ownerWritableStream,
                  r = new TypeError(
                    "Writer was released and can no longer be used to monitor the stream's closedness"
                  );
                lt(e, r),
                  (function (e, t) {
                    "pending" === e._closedPromiseState
                      ? vt(e, t)
                      : (function (e, t) {
                          wt(e, t);
                        })(e, t);
                  })(e, r),
                  (t._writer = void 0),
                  (e._ownerWritableStream = void 0);
              })(this);
          }
          write(e) {
            return it(this)
              ? void 0 === this._ownerWritableStream
                ? f(gt("write to"))
                : (function (e, t) {
                    const r = e._ownerWritableStream,
                      o = r._writableStreamController,
                      n = (function (e, t) {
                        try {
                          return e._strategySizeAlgorithm(t);
                        } catch (t) {
                          return bt(e, t), 1;
                        }
                      })(o, t);
                    if (r !== e._ownerWritableStream) return f(gt("write to"));
                    const a = r._state;
                    if ("errored" === a) return f(r._storedError);
                    if (ot(r) || "closed" === a)
                      return f(
                        new TypeError(
                          "The stream is closing or closed and cannot be written to"
                        )
                      );
                    if ("erroring" === a) return f(r._storedError);
                    const i = (function (e) {
                      return c((t, r) => {
                        const o = { _resolve: t, _reject: r };
                        e._writeRequests.push(o);
                      });
                    })(r);
                    return (
                      (function (e, t, r) {
                        try {
                          ce(e, t, r);
                        } catch (t) {
                          return void bt(e, t);
                        }
                        const o = e._controlledWritableStream;
                        if (!ot(o) && "writable" === o._state) {
                          at(o, ht(e));
                        }
                        ft(e);
                      })(o, t, n),
                      i
                    );
                  })(this, e)
              : f(yt("write"));
          }
        }
        function it(e) {
          return (
            !!o(e) &&
            !!Object.prototype.hasOwnProperty.call(e, "_ownerWritableStream") &&
            e instanceof WritableStreamDefaultWriter
          );
        }
        function lt(e, t) {
          "pending" === e._readyPromiseState
            ? Pt(e, t)
            : (function (e, t) {
                qt(e, t);
              })(e, t);
        }
        Object.defineProperties(WritableStreamDefaultWriter.prototype, {
          abort: { enumerable: !0 },
          close: { enumerable: !0 },
          releaseLock: { enumerable: !0 },
          write: { enumerable: !0 },
          closed: { enumerable: !0 },
          desiredSize: { enumerable: !0 },
          ready: { enumerable: !0 },
        }),
          a(WritableStreamDefaultWriter.prototype.abort, "abort"),
          a(WritableStreamDefaultWriter.prototype.close, "close"),
          a(WritableStreamDefaultWriter.prototype.releaseLock, "releaseLock"),
          a(WritableStreamDefaultWriter.prototype.write, "write"),
          "symbol" == typeof t.toStringTag &&
            Object.defineProperty(
              WritableStreamDefaultWriter.prototype,
              t.toStringTag,
              { value: "WritableStreamDefaultWriter", configurable: !0 }
            );
        const st = {};
        class WritableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get abortReason() {
            if (!ut(this)) throw mt("abortReason");
            return this._abortReason;
          }
          get signal() {
            if (!ut(this)) throw mt("signal");
            if (void 0 === this._abortController)
              throw new TypeError(
                "WritableStreamDefaultController.prototype.signal is not supported"
              );
            return this._abortController.signal;
          }
          error(e) {
            if (!ut(this)) throw mt("error");
            "writable" === this._controlledWritableStream._state && _t(this, e);
          }
          [R](e) {
            const t = this._abortAlgorithm(e);
            return ct(this), t;
          }
          [T]() {
            de(this);
          }
        }
        function ut(e) {
          return (
            !!o(e) &&
            !!Object.prototype.hasOwnProperty.call(
              e,
              "_controlledWritableStream"
            ) &&
            e instanceof WritableStreamDefaultController
          );
        }
        function ct(e) {
          (e._writeAlgorithm = void 0),
            (e._closeAlgorithm = void 0),
            (e._abortAlgorithm = void 0),
            (e._strategySizeAlgorithm = void 0);
        }
        function dt(e) {
          return e._strategyHWM - e._queueTotalSize;
        }
        function ft(e) {
          const t = e._controlledWritableStream;
          if (!e._started) return;
          if (void 0 !== t._inFlightWriteRequest) return;
          if ("erroring" === t._state) return void rt(t);
          if (0 === e._queue.length) return;
          const r = e._queue.peek().value;
          r === st
            ? (function (e) {
                const t = e._controlledWritableStream;
                (function (e) {
                  (e._inFlightCloseRequest = e._closeRequest),
                    (e._closeRequest = void 0);
                })(t),
                  ue(e);
                const r = e._closeAlgorithm();
                ct(e),
                  h(
                    r,
                    () => (
                      (function (e) {
                        e._inFlightCloseRequest._resolve(void 0),
                          (e._inFlightCloseRequest = void 0),
                          "erroring" === e._state &&
                            ((e._storedError = void 0),
                            void 0 !== e._pendingAbortRequest &&
                              (e._pendingAbortRequest._resolve(),
                              (e._pendingAbortRequest = void 0))),
                          (e._state = "closed");
                        const t = e._writer;
                        void 0 !== t && Rt(t);
                      })(t),
                      null
                    ),
                    (e) => (
                      (function (e, t) {
                        e._inFlightCloseRequest._reject(t),
                          (e._inFlightCloseRequest = void 0),
                          void 0 !== e._pendingAbortRequest &&
                            (e._pendingAbortRequest._reject(t),
                            (e._pendingAbortRequest = void 0)),
                          et(e, t);
                      })(t, e),
                      null
                    )
                  );
              })(e)
            : (function (e, t) {
                const r = e._controlledWritableStream;
                !(function (e) {
                  e._inFlightWriteRequest = e._writeRequests.shift();
                })(r);
                h(
                  e._writeAlgorithm(t),
                  () => {
                    !(function (e) {
                      e._inFlightWriteRequest._resolve(void 0),
                        (e._inFlightWriteRequest = void 0);
                    })(r);
                    const t = r._state;
                    if ((ue(e), !ot(r) && "writable" === t)) {
                      const t = ht(e);
                      at(r, t);
                    }
                    return ft(e), null;
                  },
                  (t) => (
                    "writable" === r._state && ct(e),
                    (function (e, t) {
                      e._inFlightWriteRequest._reject(t),
                        (e._inFlightWriteRequest = void 0),
                        et(e, t);
                    })(r, t),
                    null
                  )
                );
              })(e, r);
        }
        function bt(e, t) {
          "writable" === e._controlledWritableStream._state && _t(e, t);
        }
        function ht(e) {
          return dt(e) <= 0;
        }
        function _t(e, t) {
          const r = e._controlledWritableStream;
          ct(e), tt(r, t);
        }
        function pt(e) {
          return new TypeError(
            `WritableStream.prototype.${e} can only be used on a WritableStream`
          );
        }
        function mt(e) {
          return new TypeError(
            `WritableStreamDefaultController.prototype.${e} can only be used on a WritableStreamDefaultController`
          );
        }
        function yt(e) {
          return new TypeError(
            `WritableStreamDefaultWriter.prototype.${e} can only be used on a WritableStreamDefaultWriter`
          );
        }
        function gt(e) {
          return new TypeError(
            "Cannot " + e + " a stream using a released writer"
          );
        }
        function St(e) {
          e._closedPromise = c((t, r) => {
            (e._closedPromise_resolve = t),
              (e._closedPromise_reject = r),
              (e._closedPromiseState = "pending");
          });
        }
        function wt(e, t) {
          St(e), vt(e, t);
        }
        function vt(e, t) {
          void 0 !== e._closedPromise_reject &&
            (y(e._closedPromise),
            e._closedPromise_reject(t),
            (e._closedPromise_resolve = void 0),
            (e._closedPromise_reject = void 0),
            (e._closedPromiseState = "rejected"));
        }
        function Rt(e) {
          void 0 !== e._closedPromise_resolve &&
            (e._closedPromise_resolve(void 0),
            (e._closedPromise_resolve = void 0),
            (e._closedPromise_reject = void 0),
            (e._closedPromiseState = "resolved"));
        }
        function Tt(e) {
          (e._readyPromise = c((t, r) => {
            (e._readyPromise_resolve = t), (e._readyPromise_reject = r);
          })),
            (e._readyPromiseState = "pending");
        }
        function qt(e, t) {
          Tt(e), Pt(e, t);
        }
        function Ct(e) {
          Tt(e), Et(e);
        }
        function Pt(e, t) {
          void 0 !== e._readyPromise_reject &&
            (y(e._readyPromise),
            e._readyPromise_reject(t),
            (e._readyPromise_resolve = void 0),
            (e._readyPromise_reject = void 0),
            (e._readyPromiseState = "rejected"));
        }
        function Et(e) {
          void 0 !== e._readyPromise_resolve &&
            (e._readyPromise_resolve(void 0),
            (e._readyPromise_resolve = void 0),
            (e._readyPromise_reject = void 0),
            (e._readyPromiseState = "fulfilled"));
        }
        Object.defineProperties(WritableStreamDefaultController.prototype, {
          abortReason: { enumerable: !0 },
          signal: { enumerable: !0 },
          error: { enumerable: !0 },
        }),
          "symbol" == typeof t.toStringTag &&
            Object.defineProperty(
              WritableStreamDefaultController.prototype,
              t.toStringTag,
              { value: "WritableStreamDefaultController", configurable: !0 }
            );
        const Wt = "undefined" != typeof DOMException ? DOMException : void 0;
        const Ot = (function (e) {
          if ("function" != typeof e && "object" != typeof e) return !1;
          try {
            return new e(), !0;
          } catch (e) {
            return !1;
          }
        })(Wt)
          ? Wt
          : (function () {
              const e = function (e, t) {
                (this.message = e || ""),
                  (this.name = t || "Error"),
                  Error.captureStackTrace &&
                    Error.captureStackTrace(this, this.constructor);
              };
              return (
                (e.prototype = Object.create(Error.prototype)),
                Object.defineProperty(e.prototype, "constructor", {
                  value: e,
                  writable: !0,
                  configurable: !0,
                }),
                e
              );
            })();
        function kt(e, t, r, o, n, a) {
          const i = e.getReader(),
            l = t.getWriter();
          Ut(e) && (e._disturbed = !0);
          let s,
            u,
            p,
            S = !1,
            w = !1,
            v = "readable",
            R = "writable",
            T = !1,
            q = !1;
          const C = c((e) => {
            p = e;
          });
          let P = Promise.resolve(void 0);
          return c((E, W) => {
            let O;
            function k() {
              if (S) return;
              const e = c((e, t) => {
                !(function r(o) {
                  o
                    ? e()
                    : b(
                        (function () {
                          if (S) return d(!0);
                          return b(l.ready, () =>
                            b(
                              i.read(),
                              (e) =>
                                !!e.done || ((P = l.write(e.value)), y(P), !1)
                            )
                          );
                        })(),
                        r,
                        t
                      );
                })(!1);
              });
              y(e);
            }
            function B() {
              return (
                (v = "closed"),
                r
                  ? L()
                  : z(
                      () => (
                        Xe(t) && ((T = ot(t)), (R = t._state)),
                        T || "closed" === R
                          ? d(void 0)
                          : "erroring" === R || "errored" === R
                          ? f(u)
                          : ((T = !0), l.close())
                      ),
                      !1,
                      void 0
                    ),
                null
              );
            }
            function A(e) {
              return (
                S ||
                  ((v = "errored"),
                  (s = e),
                  o ? L(!0, e) : z(() => l.abort(e), !0, e)),
                null
              );
            }
            function j(e) {
              return (
                w ||
                  ((R = "errored"),
                  (u = e),
                  n ? L(!0, e) : z(() => i.cancel(e), !0, e)),
                null
              );
            }
            if (
              (void 0 !== a &&
                ((O = () => {
                  const e =
                      void 0 !== a.reason
                        ? a.reason
                        : new Ot("Aborted", "AbortError"),
                    t = [];
                  o ||
                    t.push(() => ("writable" === R ? l.abort(e) : d(void 0))),
                    n ||
                      t.push(() =>
                        "readable" === v ? i.cancel(e) : d(void 0)
                      ),
                    z(() => Promise.all(t.map((e) => e())), !0, e);
                }),
                a.aborted ? O() : a.addEventListener("abort", O)),
              Ut(e) && ((v = e._state), (s = e._storedError)),
              Xe(t) && ((R = t._state), (u = t._storedError), (T = ot(t))),
              Ut(e) && Xe(t) && ((q = !0), p()),
              "errored" === v)
            )
              A(s);
            else if ("erroring" === R || "errored" === R) j(u);
            else if ("closed" === v) B();
            else if (T || "closed" === R) {
              const e = new TypeError(
                "the destination writable stream closed before all data could be piped to it"
              );
              n ? L(!0, e) : z(() => i.cancel(e), !0, e);
            }
            function z(e, t, r) {
              function o() {
                return (
                  "writable" !== R || T
                    ? n()
                    : _(
                        (function () {
                          let e;
                          return d(
                            (function t() {
                              if (e !== P) return (e = P), m(P, t, t);
                            })()
                          );
                        })(),
                        n
                      ),
                  null
                );
              }
              function n() {
                return (
                  e
                    ? h(
                        e(),
                        () => F(t, r),
                        (e) => F(!0, e)
                      )
                    : F(t, r),
                  null
                );
              }
              S || ((S = !0), q ? o() : _(C, o));
            }
            function L(e, t) {
              z(void 0, e, t);
            }
            function F(e, t) {
              return (
                (w = !0),
                l.releaseLock(),
                i.releaseLock(),
                void 0 !== a && a.removeEventListener("abort", O),
                e ? W(t) : E(void 0),
                null
              );
            }
            S ||
              (h(i.closed, B, A),
              h(
                l.closed,
                function () {
                  return w || (R = "closed"), null;
                },
                j
              )),
              q
                ? k()
                : g(() => {
                    (q = !0), p(), k();
                  });
          });
        }
        function Bt(e, t) {
          return (function (e) {
            try {
              return e.getReader({ mode: "byob" }).releaseLock(), !0;
            } catch (e) {
              return !1;
            }
          })(e)
            ? (function (e) {
                let t,
                  r,
                  o,
                  n,
                  a,
                  i = e.getReader(),
                  l = !1,
                  s = !1,
                  u = !1,
                  f = !1,
                  b = !1,
                  _ = !1;
                const m = c((e) => {
                  a = e;
                });
                function y(e) {
                  p(
                    e.closed,
                    (t) => (
                      e !== i ||
                        (o.error(t), n.error(t), (b && _) || a(void 0)),
                      null
                    )
                  );
                }
                function g() {
                  l && (i.releaseLock(), (i = e.getReader()), y(i), (l = !1)),
                    h(
                      i.read(),
                      (e) => {
                        var t, r;
                        if (((u = !1), (f = !1), e.done))
                          return (
                            b || o.close(),
                            _ || n.close(),
                            null === (t = o.byobRequest) ||
                              void 0 === t ||
                              t.respond(0),
                            null === (r = n.byobRequest) ||
                              void 0 === r ||
                              r.respond(0),
                            (b && _) || a(void 0),
                            null
                          );
                        const l = e.value,
                          c = l;
                        let d = l;
                        if (!b && !_)
                          try {
                            d = se(l);
                          } catch (e) {
                            return o.error(e), n.error(e), a(i.cancel(e)), null;
                          }
                        return (
                          b || o.enqueue(c),
                          _ || n.enqueue(d),
                          (s = !1),
                          u ? w() : f && v(),
                          null
                        );
                      },
                      () => ((s = !1), null)
                    );
                }
                function S(t, r) {
                  l ||
                    (i.releaseLock(),
                    (i = e.getReader({ mode: "byob" })),
                    y(i),
                    (l = !0));
                  const c = r ? n : o,
                    d = r ? o : n;
                  h(
                    i.read(t),
                    (e) => {
                      var t;
                      (u = !1), (f = !1);
                      const o = r ? _ : b,
                        n = r ? b : _;
                      if (e.done) {
                        o || c.close(), n || d.close();
                        const r = e.value;
                        return (
                          void 0 !== r &&
                            (o || c.byobRequest.respondWithNewView(r),
                            n ||
                              null === (t = d.byobRequest) ||
                              void 0 === t ||
                              t.respond(0)),
                          (o && n) || a(void 0),
                          null
                        );
                      }
                      const l = e.value;
                      if (n) o || c.byobRequest.respondWithNewView(l);
                      else {
                        let e;
                        try {
                          e = se(l);
                        } catch (e) {
                          return c.error(e), d.error(e), a(i.cancel(e)), null;
                        }
                        o || c.byobRequest.respondWithNewView(l), d.enqueue(e);
                      }
                      return (s = !1), u ? w() : f && v(), null;
                    },
                    () => ((s = !1), null)
                  );
                }
                function w() {
                  if (s) return (u = !0), d(void 0);
                  s = !0;
                  const e = o.byobRequest;
                  return null === e ? g() : S(e.view, !1), d(void 0);
                }
                function v() {
                  if (s) return (f = !0), d(void 0);
                  s = !0;
                  const e = n.byobRequest;
                  return null === e ? g() : S(e.view, !0), d(void 0);
                }
                function R(e) {
                  if (((b = !0), (t = e), _)) {
                    const e = [t, r],
                      o = i.cancel(e);
                    a(o);
                  }
                  return m;
                }
                function T(e) {
                  if (((_ = !0), (r = e), b)) {
                    const e = [t, r],
                      o = i.cancel(e);
                    a(o);
                  }
                  return m;
                }
                const q = new ReadableStream({
                    type: "bytes",
                    start(e) {
                      o = e;
                    },
                    pull: w,
                    cancel: R,
                  }),
                  C = new ReadableStream({
                    type: "bytes",
                    start(e) {
                      n = e;
                    },
                    pull: v,
                    cancel: T,
                  });
                return y(i), [q, C];
              })(e)
            : (function (e, t) {
                const r = e.getReader();
                let o,
                  n,
                  a,
                  i,
                  l,
                  s = !1,
                  u = !1,
                  f = !1,
                  b = !1;
                const _ = c((e) => {
                  l = e;
                });
                function m() {
                  return s
                    ? ((u = !0), d(void 0))
                    : ((s = !0),
                      h(
                        r.read(),
                        (e) => {
                          if (((u = !1), e.done))
                            return (
                              f || a.close(),
                              b || i.close(),
                              (f && b) || l(void 0),
                              null
                            );
                          const t = e.value,
                            r = t,
                            o = t;
                          return (
                            f || a.enqueue(r),
                            b || i.enqueue(o),
                            (s = !1),
                            u && m(),
                            null
                          );
                        },
                        () => ((s = !1), null)
                      ),
                      d(void 0));
                }
                function y(e) {
                  if (((f = !0), (o = e), b)) {
                    const e = [o, n],
                      t = r.cancel(e);
                    l(t);
                  }
                  return _;
                }
                function g(e) {
                  if (((b = !0), (n = e), f)) {
                    const e = [o, n],
                      t = r.cancel(e);
                    l(t);
                  }
                  return _;
                }
                const S = new ReadableStream({
                    start(e) {
                      a = e;
                    },
                    pull: m,
                    cancel: y,
                  }),
                  w = new ReadableStream({
                    start(e) {
                      i = e;
                    },
                    pull: m,
                    cancel: g,
                  });
                return (
                  p(
                    r.closed,
                    (e) => (a.error(e), i.error(e), (f && b) || l(void 0), null)
                  ),
                  [S, w]
                );
              })(e);
        }
        class ReadableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!At(this)) throw $t("desiredSize");
            return Ft(this);
          }
          close() {
            if (!At(this)) throw $t("close");
            if (!Dt(this))
              throw new TypeError(
                "The stream is not in a state that permits close"
              );
            !(function (e) {
              if (!Dt(e)) return;
              const t = e._controlledReadableStream;
              (e._closeRequested = !0), 0 === e._queue.length && (zt(e), Jt(t));
            })(this);
          }
          enqueue(e) {
            if (!At(this)) throw $t("enqueue");
            if (!Dt(this))
              throw new TypeError(
                "The stream is not in a state that permits enqueue"
              );
            return (function (e, t) {
              if (!Dt(e)) return;
              const r = e._controlledReadableStream;
              if (Gt(r) && J(r) > 0) X(r, t, !1);
              else {
                let r;
                try {
                  r = e._strategySizeAlgorithm(t);
                } catch (t) {
                  throw (Lt(e, t), t);
                }
                try {
                  ce(e, t, r);
                } catch (t) {
                  throw (Lt(e, t), t);
                }
              }
              jt(e);
            })(this, e);
          }
          error(e) {
            if (!At(this)) throw $t("error");
            Lt(this, e);
          }
          [q](e) {
            de(this);
            const t = this._cancelAlgorithm(e);
            return zt(this), t;
          }
          [C](e) {
            const t = this._controlledReadableStream;
            if (this._queue.length > 0) {
              const r = ue(this);
              this._closeRequested && 0 === this._queue.length
                ? (zt(this), Jt(t))
                : jt(this),
                e._chunkSteps(r);
            } else G(t, e), jt(this);
          }
          [P]() {}
        }
        function At(e) {
          return (
            !!o(e) &&
            !!Object.prototype.hasOwnProperty.call(
              e,
              "_controlledReadableStream"
            ) &&
            e instanceof ReadableStreamDefaultController
          );
        }
        function jt(e) {
          const t = (function (e) {
            const t = e._controlledReadableStream;
            if (!Dt(e)) return !1;
            if (!e._started) return !1;
            if (Gt(t) && J(t) > 0) return !0;
            if (Ft(e) > 0) return !0;
            return !1;
          })(e);
          if (!t) return;
          if (e._pulling) return void (e._pullAgain = !0);
          e._pulling = !0;
          h(
            e._pullAlgorithm(),
            () => (
              (e._pulling = !1),
              e._pullAgain && ((e._pullAgain = !1), jt(e)),
              null
            ),
            (t) => (Lt(e, t), null)
          );
        }
        function zt(e) {
          (e._pullAlgorithm = void 0),
            (e._cancelAlgorithm = void 0),
            (e._strategySizeAlgorithm = void 0);
        }
        function Lt(e, t) {
          const r = e._controlledReadableStream;
          "readable" === r._state && (de(e), zt(e), Kt(r, t));
        }
        function Ft(e) {
          const t = e._controlledReadableStream._state;
          return "errored" === t
            ? null
            : "closed" === t
            ? 0
            : e._strategyHWM - e._queueTotalSize;
        }
        function Dt(e) {
          return (
            !e._closeRequested &&
            "readable" === e._controlledReadableStream._state
          );
        }
        function It(e, t, r, o) {
          const n = Object.create(ReadableStreamDefaultController.prototype);
          let a, i, l;
          (a = void 0 !== t.start ? () => t.start(n) : () => {}),
            (i = void 0 !== t.pull ? () => t.pull(n) : () => d(void 0)),
            (l = void 0 !== t.cancel ? (e) => t.cancel(e) : () => d(void 0)),
            (function (e, t, r, o, n, a, i) {
              (t._controlledReadableStream = e),
                (t._queue = void 0),
                (t._queueTotalSize = void 0),
                de(t),
                (t._started = !1),
                (t._closeRequested = !1),
                (t._pullAgain = !1),
                (t._pulling = !1),
                (t._strategySizeAlgorithm = i),
                (t._strategyHWM = a),
                (t._pullAlgorithm = o),
                (t._cancelAlgorithm = n),
                (e._readableStreamController = t),
                h(
                  d(r()),
                  () => ((t._started = !0), jt(t), null),
                  (e) => (Lt(t, e), null)
                );
            })(e, n, a, i, l, r, o);
        }
        function $t(e) {
          return new TypeError(
            `ReadableStreamDefaultController.prototype.${e} can only be used on a ReadableStreamDefaultController`
          );
        }
        function Mt(e, t, r) {
          return I(e, r), (r) => w(e, t, [r]);
        }
        function Yt(e, t, r) {
          return I(e, r), (r) => w(e, t, [r]);
        }
        function Qt(e, t, r) {
          return I(e, r), (r) => S(e, t, [r]);
        }
        function Nt(e, t) {
          if ("bytes" !== (e = `${e}`))
            throw new TypeError(
              `${t} '${e}' is not a valid enumeration value for ReadableStreamType`
            );
          return e;
        }
        function xt(e, t) {
          if ("byob" !== (e = `${e}`))
            throw new TypeError(
              `${t} '${e}' is not a valid enumeration value for ReadableStreamReaderMode`
            );
          return e;
        }
        function Ht(e, t) {
          D(e, t);
          const r = null == e ? void 0 : e.preventAbort,
            o = null == e ? void 0 : e.preventCancel,
            n = null == e ? void 0 : e.preventClose,
            a = null == e ? void 0 : e.signal;
          return (
            void 0 !== a &&
              (function (e, t) {
                if (
                  !(function (e) {
                    if ("object" != typeof e || null === e) return !1;
                    try {
                      return "boolean" == typeof e.aborted;
                    } catch (e) {
                      return !1;
                    }
                  })(e)
                )
                  throw new TypeError(`${t} is not an AbortSignal.`);
              })(a, `${t} has member 'signal' that`),
            {
              preventAbort: Boolean(r),
              preventCancel: Boolean(o),
              preventClose: Boolean(n),
              signal: a,
            }
          );
        }
        function Vt(e, t) {
          D(e, t);
          const r = null == e ? void 0 : e.readable;
          Y(r, "readable", "ReadableWritablePair"),
            (function (e, t) {
              if (!H(e)) throw new TypeError(`${t} is not a ReadableStream.`);
            })(r, `${t} has member 'readable' that`);
          const o = null == e ? void 0 : e.writable;
          return (
            Y(o, "writable", "ReadableWritablePair"),
            (function (e, t) {
              if (!V(e)) throw new TypeError(`${t} is not a WritableStream.`);
            })(o, `${t} has member 'writable' that`),
            { readable: r, writable: o }
          );
        }
        Object.defineProperties(ReadableStreamDefaultController.prototype, {
          close: { enumerable: !0 },
          enqueue: { enumerable: !0 },
          error: { enumerable: !0 },
          desiredSize: { enumerable: !0 },
        }),
          a(ReadableStreamDefaultController.prototype.close, "close"),
          a(ReadableStreamDefaultController.prototype.enqueue, "enqueue"),
          a(ReadableStreamDefaultController.prototype.error, "error"),
          "symbol" == typeof t.toStringTag &&
            Object.defineProperty(
              ReadableStreamDefaultController.prototype,
              t.toStringTag,
              { value: "ReadableStreamDefaultController", configurable: !0 }
            );
        class ReadableStream {
          constructor(e = {}, t = {}) {
            void 0 === e ? (e = null) : $(e, "First parameter");
            const r = Qe(t, "Second parameter"),
              o = (function (e, t) {
                D(e, t);
                const r = e,
                  o = null == r ? void 0 : r.autoAllocateChunkSize,
                  n = null == r ? void 0 : r.cancel,
                  a = null == r ? void 0 : r.pull,
                  i = null == r ? void 0 : r.start,
                  l = null == r ? void 0 : r.type;
                return {
                  autoAllocateChunkSize:
                    void 0 === o
                      ? void 0
                      : x(o, `${t} has member 'autoAllocateChunkSize' that`),
                  cancel:
                    void 0 === n
                      ? void 0
                      : Mt(n, r, `${t} has member 'cancel' that`),
                  pull:
                    void 0 === a
                      ? void 0
                      : Yt(a, r, `${t} has member 'pull' that`),
                  start:
                    void 0 === i
                      ? void 0
                      : Qt(i, r, `${t} has member 'start' that`),
                  type:
                    void 0 === l
                      ? void 0
                      : Nt(l, `${t} has member 'type' that`),
                };
              })(e, "First parameter");
            var n;
            if (
              (((n = this)._state = "readable"),
              (n._reader = void 0),
              (n._storedError = void 0),
              (n._disturbed = !1),
              "bytes" === o.type)
            ) {
              if (void 0 !== r.size)
                throw new RangeError(
                  "The strategy for a byte stream cannot have a size function"
                );
              Be(this, o, Me(r, 0));
            } else {
              const e = Ye(r);
              It(this, o, Me(r, 1), e);
            }
          }
          get locked() {
            if (!Ut(this)) throw Zt("locked");
            return Gt(this);
          }
          cancel(e) {
            return Ut(this)
              ? Gt(this)
                ? f(
                    new TypeError(
                      "Cannot cancel a stream that already has a reader"
                    )
                  )
                : Xt(this, e)
              : f(Zt("cancel"));
          }
          getReader(e) {
            if (!Ut(this)) throw Zt("getReader");
            return void 0 ===
              (function (e, t) {
                D(e, t);
                const r = null == e ? void 0 : e.mode;
                return {
                  mode:
                    void 0 === r
                      ? void 0
                      : xt(r, `${t} has member 'mode' that`),
                };
              })(e, "First parameter").mode
              ? new ReadableStreamDefaultReader(this)
              : (function (e) {
                  return new ReadableStreamBYOBReader(e);
                })(this);
          }
          pipeThrough(e, t = {}) {
            if (!H(this)) throw Zt("pipeThrough");
            M(e, 1, "pipeThrough");
            const r = Vt(e, "First parameter"),
              o = Ht(t, "Second parameter");
            if (this.locked)
              throw new TypeError(
                "ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream"
              );
            if (r.writable.locked)
              throw new TypeError(
                "ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream"
              );
            return (
              y(
                kt(
                  this,
                  r.writable,
                  o.preventClose,
                  o.preventAbort,
                  o.preventCancel,
                  o.signal
                )
              ),
              r.readable
            );
          }
          pipeTo(e, t = {}) {
            if (!H(this)) return f(Zt("pipeTo"));
            if (void 0 === e) return f("Parameter 1 is required in 'pipeTo'.");
            if (!V(e))
              return f(
                new TypeError(
                  "ReadableStream.prototype.pipeTo's first argument must be a WritableStream"
                )
              );
            let r;
            try {
              r = Ht(t, "Second parameter");
            } catch (e) {
              return f(e);
            }
            return this.locked
              ? f(
                  new TypeError(
                    "ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream"
                  )
                )
              : e.locked
              ? f(
                  new TypeError(
                    "ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream"
                  )
                )
              : kt(
                  this,
                  e,
                  r.preventClose,
                  r.preventAbort,
                  r.preventCancel,
                  r.signal
                );
          }
          tee() {
            if (!H(this)) throw Zt("tee");
            if (this.locked)
              throw new TypeError(
                "Cannot tee a stream that already has a reader"
              );
            return Bt(this);
          }
          values(e) {
            if (!H(this)) throw Zt("values");
            return (function (e, t) {
              const r = e.getReader(),
                o = new re(r, t),
                n = Object.create(oe);
              return (n._asyncIteratorImpl = o), n;
            })(
              this,
              (function (e, t) {
                D(e, t);
                const r = null == e ? void 0 : e.preventCancel;
                return { preventCancel: Boolean(r) };
              })(e, "First parameter").preventCancel
            );
          }
        }
        function Ut(e) {
          return (
            !!o(e) &&
            !!Object.prototype.hasOwnProperty.call(
              e,
              "_readableStreamController"
            ) &&
            e instanceof ReadableStream
          );
        }
        function Gt(e) {
          return void 0 !== e._reader;
        }
        function Xt(e, t) {
          if (((e._disturbed = !0), "closed" === e._state)) return d(void 0);
          if ("errored" === e._state) return f(e._storedError);
          Jt(e);
          const o = e._reader;
          if (void 0 !== o && De(o)) {
            const e = o._readIntoRequests;
            (o._readIntoRequests = new v()),
              e.forEach((e) => {
                e._closeSteps(void 0);
              });
          }
          return m(e._readableStreamController[q](t), r);
        }
        function Jt(e) {
          e._state = "closed";
          const t = e._reader;
          if (void 0 !== t && (z(t), Z(t))) {
            const e = t._readRequests;
            (t._readRequests = new v()),
              e.forEach((e) => {
                e._closeSteps();
              });
          }
        }
        function Kt(e, t) {
          (e._state = "errored"), (e._storedError = t);
          const r = e._reader;
          void 0 !== r && (j(r, t), Z(r) ? ee(r, t) : Ie(r, t));
        }
        function Zt(e) {
          return new TypeError(
            `ReadableStream.prototype.${e} can only be used on a ReadableStream`
          );
        }
        function er(e, t) {
          D(e, t);
          const r = null == e ? void 0 : e.highWaterMark;
          return (
            Y(r, "highWaterMark", "QueuingStrategyInit"),
            { highWaterMark: Q(r) }
          );
        }
        Object.defineProperties(ReadableStream.prototype, {
          cancel: { enumerable: !0 },
          getReader: { enumerable: !0 },
          pipeThrough: { enumerable: !0 },
          pipeTo: { enumerable: !0 },
          tee: { enumerable: !0 },
          values: { enumerable: !0 },
          locked: { enumerable: !0 },
        }),
          a(ReadableStream.prototype.cancel, "cancel"),
          a(ReadableStream.prototype.getReader, "getReader"),
          a(ReadableStream.prototype.pipeThrough, "pipeThrough"),
          a(ReadableStream.prototype.pipeTo, "pipeTo"),
          a(ReadableStream.prototype.tee, "tee"),
          a(ReadableStream.prototype.values, "values"),
          "symbol" == typeof t.toStringTag &&
            Object.defineProperty(ReadableStream.prototype, t.toStringTag, {
              value: "ReadableStream",
              configurable: !0,
            }),
          "symbol" == typeof t.asyncIterator &&
            Object.defineProperty(ReadableStream.prototype, t.asyncIterator, {
              value: ReadableStream.prototype.values,
              writable: !0,
              configurable: !0,
            });
        const tr = (e) => e.byteLength;
        a(tr, "size");
        class ByteLengthQueuingStrategy {
          constructor(e) {
            M(e, 1, "ByteLengthQueuingStrategy"),
              (e = er(e, "First parameter")),
              (this._byteLengthQueuingStrategyHighWaterMark = e.highWaterMark);
          }
          get highWaterMark() {
            if (!or(this)) throw rr("highWaterMark");
            return this._byteLengthQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!or(this)) throw rr("size");
            return tr;
          }
        }
        function rr(e) {
          return new TypeError(
            `ByteLengthQueuingStrategy.prototype.${e} can only be used on a ByteLengthQueuingStrategy`
          );
        }
        function or(e) {
          return (
            !!o(e) &&
            !!Object.prototype.hasOwnProperty.call(
              e,
              "_byteLengthQueuingStrategyHighWaterMark"
            ) &&
            e instanceof ByteLengthQueuingStrategy
          );
        }
        Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
          highWaterMark: { enumerable: !0 },
          size: { enumerable: !0 },
        }),
          "symbol" == typeof t.toStringTag &&
            Object.defineProperty(
              ByteLengthQueuingStrategy.prototype,
              t.toStringTag,
              { value: "ByteLengthQueuingStrategy", configurable: !0 }
            );
        const nr = () => 1;
        a(nr, "size");
        class CountQueuingStrategy {
          constructor(e) {
            M(e, 1, "CountQueuingStrategy"),
              (e = er(e, "First parameter")),
              (this._countQueuingStrategyHighWaterMark = e.highWaterMark);
          }
          get highWaterMark() {
            if (!ir(this)) throw ar("highWaterMark");
            return this._countQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!ir(this)) throw ar("size");
            return nr;
          }
        }
        function ar(e) {
          return new TypeError(
            `CountQueuingStrategy.prototype.${e} can only be used on a CountQueuingStrategy`
          );
        }
        function ir(e) {
          return (
            !!o(e) &&
            !!Object.prototype.hasOwnProperty.call(
              e,
              "_countQueuingStrategyHighWaterMark"
            ) &&
            e instanceof CountQueuingStrategy
          );
        }
        function lr(e, t, r) {
          return I(e, r), (r) => w(e, t, [r]);
        }
        function sr(e, t, r) {
          return I(e, r), (r) => S(e, t, [r]);
        }
        function ur(e, t, r) {
          return I(e, r), (r, o) => w(e, t, [r, o]);
        }
        Object.defineProperties(CountQueuingStrategy.prototype, {
          highWaterMark: { enumerable: !0 },
          size: { enumerable: !0 },
        }),
          "symbol" == typeof t.toStringTag &&
            Object.defineProperty(
              CountQueuingStrategy.prototype,
              t.toStringTag,
              { value: "CountQueuingStrategy", configurable: !0 }
            );
        class TransformStream {
          constructor(e = {}, t = {}, r = {}) {
            void 0 === e && (e = null);
            const o = Qe(t, "Second parameter"),
              n = Qe(r, "Third parameter"),
              a = (function (e, t) {
                D(e, t);
                const r = null == e ? void 0 : e.flush,
                  o = null == e ? void 0 : e.readableType,
                  n = null == e ? void 0 : e.start,
                  a = null == e ? void 0 : e.transform,
                  i = null == e ? void 0 : e.writableType;
                return {
                  flush:
                    void 0 === r
                      ? void 0
                      : lr(r, e, `${t} has member 'flush' that`),
                  readableType: o,
                  start:
                    void 0 === n
                      ? void 0
                      : sr(n, e, `${t} has member 'start' that`),
                  transform:
                    void 0 === a
                      ? void 0
                      : ur(a, e, `${t} has member 'transform' that`),
                  writableType: i,
                };
              })(e, "First parameter");
            if (void 0 !== a.readableType)
              throw new RangeError("Invalid readableType specified");
            if (void 0 !== a.writableType)
              throw new RangeError("Invalid writableType specified");
            const i = Me(n, 0),
              l = Ye(n),
              s = Me(o, 1),
              u = Ye(o);
            let b;
            !(function (e, t, r, o, n, a) {
              function i() {
                return t;
              }
              function l(t) {
                return (function (e, t) {
                  const r = e._transformStreamController;
                  if (e._backpressure) {
                    return m(e._backpressureChangePromise, () => {
                      if (
                        "erroring" ===
                        (Xe(e._writable)
                          ? e._writable._state
                          : e._writableState)
                      )
                        throw Xe(e._writable)
                          ? e._writable._storedError
                          : e._writableStoredError;
                      return mr(r, t);
                    });
                  }
                  return mr(r, t);
                })(e, t);
              }
              function s(t) {
                return (function (e, t) {
                  return dr(e, t), d(void 0);
                })(e, t);
              }
              function u() {
                return (function (e) {
                  const t = e._transformStreamController,
                    r = t._flushAlgorithm();
                  return (
                    _r(t),
                    m(
                      r,
                      () => {
                        if ("errored" === e._readableState)
                          throw e._readableStoredError;
                        Sr(e) && wr(e);
                      },
                      (t) => {
                        throw (dr(e, t), e._readableStoredError);
                      }
                    )
                  );
                })(e);
              }
              function c() {
                return (function (e) {
                  return br(e, !1), e._backpressureChangePromise;
                })(e);
              }
              function f(t) {
                return fr(e, t), d(void 0);
              }
              (e._writableState = "writable"),
                (e._writableStoredError = void 0),
                (e._writableHasInFlightOperation = !1),
                (e._writableStarted = !1),
                (e._writable = (function (e, t, r, o, n, a, i) {
                  return new WritableStream(
                    {
                      start(r) {
                        e._writableController = r;
                        try {
                          const t = r.signal;
                          void 0 !== t &&
                            t.addEventListener("abort", () => {
                              "writable" === e._writableState &&
                                ((e._writableState = "erroring"),
                                t.reason &&
                                  (e._writableStoredError = t.reason));
                            });
                        } catch (e) {}
                        return m(
                          t(),
                          () => ((e._writableStarted = !0), Pr(e), null),
                          (t) => {
                            throw ((e._writableStarted = !0), Tr(e, t), t);
                          }
                        );
                      },
                      write: (t) => (
                        (function (e) {
                          e._writableHasInFlightOperation = !0;
                        })(e),
                        m(
                          r(t),
                          () => (
                            (function (e) {
                              e._writableHasInFlightOperation = !1;
                            })(e),
                            Pr(e),
                            null
                          ),
                          (t) => {
                            throw (
                              ((function (e, t) {
                                (e._writableHasInFlightOperation = !1),
                                  Tr(e, t);
                              })(e, t),
                              t)
                            );
                          }
                        )
                      ),
                      close: () => (
                        (function (e) {
                          e._writableHasInFlightOperation = !0;
                        })(e),
                        m(
                          o(),
                          () => (
                            (function (e) {
                              e._writableHasInFlightOperation = !1;
                              "erroring" === e._writableState &&
                                (e._writableStoredError = void 0);
                              e._writableState = "closed";
                            })(e),
                            null
                          ),
                          (t) => {
                            throw (
                              ((function (e, t) {
                                (e._writableHasInFlightOperation = !1),
                                  e._writableState,
                                  Tr(e, t);
                              })(e, t),
                              t)
                            );
                          }
                        )
                      ),
                      abort: (t) => (
                        (e._writableState = "errored"),
                        (e._writableStoredError = t),
                        n(t)
                      ),
                    },
                    { highWaterMark: a, size: i }
                  );
                })(e, i, l, u, s, r, o)),
                (e._readableState = "readable"),
                (e._readableStoredError = void 0),
                (e._readableCloseRequested = !1),
                (e._readablePulling = !1),
                (e._readable = (function (e, t, r, o, n, a) {
                  return new ReadableStream(
                    {
                      start: (r) => (
                        (e._readableController = r),
                        t().catch((t) => {
                          vr(e, t);
                        })
                      ),
                      pull: () => (
                        (e._readablePulling = !0),
                        r().catch((t) => {
                          vr(e, t);
                        })
                      ),
                      cancel: (t) => ((e._readableState = "closed"), o(t)),
                    },
                    { highWaterMark: n, size: a }
                  );
                })(e, i, c, f, n, a)),
                (e._backpressure = void 0),
                (e._backpressureChangePromise = void 0),
                (e._backpressureChangePromise_resolve = void 0),
                br(e, !0),
                (e._transformStreamController = void 0);
            })(
              this,
              c((e) => {
                b = e;
              }),
              s,
              u,
              i,
              l
            ),
              (function (e, t) {
                const r = Object.create(
                  TransformStreamDefaultController.prototype
                );
                let o, n;
                o =
                  void 0 !== t.transform
                    ? (e) => t.transform(e, r)
                    : (e) => {
                        try {
                          return pr(r, e), d(void 0);
                        } catch (e) {
                          return f(e);
                        }
                      };
                n = void 0 !== t.flush ? () => t.flush(r) : () => d(void 0);
                !(function (e, t, r, o) {
                  (t._controlledTransformStream = e),
                    (e._transformStreamController = t),
                    (t._transformAlgorithm = r),
                    (t._flushAlgorithm = o);
                })(e, r, o, n);
              })(this, a),
              void 0 !== a.start
                ? b(a.start(this._transformStreamController))
                : b(void 0);
          }
          get readable() {
            if (!cr(this)) throw gr("readable");
            return this._readable;
          }
          get writable() {
            if (!cr(this)) throw gr("writable");
            return this._writable;
          }
        }
        function cr(e) {
          return (
            !!o(e) &&
            !!Object.prototype.hasOwnProperty.call(
              e,
              "_transformStreamController"
            ) &&
            e instanceof TransformStream
          );
        }
        function dr(e, t) {
          vr(e, t), fr(e, t);
        }
        function fr(e, t) {
          _r(e._transformStreamController),
            (function (e, t) {
              e._writableController.error(t);
              "writable" === e._writableState && qr(e, t);
            })(e, t),
            e._backpressure && br(e, !1);
        }
        function br(e, t) {
          void 0 !== e._backpressureChangePromise &&
            e._backpressureChangePromise_resolve(),
            (e._backpressureChangePromise = c((t) => {
              e._backpressureChangePromise_resolve = t;
            })),
            (e._backpressure = t);
        }
        Object.defineProperties(TransformStream.prototype, {
          readable: { enumerable: !0 },
          writable: { enumerable: !0 },
        }),
          "symbol" == typeof t.toStringTag &&
            Object.defineProperty(TransformStream.prototype, t.toStringTag, {
              value: "TransformStream",
              configurable: !0,
            });
        class TransformStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!hr(this)) throw yr("desiredSize");
            return Rr(this._controlledTransformStream);
          }
          enqueue(e) {
            if (!hr(this)) throw yr("enqueue");
            pr(this, e);
          }
          error(e) {
            if (!hr(this)) throw yr("error");
            var t;
            (t = e), dr(this._controlledTransformStream, t);
          }
          terminate() {
            if (!hr(this)) throw yr("terminate");
            !(function (e) {
              const t = e._controlledTransformStream;
              Sr(t) && wr(t);
              const r = new TypeError("TransformStream terminated");
              fr(t, r);
            })(this);
          }
        }
        function hr(e) {
          return (
            !!o(e) &&
            !!Object.prototype.hasOwnProperty.call(
              e,
              "_controlledTransformStream"
            ) &&
            e instanceof TransformStreamDefaultController
          );
        }
        function _r(e) {
          (e._transformAlgorithm = void 0), (e._flushAlgorithm = void 0);
        }
        function pr(e, t) {
          const r = e._controlledTransformStream;
          if (!Sr(r))
            throw new TypeError(
              "Readable side is not in a state that permits enqueue"
            );
          try {
            !(function (e, t) {
              e._readablePulling = !1;
              try {
                e._readableController.enqueue(t);
              } catch (t) {
                throw (vr(e, t), t);
              }
            })(r, t);
          } catch (e) {
            throw (fr(r, e), r._readableStoredError);
          }
          const o = (function (e) {
            return !(function (e) {
              if (!Sr(e)) return !1;
              if (e._readablePulling) return !0;
              if (Rr(e) > 0) return !0;
              return !1;
            })(e);
          })(r);
          o !== r._backpressure && br(r, !0);
        }
        function mr(e, t) {
          return m(e._transformAlgorithm(t), void 0, (t) => {
            throw (dr(e._controlledTransformStream, t), t);
          });
        }
        function yr(e) {
          return new TypeError(
            `TransformStreamDefaultController.prototype.${e} can only be used on a TransformStreamDefaultController`
          );
        }
        function gr(e) {
          return new TypeError(
            `TransformStream.prototype.${e} can only be used on a TransformStream`
          );
        }
        function Sr(e) {
          return !e._readableCloseRequested && "readable" === e._readableState;
        }
        function wr(e) {
          (e._readableState = "closed"),
            (e._readableCloseRequested = !0),
            e._readableController.close();
        }
        function vr(e, t) {
          "readable" === e._readableState &&
            ((e._readableState = "errored"), (e._readableStoredError = t)),
            e._readableController.error(t);
        }
        function Rr(e) {
          return e._readableController.desiredSize;
        }
        function Tr(e, t) {
          "writable" !== e._writableState ? Cr(e) : qr(e, t);
        }
        function qr(e, t) {
          (e._writableState = "erroring"),
            (e._writableStoredError = t),
            !(function (e) {
              return e._writableHasInFlightOperation;
            })(e) &&
              e._writableStarted &&
              Cr(e);
        }
        function Cr(e) {
          e._writableState = "errored";
        }
        function Pr(e) {
          "erroring" === e._writableState && Cr(e);
        }
        Object.defineProperties(TransformStreamDefaultController.prototype, {
          enqueue: { enumerable: !0 },
          error: { enumerable: !0 },
          terminate: { enumerable: !0 },
          desiredSize: { enumerable: !0 },
        }),
          a(TransformStreamDefaultController.prototype.enqueue, "enqueue"),
          a(TransformStreamDefaultController.prototype.error, "error"),
          a(TransformStreamDefaultController.prototype.terminate, "terminate"),
          "symbol" == typeof t.toStringTag &&
            Object.defineProperty(
              TransformStreamDefaultController.prototype,
              t.toStringTag,
              { value: "TransformStreamDefaultController", configurable: !0 }
            ),
          (e.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy),
          (e.CountQueuingStrategy = CountQueuingStrategy),
          (e.ReadableByteStreamController = ReadableByteStreamController),
          (e.ReadableStream = ReadableStream),
          (e.ReadableStreamBYOBReader = ReadableStreamBYOBReader),
          (e.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest),
          (e.ReadableStreamDefaultController = ReadableStreamDefaultController),
          (e.ReadableStreamDefaultReader = ReadableStreamDefaultReader),
          (e.TransformStream = TransformStream),
          (e.TransformStreamDefaultController =
            TransformStreamDefaultController),
          (e.WritableStream = WritableStream),
          (e.WritableStreamDefaultController = WritableStreamDefaultController),
          (e.WritableStreamDefaultWriter = WritableStreamDefaultWriter),
          Object.defineProperty(e, "__esModule", { value: !0 });
      });

      /***/
    },

    /***/ 845: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";
      /*!
       * humanize-ms - index.js
       * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
       * MIT Licensed
       */

      /**
       * Module dependencies.
       */

      var util = __nccwpck_require__(3837);
      var ms = __nccwpck_require__(900);

      module.exports = function (t) {
        if (typeof t === "number") return t;
        var r = ms(t);
        if (r === undefined) {
          var err = new Error(
            util.format("humanize-ms(%j) result undefined", t)
          );
          console.warn(err.stack);
        }
        return r;
      };

      /***/
    },

    /***/ 3287: /***/ (__unused_webpack_module, exports) => {
      "use strict";

      Object.defineProperty(exports, "__esModule", { value: true });

      /*!
       * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
       *
       * Copyright (c) 2014-2017, Jon Schlinkert.
       * Released under the MIT License.
       */

      function isObject(o) {
        return Object.prototype.toString.call(o) === "[object Object]";
      }

      function isPlainObject(o) {
        var ctor, prot;

        if (isObject(o) === false) return false;

        // If has modified constructor
        ctor = o.constructor;
        if (ctor === undefined) return true;

        // If has modified prototype
        prot = ctor.prototype;
        if (isObject(prot) === false) return false;

        // If constructor does not have an Object-specific method
        if (prot.hasOwnProperty("isPrototypeOf") === false) {
          return false;
        }

        // Most likely a plain Object
        return true;
      }

      exports.isPlainObject = isPlainObject;

      /***/
    },

    /***/ 7073: /***/ (module, exports) => {
      exports = module.exports = stringify;
      exports.getSerialize = serializer;

      function stringify(obj, replacer, spaces, cycleReplacer) {
        return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces);
      }

      function serializer(replacer, cycleReplacer) {
        var stack = [],
          keys = [];

        if (cycleReplacer == null)
          cycleReplacer = function (key, value) {
            if (stack[0] === value) return "[Circular ~]";
            return (
              "[Circular ~." +
              keys.slice(0, stack.indexOf(value)).join(".") +
              "]"
            );
          };

        return function (key, value) {
          if (stack.length > 0) {
            var thisPos = stack.indexOf(this);
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
            if (~stack.indexOf(value))
              value = cycleReplacer.call(this, key, value);
          } else stack.push(value);

          return replacer == null ? value : replacer.call(this, key, value);
        };
      }

      /***/
    },

    /***/ 900: /***/ (module) => {
      /**
       * Helpers.
       */

      var s = 1000;
      var m = s * 60;
      var h = m * 60;
      var d = h * 24;
      var w = d * 7;
      var y = d * 365.25;

      /**
       * Parse or format the given `val`.
       *
       * Options:
       *
       *  - `long` verbose formatting [false]
       *
       * @param {String|Number} val
       * @param {Object} [options]
       * @throws {Error} throw an error if val is not a non-empty string or a number
       * @return {String|Number}
       * @api public
       */

      module.exports = function (val, options) {
        options = options || {};
        var type = typeof val;
        if (type === "string" && val.length > 0) {
          return parse(val);
        } else if (type === "number" && isFinite(val)) {
          return options.long ? fmtLong(val) : fmtShort(val);
        }
        throw new Error(
          "val is not a non-empty string or a valid number. val=" +
            JSON.stringify(val)
        );
      };

      /**
       * Parse the given `str` and return milliseconds.
       *
       * @param {String} str
       * @return {Number}
       * @api private
       */

      function parse(str) {
        str = String(str);
        if (str.length > 100) {
          return;
        }
        var match =
          /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
            str
          );
        if (!match) {
          return;
        }
        var n = parseFloat(match[1]);
        var type = (match[2] || "ms").toLowerCase();
        switch (type) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return n * y;
          case "weeks":
          case "week":
          case "w":
            return n * w;
          case "days":
          case "day":
          case "d":
            return n * d;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return n * h;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return n * m;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return n * s;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return n;
          default:
            return undefined;
        }
      }

      /**
       * Short format for `ms`.
       *
       * @param {Number} ms
       * @return {String}
       * @api private
       */

      function fmtShort(ms) {
        var msAbs = Math.abs(ms);
        if (msAbs >= d) {
          return Math.round(ms / d) + "d";
        }
        if (msAbs >= h) {
          return Math.round(ms / h) + "h";
        }
        if (msAbs >= m) {
          return Math.round(ms / m) + "m";
        }
        if (msAbs >= s) {
          return Math.round(ms / s) + "s";
        }
        return ms + "ms";
      }

      /**
       * Long format for `ms`.
       *
       * @param {Number} ms
       * @return {String}
       * @api private
       */

      function fmtLong(ms) {
        var msAbs = Math.abs(ms);
        if (msAbs >= d) {
          return plural(ms, msAbs, d, "day");
        }
        if (msAbs >= h) {
          return plural(ms, msAbs, h, "hour");
        }
        if (msAbs >= m) {
          return plural(ms, msAbs, m, "minute");
        }
        if (msAbs >= s) {
          return plural(ms, msAbs, s, "second");
        }
        return ms + " ms";
      }

      /**
       * Pluralization helper.
       */

      function plural(ms, msAbs, n, name) {
        var isPlural = msAbs >= n * 1.5;
        return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
      }

      /***/
    },

    /***/ 8437: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";

      const back = __nccwpck_require__(1846);
      const emitter = __nccwpck_require__(9935);
      const {
        activate,
        isActive,
        isDone,
        isOn,
        pendingMocks,
        activeMocks,
        removeInterceptor,
        disableNetConnect,
        enableNetConnect,
        removeAll,
        abortPendingRequests,
      } = __nccwpck_require__(7607);
      const recorder = __nccwpck_require__(8687);
      const { Scope, load, loadDefs, define } = __nccwpck_require__(7004);

      module.exports = (basePath, options) => new Scope(basePath, options);

      Object.assign(module.exports, {
        activate,
        isActive,
        isDone,
        pendingMocks,
        activeMocks,
        removeInterceptor,
        disableNetConnect,
        enableNetConnect,
        cleanAll: removeAll,
        abortPendingRequests,
        load,
        loadDefs,
        define,
        emitter,
        recorder: {
          rec: recorder.record,
          clear: recorder.clear,
          play: recorder.outputs,
        },
        restore: recorder.restore,
        back,
      });

      // We always activate Nock on import, overriding the globals.
      // Setting the Back mode "activates" Nock by overriding the global entries in the `http/s` modules.
      // If Nock Back is configured, we need to honor that setting for backward compatibility,
      // otherwise we rely on Nock Back's default initializing side effect.
      if (isOn()) {
        back.setMode(process.env.NOCK_BACK_MODE || "dryrun");
      }

      /***/
    },

    /***/ 1846: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";

      const assert = __nccwpck_require__(9491);
      const recorder = __nccwpck_require__(8687);
      const {
        activate,
        disableNetConnect,
        enableNetConnect,
        removeAll: cleanAll,
      } = __nccwpck_require__(7607);
      const { loadDefs, define } = __nccwpck_require__(7004);

      const { format } = __nccwpck_require__(3837);
      const path = __nccwpck_require__(1017);
      const debug = __nccwpck_require__(8237)("nock.back");

      let _mode = null;

      let fs;

      try {
        fs = __nccwpck_require__(7147);
      } catch (err) {
        // do nothing, probably in browser
      }

      /**
       * nock the current function with the fixture given
       *
       * @param {string}   fixtureName  - the name of the fixture, e.x. 'foo.json'
       * @param {object}   options      - [optional] extra options for nock with, e.x. `{ assert: true }`
       * @param {function} nockedFn     - [optional] callback function to be executed with the given fixture being loaded;
       *                                  if defined the function will be called with context `{ scopes: loaded_nocks || [] }`
       *                                  set as `this` and `nockDone` callback function as first and only parameter;
       *                                  if not defined a promise resolving to `{nockDone, context}` where `context` is
       *                                  aforementioned `{ scopes: loaded_nocks || [] }`
       *
       * List of options:
       *
       * @param {function} before       - a preprocessing function, gets called before nock.define
       * @param {function} after        - a postprocessing function, gets called after nock.define
       * @param {function} afterRecord  - a postprocessing function, gets called after recording. Is passed the array
       *                                  of scopes recorded and should return the array scopes to save to the fixture
       * @param {function} recorder     - custom options to pass to the recorder
       *
       */
      function Back(fixtureName, options, nockedFn) {
        if (!Back.fixtures) {
          throw new Error(
            "Back requires nock.back.fixtures to be set\n" +
              "Ex:\n" +
              "\trequire(nock).back.fixtures = '/path/to/fixtures/'"
          );
        }

        if (typeof fixtureName !== "string") {
          throw new Error("Parameter fixtureName must be a string");
        }

        if (arguments.length === 1) {
          options = {};
        } else if (arguments.length === 2) {
          // If 2nd parameter is a function then `options` has been omitted
          // otherwise `options` haven't been omitted but `nockedFn` was.
          if (typeof options === "function") {
            nockedFn = options;
            options = {};
          }
        }

        _mode.setup();

        const fixture = path.join(Back.fixtures, fixtureName);
        const context = _mode.start(fixture, options);

        const nockDone = function () {
          _mode.finish(fixture, options, context);
        };

        debug("context:", context);

        // If nockedFn is a function then invoke it, otherwise return a promise resolving to nockDone.
        if (typeof nockedFn === "function") {
          nockedFn.call(context, nockDone);
        } else {
          return Promise.resolve({ nockDone, context });
        }
      }

      /*******************************************************************************
       *                                    Modes                                     *
       *******************************************************************************/

      const wild = {
        setup: function () {
          cleanAll();
          recorder.restore();
          activate();
          enableNetConnect();
        },

        start: function () {
          return load(); // don't load anything but get correct context
        },

        finish: function () {
          // nothing to do
        },
      };

      const dryrun = {
        setup: function () {
          recorder.restore();
          cleanAll();
          activate();
          //  We have to explicitly enable net connectivity as by default it's off.
          enableNetConnect();
        },

        start: function (fixture, options) {
          const contexts = load(fixture, options);

          enableNetConnect();
          return contexts;
        },

        finish: function () {
          // nothing to do
        },
      };

      const record = {
        setup: function () {
          recorder.restore();
          recorder.clear();
          cleanAll();
          activate();
          disableNetConnect();
        },

        start: function (fixture, options) {
          if (!fs) {
            throw new Error("no fs");
          }
          const context = load(fixture, options);

          if (!context.isLoaded) {
            recorder.record({
              dont_print: true,
              output_objects: true,
              ...options.recorder,
            });

            context.isRecording = true;
          }

          return context;
        },

        finish: function (fixture, options, context) {
          if (context.isRecording) {
            let outputs = recorder.outputs();

            if (typeof options.afterRecord === "function") {
              outputs = options.afterRecord(outputs);
            }

            outputs =
              typeof outputs === "string"
                ? outputs
                : JSON.stringify(outputs, null, 4);
            debug("recorder outputs:", outputs);

            fs.mkdirSync(path.dirname(fixture), { recursive: true });
            fs.writeFileSync(fixture, outputs);
          }
        },
      };

      const update = {
        setup: function () {
          recorder.restore();
          recorder.clear();
          cleanAll();
          activate();
          disableNetConnect();
        },

        start: function (fixture, options) {
          if (!fs) {
            throw new Error("no fs");
          }
          const context = removeFixture(fixture);
          recorder.record({
            dont_print: true,
            output_objects: true,
            ...options.recorder,
          });

          context.isRecording = true;

          return context;
        },

        finish: function (fixture, options, context) {
          let outputs = recorder.outputs();

          if (typeof options.afterRecord === "function") {
            outputs = options.afterRecord(outputs);
          }

          outputs =
            typeof outputs === "string"
              ? outputs
              : JSON.stringify(outputs, null, 4);
          debug("recorder outputs:", outputs);

          fs.mkdirSync(path.dirname(fixture), { recursive: true });
          fs.writeFileSync(fixture, outputs);
        },
      };

      const lockdown = {
        setup: function () {
          recorder.restore();
          recorder.clear();
          cleanAll();
          activate();
          disableNetConnect();
        },

        start: function (fixture, options) {
          return load(fixture, options);
        },

        finish: function () {
          // nothing to do
        },
      };

      function load(fixture, options) {
        const context = {
          scopes: [],
          assertScopesFinished: function () {
            assertScopes(this.scopes, fixture);
          },
          query: function () {
            const nested = this.scopes.map((scope) =>
              scope.interceptors.map((interceptor) => ({
                method: interceptor.method,
                uri: interceptor.uri,
                basePath: interceptor.basePath,
                path: interceptor.path,
                queries: interceptor.queries,
                counter: interceptor.counter,
                body: interceptor.body,
                statusCode: interceptor.statusCode,
                optional: interceptor.optional,
              }))
            );

            return [].concat.apply([], nested);
          },
        };

        if (fixture && fixtureExists(fixture)) {
          let scopes = loadDefs(fixture);
          applyHook(scopes, options.before);

          scopes = define(scopes);
          applyHook(scopes, options.after);

          context.scopes = scopes;
          context.isLoaded = true;
        }

        return context;
      }

      function removeFixture(fixture, options) {
        const context = {
          scopes: [],
          assertScopesFinished: function () {},
        };

        if (fixture && fixtureExists(fixture)) {
          /* istanbul ignore next - fs.unlinkSync is for node 10 support */
          fs.rmSync ? fs.rmSync(fixture) : fs.unlinkSync(fixture);
        }
        context.isLoaded = false;
        return context;
      }

      function applyHook(scopes, fn) {
        if (!fn) {
          return;
        }

        if (typeof fn !== "function") {
          throw new Error("processing hooks must be a function");
        }

        scopes.forEach(fn);
      }

      function fixtureExists(fixture) {
        if (!fs) {
          throw new Error("no fs");
        }

        return fs.existsSync(fixture);
      }

      function assertScopes(scopes, fixture) {
        const pending = scopes
          .filter((scope) => !scope.isDone())
          .map((scope) => scope.pendingMocks());

        if (pending.length) {
          assert.fail(
            format(
              "%j was not used, consider removing %s to rerecord fixture",
              [].concat(...pending),
              fixture
            )
          );
        }
      }

      const Modes = {
        wild, // all requests go out to the internet, dont replay anything, doesnt record anything

        dryrun, // use recorded nocks, allow http calls, doesnt record anything, useful for writing new tests (default)

        record, // use recorded nocks, record new nocks

        update, // allow http calls, record all nocks, don't use recorded nocks

        lockdown, // use recorded nocks, disables all http calls even when not nocked, doesnt record
      };

      Back.setMode = function (mode) {
        if (!(mode in Modes)) {
          throw new Error(`Unknown mode: ${mode}`);
        }

        Back.currentMode = mode;
        debug("New nock back mode:", Back.currentMode);

        _mode = Modes[mode];
        _mode.setup();
      };

      Back.fixtures = null;
      Back.currentMode = null;

      module.exports = Back;

      /***/
    },

    /***/ 1521: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";

      const debug = __nccwpck_require__(8237)("nock.common");
      const timers = __nccwpck_require__(9512);
      const url = __nccwpck_require__(7310);
      const util = __nccwpck_require__(3837);

      /**
       * Normalizes the request options so that it always has `host` property.
       *
       * @param  {Object} options - a parsed options object of the request
       */
      function normalizeRequestOptions(options) {
        options.proto = options.proto || "http";
        options.port = options.port || (options.proto === "http" ? 80 : 443);
        if (options.host) {
          debug("options.host:", options.host);
          if (!options.hostname) {
            if (options.host.split(":").length === 2) {
              options.hostname = options.host.split(":")[0];
            } else {
              options.hostname = options.host;
            }
          }
        }
        debug("options.hostname in the end: %j", options.hostname);
        options.host = `${options.hostname || "localhost"}:${options.port}`;
        debug("options.host in the end: %j", options.host);

        /// lowercase host names
        ["hostname", "host"].forEach(function (attr) {
          if (options[attr]) {
            options[attr] = options[attr].toLowerCase();
          }
        });

        return options;
      }

      /**
       * Returns true if the data contained in buffer can be reconstructed
       * from its utf8 representation.
       *
       * @param  {Object} buffer - a Buffer object
       * @returns {boolean}
       */
      function isUtf8Representable(buffer) {
        const utfEncodedBuffer = buffer.toString("utf8");
        const reconstructedBuffer = Buffer.from(utfEncodedBuffer, "utf8");
        return reconstructedBuffer.equals(buffer);
      }

      //  Array where all information about all the overridden requests are held.
      let requestOverrides = {};

      /**
       * Overrides the current `request` function of `http` and `https` modules with
       * our own version which intercepts issues HTTP/HTTPS requests and forwards them
       * to the given `newRequest` function.
       *
       * @param  {Function} newRequest - a function handling requests; it accepts four arguments:
       *   - proto - a string with the overridden module's protocol name (either `http` or `https`)
       *   - overriddenRequest - the overridden module's request function already bound to module's object
       *   - options - the options of the issued request
       *   - callback - the callback of the issued request
       */
      function overrideRequests(newRequest) {
        debug("overriding requests");
        ["http", "https"].forEach(function (proto) {
          debug("- overriding request for", proto);

          const moduleName = proto; // 1 to 1 match of protocol and module is fortunate :)
          const module = require(proto);
          const overriddenRequest = module.request;
          const overriddenGet = module.get;

          if (requestOverrides[moduleName]) {
            throw new Error(
              `Module's request already overridden for ${moduleName} protocol.`
            );
          }

          //  Store the properties of the overridden request so that it can be restored later on.
          requestOverrides[moduleName] = {
            module,
            request: overriddenRequest,
            get: overriddenGet,
          };
          // https://nodejs.org/api/http.html#http_http_request_url_options_callback
          module.request = function (input, options, callback) {
            return newRequest(proto, overriddenRequest.bind(module), [
              input,
              options,
              callback,
            ]);
          };
          // https://nodejs.org/api/http.html#http_http_get_options_callback
          module.get = function (input, options, callback) {
            const req = newRequest(proto, overriddenGet.bind(module), [
              input,
              options,
              callback,
            ]);
            req.end();
            return req;
          };

          debug("- overridden request for", proto);
        });
      }

      /**
       * Restores `request` function of `http` and `https` modules to values they
       * held before they were overridden by us.
       */
      function restoreOverriddenRequests() {
        debug("restoring requests");
        Object.entries(requestOverrides).forEach(
          ([proto, { module, request, get }]) => {
            debug("- restoring request for", proto);
            module.request = request;
            module.get = get;
            debug("- restored request for", proto);
          }
        );
        requestOverrides = {};
      }

      /**
       * In WHATWG URL vernacular, this returns the origin portion of a URL.
       * However, the port is not included if it's standard and not already present on the host.
       */
      function normalizeOrigin(proto, host, port) {
        const hostHasPort = host.includes(":");
        const portIsStandard =
          (proto === "http" && (port === 80 || port === "80")) ||
          (proto === "https" && (port === 443 || port === "443"));
        const portStr = hostHasPort || portIsStandard ? "" : `:${port}`;

        return `${proto}://${host}${portStr}`;
      }

      /**
       * Get high level information about request as string
       * @param  {Object} options
       * @param  {string} options.method
       * @param  {number|string} options.port
       * @param  {string} options.proto Set internally. always http or https
       * @param  {string} options.hostname
       * @param  {string} options.path
       * @param  {Object} options.headers
       * @param  {string} body
       * @return {string}
       */
      function stringifyRequest(options, body) {
        const { method = "GET", path = "", port } = options;
        const origin = normalizeOrigin(options.proto, options.hostname, port);

        const log = {
          method,
          url: `${origin}${path}`,
          headers: options.headers,
        };

        if (body) {
          log.body = body;
        }

        return JSON.stringify(log, null, 2);
      }

      function isContentEncoded(headers) {
        const contentEncoding = headers["content-encoding"];
        return typeof contentEncoding === "string" && contentEncoding !== "";
      }

      function contentEncoding(headers, encoder) {
        const contentEncoding = headers["content-encoding"];
        return (
          contentEncoding !== undefined &&
          contentEncoding.toString() === encoder
        );
      }

      function isJSONContent(headers) {
        // https://tools.ietf.org/html/rfc8259
        const contentType = String(headers["content-type"] || "").toLowerCase();
        return contentType.startsWith("application/json");
      }

      /**
       * Return a new object with all field names of the headers lower-cased.
       *
       * Duplicates throw an error.
       */
      function headersFieldNamesToLowerCase(headers, throwOnDuplicate) {
        if (!isPlainObject(headers)) {
          throw Error("Headers must be provided as an object");
        }

        const lowerCaseHeaders = {};
        Object.entries(headers).forEach(([fieldName, fieldValue]) => {
          const key = fieldName.toLowerCase();
          if (lowerCaseHeaders[key] !== undefined) {
            if (throwOnDuplicate) {
              throw Error(
                `Failed to convert header keys to lower case due to field name conflict: ${key}`
              );
            } else {
              debug(
                `Duplicate header provided in request: ${key}. Only the last value can be matched.`
              );
            }
          }
          lowerCaseHeaders[key] = fieldValue;
        });

        return lowerCaseHeaders;
      }

      const headersFieldsArrayToLowerCase = (headers) => [
        ...new Set(headers.map((fieldName) => fieldName.toLowerCase())),
      ];

      /**
       * Converts the various accepted formats of headers into a flat array representing "raw headers".
       *
       * Nock allows headers to be provided as a raw array, a plain object, or a Map.
       *
       * While all the header names are expected to be strings, the values are left intact as they can
       * be functions, strings, or arrays of strings.
       *
       *  https://nodejs.org/api/http.html#http_message_rawheaders
       */
      function headersInputToRawArray(headers) {
        if (headers === undefined) {
          return [];
        }

        if (Array.isArray(headers)) {
          // If the input is an array, assume it's already in the raw format and simply return a copy
          // but throw an error if there aren't an even number of items in the array
          if (headers.length % 2) {
            throw new Error(
              `Raw headers must be provided as an array with an even number of items. [fieldName, value, ...]`
            );
          }
          return [...headers];
        }

        // [].concat(...) is used instead of Array.flat until v11 is the minimum Node version
        if (util.types.isMap(headers)) {
          return [].concat(
            ...Array.from(headers, ([k, v]) => [k.toString(), v])
          );
        }

        if (isPlainObject(headers)) {
          return [].concat(...Object.entries(headers));
        }

        throw new Error(
          `Headers must be provided as an array of raw values, a Map, or a plain Object. ${headers}`
        );
      }

      /**
       * Converts an array of raw headers to an object, using the same rules as Nodes `http.IncomingMessage.headers`.
       *
       * Header names/keys are lower-cased.
       */
      function headersArrayToObject(rawHeaders) {
        if (!Array.isArray(rawHeaders)) {
          throw Error("Expected a header array");
        }

        const accumulator = {};

        forEachHeader(rawHeaders, (value, fieldName) => {
          addHeaderLine(accumulator, fieldName, value);
        });

        return accumulator;
      }

      const noDuplicatesHeaders = new Set([
        "age",
        "authorization",
        "content-length",
        "content-type",
        "etag",
        "expires",
        "from",
        "host",
        "if-modified-since",
        "if-unmodified-since",
        "last-modified",
        "location",
        "max-forwards",
        "proxy-authorization",
        "referer",
        "retry-after",
        "user-agent",
      ]);

      /**
       * Set key/value data in accordance with Node's logic for folding duplicate headers.
       *
       * The `value` param should be a function, string, or array of strings.
       *
       * Node's docs and source:
       * https://nodejs.org/api/http.html#http_message_headers
       * https://github.com/nodejs/node/blob/908292cf1f551c614a733d858528ffb13fb3a524/lib/_http_incoming.js#L245
       *
       * Header names are lower-cased.
       * Duplicates in raw headers are handled in the following ways, depending on the header name:
       * - Duplicates of field names listed in `noDuplicatesHeaders` (above) are discarded.
       * - `set-cookie` is always an array. Duplicates are added to the array.
       * - For duplicate `cookie` headers, the values are joined together with '; '.
       * - For all other headers, the values are joined together with ', '.
       *
       * Node's implementation is larger because it highly optimizes for not having to call `toLowerCase()`.
       * We've opted to always call `toLowerCase` in exchange for a more concise function.
       *
       * While Node has the luxury of knowing `value` is always a string, we do an extra step of coercion at the top.
       */
      function addHeaderLine(headers, name, value) {
        let values; // code below expects `values` to be an array of strings
        if (typeof value === "function") {
          // Function values are evaluated towards the end of the response, before that we use a placeholder
          // string just to designate that the header exists. Useful when `Content-Type` is set with a function.
          values = [value.name];
        } else if (Array.isArray(value)) {
          values = value.map(String);
        } else {
          values = [String(value)];
        }

        const key = name.toLowerCase();
        if (key === "set-cookie") {
          // Array header -- only Set-Cookie at the moment
          if (headers["set-cookie"] === undefined) {
            headers["set-cookie"] = values;
          } else {
            headers["set-cookie"].push(...values);
          }
        } else if (noDuplicatesHeaders.has(key)) {
          if (headers[key] === undefined) {
            // Drop duplicates
            headers[key] = values[0];
          }
        } else {
          if (headers[key] !== undefined) {
            values = [headers[key], ...values];
          }

          const separator = key === "cookie" ? "; " : ", ";
          headers[key] = values.join(separator);
        }
      }

      /**
       * Deletes the given `fieldName` property from `headers` object by performing
       * case-insensitive search through keys.
       *
       * @headers   {Object} headers - object of header field names and values
       * @fieldName {String} field name - string with the case-insensitive field name
       */
      function deleteHeadersField(headers, fieldNameToDelete) {
        if (!isPlainObject(headers)) {
          throw Error("headers must be an object");
        }

        if (typeof fieldNameToDelete !== "string") {
          throw Error("field name must be a string");
        }

        const lowerCaseFieldNameToDelete = fieldNameToDelete.toLowerCase();

        // Search through the headers and delete all values whose field name matches the given field name.
        Object.keys(headers)
          .filter(
            (fieldName) =>
              fieldName.toLowerCase() === lowerCaseFieldNameToDelete
          )
          .forEach((fieldName) => delete headers[fieldName]);
      }

      /**
       * Utility for iterating over a raw headers array.
       *
       * The callback is called with:
       *  - The header value. string, array of strings, or a function
       *  - The header field name. string
       *  - Index of the header field in the raw header array.
       */
      function forEachHeader(rawHeaders, callback) {
        for (let i = 0; i < rawHeaders.length; i += 2) {
          callback(rawHeaders[i + 1], rawHeaders[i], i);
        }
      }

      function percentDecode(str) {
        try {
          return decodeURIComponent(str.replace(/\+/g, " "));
        } catch (e) {
          return str;
        }
      }

      /**
       * URI encode the provided string, stringently adhering to RFC 3986.
       *
       * RFC 3986 reserves !, ', (, ), and * but encodeURIComponent does not encode them so we do it manually.
       *
       * https://tools.ietf.org/html/rfc3986
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
       */
      function percentEncode(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
          return `%${c.charCodeAt(0).toString(16).toUpperCase()}`;
        });
      }

      function matchStringOrRegexp(target, pattern) {
        const targetStr =
          target === undefined || target === null ? "" : String(target);

        if (pattern instanceof RegExp) {
          // if the regexp happens to have a global flag, we want to ensure we test the entire target
          pattern.lastIndex = 0;
          return pattern.test(targetStr);
        }
        return targetStr === String(pattern);
      }

      /**
       * Formats a query parameter.
       *
       * @param key                The key of the query parameter to format.
       * @param value              The value of the query parameter to format.
       * @param stringFormattingFn The function used to format string values. Can
       *                           be used to encode or decode the query value.
       *
       * @returns *[] the formatted [key, value] pair.
       */
      function formatQueryValue(key, value, stringFormattingFn) {
        // TODO: Probably refactor code to replace `switch(true)` with `if`/`else`.
        switch (true) {
          case typeof value === "number": // fall-through
          case typeof value === "boolean":
            value = value.toString();
            break;
          case value === null:
          case value === undefined:
            value = "";
            break;
          case typeof value === "string":
            if (stringFormattingFn) {
              value = stringFormattingFn(value);
            }
            break;
          case value instanceof RegExp:
            break;
          case Array.isArray(value): {
            value = value.map(function (val, idx) {
              return formatQueryValue(idx, val, stringFormattingFn)[1];
            });
            break;
          }
          case typeof value === "object": {
            value = Object.entries(value).reduce(function (
              acc,
              [subKey, subVal]
            ) {
              const subPair = formatQueryValue(
                subKey,
                subVal,
                stringFormattingFn
              );
              acc[subPair[0]] = subPair[1];

              return acc;
            },
            {});
            break;
          }
        }

        if (stringFormattingFn) key = stringFormattingFn(key);
        return [key, value];
      }

      function isStream(obj) {
        return (
          obj &&
          typeof obj !== "string" &&
          !Buffer.isBuffer(obj) &&
          typeof obj.setEncoding === "function"
        );
      }

      /**
       * Converts the arguments from the various signatures of http[s].request into a standard
       * options object and an optional callback function.
       *
       * https://nodejs.org/api/http.html#http_http_request_url_options_callback
       *
       * Taken from the beginning of the native `ClientRequest`.
       * https://github.com/nodejs/node/blob/908292cf1f551c614a733d858528ffb13fb3a524/lib/_http_client.js#L68
       */
      function normalizeClientRequestArgs(input, options, cb) {
        if (typeof input === "string") {
          input = urlToOptions(new url.URL(input));
        } else if (input instanceof url.URL) {
          input = urlToOptions(input);
        } else {
          cb = options;
          options = input;
          input = null;
        }

        if (typeof options === "function") {
          cb = options;
          options = input || {};
        } else {
          options = Object.assign(input || {}, options);
        }

        return { options, callback: cb };
      }

      /**
       * Utility function that converts a URL object into an ordinary
       * options object as expected by the http.request and https.request APIs.
       *
       * This was copied from Node's source
       * https://github.com/nodejs/node/blob/908292cf1f551c614a733d858528ffb13fb3a524/lib/internal/url.js#L1257
       */
      function urlToOptions(url) {
        const options = {
          protocol: url.protocol,
          hostname:
            typeof url.hostname === "string" && url.hostname.startsWith("[")
              ? url.hostname.slice(1, -1)
              : url.hostname,
          hash: url.hash,
          search: url.search,
          pathname: url.pathname,
          path: `${url.pathname}${url.search || ""}`,
          href: url.href,
        };
        if (url.port !== "") {
          options.port = Number(url.port);
        }
        if (url.username || url.password) {
          options.auth = `${url.username}:${url.password}`;
        }
        return options;
      }

      /**
       * Determines if request data matches the expected schema.
       *
       * Used for comparing decoded search parameters, request body JSON objects,
       * and URL decoded request form bodies.
       *
       * Performs a general recursive strict comparison with two caveats:
       *  - The expected data can use regexp to compare values
       *  - JSON path notation and nested objects are considered equal
       */
      const dataEqual = (expected, actual) => {
        if (isPlainObject(expected)) {
          expected = expand(expected);
        }
        if (isPlainObject(actual)) {
          actual = expand(actual);
        }
        return deepEqual(expected, actual);
      };

      /**
       * Performs a recursive strict comparison between two values.
       *
       * Expected values or leaf nodes of expected object values that are RegExp use test() for comparison.
       */
      function deepEqual(expected, actual) {
        debug(
          "deepEqual comparing",
          typeof expected,
          expected,
          typeof actual,
          actual
        );
        if (expected instanceof RegExp) {
          return expected.test(actual);
        }

        if (Array.isArray(expected) && Array.isArray(actual)) {
          if (expected.length !== actual.length) {
            return false;
          }

          return expected.every((expVal, idx) =>
            deepEqual(expVal, actual[idx])
          );
        }

        if (isPlainObject(expected) && isPlainObject(actual)) {
          const allKeys = Array.from(
            new Set(Object.keys(expected).concat(Object.keys(actual)))
          );

          return allKeys.every((key) => deepEqual(expected[key], actual[key]));
        }

        return expected === actual;
      }

      const timeouts = new Set();
      const immediates = new Set();

      const wrapTimer =
        (timer, ids) =>
        (callback, ...timerArgs) => {
          const cb = (...callbackArgs) => {
            try {
              // eslint-disable-next-line n/no-callback-literal
              callback(...callbackArgs);
            } finally {
              ids.delete(id);
            }
          };
          const id = timer(cb, ...timerArgs);
          ids.add(id);
          return id;
        };

      const setTimeout = wrapTimer(timers.setTimeout, timeouts);
      const setImmediate = wrapTimer(timers.setImmediate, immediates);

      function clearTimer(clear, ids) {
        ids.forEach(clear);
        ids.clear();
      }

      function removeAllTimers() {
        clearTimer(clearTimeout, timeouts);
        clearTimer(clearImmediate, immediates);
      }

      /**
       * Check if the Client Request has been cancelled.
       *
       * Until Node 14 is the minimum, we need to look at both flags to see if the request has been cancelled.
       * The two flags have the same purpose, but the Node maintainers are migrating from `abort(ed)` to
       * `destroy(ed)` terminology, to be more consistent with `stream.Writable`.
       * In Node 14.x+, Calling `abort()` will set both `aborted` and `destroyed` to true, however,
       * calling `destroy()` will only set `destroyed` to true.
       * Falling back on checking if the socket is destroyed to cover the case of Node <14.x where
       * `destroy()` is called, but `destroyed` is undefined.
       *
       * Node Client Request history:
       * - `request.abort()`: Added in: v0.3.8, Deprecated since: v14.1.0, v13.14.0
       * - `request.aborted`: Added in: v0.11.14, Became a boolean instead of a timestamp: v11.0.0, Not deprecated (yet)
       * - `request.destroy()`: Added in: v0.3.0
       * - `request.destroyed`: Added in: v14.1.0, v13.14.0
       *
       * @param {ClientRequest} req
       * @returns {boolean}
       */
      function isRequestDestroyed(req) {
        return !!(
          req.destroyed === true ||
          req.aborted ||
          (req.socket && req.socket.destroyed)
        );
      }

      /**
       * Returns true if the given value is a plain object and not an Array.
       * @param {*} value
       * @returns {boolean}
       */
      function isPlainObject(value) {
        if (typeof value !== "object" || value === null) return false;

        if (Object.prototype.toString.call(value) !== "[object Object]")
          return false;

        const proto = Object.getPrototypeOf(value);
        if (proto === null) return true;

        const Ctor =
          Object.prototype.hasOwnProperty.call(proto, "constructor") &&
          proto.constructor;
        return (
          typeof Ctor === "function" &&
          Ctor instanceof Ctor &&
          Function.prototype.call(Ctor) === Function.prototype.call(value)
        );
      }

      const prototypePollutionBlockList = [
        "__proto__",
        "prototype",
        "constructor",
      ];
      const blocklistFilter = function (part) {
        return prototypePollutionBlockList.indexOf(part) === -1;
      };

      /**
       * Converts flat objects whose keys use JSON path notation to nested objects.
       *
       * The input object is not mutated.
       *
       * @example
       * { 'foo[bar][0]': 'baz' } -> { foo: { bar: [ 'baz' ] } }
       */
      const expand = (input) => {
        if (input === undefined || input === null) {
          return input;
        }

        const keys = Object.keys(input);

        const result = {};
        let resultPtr = result;

        for (let path of keys) {
          const originalPath = path;
          if (path.indexOf("[") >= 0) {
            path = path.replace(/\[/g, ".").replace(/]/g, "");
          }

          const parts = path.split(".");

          const check = parts.filter(blocklistFilter);

          if (check.length !== parts.length) {
            return undefined;
          }
          resultPtr = result;
          const lastIndex = parts.length - 1;

          for (let i = 0; i < parts.length; ++i) {
            const part = parts[i];
            if (i === lastIndex) {
              if (Array.isArray(resultPtr)) {
                resultPtr[+part] = input[originalPath];
              } else {
                resultPtr[part] = input[originalPath];
              }
            } else {
              if (resultPtr[part] === undefined || resultPtr[part] === null) {
                const nextPart = parts[i + 1];
                if (/^\d+$/.test(nextPart)) {
                  resultPtr[part] = [];
                } else {
                  resultPtr[part] = {};
                }
              }
              resultPtr = resultPtr[part];
            }
          }
        }
        return result;
      };

      module.exports = {
        contentEncoding,
        dataEqual,
        deleteHeadersField,
        expand,
        forEachHeader,
        formatQueryValue,
        headersArrayToObject,
        headersFieldNamesToLowerCase,
        headersFieldsArrayToLowerCase,
        headersInputToRawArray,
        isContentEncoded,
        isJSONContent,
        isPlainObject,
        isRequestDestroyed,
        isStream,
        isUtf8Representable,
        matchStringOrRegexp,
        normalizeClientRequestArgs,
        normalizeOrigin,
        normalizeRequestOptions,
        overrideRequests,
        percentDecode,
        percentEncode,
        removeAllTimers,
        restoreOverriddenRequests,
        setImmediate,
        setTimeout,
        stringifyRequest,
      };

      /***/
    },

    /***/ 9935: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";

      const { EventEmitter } = __nccwpck_require__(2361);

      module.exports = new EventEmitter();

      /***/
    },

    /***/ 7607: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";

      /**
       * @module nock/intercept
       */

      const { InterceptedRequestRouter } = __nccwpck_require__(4694);
      const common = __nccwpck_require__(1521);
      const { inherits } = __nccwpck_require__(3837);
      const http = __nccwpck_require__(3685);
      const debug = __nccwpck_require__(8237)("nock.intercept");
      const globalEmitter = __nccwpck_require__(9935);

      /**
       * @name NetConnectNotAllowedError
       * @private
       * @desc Error trying to make a connection when disabled external access.
       * @class
       * @example
       * nock.disableNetConnect();
       * http.get('http://zombo.com');
       * // throw NetConnectNotAllowedError
       */
      function NetConnectNotAllowedError(host, path) {
        Error.call(this);

        this.name = "NetConnectNotAllowedError";
        this.code = "ENETUNREACH";
        this.message = `Nock: Disallowed net connect for "${host}${path}"`;

        Error.captureStackTrace(this, this.constructor);
      }

      inherits(NetConnectNotAllowedError, Error);

      let allInterceptors = {};
      let allowNetConnect;

      /**
       * Enabled real request.
       * @public
       * @param {String|RegExp} matcher=RegExp.new('.*') Expression to match
       * @example
       * // Enables all real requests
       * nock.enableNetConnect();
       * @example
       * // Enables real requests for url that matches google
       * nock.enableNetConnect('google');
       * @example
       * // Enables real requests for url that matches google and amazon
       * nock.enableNetConnect(/(google|amazon)/);
       * @example
       * // Enables real requests for url that includes google
       * nock.enableNetConnect(host => host.includes('google'));
       */
      function enableNetConnect(matcher) {
        if (typeof matcher === "string") {
          allowNetConnect = new RegExp(matcher);
        } else if (matcher instanceof RegExp) {
          allowNetConnect = matcher;
        } else if (typeof matcher === "function") {
          allowNetConnect = { test: matcher };
        } else {
          allowNetConnect = /.*/;
        }
      }

      function isEnabledForNetConnect(options) {
        common.normalizeRequestOptions(options);

        const enabled = allowNetConnect && allowNetConnect.test(options.host);
        debug("Net connect", enabled ? "" : "not", "enabled for", options.host);
        return enabled;
      }

      /**
       * Disable all real requests.
       * @public
       * @example
       * nock.disableNetConnect();
       */
      function disableNetConnect() {
        allowNetConnect = undefined;
      }

      function isOn() {
        return !isOff();
      }

      function isOff() {
        return process.env.NOCK_OFF === "true";
      }

      function addInterceptor(key, interceptor, scope, scopeOptions, host) {
        if (!(key in allInterceptors)) {
          allInterceptors[key] = { key, interceptors: [] };
        }
        interceptor.__nock_scope = scope;

        //  We need scope's key and scope options for scope filtering function (if defined)
        interceptor.__nock_scopeKey = key;
        interceptor.__nock_scopeOptions = scopeOptions;
        //  We need scope's host for setting correct request headers for filtered scopes.
        interceptor.__nock_scopeHost = host;
        interceptor.interceptionCounter = 0;

        if (scopeOptions.allowUnmocked)
          allInterceptors[key].allowUnmocked = true;

        allInterceptors[key].interceptors.push(interceptor);
      }

      function remove(interceptor) {
        if (
          interceptor.__nock_scope.shouldPersist() ||
          --interceptor.counter > 0
        ) {
          return;
        }

        const { basePath } = interceptor;
        const interceptors =
          (allInterceptors[basePath] &&
            allInterceptors[basePath].interceptors) ||
          [];

        // TODO: There is a clearer way to write that we want to delete the first
        // matching instance. I'm also not sure why we couldn't delete _all_
        // matching instances.
        interceptors.some(function (thisInterceptor, i) {
          return thisInterceptor === interceptor
            ? interceptors.splice(i, 1)
            : false;
        });
      }

      function removeAll() {
        Object.keys(allInterceptors).forEach(function (key) {
          allInterceptors[key].interceptors.forEach(function (interceptor) {
            interceptor.scope.keyedInterceptors = {};
          });
        });
        allInterceptors = {};
      }

      /**
       * Return all the Interceptors whose Scopes match against the base path of the provided options.
       *
       * @returns {Interceptor[]}
       */
      function interceptorsFor(options) {
        common.normalizeRequestOptions(options);

        debug("interceptors for %j", options.host);

        const basePath = `${options.proto}://${options.host}`;

        debug("filtering interceptors for basepath", basePath);

        // First try to use filteringScope if any of the interceptors has it defined.
        for (const { key, interceptors, allowUnmocked } of Object.values(
          allInterceptors
        )) {
          for (const interceptor of interceptors) {
            const { filteringScope } = interceptor.__nock_scopeOptions;

            // If scope filtering function is defined and returns a truthy value then
            // we have to treat this as a match.
            if (filteringScope && filteringScope(basePath)) {
              interceptor.scope.logger("found matching scope interceptor");

              // Keep the filtered scope (its key) to signal the rest of the module
              // that this wasn't an exact but filtered match.
              interceptors.forEach((ic) => {
                ic.__nock_filteredScope = ic.__nock_scopeKey;
              });
              return interceptors;
            }
          }

          if (common.matchStringOrRegexp(basePath, key)) {
            if (allowUnmocked && interceptors.length === 0) {
              debug(
                "matched base path with allowUnmocked (no matching interceptors)"
              );
              return [
                {
                  options: { allowUnmocked: true },
                  matchOrigin() {
                    return false;
                  },
                },
              ];
            } else {
              debug(
                `matched base path (${interceptors.length} interceptor${
                  interceptors.length > 1 ? "s" : ""
                })`
              );
              return interceptors;
            }
          }
        }

        return undefined;
      }

      function removeInterceptor(options) {
        // Lazily import to avoid circular imports.
        const Interceptor = __nccwpck_require__(5419);

        let baseUrl, key, method, proto;
        if (options instanceof Interceptor) {
          baseUrl = options.basePath;
          key = options._key;
        } else {
          proto = options.proto ? options.proto : "http";

          common.normalizeRequestOptions(options);
          baseUrl = `${proto}://${options.host}`;
          method = (options.method && options.method.toUpperCase()) || "GET";
          key = `${method} ${baseUrl}${options.path || "/"}`;
        }

        if (
          allInterceptors[baseUrl] &&
          allInterceptors[baseUrl].interceptors.length > 0
        ) {
          for (
            let i = 0;
            i < allInterceptors[baseUrl].interceptors.length;
            i++
          ) {
            const interceptor = allInterceptors[baseUrl].interceptors[i];
            if (
              options instanceof Interceptor
                ? interceptor === options
                : interceptor._key === key
            ) {
              allInterceptors[baseUrl].interceptors.splice(i, 1);
              interceptor.scope.remove(key, interceptor);
              break;
            }
          }

          return true;
        }

        return false;
      }
      //  Variable where we keep the ClientRequest we have overridden
      //  (which might or might not be node's original http.ClientRequest)
      let originalClientRequest;

      function ErroringClientRequest(error) {
        http.OutgoingMessage.call(this);
        process.nextTick(
          function () {
            this.emit("error", error);
          }.bind(this)
        );
      }

      inherits(ErroringClientRequest, http.ClientRequest);

      function overrideClientRequest() {
        // Here's some background discussion about overriding ClientRequest:
        // - https://github.com/nodejitsu/mock-request/issues/4
        // - https://github.com/nock/nock/issues/26
        // It would be good to add a comment that explains this more clearly.
        debug("Overriding ClientRequest");

        // ----- Extending http.ClientRequest

        //  Define the overriding client request that nock uses internally.
        function OverriddenClientRequest(...args) {
          const { options, callback } = common.normalizeClientRequestArgs(
            ...args
          );

          if (Object.keys(options).length === 0) {
            // As weird as it is, it's possible to call `http.request` without
            // options, and it makes a request to localhost or somesuch. We should
            // support it too, for parity. However it doesn't work today, and fixing
            // it seems low priority. Giving an explicit error is nicer than
            // crashing with a weird stack trace. `http[s].request()`, nock's other
            // client-facing entry point, makes a similar check.
            // https://github.com/nock/nock/pull/1386
            // https://github.com/nock/nock/pull/1440
            throw Error(
              "Creating a ClientRequest with empty `options` is not supported in Nock"
            );
          }

          http.OutgoingMessage.call(this);

          //  Filter the interceptors per request options.
          const interceptors = interceptorsFor(options);

          if (isOn() && interceptors) {
            debug("using", interceptors.length, "interceptors");

            //  Use filtered interceptors to intercept requests.
            // TODO: this shouldn't be a class anymore
            // the overrider explicitly overrides methods and attrs on the request so the `assign` below should be removed.
            const overrider = new InterceptedRequestRouter({
              req: this,
              options,
              interceptors,
            });
            Object.assign(this, overrider);

            if (callback) {
              this.once("response", callback);
            }
          } else {
            debug("falling back to original ClientRequest");

            //  Fallback to original ClientRequest if nock is off or the net connection is enabled.
            if (isOff() || isEnabledForNetConnect(options)) {
              originalClientRequest.apply(this, arguments);
            } else {
              common.setImmediate(
                function () {
                  const error = new NetConnectNotAllowedError(
                    options.host,
                    options.path
                  );
                  this.emit("error", error);
                }.bind(this)
              );
            }
          }
        }
        inherits(OverriddenClientRequest, http.ClientRequest);

        //  Override the http module's request but keep the original so that we can use it and later restore it.
        //  NOTE: We only override http.ClientRequest as https module also uses it.
        originalClientRequest = http.ClientRequest;
        http.ClientRequest = OverriddenClientRequest;

        debug("ClientRequest overridden");
      }

      function restoreOverriddenClientRequest() {
        debug("restoring overridden ClientRequest");

        //  Restore the ClientRequest we have overridden.
        if (!originalClientRequest) {
          debug("- ClientRequest was not overridden");
        } else {
          http.ClientRequest = originalClientRequest;
          originalClientRequest = undefined;

          debug("- ClientRequest restored");
        }
      }

      function isActive() {
        //  If ClientRequest has been overwritten by Nock then originalClientRequest is not undefined.
        //  This means that Nock has been activated.
        return originalClientRequest !== undefined;
      }

      function interceptorScopes() {
        const nestedInterceptors = Object.values(allInterceptors).map(
          (i) => i.interceptors
        );
        const scopes = new Set(
          [].concat(...nestedInterceptors).map((i) => i.scope)
        );
        return [...scopes];
      }

      function isDone() {
        return interceptorScopes().every((scope) => scope.isDone());
      }

      function pendingMocks() {
        return [].concat(
          ...interceptorScopes().map((scope) => scope.pendingMocks())
        );
      }

      function activeMocks() {
        return [].concat(
          ...interceptorScopes().map((scope) => scope.activeMocks())
        );
      }

      function activate() {
        if (originalClientRequest) {
          throw new Error("Nock already active");
        }

        // ----- Overriding http.request and https.request:

        common.overrideRequests(function (proto, overriddenRequest, args) {
          //  NOTE: overriddenRequest is already bound to its module.

          const { options, callback } = common.normalizeClientRequestArgs(
            ...args
          );

          if (Object.keys(options).length === 0) {
            // As weird as it is, it's possible to call `http.request` without
            // options, and it makes a request to localhost or somesuch. We should
            // support it too, for parity. However it doesn't work today, and fixing
            // it seems low priority. Giving an explicit error is nicer than
            // crashing with a weird stack trace. `new ClientRequest()`, nock's
            // other client-facing entry point, makes a similar check.
            // https://github.com/nock/nock/pull/1386
            // https://github.com/nock/nock/pull/1440
            throw Error(
              "Making a request with empty `options` is not supported in Nock"
            );
          }

          // The option per the docs is `protocol`. Its unclear if this line is meant to override that and is misspelled or if
          // the intend is to explicitly keep track of which module was called using a separate name.
          // Either way, `proto` is used as the source of truth from here on out.
          options.proto = proto;

          const interceptors = interceptorsFor(options);

          if (isOn() && interceptors) {
            const matches = interceptors.some((interceptor) =>
              interceptor.matchOrigin(options)
            );
            const allowUnmocked = interceptors.some(
              (interceptor) => interceptor.options.allowUnmocked
            );

            if (!matches && allowUnmocked) {
              let req;
              if (proto === "https") {
                const { ClientRequest } = http;
                http.ClientRequest = originalClientRequest;
                req = overriddenRequest(options, callback);
                http.ClientRequest = ClientRequest;
              } else {
                req = overriddenRequest(options, callback);
              }
              globalEmitter.emit("no match", req);
              return req;
            }

            //  NOTE: Since we already overrode the http.ClientRequest we are in fact constructing
            //    our own OverriddenClientRequest.
            return new http.ClientRequest(options, callback);
          } else {
            globalEmitter.emit("no match", options);
            if (isOff() || isEnabledForNetConnect(options)) {
              return overriddenRequest(options, callback);
            } else {
              const error = new NetConnectNotAllowedError(
                options.host,
                options.path
              );
              return new ErroringClientRequest(error);
            }
          }
        });

        overrideClientRequest();
      }

      module.exports = {
        addInterceptor,
        remove,
        removeAll,
        removeInterceptor,
        isOn,
        activate,
        isActive,
        isDone,
        pendingMocks,
        activeMocks,
        enableNetConnect,
        disableNetConnect,
        restoreOverriddenClientRequest,
        abortPendingRequests: common.removeAllTimers,
      };

      /***/
    },

    /***/ 4694: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";

      const debug = __nccwpck_require__(8237)("nock.request_overrider");
      const {
        IncomingMessage,
        ClientRequest,
        request: originalHttpRequest,
      } = __nccwpck_require__(3685);
      const { request: originalHttpsRequest } = __nccwpck_require__(5687);
      const propagate = __nccwpck_require__(9577);
      const common = __nccwpck_require__(1521);
      const globalEmitter = __nccwpck_require__(9935);
      const Socket = __nccwpck_require__(5676);
      const { playbackInterceptor } = __nccwpck_require__(6523);

      function socketOnClose(req) {
        debug("socket close");

        if (!req.res && !req.socket._hadError) {
          // If we don't have a response then we know that the socket
          // ended prematurely and we need to emit an error on the request.
          req.socket._hadError = true;
          const err = new Error("socket hang up");
          err.code = "ECONNRESET";
          req.emit("error", err);
        }
        req.emit("close");
      }

      /**
       * Given a group of interceptors, appropriately route an outgoing request.
       * Identify which interceptor ought to respond, if any, then delegate to
       * `playbackInterceptor()` to consume the request itself.
       */
      class InterceptedRequestRouter {
        constructor({ req, options, interceptors }) {
          this.req = req;
          this.options = {
            // We may be changing the options object and we don't want those changes
            // affecting the user so we use a clone of the object.
            ...options,
            // We use lower-case header field names throughout Nock.
            headers: common.headersFieldNamesToLowerCase(
              options.headers || {},
              false
            ),
          };
          this.interceptors = interceptors;

          this.socket = new Socket(options);

          // support setting `timeout` using request `options`
          // https://nodejs.org/docs/latest-v12.x/api/http.html#http_http_request_url_options_callback
          // any timeout in the request options override any timeout in the agent options.
          // per https://github.com/nodejs/node/pull/21204
          const timeout =
            options.timeout ||
            (options.agent &&
              options.agent.options &&
              options.agent.options.timeout);

          if (timeout) {
            this.socket.setTimeout(timeout);
          }

          this.response = new IncomingMessage(this.socket);
          this.requestBodyBuffers = [];
          this.playbackStarted = false;

          // For parity with Node, it's important the socket event is emitted before we begin playback.
          // This flag is set when playback is triggered if we haven't yet gotten the
          // socket event to indicate that playback should start as soon as it comes in.
          this.readyToStartPlaybackOnSocketEvent = false;

          this.attachToReq();

          // Emit a fake socket event on the next tick to mimic what would happen on a real request.
          // Some clients listen for a 'socket' event to be emitted before calling end(),
          // which causes Nock to hang.
          process.nextTick(() => this.connectSocket());
        }

        attachToReq() {
          const { req, options } = this;

          for (const [name, val] of Object.entries(options.headers)) {
            req.setHeader(name.toLowerCase(), val);
          }

          if (options.auth && !options.headers.authorization) {
            req.setHeader(
              // We use lower-case header field names throughout Nock.
              "authorization",
              `Basic ${Buffer.from(options.auth).toString("base64")}`
            );
          }

          req.path = options.path;
          req.method = options.method;

          req.write = (...args) => this.handleWrite(...args);
          req.end = (...args) => this.handleEnd(...args);
          req.flushHeaders = (...args) => this.handleFlushHeaders(...args);

          // https://github.com/nock/nock/issues/256
          if (options.headers.expect === "100-continue") {
            common.setImmediate(() => {
              debug("continue");
              req.emit("continue");
            });
          }
        }

        connectSocket() {
          const { req, socket } = this;

          if (common.isRequestDestroyed(req)) {
            return;
          }

          // ClientRequest.connection is an alias for ClientRequest.socket
          // https://nodejs.org/api/http.html#http_request_socket
          // https://github.com/nodejs/node/blob/b0f75818f39ed4e6bd80eb7c4010c1daf5823ef7/lib/_http_client.js#L640-L641
          // The same Socket is shared between the request and response to mimic native behavior.
          req.socket = req.connection = socket;

          propagate(["error", "timeout"], socket, req);
          socket.on("close", () => socketOnClose(req));

          socket.connecting = false;
          req.emit("socket", socket);

          // https://nodejs.org/api/net.html#net_event_connect
          socket.emit("connect");

          // https://nodejs.org/api/tls.html#tls_event_secureconnect
          if (socket.authorized) {
            socket.emit("secureConnect");
          }

          if (this.readyToStartPlaybackOnSocketEvent) {
            this.maybeStartPlayback();
          }
        }

        // from docs: When write function is called with empty string or buffer, it does nothing and waits for more input.
        // However, actually implementation checks the state of finished and aborted before checking if the first arg is empty.
        handleWrite(...args) {
          debug("request write");

          let [buffer, encoding] = args;

          const { req } = this;

          if (req.finished) {
            const err = new Error("write after end");
            err.code = "ERR_STREAM_WRITE_AFTER_END";
            process.nextTick(() => req.emit("error", err));

            // It seems odd to return `true` here, not sure why you'd want to have
            // the stream potentially written to more, but it's what Node does.
            // https://github.com/nodejs/node/blob/a9270dcbeba4316b1e179b77ecb6c46af5aa8c20/lib/_http_outgoing.js#L662-L665
            return true;
          }

          if (req.socket && req.socket.destroyed) {
            return false;
          }

          if (!buffer) {
            return true;
          }

          if (!Buffer.isBuffer(buffer)) {
            buffer = Buffer.from(buffer, encoding);
          }
          this.requestBodyBuffers.push(buffer);

          // writable.write encoding param is optional
          // so if callback is present it's the last argument
          const callback = args.length > 1 ? args[args.length - 1] : undefined;
          // can't use instanceof Function because some test runners
          // run tests in vm.runInNewContext where Function is not same
          // as that in the current context
          // https://github.com/nock/nock/pull/1754#issuecomment-571531407
          if (typeof callback === "function") {
            callback();
          }

          common.setImmediate(function () {
            req.emit("drain");
          });

          return false;
        }

        handleEnd(chunk, encoding, callback) {
          debug("request end");
          const { req } = this;

          // handle the different overloaded arg signatures
          if (typeof chunk === "function") {
            callback = chunk;
            chunk = null;
          } else if (typeof encoding === "function") {
            callback = encoding;
            encoding = null;
          }

          if (typeof callback === "function") {
            req.once("finish", callback);
          }

          if (chunk) {
            req.write(chunk, encoding);
          }
          req.finished = true;
          this.maybeStartPlayback();

          return req;
        }

        handleFlushHeaders() {
          debug("request flushHeaders");
          this.maybeStartPlayback();
        }

        /**
         * Set request headers of the given request. This is needed both during the
         * routing phase, in case header filters were specified, and during the
         * interceptor-playback phase, to correctly pass mocked request headers.
         * TODO There are some problems with this; see https://github.com/nock/nock/issues/1718
         */
        setHostHeaderUsingInterceptor(interceptor) {
          const { req, options } = this;

          // If a filtered scope is being used we have to use scope's host in the
          // header, otherwise 'host' header won't match.
          // NOTE: We use lower-case header field names throughout Nock.
          const HOST_HEADER = "host";
          if (
            interceptor.__nock_filteredScope &&
            interceptor.__nock_scopeHost
          ) {
            options.headers[HOST_HEADER] = interceptor.__nock_scopeHost;
            req.setHeader(HOST_HEADER, interceptor.__nock_scopeHost);
          } else {
            // For all other cases, we always add host header equal to the requested
            // host unless it was already defined.
            if (options.host && !req.getHeader(HOST_HEADER)) {
              let hostHeader = options.host;

              if (options.port === 80 || options.port === 443) {
                hostHeader = hostHeader.split(":")[0];
              }

              req.setHeader(HOST_HEADER, hostHeader);
            }
          }
        }

        maybeStartPlayback() {
          const { req, socket, playbackStarted } = this;

          // In order to get the events in the right order we need to delay playback
          // if we get here before the `socket` event is emitted.
          if (socket.connecting) {
            this.readyToStartPlaybackOnSocketEvent = true;
            return;
          }

          if (!common.isRequestDestroyed(req) && !playbackStarted) {
            this.startPlayback();
          }
        }

        startPlayback() {
          debug("ending");
          this.playbackStarted = true;

          const { req, response, socket, options, interceptors } = this;

          Object.assign(options, {
            // Re-update `options` with the current value of `req.path` because badly
            // behaving agents like superagent like to change `req.path` mid-flight.
            path: req.path,
            // Similarly, node-http-proxy will modify headers in flight, so we have
            // to put the headers back into options.
            // https://github.com/nock/nock/pull/1484
            headers: req.getHeaders(),
            // Fixes https://github.com/nock/nock/issues/976
            protocol: `${options.proto}:`,
          });

          interceptors.forEach((interceptor) => {
            this.setHostHeaderUsingInterceptor(interceptor);
          });

          const requestBodyBuffer = Buffer.concat(this.requestBodyBuffers);
          // When request body is a binary buffer we internally use in its hexadecimal
          // representation.
          const requestBodyIsUtf8Representable =
            common.isUtf8Representable(requestBodyBuffer);
          const requestBodyString = requestBodyBuffer.toString(
            requestBodyIsUtf8Representable ? "utf8" : "hex"
          );

          const matchedInterceptor = interceptors.find((i) =>
            i.match(req, options, requestBodyString)
          );

          if (matchedInterceptor) {
            matchedInterceptor.scope.logger(
              "interceptor identified, starting mocking"
            );

            matchedInterceptor.markConsumed();

            // wait to emit the finish event until we know for sure an Interceptor is going to playback.
            // otherwise an unmocked request might emit finish twice.
            req.emit("finish");

            playbackInterceptor({
              req,
              socket,
              options,
              requestBodyString,
              requestBodyIsUtf8Representable,
              response,
              interceptor: matchedInterceptor,
            });
          } else {
            globalEmitter.emit("no match", req, options, requestBodyString);

            // Try to find a hostname match that allows unmocked.
            const allowUnmocked = interceptors.some(
              (i) => i.matchHostName(options) && i.options.allowUnmocked
            );

            if (allowUnmocked && req instanceof ClientRequest) {
              const newReq =
                options.proto === "https"
                  ? originalHttpsRequest(options)
                  : originalHttpRequest(options);

              propagate(newReq, req);
              // We send the raw buffer as we received it, not as we interpreted it.
              newReq.end(requestBodyBuffer);
            } else {
              const reqStr = common.stringifyRequest(
                options,
                requestBodyString
              );
              const err = new Error(`Nock: No match for request ${reqStr}`);
              err.code = "ERR_NOCK_NO_MATCH";
              err.statusCode = err.status = 404;
              req.destroy(err);
            }
          }
        }
      }

      module.exports = { InterceptedRequestRouter };

      /***/
    },

    /***/ 5419: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";

      const stringify = __nccwpck_require__(7073);
      const querystring = __nccwpck_require__(3477);
      const { URL, URLSearchParams } = __nccwpck_require__(7310);

      const common = __nccwpck_require__(1521);
      const { remove } = __nccwpck_require__(7607);
      const matchBody = __nccwpck_require__(3986);

      let fs;
      try {
        fs = __nccwpck_require__(7147);
      } catch (err) {
        // do nothing, we're in the browser
      }

      module.exports = class Interceptor {
        /**
         *
         * Valid argument types for `uri`:
         *  - A string used for strict comparisons with pathname.
         *    The search portion of the URI may also be postfixed, in which case the search params
         *    are striped and added via the `query` method.
         *  - A RegExp instance that tests against only the pathname of requests.
         *  - A synchronous function bound to this Interceptor instance. It's provided the pathname
         *    of requests and must return a boolean denoting if the request is considered a match.
         */
        constructor(scope, uri, method, requestBody, interceptorOptions) {
          const uriIsStr = typeof uri === "string";
          // Check for leading slash. Uri can be either a string or a regexp, but
          // When enabled filteringScope ignores the passed URL entirely so we skip validation.

          if (
            uriIsStr &&
            !scope.scopeOptions.filteringScope &&
            !scope.basePathname &&
            !uri.startsWith("/") &&
            !uri.startsWith("*")
          ) {
            throw Error(
              `Non-wildcard URL path strings must begin with a slash (otherwise they won't match anything) (got: ${uri})`
            );
          }

          if (!method) {
            throw new Error(
              'The "method" parameter is required for an intercept call.'
            );
          }

          this.scope = scope;
          this.interceptorMatchHeaders = [];
          this.method = method.toUpperCase();
          this.uri = uri;
          this._key = `${this.method} ${scope.basePath}${scope.basePathname}${
            uriIsStr ? "" : "/"
          }${uri}`;
          this.basePath = this.scope.basePath;
          this.path = uriIsStr ? scope.basePathname + uri : uri;
          this.queries = null;

          this.options = interceptorOptions || {};
          this.counter = 1;
          this._requestBody = requestBody;

          //  We use lower-case header field names throughout Nock.
          this.reqheaders = common.headersFieldNamesToLowerCase(
            scope.scopeOptions.reqheaders || {},
            true
          );
          this.badheaders = common.headersFieldsArrayToLowerCase(
            scope.scopeOptions.badheaders || []
          );

          this.delayBodyInMs = 0;
          this.delayConnectionInMs = 0;

          this.optional = false;

          // strip off literal query parameters if they were provided as part of the URI
          if (uriIsStr && uri.includes("?")) {
            // localhost is a dummy value because the URL constructor errors for only relative inputs
            const parsedURL = new URL(this.path, "http://localhost");
            this.path = parsedURL.pathname;
            this.query(parsedURL.searchParams);
            this._key = `${this.method} ${scope.basePath}${this.path}`;
          }
        }

        optionally(flag = true) {
          // The default behaviour of optionally() with no arguments is to make the mock optional.
          if (typeof flag !== "boolean") {
            throw new Error("Invalid arguments: argument should be a boolean");
          }

          this.optional = flag;

          return this;
        }

        replyWithError(errorMessage) {
          this.errorMessage = errorMessage;

          this.options = {
            ...this.scope.scopeOptions,
            ...this.options,
          };

          this.scope.add(this._key, this);
          return this.scope;
        }

        reply(statusCode, body, rawHeaders) {
          // support the format of only passing in a callback
          if (typeof statusCode === "function") {
            if (arguments.length > 1) {
              // It's not very Javascript-y to throw an error for extra args to a function, but because
              // of legacy behavior, this error was added to reduce confusion for those migrating.
              throw Error(
                "Invalid arguments. When providing a function for the first argument, .reply does not accept other arguments."
              );
            }
            this.statusCode = null;
            this.fullReplyFunction = statusCode;
          } else {
            if (statusCode !== undefined && !Number.isInteger(statusCode)) {
              throw new Error(
                `Invalid ${typeof statusCode} value for status code`
              );
            }

            this.statusCode = statusCode || 200;
            if (typeof body === "function") {
              this.replyFunction = body;
              body = null;
            }
          }

          this.options = {
            ...this.scope.scopeOptions,
            ...this.options,
          };

          this.rawHeaders = common.headersInputToRawArray(rawHeaders);

          if (this.scope.date) {
            // https://tools.ietf.org/html/rfc7231#section-7.1.1.2
            this.rawHeaders.push("Date", this.scope.date.toUTCString());
          }

          // Prepare the headers temporarily so we can make best guesses about content-encoding and content-type
          // below as well as while the response is being processed in RequestOverrider.end().
          // Including all the default headers is safe for our purposes because of the specific headers we introspect.
          // A more thoughtful process is used to merge the default headers when the response headers are finally computed.
          this.headers = common.headersArrayToObject(
            this.rawHeaders.concat(this.scope._defaultReplyHeaders)
          );

          //  If the content is not encoded we may need to transform the response body.
          //  Otherwise, we leave it as it is.
          if (
            body &&
            typeof body !== "string" &&
            !Buffer.isBuffer(body) &&
            !common.isStream(body) &&
            !common.isContentEncoded(this.headers)
          ) {
            try {
              body = stringify(body);
            } catch (err) {
              throw new Error("Error encoding response body into JSON");
            }

            if (!this.headers["content-type"]) {
              // https://tools.ietf.org/html/rfc7231#section-3.1.1.5
              this.rawHeaders.push("Content-Type", "application/json");
            }
          }

          if (this.scope.contentLen) {
            // https://tools.ietf.org/html/rfc7230#section-3.3.2
            if (typeof body === "string") {
              this.rawHeaders.push("Content-Length", body.length);
            } else if (Buffer.isBuffer(body)) {
              this.rawHeaders.push("Content-Length", body.byteLength);
            }
          }

          this.scope.logger("reply.headers:", this.headers);
          this.scope.logger("reply.rawHeaders:", this.rawHeaders);

          this.body = body;

          this.scope.add(this._key, this);
          return this.scope;
        }

        replyWithFile(statusCode, filePath, headers) {
          if (!fs) {
            throw new Error("No fs");
          }
          this.filePath = filePath;
          return this.reply(
            statusCode,
            () => {
              const readStream = fs.createReadStream(filePath);
              readStream.pause();
              return readStream;
            },
            headers
          );
        }

        // Also match request headers
        // https://github.com/nock/nock/issues/163
        reqheaderMatches(options, key) {
          const reqHeader = this.reqheaders[key];
          let header = options.headers[key];

          // https://github.com/nock/nock/issues/399
          // https://github.com/nock/nock/issues/822
          if (header && typeof header !== "string" && header.toString) {
            header = header.toString();
          }

          // We skip 'host' header comparison unless it's available in both mock and
          // actual request. This because 'host' may get inserted by Nock itself and
          // then get recorded. NOTE: We use lower-case header field names throughout
          // Nock. See https://github.com/nock/nock/pull/196.
          if (
            key === "host" &&
            (header === undefined || reqHeader === undefined)
          ) {
            return true;
          }

          if (reqHeader !== undefined && header !== undefined) {
            if (typeof reqHeader === "function") {
              return reqHeader(header);
            } else if (common.matchStringOrRegexp(header, reqHeader)) {
              return true;
            }
          }

          this.scope.logger(
            "request header field doesn't match:",
            key,
            header,
            reqHeader
          );
          return false;
        }

        match(req, options, body) {
          // check if the logger is enabled because the stringifies can be expensive.
          if (this.scope.logger.enabled) {
            this.scope.logger(
              "attempting match %s, body = %s",
              stringify(options),
              stringify(body)
            );
          }

          const method = (options.method || "GET").toUpperCase();
          let { path = "/" } = options;
          let matches;
          let matchKey;
          const { proto } = options;

          if (this.method !== method) {
            this.scope.logger(
              `Method did not match. Request ${method} Interceptor ${this.method}`
            );
            return false;
          }

          if (this.scope.transformPathFunction) {
            path = this.scope.transformPathFunction(path);
          }

          const requestMatchesFilter = ({ name, value: predicate }) => {
            const headerValue = req.getHeader(name);
            if (typeof predicate === "function") {
              return predicate(headerValue);
            } else {
              return common.matchStringOrRegexp(headerValue, predicate);
            }
          };

          if (
            !this.scope.matchHeaders.every(requestMatchesFilter) ||
            !this.interceptorMatchHeaders.every(requestMatchesFilter)
          ) {
            this.scope.logger("headers don't match");
            return false;
          }

          const reqHeadersMatch = Object.keys(this.reqheaders).every((key) =>
            this.reqheaderMatches(options, key)
          );

          if (!reqHeadersMatch) {
            this.scope.logger("headers don't match");
            return false;
          }

          if (
            this.scope.scopeOptions.conditionally &&
            !this.scope.scopeOptions.conditionally()
          ) {
            this.scope.logger(
              "matching failed because Scope.conditionally() did not validate"
            );
            return false;
          }

          const badHeaders = this.badheaders.filter(
            (header) => header in options.headers
          );

          if (badHeaders.length) {
            this.scope.logger("request contains bad headers", ...badHeaders);
            return false;
          }

          // Match query strings when using query()
          if (this.queries === null) {
            this.scope.logger("query matching skipped");
          } else {
            // can't rely on pathname or search being in the options, but path has a default
            const [pathname, search] = path.split("?");
            const matchQueries = this.matchQuery({ search });

            this.scope.logger(
              matchQueries
                ? "query matching succeeded"
                : "query matching failed"
            );

            if (!matchQueries) {
              return false;
            }

            // If the query string was explicitly checked then subsequent checks against
            // the path using a callback or regexp only validate the pathname.
            path = pathname;
          }

          // If we have a filtered scope then we use it instead reconstructing the
          // scope from the request options (proto, host and port) as these two won't
          // necessarily match and we have to remove the scope that was matched (vs.
          // that was defined).
          if (this.__nock_filteredScope) {
            matchKey = this.__nock_filteredScope;
          } else {
            matchKey = common.normalizeOrigin(
              proto,
              options.host,
              options.port
            );
          }

          if (typeof this.uri === "function") {
            matches =
              common.matchStringOrRegexp(matchKey, this.basePath) &&
              // This is a false positive, as `uri` is not bound to `this`.
              // eslint-disable-next-line no-useless-call
              this.uri.call(this, path);
          } else {
            matches =
              common.matchStringOrRegexp(matchKey, this.basePath) &&
              common.matchStringOrRegexp(path, this.path);
          }

          this.scope.logger(
            `matching ${matchKey}${path} to ${this._key}: ${matches}`
          );

          if (matches && this._requestBody !== undefined) {
            if (this.scope.transformRequestBodyFunction) {
              body = this.scope.transformRequestBodyFunction(
                body,
                this._requestBody
              );
            }

            matches = matchBody(options, this._requestBody, body);
            if (!matches) {
              this.scope.logger(
                "bodies don't match: \n",
                this._requestBody,
                "\n",
                body
              );
            }
          }

          return matches;
        }

        /**
         * Return true when the interceptor's method, protocol, host, port, and path
         * match the provided options.
         */
        matchOrigin(options) {
          const isPathFn = typeof this.path === "function";
          const isRegex = this.path instanceof RegExp;
          const isRegexBasePath = this.scope.basePath instanceof RegExp;

          const method = (options.method || "GET").toUpperCase();
          let { path } = options;
          const { proto } = options;

          // NOTE: Do not split off the query params as the regex could use them
          if (!isRegex) {
            path = path ? path.split("?")[0] : "";
          }

          if (this.scope.transformPathFunction) {
            path = this.scope.transformPathFunction(path);
          }
          const comparisonKey =
            isPathFn || isRegex ? this.__nock_scopeKey : this._key;
          const matchKey = `${method} ${proto}://${options.host}${path}`;

          if (isPathFn) {
            return !!(matchKey.match(comparisonKey) && this.path(path));
          }

          if (isRegex && !isRegexBasePath) {
            return !!matchKey.match(comparisonKey) && this.path.test(path);
          }

          if (isRegexBasePath) {
            return (
              this.scope.basePath.test(matchKey) && !!path.match(this.path)
            );
          }

          return comparisonKey === matchKey;
        }

        matchHostName(options) {
          const { basePath } = this.scope;

          if (basePath instanceof RegExp) {
            return basePath.test(options.hostname);
          }

          return options.hostname === this.scope.urlParts.hostname;
        }

        matchQuery(options) {
          if (this.queries === true) {
            return true;
          }

          const reqQueries = querystring.parse(options.search);
          this.scope.logger("Interceptor queries: %j", this.queries);
          this.scope.logger("    Request queries: %j", reqQueries);

          if (typeof this.queries === "function") {
            return this.queries(reqQueries);
          }

          return common.dataEqual(this.queries, reqQueries);
        }

        filteringPath(...args) {
          this.scope.filteringPath(...args);
          return this;
        }

        // TODO filtering by path is valid on the intercept level, but not filtering
        // by request body?

        markConsumed() {
          this.interceptionCounter++;

          remove(this);

          if (!this.scope.shouldPersist() && this.counter < 1) {
            this.scope.remove(this._key, this);
          }
        }

        matchHeader(name, value) {
          this.interceptorMatchHeaders.push({ name, value });
          return this;
        }

        basicAuth({ user, pass = "" }) {
          const encoded = Buffer.from(`${user}:${pass}`).toString("base64");
          this.matchHeader("authorization", `Basic ${encoded}`);
          return this;
        }

        /**
         * Set query strings for the interceptor
         * @name query
         * @param queries Object of query string name,values (accepts regexp values)
         * @public
         * @example
         * // Will match 'http://zombo.com/?q=t'
         * nock('http://zombo.com').get('/').query({q: 't'});
         */
        query(queries) {
          if (this.queries !== null) {
            throw Error(`Query parameters have already been defined`);
          }

          // Allow all query strings to match this route
          if (queries === true) {
            this.queries = queries;
            return this;
          }

          if (typeof queries === "function") {
            this.queries = queries;
            return this;
          }

          let strFormattingFn;
          if (this.scope.scopeOptions.encodedQueryParams) {
            strFormattingFn = common.percentDecode;
          }

          if (
            queries instanceof URLSearchParams ||
            typeof queries === "string"
          ) {
            // Normalize the data into the shape that is matched against.
            // Duplicate keys are handled by combining the values into an array.
            queries = querystring.parse(queries.toString());
          } else if (!common.isPlainObject(queries)) {
            throw Error(`Argument Error: ${queries}`);
          }

          this.queries = {};
          for (const [key, value] of Object.entries(queries)) {
            const formatted = common.formatQueryValue(
              key,
              value,
              strFormattingFn
            );
            const [formattedKey, formattedValue] = formatted;
            this.queries[formattedKey] = formattedValue;
          }

          return this;
        }

        /**
         * Set number of times will repeat the interceptor
         * @name times
         * @param newCounter Number of times to repeat (should be > 0)
         * @public
         * @example
         * // Will repeat mock 5 times for same king of request
         * nock('http://zombo.com).get('/').times(5).reply(200, 'Ok');
         */
        times(newCounter) {
          if (newCounter < 1) {
            return this;
          }

          this.counter = newCounter;

          return this;
        }

        /**
         * An sugar syntax for times(1)
         * @name once
         * @see {@link times}
         * @public
         * @example
         * nock('http://zombo.com).get('/').once().reply(200, 'Ok');
         */
        once() {
          return this.times(1);
        }

        /**
         * An sugar syntax for times(2)
         * @name twice
         * @see {@link times}
         * @public
         * @example
         * nock('http://zombo.com).get('/').twice().reply(200, 'Ok');
         */
        twice() {
          return this.times(2);
        }

        /**
         * An sugar syntax for times(3).
         * @name thrice
         * @see {@link times}
         * @public
         * @example
         * nock('http://zombo.com).get('/').thrice().reply(200, 'Ok');
         */
        thrice() {
          return this.times(3);
        }

        /**
         * Delay the response by a certain number of ms.
         *
         * @param {(integer|object)} opts - Number of milliseconds to wait, or an object
         * @param {integer} [opts.head] - Number of milliseconds to wait before response is sent
         * @param {integer} [opts.body] - Number of milliseconds to wait before response body is sent
         * @return {Interceptor} - the current interceptor for chaining
         */
        delay(opts) {
          let headDelay;
          let bodyDelay;
          if (typeof opts === "number") {
            headDelay = opts;
            bodyDelay = 0;
          } else if (typeof opts === "object") {
            headDelay = opts.head || 0;
            bodyDelay = opts.body || 0;
          } else {
            throw new Error(`Unexpected input opts ${opts}`);
          }

          return this.delayConnection(headDelay).delayBody(bodyDelay);
        }

        /**
         * Delay the response body by a certain number of ms.
         *
         * @param {integer} ms - Number of milliseconds to wait before response is sent
         * @return {Interceptor} - the current interceptor for chaining
         */
        delayBody(ms) {
          this.delayBodyInMs = ms;
          return this;
        }

        /**
         * Delay the connection by a certain number of ms.
         *
         * @param  {integer} ms - Number of milliseconds to wait
         * @return {Interceptor} - the current interceptor for chaining
         */
        delayConnection(ms) {
          this.delayConnectionInMs = ms;
          return this;
        }
      };

      /***/
    },

    /***/ 3986: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";

      const querystring = __nccwpck_require__(3477);

      const common = __nccwpck_require__(1521);

      module.exports = function matchBody(options, spec, body) {
        if (spec instanceof RegExp) {
          return spec.test(body);
        }

        if (Buffer.isBuffer(spec)) {
          const encoding = common.isUtf8Representable(spec) ? "utf8" : "hex";
          spec = spec.toString(encoding);
        }

        const contentType = (
          (options.headers &&
            (options.headers["Content-Type"] ||
              options.headers["content-type"])) ||
          ""
        ).toString();

        const isMultipart = contentType.includes("multipart");
        const isUrlencoded = contentType.includes(
          "application/x-www-form-urlencoded"
        );

        // try to transform body to json
        let json;
        if (typeof spec === "object" || typeof spec === "function") {
          try {
            json = JSON.parse(body);
          } catch (err) {
            // not a valid JSON string
          }
          if (json !== undefined) {
            body = json;
          } else if (isUrlencoded) {
            body = querystring.parse(body);
          }
        }

        if (typeof spec === "function") {
          return spec.call(options, body);
        }

        // strip line endings from both so that we get a match no matter what OS we are running on
        // if Content-Type does not contain 'multipart'
        if (!isMultipart && typeof body === "string") {
          body = body.replace(/\r?\n|\r/g, "");
        }

        if (!isMultipart && typeof spec === "string") {
          spec = spec.replace(/\r?\n|\r/g, "");
        }

        // Because the nature of URL encoding, all the values in the body must be cast to strings.
        // dataEqual does strict checking, so we have to cast the non-regexp values in the spec too.
        if (isUrlencoded) {
          spec = mapValuesDeep(spec, (val) =>
            val instanceof RegExp ? val : `${val}`
          );
        }

        return common.dataEqual(spec, body);
      };

      function mapValues(object, cb) {
        const keys = Object.keys(object);
        for (const key of keys) {
          object[key] = cb(object[key], key, object);
        }
        return object;
      }

      /**
       * Based on lodash issue discussion
       * https://github.com/lodash/lodash/issues/1244
       */
      function mapValuesDeep(obj, cb) {
        if (Array.isArray(obj)) {
          return obj.map((v) => mapValuesDeep(v, cb));
        }
        if (common.isPlainObject(obj)) {
          return mapValues(obj, (v) => mapValuesDeep(v, cb));
        }
        return cb(obj);
      }

      /***/
    },

    /***/ 6523: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";

      const stream = __nccwpck_require__(2781);
      const util = __nccwpck_require__(3837);
      const zlib = __nccwpck_require__(9796);
      const debug = __nccwpck_require__(8237)("nock.playback_interceptor");
      const common = __nccwpck_require__(1521);

      function parseJSONRequestBody(req, requestBody) {
        if (!requestBody || !common.isJSONContent(req.headers)) {
          return requestBody;
        }

        if (common.contentEncoding(req.headers, "gzip")) {
          requestBody = String(
            zlib.gunzipSync(Buffer.from(requestBody, "hex"))
          );
        } else if (common.contentEncoding(req.headers, "deflate")) {
          requestBody = String(
            zlib.inflateSync(Buffer.from(requestBody, "hex"))
          );
        }

        return JSON.parse(requestBody);
      }

      function parseFullReplyResult(response, fullReplyResult) {
        debug("full response from callback result: %j", fullReplyResult);

        if (!Array.isArray(fullReplyResult)) {
          throw Error(
            "A single function provided to .reply MUST return an array"
          );
        }

        if (fullReplyResult.length > 3) {
          throw Error(
            "The array returned from the .reply callback contains too many values"
          );
        }

        const [status, body = "", headers] = fullReplyResult;

        if (!Number.isInteger(status)) {
          throw new Error(`Invalid ${typeof status} value for status code`);
        }

        response.statusCode = status;
        response.rawHeaders.push(...common.headersInputToRawArray(headers));
        debug("response.rawHeaders after reply: %j", response.rawHeaders);

        return body;
      }

      /**
       * Determine which of the default headers should be added to the response.
       *
       * Don't include any defaults whose case-insensitive keys are already on the response.
       */
      function selectDefaultHeaders(existingHeaders, defaultHeaders) {
        if (!defaultHeaders.length) {
          return []; // return early if we don't need to bother
        }

        const definedHeaders = new Set();
        const result = [];

        common.forEachHeader(existingHeaders, (_, fieldName) => {
          definedHeaders.add(fieldName.toLowerCase());
        });
        common.forEachHeader(defaultHeaders, (value, fieldName) => {
          if (!definedHeaders.has(fieldName.toLowerCase())) {
            result.push(fieldName, value);
          }
        });

        return result;
      }

      // Presents a list of Buffers as a Readable
      class ReadableBuffers extends stream.Readable {
        constructor(buffers, opts = {}) {
          super(opts);

          this.buffers = buffers;
        }

        _read(_size) {
          while (this.buffers.length) {
            if (!this.push(this.buffers.shift())) {
              return;
            }
          }
          this.push(null);
        }
      }

      function convertBodyToStream(body) {
        if (common.isStream(body)) {
          return body;
        }

        if (body === undefined) {
          return new ReadableBuffers([]);
        }

        if (Buffer.isBuffer(body)) {
          return new ReadableBuffers([body]);
        }

        if (typeof body !== "string") {
          body = JSON.stringify(body);
        }

        return new ReadableBuffers([Buffer.from(body)]);
      }

      /**
       * Play back an interceptor using the given request and mock response.
       */
      function playbackInterceptor({
        req,
        socket,
        options,
        requestBodyString,
        requestBodyIsUtf8Representable,
        response,
        interceptor,
      }) {
        const { logger } = interceptor.scope;

        function start() {
          req.headers = req.getHeaders();

          interceptor.scope.emit(
            "request",
            req,
            interceptor,
            requestBodyString
          );

          if (typeof interceptor.errorMessage !== "undefined") {
            let error;
            if (typeof interceptor.errorMessage === "object") {
              error = interceptor.errorMessage;
            } else {
              error = new Error(interceptor.errorMessage);
            }

            const delay =
              interceptor.delayBodyInMs + interceptor.delayConnectionInMs;
            common.setTimeout(() => req.destroy(error), delay);
            return;
          }

          // This will be null if we have a fullReplyFunction,
          // in that case status code will be set in `parseFullReplyResult`
          response.statusCode = interceptor.statusCode;

          // Clone headers/rawHeaders to not override them when evaluating later
          response.rawHeaders = [...interceptor.rawHeaders];
          logger("response.rawHeaders:", response.rawHeaders);

          // TODO: MAJOR: Don't tack the request onto the interceptor.
          // The only reason we do this is so that it's available inside reply functions.
          // It would be better to pass the request as an argument to the functions instead.
          // Not adding the req as a third arg now because it should first be decided if (path, body, req)
          // is the signature we want to go with going forward.
          interceptor.req = req;

          if (interceptor.replyFunction) {
            const parsedRequestBody = parseJSONRequestBody(
              req,
              requestBodyString
            );

            let fn = interceptor.replyFunction;
            if (fn.length === 3) {
              // Handle the case of an async reply function, the third parameter being the callback.
              fn = util.promisify(fn);
            }

            // At this point `fn` is either a synchronous function or a promise-returning function;
            // wrapping in `Promise.resolve` makes it into a promise either way.
            Promise.resolve(
              fn.call(interceptor, options.path, parsedRequestBody)
            )
              .then(continueWithResponseBody)
              .catch((err) => req.destroy(err));
            return;
          }

          if (interceptor.fullReplyFunction) {
            const parsedRequestBody = parseJSONRequestBody(
              req,
              requestBodyString
            );

            let fn = interceptor.fullReplyFunction;
            if (fn.length === 3) {
              fn = util.promisify(fn);
            }

            Promise.resolve(
              fn.call(interceptor, options.path, parsedRequestBody)
            )
              .then(continueWithFullResponse)
              .catch((err) => req.destroy(err));
            return;
          }

          if (
            common.isContentEncoded(interceptor.headers) &&
            !common.isStream(interceptor.body)
          ) {
            //  If the content is encoded we know that the response body *must* be an array
            //  of response buffers which should be mocked one by one.
            //  (otherwise decompressions after the first one fails as unzip expects to receive
            //  buffer by buffer and not one single merged buffer)
            const bufferData = Array.isArray(interceptor.body)
              ? interceptor.body
              : [interceptor.body];
            const responseBuffers = bufferData.map((data) =>
              Buffer.from(data, "hex")
            );
            const responseBody = new ReadableBuffers(responseBuffers);
            continueWithResponseBody(responseBody);
            return;
          }

          // If we get to this point, the body is either a string or an object that
          // will eventually be JSON stringified.
          let responseBody = interceptor.body;

          // If the request was not UTF8-representable then we assume that the
          // response won't be either. In that case we send the response as a Buffer
          // object as that's what the client will expect.
          if (
            !requestBodyIsUtf8Representable &&
            typeof responseBody === "string"
          ) {
            // Try to create the buffer from the interceptor's body response as hex.
            responseBody = Buffer.from(responseBody, "hex");

            // Creating buffers does not necessarily throw errors; check for difference in size.
            if (
              !responseBody ||
              (interceptor.body.length > 0 && responseBody.length === 0)
            ) {
              // We fallback on constructing buffer from utf8 representation of the body.
              responseBody = Buffer.from(interceptor.body, "utf8");
            }
          }

          return continueWithResponseBody(responseBody);
        }

        function continueWithFullResponse(fullReplyResult) {
          let responseBody;
          try {
            responseBody = parseFullReplyResult(response, fullReplyResult);
          } catch (err) {
            req.destroy(err);
            return;
          }

          continueWithResponseBody(responseBody);
        }

        function prepareResponseHeaders(body) {
          const defaultHeaders = [...interceptor.scope._defaultReplyHeaders];

          // Include a JSON content type when JSON.stringify is called on the body.
          // This is a convenience added by Nock that has no analog in Node. It's added to the
          // defaults, so it will be ignored if the caller explicitly provided the header already.
          const isJSON =
            body !== undefined &&
            typeof body !== "string" &&
            !Buffer.isBuffer(body) &&
            !common.isStream(body);

          if (isJSON) {
            defaultHeaders.push("Content-Type", "application/json");
          }

          response.rawHeaders.push(
            ...selectDefaultHeaders(response.rawHeaders, defaultHeaders)
          );

          // Evaluate functional headers.
          common.forEachHeader(response.rawHeaders, (value, fieldName, i) => {
            if (typeof value === "function") {
              response.rawHeaders[i + 1] = value(req, response, body);
            }
          });

          response.headers = common.headersArrayToObject(response.rawHeaders);
        }

        function continueWithResponseBody(rawBody) {
          prepareResponseHeaders(rawBody);
          const bodyAsStream = convertBodyToStream(rawBody);
          bodyAsStream.pause();

          // IncomingMessage extends Readable so we can't simply pipe.
          bodyAsStream.on("data", function (chunk) {
            response.push(chunk);
          });
          bodyAsStream.on("end", function () {
            // https://nodejs.org/dist/latest-v10.x/docs/api/http.html#http_message_complete
            response.complete = true;
            response.push(null);

            interceptor.scope.emit("replied", req, interceptor);
          });
          bodyAsStream.on("error", function (err) {
            response.emit("error", err);
          });

          const { delayBodyInMs, delayConnectionInMs } = interceptor;

          function respond() {
            if (common.isRequestDestroyed(req)) {
              return;
            }

            // Even though we've had the response object for awhile at this point,
            // we only attach it to the request immediately before the `response`
            // event because, as in Node, it alters the error handling around aborts.
            req.res = response;
            response.req = req;

            logger("emitting response");
            req.emit("response", response);

            common.setTimeout(() => bodyAsStream.resume(), delayBodyInMs);
          }

          socket.applyDelay(delayConnectionInMs);
          common.setTimeout(respond, delayConnectionInMs);
        }

        // Calling `start` immediately could take the request all the way to the connection delay
        // during a single microtask execution. This setImmediate stalls the playback to ensure the
        // correct events are emitted first ('socket', 'finish') and any aborts in the queue or
        // called during a 'finish' listener can be called.
        common.setImmediate(() => {
          if (!common.isRequestDestroyed(req)) {
            start();
          }
        });
      }

      module.exports = { playbackInterceptor };

      /***/
    },

    /***/ 8687: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";

      const debug = __nccwpck_require__(8237)("nock.recorder");
      const querystring = __nccwpck_require__(3477);
      const { inspect } = __nccwpck_require__(3837);

      const common = __nccwpck_require__(1521);
      const { restoreOverriddenClientRequest } = __nccwpck_require__(7607);

      const SEPARATOR = "\n<<<<<<-- cut here -->>>>>>\n";
      let recordingInProgress = false;
      let outputs = [];

      function getScope(options) {
        const { proto, host, port } = common.normalizeRequestOptions(options);
        return common.normalizeOrigin(proto, host, port);
      }

      function getMethod(options) {
        return options.method || "GET";
      }

      function getBodyFromChunks(chunks, headers) {
        // If we have headers and there is content-encoding it means that the body
        // shouldn't be merged but instead persisted as an array of hex strings so
        // that the response chunks can be mocked one by one.
        if (headers && common.isContentEncoded(headers)) {
          return {
            body: chunks.map((chunk) => chunk.toString("hex")),
          };
        }

        const mergedBuffer = Buffer.concat(chunks);

        // The merged buffer can be one of three things:
        // 1. A UTF-8-representable string buffer which represents a JSON object.
        // 2. A UTF-8-representable buffer which doesn't represent a JSON object.
        // 3. A non-UTF-8-representable buffer which then has to be recorded as a hex string.
        const isUtf8Representable = common.isUtf8Representable(mergedBuffer);
        if (isUtf8Representable) {
          const maybeStringifiedJson = mergedBuffer.toString("utf8");
          try {
            return {
              isUtf8Representable,
              body: JSON.parse(maybeStringifiedJson),
            };
          } catch (err) {
            return {
              isUtf8Representable,
              body: maybeStringifiedJson,
            };
          }
        } else {
          return {
            isUtf8Representable,
            body: mergedBuffer.toString("hex"),
          };
        }
      }

      function generateRequestAndResponseObject({
        req,
        bodyChunks,
        options,
        res,
        dataChunks,
        reqheaders,
      }) {
        const { body, isUtf8Representable } = getBodyFromChunks(
          dataChunks,
          res.headers
        );
        options.path = req.path;

        return {
          scope: getScope(options),
          method: getMethod(options),
          path: options.path,
          // Is it deliberate that `getBodyFromChunks()` is called a second time?
          body: getBodyFromChunks(bodyChunks).body,
          status: res.statusCode,
          response: body,
          rawHeaders: res.rawHeaders,
          reqheaders: reqheaders || undefined,
          // When content-encoding is enabled, isUtf8Representable is `undefined`,
          // so we explicitly check for `false`.
          responseIsBinary: isUtf8Representable === false,
        };
      }

      function generateRequestAndResponse({
        req,
        bodyChunks,
        options,
        res,
        dataChunks,
        reqheaders,
      }) {
        const requestBody = getBodyFromChunks(bodyChunks).body;
        const responseBody = getBodyFromChunks(dataChunks, res.headers).body;

        // Remove any query params from options.path so they can be added in the query() function
        let { path } = options;
        const queryIndex = req.path.indexOf("?");
        let queryObj = {};
        if (queryIndex !== -1) {
          // Remove the query from the path
          path = path.substring(0, queryIndex);

          const queryStr = req.path.slice(queryIndex + 1);
          queryObj = querystring.parse(queryStr);
        }

        // Escape any single quotes in the path as the output uses them
        path = path.replace(/'/g, `\\'`);

        // Always encode the query parameters when recording.
        const encodedQueryObj = {};
        for (const key in queryObj) {
          const formattedPair = common.formatQueryValue(
            key,
            queryObj[key],
            common.percentEncode
          );
          encodedQueryObj[formattedPair[0]] = formattedPair[1];
        }

        const lines = [];

        // We want a leading newline.
        lines.push("");

        const scope = getScope(options);
        lines.push(`nock('${scope}', {"encodedQueryParams":true})`);

        const methodName = getMethod(options).toLowerCase();
        if (requestBody) {
          lines.push(
            `  .${methodName}('${path}', ${JSON.stringify(requestBody)})`
          );
        } else {
          lines.push(`  .${methodName}('${path}')`);
        }

        Object.entries(reqheaders || {}).forEach(([fieldName, fieldValue]) => {
          const safeName = JSON.stringify(fieldName);
          const safeValue = JSON.stringify(fieldValue);
          lines.push(`  .matchHeader(${safeName}, ${safeValue})`);
        });

        if (queryIndex !== -1) {
          lines.push(`  .query(${JSON.stringify(encodedQueryObj)})`);
        }

        const statusCode = res.statusCode.toString();
        const stringifiedResponseBody = JSON.stringify(responseBody);
        const headers = inspect(res.rawHeaders);
        lines.push(
          `  .reply(${statusCode}, ${stringifiedResponseBody}, ${headers});`
        );

        return lines.join("\n");
      }

      //  This module variable is used to identify a unique recording ID in order to skip
      //  spurious requests that sometimes happen. This problem has been, so far,
      //  exclusively detected in nock's unit testing where 'checks if callback is specified'
      //  interferes with other tests as its t.end() is invoked without waiting for request
      //  to finish (which is the point of the test).
      let currentRecordingId = 0;

      const defaultRecordOptions = {
        dont_print: false,
        enable_reqheaders_recording: false,
        logging: console.log, // eslint-disable-line no-console
        output_objects: false,
        use_separator: true,
      };

      function record(recOptions) {
        //  Trying to start recording with recording already in progress implies an error
        //  in the recording configuration (double recording makes no sense and used to lead
        //  to duplicates in output)
        if (recordingInProgress) {
          throw new Error("Nock recording already in progress");
        }

        recordingInProgress = true;

        // Set the new current recording ID and capture its value in this instance of record().
        currentRecordingId = currentRecordingId + 1;
        const thisRecordingId = currentRecordingId;

        // Originally the parameter was a dont_print boolean flag.
        // To keep the existing code compatible we take that case into account.
        if (typeof recOptions === "boolean") {
          recOptions = { dont_print: recOptions };
        }

        recOptions = { ...defaultRecordOptions, ...recOptions };

        debug("start recording", thisRecordingId, recOptions);

        const {
          dont_print: dontPrint,
          enable_reqheaders_recording: enableReqHeadersRecording,
          logging,
          output_objects: outputObjects,
          use_separator: useSeparator,
        } = recOptions;

        debug(
          thisRecordingId,
          "restoring overridden requests before new overrides"
        );
        //  To preserve backward compatibility (starting recording wasn't throwing if nock was already active)
        //  we restore any requests that may have been overridden by other parts of nock (e.g. intercept)
        //  NOTE: This is hacky as hell but it keeps the backward compatibility *and* allows correct
        //    behavior in the face of other modules also overriding ClientRequest.
        common.restoreOverriddenRequests();
        //  We restore ClientRequest as it messes with recording of modules that also override ClientRequest (e.g. xhr2)
        restoreOverriddenClientRequest();

        //  We override the requests so that we can save information on them before executing.
        common.overrideRequests(function (proto, overriddenRequest, rawArgs) {
          const { options, callback } = common.normalizeClientRequestArgs(
            ...rawArgs
          );
          const bodyChunks = [];

          // Node 0.11 https.request calls http.request -- don't want to record things
          // twice.
          /* istanbul ignore if */
          if (options._recording) {
            return overriddenRequest(options, callback);
          }
          options._recording = true;

          const req = overriddenRequest(options, function (res) {
            debug(thisRecordingId, "intercepting", proto, "request to record");

            //  We put our 'end' listener to the front of the listener array.
            res.once("end", function () {
              debug(thisRecordingId, proto, "intercepted request ended");

              let reqheaders;
              // Ignore request headers completely unless it was explicitly enabled by the user (see README)
              if (enableReqHeadersRecording) {
                // We never record user-agent headers as they are worse than useless -
                // they actually make testing more difficult without providing any benefit (see README)
                reqheaders = req.getHeaders();
                common.deleteHeadersField(reqheaders, "user-agent");
              }

              const generateFn = outputObjects
                ? generateRequestAndResponseObject
                : generateRequestAndResponse;
              let out = generateFn({
                req,
                bodyChunks,
                options,
                res,
                dataChunks,
                reqheaders,
              });

              debug("out:", out);

              //  Check that the request was made during the current recording.
              //  If it hasn't then skip it. There is no other simple way to handle
              //  this as it depends on the timing of requests and responses. Throwing
              //  will make some recordings/unit tests fail randomly depending on how
              //  fast/slow the response arrived.
              //  If you are seeing this error then you need to make sure that all
              //  the requests made during a single recording session finish before
              //  ending the same recording session.
              if (thisRecordingId !== currentRecordingId) {
                debug("skipping recording of an out-of-order request", out);
                return;
              }

              outputs.push(out);

              if (!dontPrint) {
                if (useSeparator) {
                  if (typeof out !== "string") {
                    out = JSON.stringify(out, null, 2);
                  }
                  logging(SEPARATOR + out + SEPARATOR);
                } else {
                  logging(out);
                }
              }
            });

            let encoding;
            // We need to be aware of changes to the stream's encoding so that we
            // don't accidentally mangle the data.
            const { setEncoding } = res;
            res.setEncoding = function (newEncoding) {
              encoding = newEncoding;
              return setEncoding.apply(this, arguments);
            };

            const dataChunks = [];
            // Replace res.push with our own implementation that stores chunks
            const origResPush = res.push;
            res.push = function (data) {
              if (data) {
                if (encoding) {
                  data = Buffer.from(data, encoding);
                }
                dataChunks.push(data);
              }

              return origResPush.call(res, data);
            };

            if (callback) {
              callback(res, options, callback);
            }

            debug("finished setting up intercepting");

            // We override both the http and the https modules; when we are
            // serializing the request, we need to know which was called.
            // By stuffing the state, we can make sure that nock records
            // the intended protocol.
            if (proto === "https") {
              options.proto = "https";
            }
          });

          const recordChunk = (chunk, encoding) => {
            debug(thisRecordingId, "new", proto, "body chunk");
            if (!Buffer.isBuffer(chunk)) {
              chunk = Buffer.from(chunk, encoding);
            }
            bodyChunks.push(chunk);
          };

          const oldWrite = req.write;
          req.write = function (chunk, encoding) {
            if (typeof chunk !== "undefined") {
              recordChunk(chunk, encoding);
              oldWrite.apply(req, arguments);
            } else {
              throw new Error("Data was undefined.");
            }
          };

          // Starting in Node 8, `OutgoingMessage.end()` directly calls an internal
          // `write_` function instead of proxying to the public
          // `OutgoingMessage.write()` method, so we have to wrap `end` too.
          const oldEnd = req.end;
          req.end = function (chunk, encoding, callback) {
            debug("req.end");
            if (typeof chunk === "function") {
              callback = chunk;
              chunk = null;
            } else if (typeof encoding === "function") {
              callback = encoding;
              encoding = null;
            }

            if (chunk) {
              recordChunk(chunk, encoding);
            }
            oldEnd.call(req, chunk, encoding, callback);
          };

          return req;
        });
      }

      // Restore *all* the overridden http/https modules' properties.
      function restore() {
        debug(
          currentRecordingId,
          "restoring all the overridden http/https properties"
        );

        common.restoreOverriddenRequests();
        restoreOverriddenClientRequest();
        recordingInProgress = false;
      }

      function clear() {
        outputs = [];
      }

      module.exports = {
        record,
        outputs: () => outputs,
        restore,
        clear,
      };

      /***/
    },

    /***/ 7004: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";

      /**
       * @module nock/scope
       */
      const { addInterceptor, isOn } = __nccwpck_require__(7607);
      const common = __nccwpck_require__(1521);
      const assert = __nccwpck_require__(9491);
      const url = __nccwpck_require__(7310);
      const debug = __nccwpck_require__(8237)("nock.scope");
      const { EventEmitter } = __nccwpck_require__(2361);
      const Interceptor = __nccwpck_require__(5419);

      const { URL, Url: LegacyUrl } = url;
      let fs;

      try {
        fs = __nccwpck_require__(7147);
      } catch (err) {
        // do nothing, we're in the browser
      }

      /**
       * Normalizes the passed url for consistent internal processing
       * @param {string|LegacyUrl|URL} u
       */
      function normalizeUrl(u) {
        if (!(u instanceof URL)) {
          if (u instanceof LegacyUrl) {
            return normalizeUrl(new URL(url.format(u)));
          }
          // If the url is invalid, let the URL library report it
          return normalizeUrl(new URL(u));
        }

        if (!/https?:/.test(u.protocol)) {
          throw new TypeError(
            `Protocol '${u.protocol}' not recognized. This commonly occurs when a hostname and port are included without a protocol, producing a URL that is valid but confusing, and probably not what you want.`
          );
        }

        return {
          href: u.href,
          origin: u.origin,
          protocol: u.protocol,
          username: u.username,
          password: u.password,
          host: u.host,
          hostname:
            // strip brackets from IPv6
            typeof u.hostname === "string" && u.hostname.startsWith("[")
              ? u.hostname.slice(1, -1)
              : u.hostname,
          port: u.port || (u.protocol === "http:" ? 80 : 443),
          pathname: u.pathname,
          search: u.search,
          searchParams: u.searchParams,
          hash: u.hash,
        };
      }

      /**
       * @param  {string|RegExp|LegacyUrl|URL} basePath
       * @param  {Object}   options
       * @param  {boolean}  options.allowUnmocked
       * @param  {string[]} options.badheaders
       * @param  {function} options.conditionally
       * @param  {boolean}  options.encodedQueryParams
       * @param  {function} options.filteringScope
       * @param  {Object}   options.reqheaders
       * @constructor
       */
      class Scope extends EventEmitter {
        constructor(basePath, options) {
          super();

          this.keyedInterceptors = {};
          this.interceptors = [];
          this.transformPathFunction = null;
          this.transformRequestBodyFunction = null;
          this.matchHeaders = [];
          this.scopeOptions = options || {};
          this.urlParts = {};
          this._persist = false;
          this.contentLen = false;
          this.date = null;
          this.basePath = basePath;
          this.basePathname = "";
          this.port = null;
          this._defaultReplyHeaders = [];

          let logNamespace = String(basePath);

          if (!(basePath instanceof RegExp)) {
            this.urlParts = normalizeUrl(basePath);
            this.port = this.urlParts.port;
            this.basePathname = this.urlParts.pathname.replace(/\/$/, "");
            this.basePath = `${this.urlParts.protocol}//${this.urlParts.hostname}:${this.port}`;
            logNamespace = this.urlParts.host;
          }

          this.logger = debug.extend(logNamespace);
        }

        add(key, interceptor) {
          if (!(key in this.keyedInterceptors)) {
            this.keyedInterceptors[key] = [];
          }
          this.keyedInterceptors[key].push(interceptor);
          addInterceptor(
            this.basePath,
            interceptor,
            this,
            this.scopeOptions,
            this.urlParts.hostname
          );
        }

        remove(key, interceptor) {
          if (this._persist) {
            return;
          }
          const arr = this.keyedInterceptors[key];
          if (arr) {
            arr.splice(arr.indexOf(interceptor), 1);
            if (arr.length === 0) {
              delete this.keyedInterceptors[key];
            }
          }
        }

        intercept(uri, method, requestBody, interceptorOptions) {
          const ic = new Interceptor(
            this,
            uri,
            method,
            requestBody,
            interceptorOptions
          );

          this.interceptors.push(ic);
          return ic;
        }

        get(uri, requestBody, options) {
          return this.intercept(uri, "GET", requestBody, options);
        }

        post(uri, requestBody, options) {
          return this.intercept(uri, "POST", requestBody, options);
        }

        put(uri, requestBody, options) {
          return this.intercept(uri, "PUT", requestBody, options);
        }

        head(uri, requestBody, options) {
          return this.intercept(uri, "HEAD", requestBody, options);
        }

        patch(uri, requestBody, options) {
          return this.intercept(uri, "PATCH", requestBody, options);
        }

        merge(uri, requestBody, options) {
          return this.intercept(uri, "MERGE", requestBody, options);
        }

        delete(uri, requestBody, options) {
          return this.intercept(uri, "DELETE", requestBody, options);
        }

        options(uri, requestBody, options) {
          return this.intercept(uri, "OPTIONS", requestBody, options);
        }

        // Returns the list of keys for non-optional Interceptors that haven't been completed yet.
        // TODO: This assumes that completed mocks are removed from the keyedInterceptors list
        // (when persistence is off). We should change that (and this) in future.
        pendingMocks() {
          return this.activeMocks().filter((key) =>
            this.keyedInterceptors[key].some(
              ({ interceptionCounter, optional }) => {
                const persistedAndUsed =
                  this._persist && interceptionCounter > 0;
                return !persistedAndUsed && !optional;
              }
            )
          );
        }

        // Returns all keyedInterceptors that are active.
        // This includes incomplete interceptors, persisted but complete interceptors, and
        // optional interceptors, but not non-persisted and completed interceptors.
        activeMocks() {
          return Object.keys(this.keyedInterceptors);
        }

        isDone() {
          if (!isOn()) {
            return true;
          }

          return this.pendingMocks().length === 0;
        }

        done() {
          assert.ok(
            this.isDone(),
            `Mocks not yet satisfied:\n${this.pendingMocks().join("\n")}`
          );
        }

        buildFilter() {
          const filteringArguments = arguments;

          if (arguments[0] instanceof RegExp) {
            return function (candidate) {
              /* istanbul ignore if */
              if (typeof candidate !== "string") {
                // Given the way nock is written, it seems like `candidate` will always
                // be a string, regardless of what options might be passed to it.
                // However the code used to contain a truthiness test of `candidate`.
                // The check is being preserved for now.
                throw Error(
                  `Nock internal assertion failed: typeof candidate is ${typeof candidate}. If you encounter this error, please report it as a bug.`
                );
              }
              return candidate.replace(
                filteringArguments[0],
                filteringArguments[1]
              );
            };
          } else if (typeof arguments[0] === "function") {
            return arguments[0];
          }
        }

        filteringPath() {
          this.transformPathFunction = this.buildFilter.apply(this, arguments);
          if (!this.transformPathFunction) {
            throw new Error(
              "Invalid arguments: filtering path should be a function or a regular expression"
            );
          }
          return this;
        }

        filteringRequestBody() {
          this.transformRequestBodyFunction = this.buildFilter.apply(
            this,
            arguments
          );
          if (!this.transformRequestBodyFunction) {
            throw new Error(
              "Invalid arguments: filtering request body should be a function or a regular expression"
            );
          }
          return this;
        }

        matchHeader(name, value) {
          //  We use lower-case header field names throughout Nock.
          this.matchHeaders.push({ name: name.toLowerCase(), value });
          return this;
        }

        defaultReplyHeaders(headers) {
          this._defaultReplyHeaders = common.headersInputToRawArray(headers);
          return this;
        }

        persist(flag = true) {
          if (typeof flag !== "boolean") {
            throw new Error("Invalid arguments: argument should be a boolean");
          }
          this._persist = flag;
          return this;
        }

        /**
         * @private
         * @returns {boolean}
         */
        shouldPersist() {
          return this._persist;
        }

        replyContentLength() {
          this.contentLen = true;
          return this;
        }

        replyDate(d) {
          this.date = d || new Date();
          return this;
        }

        clone() {
          return new Scope(this.basePath, this.scopeOptions);
        }
      }

      function loadDefs(path) {
        if (!fs) {
          throw new Error("No fs");
        }

        const contents = fs.readFileSync(path);
        return JSON.parse(contents);
      }

      function load(path) {
        return define(loadDefs(path));
      }

      function getStatusFromDefinition(nockDef) {
        // Backward compatibility for when `status` was encoded as string in `reply`.
        if (nockDef.reply !== undefined) {
          const parsedReply = parseInt(nockDef.reply, 10);
          if (isNaN(parsedReply)) {
            throw Error("`reply`, when present, must be a numeric string");
          }

          return parsedReply;
        }

        const DEFAULT_STATUS_OK = 200;
        return nockDef.status || DEFAULT_STATUS_OK;
      }

      function getScopeFromDefinition(nockDef) {
        //  Backward compatibility for when `port` was part of definition.
        if (nockDef.port !== undefined) {
          //  Include `port` into scope if it doesn't exist.
          const options = url.parse(nockDef.scope);
          if (options.port === null) {
            return `${nockDef.scope}:${nockDef.port}`;
          } else {
            if (parseInt(options.port) !== parseInt(nockDef.port)) {
              throw new Error(
                "Mismatched port numbers in scope and port properties of nock definition."
              );
            }
          }
        }

        return nockDef.scope;
      }

      function tryJsonParse(string) {
        try {
          return JSON.parse(string);
        } catch (err) {
          return string;
        }
      }

      function define(nockDefs) {
        const scopes = [];

        nockDefs.forEach(function (nockDef) {
          const nscope = getScopeFromDefinition(nockDef);
          const npath = nockDef.path;
          if (!nockDef.method) {
            throw Error("Method is required");
          }
          const method = nockDef.method.toLowerCase();
          const status = getStatusFromDefinition(nockDef);
          const rawHeaders = nockDef.rawHeaders || [];
          const reqheaders = nockDef.reqheaders || {};
          const badheaders = nockDef.badheaders || [];
          const options = { ...nockDef.options };

          //  We use request headers for both filtering (see below) and mocking.
          //  Here we are setting up mocked request headers but we don't want to
          //  be changing the user's options object so we clone it first.
          options.reqheaders = reqheaders;
          options.badheaders = badheaders;

          // Response is not always JSON as it could be a string or binary data or
          // even an array of binary buffers (e.g. when content is encoded).
          let response;
          if (!nockDef.response) {
            response = "";
            // TODO: Rename `responseIsBinary` to `responseIsUtf8Representable`.
          } else if (nockDef.responseIsBinary) {
            response = Buffer.from(nockDef.response, "hex");
          } else {
            response =
              typeof nockDef.response === "string"
                ? tryJsonParse(nockDef.response)
                : nockDef.response;
          }

          const scope = new Scope(nscope, options);

          // If request headers were specified filter by them.
          Object.entries(reqheaders).forEach(([fieldName, value]) => {
            scope.matchHeader(fieldName, value);
          });

          const acceptableFilters = ["filteringRequestBody", "filteringPath"];
          acceptableFilters.forEach((filter) => {
            if (nockDef[filter]) {
              scope[filter](nockDef[filter]);
            }
          });

          scope
            .intercept(npath, method, nockDef.body)
            .reply(status, response, rawHeaders);

          scopes.push(scope);
        });

        return scopes;
      }

      module.exports = {
        Scope,
        load,
        loadDefs,
        define,
      };

      /***/
    },

    /***/ 5676: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      "use strict";

      const { EventEmitter } = __nccwpck_require__(2361);
      const debug = __nccwpck_require__(8237)("nock.socket");

      module.exports = class Socket extends EventEmitter {
        constructor(options) {
          super();

          // Pretend this is a TLSSocket
          if (options.proto === "https") {
            // https://github.com/nock/nock/issues/158
            this.authorized = true;
            // https://github.com/nock/nock/issues/2147
            this.encrypted = true;
          }

          this.bufferSize = 0;
          this.writableLength = 0;
          this.writable = true;
          this.readable = true;
          this.pending = false;
          this.destroyed = false;
          this.connecting = true;

          // Undocumented flag used by ClientRequest to ensure errors aren't double-fired
          this._hadError = false;

          // Maximum allowed delay. 0 means unlimited.
          this.timeout = 0;

          const ipv6 = options.family === 6;
          this.remoteFamily = ipv6 ? "IPv6" : "IPv4";
          this.localAddress = this.remoteAddress = ipv6 ? "::1" : "127.0.0.1";
          this.localPort = this.remotePort = parseInt(options.port);
        }

        setNoDelay() {}
        setKeepAlive() {}
        resume() {}
        ref() {}
        unref() {}
        write() {}

        address() {
          return {
            port: this.remotePort,
            family: this.remoteFamily,
            address: this.remoteAddress,
          };
        }

        setTimeout(timeoutMs, fn) {
          this.timeout = timeoutMs;
          if (fn) {
            this.once("timeout", fn);
          }
          return this;
        }

        /**
         * Artificial delay that will trip socket timeouts when appropriate.
         *
         * Doesn't actually wait for time to pass.
         * Timeout events don't necessarily end the request.
         * While many clients choose to abort the request upon a timeout, Node itself does not.
         */
        applyDelay(delayMs) {
          if (this.timeout && delayMs > this.timeout) {
            debug("socket timeout");
            this.emit("timeout");
          }
        }

        getPeerCertificate() {
          return Buffer.from(
            (Math.random() * 10000 + Date.now()).toString()
          ).toString("base64");
        }

        /**
         * Denotes that no more I/O activity should happen on this socket.
         *
         * The implementation in Node if far more complex as it juggles underlying async streams.
         * For the purposes of Nock, we just need it to set some flags and on the first call
         * emit a 'close' and optional 'error' event. Both events propagate through the request object.
         */
        destroy(err) {
          if (this.destroyed) {
            return this;
          }

          debug("socket destroy");
          this.destroyed = true;
          this.readable = this.writable = false;
          this.readableEnded = this.writableFinished = true;

          process.nextTick(() => {
            if (err) {
              this._hadError = true;
              this.emit("error", err);
            }
            this.emit("close");
          });

          return this;
        }
      };

      /***/
    },

    /***/ 7760: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__
    ) => {
      /*! node-domexception. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */

      if (!globalThis.DOMException) {
        try {
          const { MessageChannel } = __nccwpck_require__(1267),
            port = new MessageChannel().port1,
            ab = new ArrayBuffer();
          port.postMessage(ab, [ab, ab]);
        } catch (err) {
          err.constructor.name === "DOMException" &&
            (globalThis.DOMException = err.constructor);
        }
      }

      module.exports = globalThis.DOMException;

      /***/
    },

    /***/ 467: /***/ (module, exports, __nccwpck_require__) => {
      "use strict";

      Object.defineProperty(exports, "__esModule", { value: true });

      function _interopDefault(ex) {
        return ex && typeof ex === "object" && "default" in ex
          ? ex["default"]
          : ex;
      }

      var Stream = _interopDefault(__nccwpck_require__(2781));
      var http = _interopDefault(__nccwpck_require__(3685));
      var Url = _interopDefault(__nccwpck_require__(7310));
      var whatwgUrl = _interopDefault(__nccwpck_require__(8665));
      var https = _interopDefault(__nccwpck_require__(5687));
      var zlib = _interopDefault(__nccwpck_require__(9796));

      // Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

      // fix for "Readable" isn't a named export issue
      const Readable = Stream.Readable;

      const BUFFER = Symbol("buffer");
      const TYPE = Symbol("type");

      class Blob {
        constructor() {
          this[TYPE] = "";

          const blobParts = arguments[0];
          const options = arguments[1];

          const buffers = [];
          let size = 0;

          if (blobParts) {
            const a = blobParts;
            const length = Number(a.length);
            for (let i = 0; i < length; i++) {
              const element = a[i];
              let buffer;
              if (element instanceof Buffer) {
                buffer = element;
              } else if (ArrayBuffer.isView(element)) {
                buffer = Buffer.from(
                  element.buffer,
                  element.byteOffset,
                  element.byteLength
                );
              } else if (element instanceof ArrayBuffer) {
                buffer = Buffer.from(element);
              } else if (element instanceof Blob) {
                buffer = element[BUFFER];
              } else {
                buffer = Buffer.from(
                  typeof element === "string" ? element : String(element)
                );
              }
              size += buffer.length;
              buffers.push(buffer);
            }
          }

          this[BUFFER] = Buffer.concat(buffers);

          let type =
            options &&
            options.type !== undefined &&
            String(options.type).toLowerCase();
          if (type && !/[^\u0020-\u007E]/.test(type)) {
            this[TYPE] = type;
          }
        }
        get size() {
          return this[BUFFER].length;
        }
        get type() {
          return this[TYPE];
        }
        text() {
          return Promise.resolve(this[BUFFER].toString());
        }
        arrayBuffer() {
          const buf = this[BUFFER];
          const ab = buf.buffer.slice(
            buf.byteOffset,
            buf.byteOffset + buf.byteLength
          );
          return Promise.resolve(ab);
        }
        stream() {
          const readable = new Readable();
          readable._read = function () {};
          readable.push(this[BUFFER]);
          readable.push(null);
          return readable;
        }
        toString() {
          return "[object Blob]";
        }
        slice() {
          const size = this.size;

          const start = arguments[0];
          const end = arguments[1];
          let relativeStart, relativeEnd;
          if (start === undefined) {
            relativeStart = 0;
          } else if (start < 0) {
            relativeStart = Math.max(size + start, 0);
          } else {
            relativeStart = Math.min(start, size);
          }
          if (end === undefined) {
            relativeEnd = size;
          } else if (end < 0) {
            relativeEnd = Math.max(size + end, 0);
          } else {
            relativeEnd = Math.min(end, size);
          }
          const span = Math.max(relativeEnd - relativeStart, 0);

          const buffer = this[BUFFER];
          const slicedBuffer = buffer.slice(
            relativeStart,
            relativeStart + span
          );
          const blob = new Blob([], { type: arguments[2] });
          blob[BUFFER] = slicedBuffer;
          return blob;
        }
      }

      Object.defineProperties(Blob.prototype, {
        size: { enumerable: true },
        type: { enumerable: true },
        slice: { enumerable: true },
      });

      Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
        value: "Blob",
        writable: false,
        enumerable: false,
        configurable: true,
      });

      /**
       * fetch-error.js
       *
       * FetchError interface for operational errors
       */

      /**
       * Create FetchError instance
       *
       * @param   String      message      Error message for human
       * @param   String      type         Error type for machine
       * @param   String      systemError  For Node.js system error
       * @return  FetchError
       */
      function FetchError(message, type, systemError) {
        Error.call(this, message);

        this.message = message;
        this.type = type;

        // when err.type is `system`, err.code contains system error code
        if (systemError) {
          this.code = this.errno = systemError.code;
        }

        // hide custom error implementation details from end-users
        Error.captureStackTrace(this, this.constructor);
      }

      FetchError.prototype = Object.create(Error.prototype);
      FetchError.prototype.constructor = FetchError;
      FetchError.prototype.name = "FetchError";

      let convert;
      try {
        convert = __nccwpck_require__(2877).convert;
      } catch (e) {}

      const INTERNALS = Symbol("Body internals");

      // fix an issue where "PassThrough" isn't a named export for node <10
      const PassThrough = Stream.PassThrough;

      /**
       * Body mixin
       *
       * Ref: https://fetch.spec.whatwg.org/#body
       *
       * @param   Stream  body  Readable stream
       * @param   Object  opts  Response options
       * @return  Void
       */
      function Body(body) {
        var _this = this;

        var _ref =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {},
          _ref$size = _ref.size;

        let size = _ref$size === undefined ? 0 : _ref$size;
        var _ref$timeout = _ref.timeout;
        let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

        if (body == null) {
          // body is undefined or null
          body = null;
        } else if (isURLSearchParams(body)) {
          // body is a URLSearchParams
          body = Buffer.from(body.toString());
        } else if (isBlob(body));
        else if (Buffer.isBuffer(body));
        else if (
          Object.prototype.toString.call(body) === "[object ArrayBuffer]"
        ) {
          // body is ArrayBuffer
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          // body is ArrayBufferView
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof Stream);
        else {
          // none of the above
          // coerce to string then buffer
          body = Buffer.from(String(body));
        }
        this[INTERNALS] = {
          body,
          disturbed: false,
          error: null,
        };
        this.size = size;
        this.timeout = timeout;

        if (body instanceof Stream) {
          body.on("error", function (err) {
            const error =
              err.name === "AbortError"
                ? err
                : new FetchError(
                    `Invalid response body while trying to fetch ${_this.url}: ${err.message}`,
                    "system",
                    err
                  );
            _this[INTERNALS].error = error;
          });
        }
      }

      Body.prototype = {
        get body() {
          return this[INTERNALS].body;
        },

        get bodyUsed() {
          return this[INTERNALS].disturbed;
        },

        /**
         * Decode response as ArrayBuffer
         *
         * @return  Promise
         */
        arrayBuffer() {
          return consumeBody.call(this).then(function (buf) {
            return buf.buffer.slice(
              buf.byteOffset,
              buf.byteOffset + buf.byteLength
            );
          });
        },

        /**
         * Return raw response as Blob
         *
         * @return Promise
         */
        blob() {
          let ct = (this.headers && this.headers.get("content-type")) || "";
          return consumeBody.call(this).then(function (buf) {
            return Object.assign(
              // Prevent copying
              new Blob([], {
                type: ct.toLowerCase(),
              }),
              {
                [BUFFER]: buf,
              }
            );
          });
        },

        /**
         * Decode response as json
         *
         * @return  Promise
         */
        json() {
          var _this2 = this;

          return consumeBody.call(this).then(function (buffer) {
            try {
              return JSON.parse(buffer.toString());
            } catch (err) {
              return Body.Promise.reject(
                new FetchError(
                  `invalid json response body at ${_this2.url} reason: ${err.message}`,
                  "invalid-json"
                )
              );
            }
          });
        },

        /**
         * Decode response as text
         *
         * @return  Promise
         */
        text() {
          return consumeBody.call(this).then(function (buffer) {
            return buffer.toString();
          });
        },

        /**
         * Decode response as buffer (non-spec api)
         *
         * @return  Promise
         */
        buffer() {
          return consumeBody.call(this);
        },

        /**
         * Decode response as text, while automatically detecting the encoding and
         * trying to decode to UTF-8 (non-spec api)
         *
         * @return  Promise
         */
        textConverted() {
          var _this3 = this;

          return consumeBody.call(this).then(function (buffer) {
            return convertBody(buffer, _this3.headers);
          });
        },
      };

      // In browsers, all properties are enumerable.
      Object.defineProperties(Body.prototype, {
        body: { enumerable: true },
        bodyUsed: { enumerable: true },
        arrayBuffer: { enumerable: true },
        blob: { enumerable: true },
        json: { enumerable: true },
        text: { enumerable: true },
      });

      Body.mixIn = function (proto) {
        for (const name of Object.getOwnPropertyNames(Body.prototype)) {
          // istanbul ignore else: future proof
          if (!(name in proto)) {
            const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
            Object.defineProperty(proto, name, desc);
          }
        }
      };

      /**
       * Consume and convert an entire Body to a Buffer.
       *
       * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
       *
       * @return  Promise
       */
      function consumeBody() {
        var _this4 = this;

        if (this[INTERNALS].disturbed) {
          return Body.Promise.reject(
            new TypeError(`body used already for: ${this.url}`)
          );
        }

        this[INTERNALS].disturbed = true;

        if (this[INTERNALS].error) {
          return Body.Promise.reject(this[INTERNALS].error);
        }

        let body = this.body;

        // body is null
        if (body === null) {
          return Body.Promise.resolve(Buffer.alloc(0));
        }

        // body is blob
        if (isBlob(body)) {
          body = body.stream();
        }

        // body is buffer
        if (Buffer.isBuffer(body)) {
          return Body.Promise.resolve(body);
        }

        // istanbul ignore if: should never happen
        if (!(body instanceof Stream)) {
          return Body.Promise.resolve(Buffer.alloc(0));
        }

        // body is stream
        // get ready to actually consume the body
        let accum = [];
        let accumBytes = 0;
        let abort = false;

        return new Body.Promise(function (resolve, reject) {
          let resTimeout;

          // allow timeout on slow response body
          if (_this4.timeout) {
            resTimeout = setTimeout(function () {
              abort = true;
              reject(
                new FetchError(
                  `Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`,
                  "body-timeout"
                )
              );
            }, _this4.timeout);
          }

          // handle stream errors
          body.on("error", function (err) {
            if (err.name === "AbortError") {
              // if the request was aborted, reject with this Error
              abort = true;
              reject(err);
            } else {
              // other errors, such as incorrect content-encoding
              reject(
                new FetchError(
                  `Invalid response body while trying to fetch ${_this4.url}: ${err.message}`,
                  "system",
                  err
                )
              );
            }
          });

          body.on("data", function (chunk) {
            if (abort || chunk === null) {
              return;
            }

            if (_this4.size && accumBytes + chunk.length > _this4.size) {
              abort = true;
              reject(
                new FetchError(
                  `content size at ${_this4.url} over limit: ${_this4.size}`,
                  "max-size"
                )
              );
              return;
            }

            accumBytes += chunk.length;
            accum.push(chunk);
          });

          body.on("end", function () {
            if (abort) {
              return;
            }

            clearTimeout(resTimeout);

            try {
              resolve(Buffer.concat(accum, accumBytes));
            } catch (err) {
              // handle streams that have accumulated too much data (issue #414)
              reject(
                new FetchError(
                  `Could not create Buffer from response body for ${_this4.url}: ${err.message}`,
                  "system",
                  err
                )
              );
            }
          });
        });
      }

      /**
       * Detect buffer encoding and convert to target encoding
       * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
       *
       * @param   Buffer  buffer    Incoming buffer
       * @param   String  encoding  Target encoding
       * @return  String
       */
      function convertBody(buffer, headers) {
        if (typeof convert !== "function") {
          throw new Error(
            "The package `encoding` must be installed to use the textConverted() function"
          );
        }

        const ct = headers.get("content-type");
        let charset = "utf-8";
        let res, str;

        // header
        if (ct) {
          res = /charset=([^;]*)/i.exec(ct);
        }

        // no charset in content type, peek at response body for at most 1024 bytes
        str = buffer.slice(0, 1024).toString();

        // html5
        if (!res && str) {
          res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
        }

        // html4
        if (!res && str) {
          res =
            /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(
              str
            );
          if (!res) {
            res =
              /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(
                str
              );
            if (res) {
              res.pop(); // drop last quote
            }
          }

          if (res) {
            res = /charset=(.*)/i.exec(res.pop());
          }
        }

        // xml
        if (!res && str) {
          res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
        }

        // found charset
        if (res) {
          charset = res.pop();

          // prevent decode issues when sites use incorrect encoding
          // ref: https://hsivonen.fi/encoding-menu/
          if (charset === "gb2312" || charset === "gbk") {
            charset = "gb18030";
          }
        }

        // turn raw buffers into a single utf-8 buffer
        return convert(buffer, "UTF-8", charset).toString();
      }

      /**
       * Detect a URLSearchParams object
       * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
       *
       * @param   Object  obj     Object to detect by type or brand
       * @return  String
       */
      function isURLSearchParams(obj) {
        // Duck-typing as a necessary condition.
        if (
          typeof obj !== "object" ||
          typeof obj.append !== "function" ||
          typeof obj.delete !== "function" ||
          typeof obj.get !== "function" ||
          typeof obj.getAll !== "function" ||
          typeof obj.has !== "function" ||
          typeof obj.set !== "function"
        ) {
          return false;
        }

        // Brand-checking and more duck-typing as optional condition.
        return (
          obj.constructor.name === "URLSearchParams" ||
          Object.prototype.toString.call(obj) === "[object URLSearchParams]" ||
          typeof obj.sort === "function"
        );
      }

      /**
       * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
       * @param  {*} obj
       * @return {boolean}
       */
      function isBlob(obj) {
        return (
          typeof obj === "object" &&
          typeof obj.arrayBuffer === "function" &&
          typeof obj.type === "string" &&
          typeof obj.stream === "function" &&
          typeof obj.constructor === "function" &&
          typeof obj.constructor.name === "string" &&
          /^(Blob|File)$/.test(obj.constructor.name) &&
          /^(Blob|File)$/.test(obj[Symbol.toStringTag])
        );
      }

      /**
       * Clone body given Res/Req instance
       *
       * @param   Mixed  instance  Response or Request instance
       * @return  Mixed
       */
      function clone(instance) {
        let p1, p2;
        let body = instance.body;

        // don't allow cloning a used body
        if (instance.bodyUsed) {
          throw new Error("cannot clone body after it is used");
        }

        // check that body is a stream and not form-data object
        // note: we can't clone the form-data object without having it as a dependency
        if (body instanceof Stream && typeof body.getBoundary !== "function") {
          // tee instance body
          p1 = new PassThrough();
          p2 = new PassThrough();
          body.pipe(p1);
          body.pipe(p2);
          // set instance body to teed body and return the other teed body
          instance[INTERNALS].body = p1;
          body = p2;
        }

        return body;
      }

      /**
       * Performs the operation "extract a `Content-Type` value from |object|" as
       * specified in the specification:
       * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
       *
       * This function assumes that instance.body is present.
       *
       * @param   Mixed  instance  Any options.body input
       */
      function extractContentType(body) {
        if (body === null) {
          // body is null
          return null;
        } else if (typeof body === "string") {
          // body is string
          return "text/plain;charset=UTF-8";
        } else if (isURLSearchParams(body)) {
          // body is a URLSearchParams
          return "application/x-www-form-urlencoded;charset=UTF-8";
        } else if (isBlob(body)) {
          // body is blob
          return body.type || null;
        } else if (Buffer.isBuffer(body)) {
          // body is buffer
          return null;
        } else if (
          Object.prototype.toString.call(body) === "[object ArrayBuffer]"
        ) {
          // body is ArrayBuffer
          return null;
        } else if (ArrayBuffer.isView(body)) {
          // body is ArrayBufferView
          return null;
        } else if (typeof body.getBoundary === "function") {
          // detect form data input from form-data module
          return `multipart/form-data;boundary=${body.getBoundary()}`;
        } else if (body instanceof Stream) {
          // body is stream
          // can't really do much about this
          return null;
        } else {
          // Body constructor defaults other things to string
          return "text/plain;charset=UTF-8";
        }
      }

      /**
       * The Fetch Standard treats this as if "total bytes" is a property on the body.
       * For us, we have to explicitly get it with a function.
       *
       * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
       *
       * @param   Body    instance   Instance of Body
       * @return  Number?            Number of bytes, or null if not possible
       */
      function getTotalBytes(instance) {
        const body = instance.body;

        if (body === null) {
          // body is null
          return 0;
        } else if (isBlob(body)) {
          return body.size;
        } else if (Buffer.isBuffer(body)) {
          // body is buffer
          return body.length;
        } else if (body && typeof body.getLengthSync === "function") {
          // detect form data input from form-data module
          if (
            (body._lengthRetrievers && body._lengthRetrievers.length == 0) || // 1.x
            (body.hasKnownLength && body.hasKnownLength())
          ) {
            // 2.x
            return body.getLengthSync();
          }
          return null;
        } else {
          // body is stream
          return null;
        }
      }

      /**
       * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
       *
       * @param   Body    instance   Instance of Body
       * @return  Void
       */
      function writeToStream(dest, instance) {
        const body = instance.body;

        if (body === null) {
          // body is null
          dest.end();
        } else if (isBlob(body)) {
          body.stream().pipe(dest);
        } else if (Buffer.isBuffer(body)) {
          // body is buffer
          dest.write(body);
          dest.end();
        } else {
          // body is stream
          body.pipe(dest);
        }
      }

      // expose Promise
      Body.Promise = global.Promise;

      /**
       * headers.js
       *
       * Headers class offers convenient helpers
       */

      const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
      const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

      function validateName(name) {
        name = `${name}`;
        if (invalidTokenRegex.test(name) || name === "") {
          throw new TypeError(`${name} is not a legal HTTP header name`);
        }
      }

      function validateValue(value) {
        value = `${value}`;
        if (invalidHeaderCharRegex.test(value)) {
          throw new TypeError(`${value} is not a legal HTTP header value`);
        }
      }

      /**
       * Find the key in the map object given a header name.
       *
       * Returns undefined if not found.
       *
       * @param   String  name  Header name
       * @return  String|Undefined
       */
      function find(map, name) {
        name = name.toLowerCase();
        for (const key in map) {
          if (key.toLowerCase() === name) {
            return key;
          }
        }
        return undefined;
      }

      const MAP = Symbol("map");
      class Headers {
        /**
         * Headers class
         *
         * @param   Object  headers  Response headers
         * @return  Void
         */
        constructor() {
          let init =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : undefined;

          this[MAP] = Object.create(null);

          if (init instanceof Headers) {
            const rawHeaders = init.raw();
            const headerNames = Object.keys(rawHeaders);

            for (const headerName of headerNames) {
              for (const value of rawHeaders[headerName]) {
                this.append(headerName, value);
              }
            }

            return;
          }

          // We don't worry about converting prop to ByteString here as append()
          // will handle it.
          if (init == null);
          else if (typeof init === "object") {
            const method = init[Symbol.iterator];
            if (method != null) {
              if (typeof method !== "function") {
                throw new TypeError("Header pairs must be iterable");
              }

              // sequence<sequence<ByteString>>
              // Note: per spec we have to first exhaust the lists then process them
              const pairs = [];
              for (const pair of init) {
                if (
                  typeof pair !== "object" ||
                  typeof pair[Symbol.iterator] !== "function"
                ) {
                  throw new TypeError("Each header pair must be iterable");
                }
                pairs.push(Array.from(pair));
              }

              for (const pair of pairs) {
                if (pair.length !== 2) {
                  throw new TypeError(
                    "Each header pair must be a name/value tuple"
                  );
                }
                this.append(pair[0], pair[1]);
              }
            } else {
              // record<ByteString, ByteString>
              for (const key of Object.keys(init)) {
                const value = init[key];
                this.append(key, value);
              }
            }
          } else {
            throw new TypeError("Provided initializer must be an object");
          }
        }

        /**
         * Return combined header value given name
         *
         * @param   String  name  Header name
         * @return  Mixed
         */
        get(name) {
          name = `${name}`;
          validateName(name);
          const key = find(this[MAP], name);
          if (key === undefined) {
            return null;
          }

          return this[MAP][key].join(", ");
        }

        /**
         * Iterate over all headers
         *
         * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
         * @param   Boolean   thisArg   `this` context for callback function
         * @return  Void
         */
        forEach(callback) {
          let thisArg =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : undefined;

          let pairs = getHeaders(this);
          let i = 0;
          while (i < pairs.length) {
            var _pairs$i = pairs[i];
            const name = _pairs$i[0],
              value = _pairs$i[1];

            callback.call(thisArg, value, name, this);
            pairs = getHeaders(this);
            i++;
          }
        }

        /**
         * Overwrite header values given name
         *
         * @param   String  name   Header name
         * @param   String  value  Header value
         * @return  Void
         */
        set(name, value) {
          name = `${name}`;
          value = `${value}`;
          validateName(name);
          validateValue(value);
          const key = find(this[MAP], name);
          this[MAP][key !== undefined ? key : name] = [value];
        }

        /**
         * Append a value onto existing header
         *
         * @param   String  name   Header name
         * @param   String  value  Header value
         * @return  Void
         */
        append(name, value) {
          name = `${name}`;
          value = `${value}`;
          validateName(name);
          validateValue(value);
          const key = find(this[MAP], name);
          if (key !== undefined) {
            this[MAP][key].push(value);
          } else {
            this[MAP][name] = [value];
          }
        }

        /**
         * Check for header name existence
         *
         * @param   String   name  Header name
         * @return  Boolean
         */
        has(name) {
          name = `${name}`;
          validateName(name);
          return find(this[MAP], name) !== undefined;
        }

        /**
         * Delete all header values given name
         *
         * @param   String  name  Header name
         * @return  Void
         */
        delete(name) {
          name = `${name}`;
          validateName(name);
          const key = find(this[MAP], name);
          if (key !== undefined) {
            delete this[MAP][key];
          }
        }

        /**
         * Return raw headers (non-spec api)
         *
         * @return  Object
         */
        raw() {
          return this[MAP];
        }

        /**
         * Get an iterator on keys.
         *
         * @return  Iterator
         */
        keys() {
          return createHeadersIterator(this, "key");
        }

        /**
         * Get an iterator on values.
         *
         * @return  Iterator
         */
        values() {
          return createHeadersIterator(this, "value");
        }

        /**
         * Get an iterator on entries.
         *
         * This is the default iterator of the Headers object.
         *
         * @return  Iterator
         */
        [Symbol.iterator]() {
          return createHeadersIterator(this, "key+value");
        }
      }
      Headers.prototype.entries = Headers.prototype[Symbol.iterator];

      Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
        value: "Headers",
        writable: false,
        enumerable: false,
        configurable: true,
      });

      Object.defineProperties(Headers.prototype, {
        get: { enumerable: true },
        forEach: { enumerable: true },
        set: { enumerable: true },
        append: { enumerable: true },
        has: { enumerable: true },
        delete: { enumerable: true },
        keys: { enumerable: true },
        values: { enumerable: true },
        entries: { enumerable: true },
      });

      function getHeaders(headers) {
        let kind =
          arguments.length > 1 && arguments[1] !== undefined
            ? arguments[1]
            : "key+value";

        const keys = Object.keys(headers[MAP]).sort();
        return keys.map(
          kind === "key"
            ? function (k) {
                return k.toLowerCase();
              }
            : kind === "value"
            ? function (k) {
                return headers[MAP][k].join(", ");
              }
            : function (k) {
                return [k.toLowerCase(), headers[MAP][k].join(", ")];
              }
        );
      }

      const INTERNAL = Symbol("internal");

      function createHeadersIterator(target, kind) {
        const iterator = Object.create(HeadersIteratorPrototype);
        iterator[INTERNAL] = {
          target,
          kind,
          index: 0,
        };
        return iterator;
      }

      const HeadersIteratorPrototype = Object.setPrototypeOf(
        {
          next() {
            // istanbul ignore if
            if (
              !this ||
              Object.getPrototypeOf(this) !== HeadersIteratorPrototype
            ) {
              throw new TypeError("Value of `this` is not a HeadersIterator");
            }

            var _INTERNAL = this[INTERNAL];
            const target = _INTERNAL.target,
              kind = _INTERNAL.kind,
              index = _INTERNAL.index;

            const values = getHeaders(target, kind);
            const len = values.length;
            if (index >= len) {
              return {
                value: undefined,
                done: true,
              };
            }

            this[INTERNAL].index = index + 1;

            return {
              value: values[index],
              done: false,
            };
          },
        },
        Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()))
      );

      Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
        value: "HeadersIterator",
        writable: false,
        enumerable: false,
        configurable: true,
      });

      /**
       * Export the Headers object in a form that Node.js can consume.
       *
       * @param   Headers  headers
       * @return  Object
       */
      function exportNodeCompatibleHeaders(headers) {
        const obj = Object.assign({ __proto__: null }, headers[MAP]);

        // http.request() only supports string as Host header. This hack makes
        // specifying custom Host header possible.
        const hostHeaderKey = find(headers[MAP], "Host");
        if (hostHeaderKey !== undefined) {
          obj[hostHeaderKey] = obj[hostHeaderKey][0];
        }

        return obj;
      }

      /**
       * Create a Headers object from an object of headers, ignoring those that do
       * not conform to HTTP grammar productions.
       *
       * @param   Object  obj  Object of headers
       * @return  Headers
       */
      function createHeadersLenient(obj) {
        const headers = new Headers();
        for (const name of Object.keys(obj)) {
          if (invalidTokenRegex.test(name)) {
            continue;
          }
          if (Array.isArray(obj[name])) {
            for (const val of obj[name]) {
              if (invalidHeaderCharRegex.test(val)) {
                continue;
              }
              if (headers[MAP][name] === undefined) {
                headers[MAP][name] = [val];
              } else {
                headers[MAP][name].push(val);
              }
            }
          } else if (!invalidHeaderCharRegex.test(obj[name])) {
            headers[MAP][name] = [obj[name]];
          }
        }
        return headers;
      }

      const INTERNALS$1 = Symbol("Response internals");

      // fix an issue where "STATUS_CODES" aren't a named export for node <10
      const STATUS_CODES = http.STATUS_CODES;

      /**
       * Response class
       *
       * @param   Stream  body  Readable stream
       * @param   Object  opts  Response options
       * @return  Void
       */
      class Response {
        constructor() {
          let body =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : null;
          let opts =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};

          Body.call(this, body, opts);

          const status = opts.status || 200;
          const headers = new Headers(opts.headers);

          if (body != null && !headers.has("Content-Type")) {
            const contentType = extractContentType(body);
            if (contentType) {
              headers.append("Content-Type", contentType);
            }
          }

          this[INTERNALS$1] = {
            url: opts.url,
            status,
            statusText: opts.statusText || STATUS_CODES[status],
            headers,
            counter: opts.counter,
          };
        }

        get url() {
          return this[INTERNALS$1].url || "";
        }

        get status() {
          return this[INTERNALS$1].status;
        }

        /**
         * Convenience property representing if the request ended normally
         */
        get ok() {
          return (
            this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300
          );
        }

        get redirected() {
          return this[INTERNALS$1].counter > 0;
        }

        get statusText() {
          return this[INTERNALS$1].statusText;
        }

        get headers() {
          return this[INTERNALS$1].headers;
        }

        /**
         * Clone this response
         *
         * @return  Response
         */
        clone() {
          return new Response(clone(this), {
            url: this.url,
            status: this.status,
            statusText: this.statusText,
            headers: this.headers,
            ok: this.ok,
            redirected: this.redirected,
          });
        }
      }

      Body.mixIn(Response.prototype);

      Object.defineProperties(Response.prototype, {
        url: { enumerable: true },
        status: { enumerable: true },
        ok: { enumerable: true },
        redirected: { enumerable: true },
        statusText: { enumerable: true },
        headers: { enumerable: true },
        clone: { enumerable: true },
      });

      Object.defineProperty(Response.prototype, Symbol.toStringTag, {
        value: "Response",
        writable: false,
        enumerable: false,
        configurable: true,
      });

      const INTERNALS$2 = Symbol("Request internals");
      const URL = Url.URL || whatwgUrl.URL;

      // fix an issue where "format", "parse" aren't a named export for node <10
      const parse_url = Url.parse;
      const format_url = Url.format;

      /**
       * Wrapper around `new URL` to handle arbitrary URLs
       *
       * @param  {string} urlStr
       * @return {void}
       */
      function parseURL(urlStr) {
        /*
 	Check whether the URL is absolute or not
 		Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
 	Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
 */
        if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.exec(urlStr)) {
          urlStr = new URL(urlStr).toString();
        }

        // Fallback to old implementation for arbitrary URLs
        return parse_url(urlStr);
      }

      const streamDestructionSupported = "destroy" in Stream.Readable.prototype;

      /**
       * Check if a value is an instance of Request.
       *
       * @param   Mixed   input
       * @return  Boolean
       */
      function isRequest(input) {
        return (
          typeof input === "object" && typeof input[INTERNALS$2] === "object"
        );
      }

      function isAbortSignal(signal) {
        const proto =
          signal && typeof signal === "object" && Object.getPrototypeOf(signal);
        return !!(proto && proto.constructor.name === "AbortSignal");
      }

      /**
       * Request class
       *
       * @param   Mixed   input  Url or Request instance
       * @param   Object  init   Custom options
       * @return  Void
       */
      class Request {
        constructor(input) {
          let init =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};

          let parsedURL;

          // normalize input
          if (!isRequest(input)) {
            if (input && input.href) {
              // in order to support Node.js' Url objects; though WHATWG's URL objects
              // will fall into this branch also (since their `toString()` will return
              // `href` property anyway)
              parsedURL = parseURL(input.href);
            } else {
              // coerce input to a string before attempting to parse
              parsedURL = parseURL(`${input}`);
            }
            input = {};
          } else {
            parsedURL = parseURL(input.url);
          }

          let method = init.method || input.method || "GET";
          method = method.toUpperCase();

          if (
            (init.body != null || (isRequest(input) && input.body !== null)) &&
            (method === "GET" || method === "HEAD")
          ) {
            throw new TypeError(
              "Request with GET/HEAD method cannot have body"
            );
          }

          let inputBody =
            init.body != null
              ? init.body
              : isRequest(input) && input.body !== null
              ? clone(input)
              : null;

          Body.call(this, inputBody, {
            timeout: init.timeout || input.timeout || 0,
            size: init.size || input.size || 0,
          });

          const headers = new Headers(init.headers || input.headers || {});

          if (inputBody != null && !headers.has("Content-Type")) {
            const contentType = extractContentType(inputBody);
            if (contentType) {
              headers.append("Content-Type", contentType);
            }
          }
          let signal = isRequest(input) ? input.signal : null;
          if ("signal" in init) signal = init.signal;
          if (signal != null && !isAbortSignal(signal)) {
            throw new TypeError(
              "Expected signal to be an instanceof AbortSignal"
            );
          }
          this[INTERNALS$2] = {
            method,
            redirect: init.redirect || input.redirect || "follow",
            headers,
            parsedURL,
            signal,
          };
          // node-fetch-only options
          this.follow =
            init.follow !== undefined
              ? init.follow
              : input.follow !== undefined
              ? input.follow
              : 20;
          this.compress =
            init.compress !== undefined
              ? init.compress
              : input.compress !== undefined
              ? input.compress
              : true;
          this.counter = init.counter || input.counter || 0;
          this.agent = init.agent || input.agent;
        }
        get method() {
          return this[INTERNALS$2].method;

        get url() {
          return format_url(this[INTERNALS$2].parsedURL);
        get headers() {
          return this[INTERNALS$2].headers;
        }
        get redirect() {
          return this[INTERNALS$2].redirect;
        }
        get signal() {
          return this[INTERNALS$2].signal;
        }
        /**
         * Clone this request
         *
         * @return  Request
         */
        clone() {
          return new Request(this);
        }
      }
      Body.mixIn(Request.prototype);
      Object.defineProperty(Request.prototype, Symbol.toStringTag, {
        value: "Request",
        writable: false,
        enumerable: false,
        configurable: true,
      });
      Object.defineProperties(Request.prototype, {
        method: { enumerable: true },
        url: { enumerable: true },
        headers: { enumerable: true },
        redirect: { enumerable: true },
        clone: { enumerable: true },
        signal: { enumerable: true },
      });
      /**
       * Convert a Request to Node.js http request options.
       *
       * @param   Request  A Request instance
       * @return  Object   The options object to be passed to http.request
       */
      function getNodeRequestOptions(request) {
        const parsedURL = request[INTERNALS$2].parsedURL;
        const headers = new Headers(request[INTERNALS$2].headers);
        // fetch step 1.3
        if (!headers.has("Accept")) {
          headers.set("Accept", "*/*");
        }
        // Basic fetch
        if (!parsedURL.protocol || !parsedURL.hostname) {
          throw new TypeError("Only absolute URLs are supported");
        }

        if (!/^https?:$/.test(parsedURL.protocol)) {
          throw new TypeError("Only HTTP(S) protocols are supported");
        }

        if (
          request.signal &&
          request.body instanceof Stream.Readable &&
          !streamDestructionSupported
        ) {
          throw new Error(
            "Cancellation of streamed requests with AbortSignal is not supported in node < 8"
          );
        }

        // HTTP-network-or-cache fetch steps 2.4-2.7
        let contentLengthValue = null;
        if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
          contentLengthValue = "0";
        }
        if (request.body != null) {
          const totalBytes = getTotalBytes(request);
          if (typeof totalBytes === "number") {
            contentLengthValue = String(totalBytes);
          }
        }
        if (contentLengthValue) {
          headers.set("Content-Length", contentLengthValue);
        }

        // HTTP-network-or-cache fetch step 2.11
        if (!headers.has("User-Agent")) {
          headers.set(
            "User-Agent",
            "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)"
          );
        }

        // HTTP-network-or-cache fetch step 2.15
        if (request.compress && !headers.has("Accept-Encoding")) {
          headers.set("Accept-Encoding", "gzip,deflate");
        }

        let agent = request.agent;
        if (typeof agent === "function") {
          agent = agent(parsedURL);
        }

        if (!headers.has("Connection") && !agent) {
          headers.set("Connection", "close");
        }

        // HTTP-network fetch step 4.2
        // chunked encoding is handled by Node.js
        return Object.assign({}, parsedURL, {
          method: request.method,
          headers: exportNodeCompatibleHeaders(headers),
          agent,
        });
      /**
       * abort-error.js
       *
       * AbortError interface for cancelled requests
       */

      /**
       * Create AbortError instance
       *
       * @param   String      message      Error message for human
       */