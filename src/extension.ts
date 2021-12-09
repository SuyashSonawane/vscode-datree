import * as vscode from "vscode";
import { handleHelmCommand } from "./commands/helm";
import { handleYamlCommand } from "./commands/yaml";
import { VSViewProvider } from "./helpers/providers";
import { lookpath } from "lookpath";
export async function activate(context: vscode.ExtensionContext) {
  let path = await lookpath("datree");
  if (path === undefined) {
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
      // only run tests for *.yaml files
      if (!filePath.includes(".yaml")) {
        vscode.window.showErrorMessage("Not an YAML configuration file");
        return;
      }
      // depending on the filename, execute helm or yaml command
      if (filePath.split("/").slice(-1)[0] === "Chart.yaml") {
        await handleHelmCommand(context.extensionPath, filePath);
      } else {
        await handleYamlCommand(context.extensionPath, filePath);
      }
    }
  );

  context.subscriptions.push(scanFile);
}

// this method is called when your extension is deactivated
export function deactivate() {}
