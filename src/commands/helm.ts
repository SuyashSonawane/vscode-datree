import * as vscode from "vscode";
import { spawn } from "child_process";
import { WEB_VIEW_URI } from "../helpers/constants";
import { getHtmlContent, openSolution } from "../helpers";

export const handleHelmCommand = (extensionUri: string, filePath: string) => {
  // vscode.window.showInformationMessage("Helm starting");
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
          let json = JSON.parse(Buffer.concat(data).toString());
          json["K8sSchemaVersion"] = "1.18.0";
          json["ts"] = new Date().toString();
          json["type"] = "HELM";
          let base64 = new Buffer(JSON.stringify(json)).toString("base64");
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
          reject(false);
        });
      });
    }
  );
};
