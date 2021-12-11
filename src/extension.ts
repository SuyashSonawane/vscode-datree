import * as vscode from "vscode";
import { handleHelmCommand } from "./commands/helm";
import { handleYamlCommand } from "./commands/yaml";
import { VSViewProvider } from "./helpers/providers";
import { lookpath } from "lookpath";
import path = require('path');
import { K8S_SCHEMA_VERSION, POLICY } from "./helpers/constants";
export async function activate(context: vscode.ExtensionContext) {
  let datreePath = await lookpath("datree");
  if (datreePath === undefined) {
    vscode.window.showErrorMessage(
      "Cannot find datree installation, make sure it is added to PATH"
    );
    return;
  }

  // register web provider for sidebar
  const provider = new VSViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(VSViewProvider.viewType, provider)
  );
  let scanFile = vscode.commands.registerCommand(
    "vscode-datree.scanFile",
    async () => {
      let filePath: any = vscode.window.activeTextEditor?.document.fileName;
      if (!filePath) {
        return;
      }

      // convert windows path to posix path
      filePath = filePath.split(path.sep).join(path.posix.sep);
      // only run tests for *.yaml files
      if (!filePath.includes(".yaml")) {
        vscode.window.showErrorMessage("Not an YAML configuration file");
        return;
      }
      // depending on the filename, execute helm or yaml command
      if (filePath.split("/").slice(-1)[0] === "Chart.yaml") {
        provider.postMessage({ type: 'fileType', message: 'HELM' });
        provider.postMessage({ type: 'command', message: `helm datree test ${filePath}` });
        await handleHelmCommand(context.extensionPath, filePath);
      } else {
        provider.postMessage({ type: 'fileType', message: 'YAML' });
        provider.postMessage({ type: 'command', message: `datree test ${filePath} --schema-version ${process.env[K8S_SCHEMA_VERSION]} ${process.env[POLICY] !== 'default' ? '--policy ' + process.env[POLICY] : ''}` });

        await handleYamlCommand(context.extensionPath, filePath);
      }
      provider.postMessage({ type: 'clean' });
    }
  );

  context.subscriptions.push(scanFile);
}

// this method is called when your extension is deactivated
export function deactivate() { }
