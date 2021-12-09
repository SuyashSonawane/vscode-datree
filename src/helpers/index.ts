import * as vscode from "vscode";
/* eslint-disable @typescript-eslint/naming-convention */
const { spawn } = require("child_process");
const yaml = require("js-yaml");
const fs = require("fs");
const flatten = require("flat");

export const getDatreeOutput = (filePath: string) => {
  return new Promise((resolve, reject) => {
    const child = spawn("datree", ["test", filePath, "--output", "json"]);
    let data: any = [];
    child.stdout.on("data", (chunk: any) => {
      data.push(chunk);
    });
    child.stdout.on("close", () => {
      let json = JSON.parse(Buffer.concat(data).toString());
      let base64 = Buffer.concat(data).toString("base64");
      resolve([json, base64]);
    });
    child.stderr.on("data", console.log);

    child.on("close", (code: any) => {
      console.log(`child process exited with code ${code}`);
    });
  });
};

export const getYamlAsFlattenedJSON = (filePath: string) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = yaml.load(fs.readFileSync(filePath, "utf8"));
      resolve(Object.entries(flatten(doc)));
    } catch (e) {
      reject(e);
    }
  });
};

export const getPolicyErrors = (datreeOutput: any) => {
  const errors: any[] = [];
  let fileData = Object.entries(
    datreeOutput.EvaluationResults.FileNameRuleMapper
  );
  if (fileData.length === 0) {
    return [];
  }
  (fileData as any) = fileData[0];
  let policyErrors = Object.entries(fileData[1]);
  policyErrors.forEach((err: any) => {
    errors.push([
      err[1].FailSuggestion.split("`")[1],
      err[1].Name + "\n" + err[1].FailSuggestion,
    ]);
  });
  return errors;
};
export const decorateErrors = (key: any, type: "parent" | "error") => {
  const decorationType =
    type === "parent"
      ? vscode.window.createTextEditorDecorationType({
          backgroundColor: "yellow",
        })
      : vscode.window.createTextEditorDecorationType({
          textDecoration: "underline",
          fontWeight: "bold",
        });
  const regEx = new RegExp(key[0], "g");
  const text = vscode.window.activeTextEditor?.document.getText();
  let match;
  const decors: any = [];
  let activeEditor = vscode.window.activeTextEditor;
  if (!text || !activeEditor) {
    return;
  }

  while ((match = regEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: key[1],
    };
    decors.push(decoration);
  }
  activeEditor.setDecorations(decorationType, decors);
  vscode.workspace.onDidChangeTextDocument(() => {
    vscode.window.activeTextEditor?.setDecorations(decorationType, []);
  });
  // return decorationType;
};
export const generateErrorParentKeys = (yamlContent: any, errors: any) => {
  const keys: any = [];
  yamlContent.forEach((content: [string, string]) => {
    let pathString = content[0].split(".");
    errors.forEach((err: [string, string]) => {
      let errString = err[0].split(".");
      if (errString.length === 1) {
        keys.push([errString[0], err[1]]);
      } else {
        let index = pathString.indexOf(errString[0]);
        index--;
        if (Number.isInteger(parseInt(pathString[index]))) {
          index--;
        }
        if (index < 0) {
          return;
        }
        keys.push([pathString[index], err[1]]);
      }
    });
  });

  return keys;
};
export const generateErrorKeys = (yamlContent: any, errors: any) => {
  const keys: any = [];
  (yamlContent as any).forEach((element: [string, string]) => {
    errors?.forEach((err: any) => {
      element[0].includes(err[0]) && keys.push([element[1], err[1]]);
    });
  });
  return keys;
};

export const getYamlErrors = (invalidYamlFile: any) => {
  let validationErrors = invalidYamlFile.ValidationErrors;
  let errors: { lineNo: number; message: string }[] = [];
  validationErrors.forEach((err: any) => {
    let temp = err.ErrorMessage.split(":");
    let lineNo = parseInt(temp[1].trim().replaceAll(/[^\d.]/g, ""));
    let message = temp[2].trim();
    errors.push({ lineNo, message });
  });
  return errors;
};

export const decorateYamlError = (err: { lineNo: number; message: string }) => {
  let errorPosition = new vscode.Position(err.lineNo, 0);
  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "red",
  });
  const wordRange =
    vscode.window.activeTextEditor?.document.getWordRangeAtPosition(
      errorPosition,
      new RegExp(" ")
    );
  if (wordRange) {
    const decoration: vscode.DecorationOptions = {
      range: wordRange,
      hoverMessage: "yaml error: " + err.message,
    };
    vscode.window.activeTextEditor?.setDecorations(decorationType, [
      decoration,
    ]);
    vscode.workspace.onDidChangeTextDocument(() => {
      vscode.window.activeTextEditor?.setDecorations(decorationType, []);
    });
  }
};

export const getK8sErrors = (invalidK8sFile: any) => {
  let validationErrors = invalidK8sFile.ValidationErrors;
  let errors: string[] = [];
  validationErrors.forEach((err: any) => {
    errors.push(err.ErrorMessage);
  });
  return errors;
};

export const decorateK8sError = (err: string) => {
  const decorationType: vscode.TextEditorDecorationType =
    vscode.window.createTextEditorDecorationType({
      textDecoration: "underline",
      color: "red",
    });
  const text = vscode.window.activeTextEditor?.document.getText();
  let activeEditor = vscode.window.activeTextEditor;
  if (!text || !activeEditor) {
    return;
  }
  let startPos = new vscode.Position(0, 0);
  let endPos = new vscode.Position(activeEditor.document.lineCount, 0);
  const wordRange = new vscode.Range(startPos, endPos);
  if (wordRange) {
    const decoration: vscode.DecorationOptions = {
      range: wordRange,
      hoverMessage: "K8s schema error: " + err,
    };
    vscode.window.activeTextEditor?.setDecorations(decorationType, [
      decoration,
    ]);
    vscode.workspace.onDidChangeTextDocument(() => {
      vscode.window.activeTextEditor?.setDecorations(decorationType, []);
    });
  }
};
