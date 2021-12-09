import * as vscode from "vscode";
import { spawn } from "child_process";
import { getHtmlContent, openSolution } from "../helpers";
import { lookpath } from "lookpath";

export const handleHelmCommand = async (
  extensionUri: string,
  filePath: string
) => {
  let path = await lookpath("helm");
  if (path === undefined) {
    vscode.window.showErrorMessage(
      "Cannot find Helm installation, make sure it is added to PATH"
    );
    return;
  }
  let folderPath: any = filePath.split("/");
  folderPath.pop();
  folderPath = folderPath.join("/");
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      title: "Running Analysis using Helm Plugin",
      cancellable: false,
    },
    async (task) => {
      await new Promise((resolve, reject) => {
        let child = spawn("helm", [
          "datree",
          "test",
          folderPath,
          "--output",
          "json",
        ]);
        let data: any = [];
        let err: any = [];
        child.stdout.on("data", (chunk: any) => {
          data.push(chunk);
        });
        child.stdout.on("close", async () => {
          let temp = Buffer.concat(data).toString();
          if (temp.includes("No files detected")) {
            vscode.window.showErrorMessage(
              "Incorrect Helm Chart configuration"
            );
            return;
          }
          let json = JSON.parse(temp);
          json["K8sSchemaVersion"] = "1.18.0";
          json["ts"] = new Date().toString();
          json["type"] = "HELM";
          let base64 = Buffer.from(JSON.stringify(json)).toString("base64");
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
            panel.webview.postMessage(base64);
          });
          panel.webview.html = await getHtmlContent(extensionUri);
          panel.webview.postMessage(base64);
          resolve(true);
        });
        child.stderr.on("data", (chunk) => {
          err.push(chunk);
        });
        child.stderr.on("close", () => {
          console.log(Buffer.concat(err).toString());
          err.length && reject(false);
        });
      });
    }
  );
};
