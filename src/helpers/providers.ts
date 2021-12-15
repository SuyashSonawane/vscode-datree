import * as vscode from "vscode";
import { getDatreeVersion, getUserToken } from ".";
import { IGNORE_MISSING_SCHEMAS, K8S_SCHEMA_VERSION, POLICY } from "./constants";

export class VSViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vscode-datree-sidebar";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = await this._getHtmlForWebview(
      webviewView.webview
    );

    webviewView.webview.onDidReceiveMessage((data) => {
      process.env[K8S_SCHEMA_VERSION] = data.schema;
      process.env[POLICY] = data.policy;
      process.env[IGNORE_MISSING_SCHEMAS] = data.ignoreMissingSchema;
      vscode.commands.executeCommand("vscode-datree.scanFile");
    });
  }

  public postMessage(message: any) {
    if (this._view) {
      this._view.show?.(true);
      this._view.webview.postMessage(message);
    }
  }

  private async _getHtmlForWebview(webview: vscode.Webview) {
    try {

      const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
      );

      const styleResetUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
      );
      const styleVSCodeUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
      );
      const logoUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "media", "datree-logo.png")
      );

      const nonce = getNonce();
      const token = await getUserToken();

      const datreeVersion = await getDatreeVersion();

      return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <link rel="stylesheet" href="${styleResetUri}">
        <link rel="stylesheet" href="${styleVSCodeUri}">
    </head>
    <body>
        <img src="${logoUri}" width="300px"/>
        <br/>
        Datree version : ${datreeVersion}
        <p id="type"></p>
        <form>
          <p>K8s Schema Version</p>
          <input type="text" placeholder="1.18.0" value="1.18.0" name="schema" id="schema" required>
          <p>Policy</p>
          <input type="text" placeholder="default" value="default" name="policy" id="policy" required>
          <input type="checkbox" id="ignore-missing-schema" name="ignore"/> Ignore Missing Schema
          <button type="submit" id="submit-btn">Run Analysis</button>
          <br/>
          <br/>
          Dashboard URL: 
          ${token ? `<a href="https://app.datree.io/login?cliId=${token}">https://app.datree.io/login?cliId=${token}</a>` : '<i>Cannot fetch user token, please run datree test atleast once to generate token.</i>'}
          <br/>
          <br/>
          <br/>
          Recent Executions : <br/>
          <div id="command"></div>
        </form>
        <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
    }
    catch (e) {
      return `Error occurred ${e}`
    }
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
