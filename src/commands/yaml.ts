import * as vscode from "vscode";
import {
  decorateErrors,
  decorateK8sError,
  decorateYamlError,
  generateErrorKeys,
  generateErrorParentKeys,
  getDatreeOutput,
  getHtmlContent,
  getK8sErrors,
  getK8sSchemaVersion,
  getPolicyErrors,
  getYamlAsFlattenedJSON,
  getYamlErrors,
  openSolution,
} from "../helpers";
import { POLICY } from "../helpers/constants";
import { VSViewProvider } from "../helpers/providers";

export const handleYamlCommand = async (
  extensionUri: string,
  filePath: string
) => {
  const k8sSchemaVersion: any = await getK8sSchemaVersion(filePath);
  if (k8sSchemaVersion === undefined || k8sSchemaVersion === "") {
    vscode.window.showErrorMessage("Improper K8s version");
    return;
  }
  let policy = process.env[POLICY];
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      // cancellable: false,
      title: `Running analysis (${k8sSchemaVersion}) (${policy})`,
    },
    async (task) => {
      task.report({ increment: 0 });
      try {
        const [datreeOutput, datreeOutputBase64]: any = await getDatreeOutput(
          filePath,
          k8sSchemaVersion
        );

        if (datreeOutput.InvalidYamlFiles) {
          let yamlErrors = getYamlErrors(datreeOutput.InvalidYamlFiles[0]);
          yamlErrors.forEach((err) => {
            decorateYamlError(err);
          });
          return;
        }
        task.report({ increment: 10 });
        if (datreeOutput.InvalidK8sFiles) {
          let k8sErrors = getK8sErrors(
            datreeOutput.InvalidK8sFiles[0],
            k8sSchemaVersion
          );
          k8sErrors.forEach((err) => {
            decorateK8sError(err);
          });
          return;
        }
        let panel = vscode.window.createWebviewPanel(
          "datree-panel",
          "Result",
          vscode.ViewColumn.Beside,
          { enableScripts: true }
        );
        panel.webview.onDidReceiveMessage((message) => {
          openSolution(message);
        });
        panel.onDidChangeViewState((e) => {
          panel.webview.postMessage(datreeOutput);
        });
        panel.webview.html = await getHtmlContent(extensionUri);
        panel.webview.postMessage(datreeOutput);
        const yamlContent: any = await getYamlAsFlattenedJSON(filePath);
        task.report({ increment: 30 });
        const errors = getPolicyErrors(datreeOutput);
        if (errors?.length === 0) {
          task.report({ increment: 100 });
          vscode.window.showInformationMessage("All policy checks succeeded!");
          return;
        }
        const parentKeys: any = generateErrorParentKeys(yamlContent, errors);
        const errorKeys: any = generateErrorKeys(yamlContent, errors);
        task.report({ increment: 70 });
        const mem = new Set();
        parentKeys.forEach((key: any) => {
          if (mem.has(key.join("$"))) {
            return;
          }
          mem.add(key.join("$"));
          decorateErrors(key, "parent");
        });
        mem.clear();
        task.report({ increment: 90 });
        errorKeys.forEach((key: any) => {
          if (mem.has(key.join("$"))) {
            return;
          }
          mem.add(key.join("$"));
          decorateErrors(key, "error");
        });
        task.report({ increment: 100 });
      } catch (err) {
        vscode.window.showErrorMessage(`${err}`);
      }
    }
  );
};
