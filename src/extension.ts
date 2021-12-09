/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {
  decorateErrors,
  decorateK8sError,
  decorateYamlError,
  generateErrorKeys,
  generateErrorParentKeys,
  getDatreeOutput,
  getK8sErrors,
  getPolicyErrors,
  getYamlAsFlattenedJSON,
  getYamlErrors,
} from "./helpers";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
const datreeOutput = {
  EvaluationResults: {
    FileNameRuleMapper: {
      "/home/suyash/Desktop/Learning/test/test.yaml": {
        "4": {
          ID: 4,
          Name: "Ensure each container has a configured memory limit",
          FailSuggestion:
            "Missing property object `limits.memory` - value should be within the accepted boundaries recommended by the organization",
          OccurrencesDetails: [
            {
              MetadataName: "rss-site",
              Kind: "Deployment",
            },
          ],
        },
        "9": {
          ID: 9,
          Name: "Ensure workload has valid label values",
          FailSuggestion:
            "Incorrect value for key(s) under `labels` - the vales syntax is not valid so the Kubernetes engine will not accept it",
          OccurrencesDetails: [
            {
              MetadataName: "rss-site",
              Kind: "Deployment",
            },
          ],
        },
        "11": {
          ID: 11,
          Name: "Ensure each container has a configured liveness probe",
          FailSuggestion:
            "Missing property object `livenessProbe` - add a properly configured livenessProbe to catch possible deadlocks",
          OccurrencesDetails: [
            {
              MetadataName: "rss-site",
              Kind: "Deployment",
            },
          ],
        },
      },
    },
    Summary: {
      TotalFailedRules: 3,
      FilesCount: 1,
      TotalPassedCount: 0,
    },
  },
  EvaluationSummary: {
    ConfigsCount: 1,
    RulesCount: 21,
    FilesCount: 1,
    PassedYamlValidationCount: 1,
    PassedK8sValidationCount: 1,
    PassedPolicyCheckCount: 0,
  },
  InvalidYamlFiles: null,
  InvalidK8sFiles: null,
};
export function activate(context: vscode.ExtensionContext) {
  let scanFile = vscode.commands.registerCommand("demo.scanFile", async () => {
    let currentlyOpenTabfilePath =
      vscode.window.activeTextEditor?.document.fileName;
    if (!currentlyOpenTabfilePath) {
      return;
    }
    const [datreeOutput, datreeOutputBase64]: any = await getDatreeOutput(
      currentlyOpenTabfilePath
    );
    let panel = vscode.window.createWebviewPanel(
      "datree-panel",
      "Result",
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );
    panel.webview.html = `<iframe style="border:none;width:100%;height:100vh;" src="http://localhost:3000/#${datreeOutputBase64}"></iframe>`;
    if (datreeOutput.InvalidYamlFiles) {
      let yamlErrors = getYamlErrors(datreeOutput.InvalidYamlFiles[0]);
      yamlErrors.forEach((err) => {
        decorateYamlError(err);
      });
      return;
    }
    if (datreeOutput.InvalidK8sFiles) {
      let k8sErrors = getK8sErrors(datreeOutput.InvalidK8sFiles[0]);
      k8sErrors.forEach((err) => {
        decorateK8sError(err);
      });
      return;
    }
    const yamlContent: any = await getYamlAsFlattenedJSON(
      currentlyOpenTabfilePath
    );
    const errors = getPolicyErrors(datreeOutput);
    if (errors?.length === 0) {
      vscode.window.showInformationMessage("All policy checks succeeded!");
      return;
    }
    const parentKeys: any = generateErrorParentKeys(yamlContent, errors);
    const errorKeys: any = generateErrorKeys(yamlContent, errors);
    const mem = new Set();
    parentKeys.forEach((key: any) => {
      if (mem.has(key.join("$"))) {
        return;
      }
      mem.add(key.join("$"));
      decorateErrors(key, "parent");
    });
    mem.clear();
    errorKeys.forEach((key: any) => {
      if (mem.has(key.join("$"))) {
        return;
      }
      mem.add(key.join("$"));
      decorateErrors(key, "error");
    });
  });

  let btn = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    200
  );
  btn.text = "$(versions)";
  btn.tooltip = "Runs Datree test on this configuration file";
  btn.command = "demo.scanFile";
  btn.show();
  context.subscriptions.push(btn);
  context.subscriptions.push(scanFile);
}

// this method is called when your extension is deactivated
export function deactivate() {}
