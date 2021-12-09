/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { handleHelmCommand } from "./commands/helm";
import { handleYamlCommand } from "./commands/yaml";
import { VSViewProvider } from "./helpers/providers";
export function activate(context: vscode.ExtensionContext) {
  const provider = new VSViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(VSViewProvider.viewType, provider)
  );

  let scanFile = vscode.commands.registerCommand("demo.scanFile", async () => {
    let currentlyOpenTabfilePath: any =
      vscode.window.activeTextEditor?.document.fileName;
    if (!currentlyOpenTabfilePath) {
      return;
    }
    if (!currentlyOpenTabfilePath.includes(".yaml")) {
      vscode.window.showErrorMessage("Not an YAML configuration file");
      return;
    }
    if (currentlyOpenTabfilePath.split("/").slice(-1)[0] === "Chart.yaml") {
      await handleHelmCommand(currentlyOpenTabfilePath);
    } else {
      await handleYamlCommand(currentlyOpenTabfilePath);
    }
  });

  context.subscriptions.push(scanFile);
}

// this method is called when your extension is deactivated
export function deactivate() {}
