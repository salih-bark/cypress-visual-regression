"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/command.ts
var command_exports = {};
__export(command_exports, {
  addCompareSnapshotCommand: () => addCompareSnapshotCommand
});
module.exports = __toCommonJS(command_exports);
function addCompareSnapshotCommand(screenshotOptions) {
  Cypress.Commands.add(
    "compareSnapshot",
    // @ts-expect-error todo: fix this
    { prevSubject: "optional" },
    function(subject, name, commandOptions) {
      if (name === void 0 || name === "") {
        throw new Error("Snapshot name must be specified");
      }
      let errorThreshold = 0;
      if (typeof commandOptions === "object") {
        screenshotOptions = { ...screenshotOptions, ...commandOptions };
        if (commandOptions.errorThreshold !== void 0) {
          errorThreshold = commandOptions.errorThreshold;
        }
      } else if (typeof commandOptions === "number") {
        errorThreshold = commandOptions;
      } else if (screenshotOptions != null && screenshotOptions.errorThreshold !== void 0) {
        errorThreshold = screenshotOptions.errorThreshold;
      }
      const visualRegressionOptions = prepareOptions(name, errorThreshold, screenshotOptions);
      return takeScreenshot(subject, name, screenshotOptions).then((screenShotProps) => {
        console.groupCollapsed(
          `%c     Visual Regression Test (${visualRegressionOptions.screenshotName}) `,
          "color: #17EDE1; background: #091806; padding: 12px 6px; border-radius: 4px; width:100%;"
        );
        console.info("%c visualRegressionOptions:     ", "color: #FFF615; background: #091806; padding: 6px;");
        console.table(visualRegressionOptions);
        console.info("%c Screenshot taken:     ", "color: #FFF615; background: #091806; padding: 6px;");
        console.table(screenShotProps);
        console.groupEnd();
        visualRegressionOptions.screenshotAbsolutePath = screenShotProps.path;
        switch (visualRegressionOptions.type) {
          case "regression":
            return compareScreenshots(visualRegressionOptions);
          case "base":
            return cy.task("updateSnapshot", visualRegressionOptions);
          default:
            throw new Error(
              `The "type" environment variable is unknown.
              Expected: "regression" or "base"
              Actual: ${visualRegressionOptions.type}`
            );
        }
      });
    }
  );
}
function prepareOptions(name, errorThreshold, screenshotOptions) {
  if (Cypress.env("visualRegression") !== void 0) {
    throw new Error(
      'Environment variables under "visualRegression" object (Version 4) si deprecated, please use single keys, ie visualRegressionType, visualRegressionBaseDirectory, etc.'
    );
  }
  const options = {
    type: Cypress.env("visualRegressionType"),
    screenshotName: name,
    specName: Cypress.spec.name,
    screenshotAbsolutePath: "null",
    // will be set after takeScreenshot
    errorThreshold,
    baseDirectory: Cypress.env("visualRegressionBaseDirectory"),
    diffDirectory: Cypress.env("visualRegressionDiffDirectory"),
    generateDiff: Cypress.env("visualRegressionGenerateDiff"),
    failSilently: Cypress.env("visualRegressionFailSilently")
  };
  if (screenshotOptions != null && screenshotOptions.failSilently !== void 0) {
    options.failSilently = screenshotOptions.failSilently;
  } else if (Cypress.env("visualRegressionFailSilently") !== void 0) {
    options.failSilently = Cypress.env("visualRegressionFailSilently");
  }
  if (Cypress.env("type") !== void 0) {
    console.error(
      "Environment variable 'type' is deprecated, please rename it to 'visualRegressionType'. Please check README.md file for latest configuration."
    );
    options.type = Cypress.env("type");
  }
  if (Cypress.env("failSilently") !== void 0) {
    console.error(
      "Environment variable 'failSilently' is deprecated, please rename it to 'visualRegressionFailSilently'. Please check README.md file for latest configuration."
    );
  }
  if (Cypress.env("SNAPSHOT_BASE_DIRECTORY") !== void 0) {
    console.error(
      "Environment variable 'SNAPSHOT_BASE_DIRECTORY' is deprecated. Please check README.md file for latest configuration."
    );
    options.baseDirectory = Cypress.env("SNAPSHOT_BASE_DIRECTORY");
  }
  if (Cypress.env("SNAPSHOT_DIFF_DIRECTORY") !== void 0) {
    console.error(
      "Environment variable 'SNAPSHOT_DIFF_DIRECTORY' is deprecated. Please check README.md file for latest configuration."
    );
    options.diffDirectory = Cypress.env("SNAPSHOT_DIFF_DIRECTORY");
  }
  if (Cypress.env("INTEGRATION_FOLDER") !== void 0) {
    console.error(
      "Environment variable 'INTEGRATION_FOLDER' is deprecated. Please check README.md file for latest configuration."
    );
  }
  if (Cypress.env("ALWAYS_GENERATE_DIFF") !== void 0) {
    console.error(
      "Environment variable 'ALWAYS_GENERATE_DIFF' is deprecated. Please check README.md file for latest configuration."
    );
    options.generateDiff = Cypress.env("ALWAYS_GENERATE_DIFF") !== "" ? "always" : "never";
  }
  if (Cypress.env("ALLOW_VISUAL_REGRESSION_TO_FAIL") !== void 0) {
    console.error(
      "Environment variable 'ALLOW_VISUAL_REGRESSION_TO_FAIL' is deprecated. Please check README.md file for latest configuration."
    );
    options.failSilently = Cypress.env("ALLOW_VISUAL_REGRESSION_TO_FAIL");
  }
  return options;
}
function takeScreenshot(subject, name, screenshotOptions) {
  const objToOperateOn = subject !== void 0 ? cy.get(subject) : cy;
  let ScreenshotDetails;
  return objToOperateOn.screenshot(name, {
    ...screenshotOptions,
    onAfterScreenshot(_el, props) {
      ScreenshotDetails = props;
    }
  }).then(() => ScreenshotDetails);
}
function compareScreenshots(options) {
  return cy.task("compareSnapshots", options).then((results) => {
    if (results.error !== void 0 && !options.failSilently) {
      throw new Error(results.error);
    }
    return results;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addCompareSnapshotCommand
});
