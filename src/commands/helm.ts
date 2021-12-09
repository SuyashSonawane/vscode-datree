import * as vscode from "vscode";
import { spawn } from "child_process";
import { WEB_VIEW_URI } from "../helpers/constants";

export const handleHelmCommand = (filePath: string) => {
  // vscode.window.showInformationMessage("Helm starting");
  let folderPath: any = filePath.split("/");
  folderPath.pop();
  folderPath = folderPath.join("/");
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      title: "Running Analysis using Helm Plugin",
    },
    async (task) => {
      task.report({ increment: 10 });
      let child = spawn("helm", [
        "datree",
        "test",
        folderPath,
        "--output",
        "json",
      ]);
      let data: any = [];
      let err: any = [];
      let increment = 50;
      child.stdout.on("data", (chunk: any) => {
        data.push(chunk);
        increment += 20;
        task.report({ increment });
      });

      child.stdout.on("close", () => {
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
        panel.webview.html = `<iframe style="border:none;width:100%;height:100vh;" src="${WEB_VIEW_URI}/#${base64}"></iframe>`;
        task.report({ increment: 100 });
      });
      child.stderr.on("data", (chunk) => {
        err.push(chunk);
      });
      child.stderr.on("close", () => {
        console.log(Buffer.concat(err).toString());
      });
    }
  );
};
