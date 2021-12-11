import { readFileSync } from "fs";
import * as vscode from "vscode";
import { homedir } from "os";
import { join } from "path";
import {
  CONFIG_PATH,
  DEFAULT_SCHEMA_VERSION,
  K8S_SCHEMA_VERSION,
  POLICY,
} from "./constants";
import { defaultRules } from "../data/rules";
const { spawn } = require("child_process");
const yaml = require("js-yaml");
const fs = require("fs");
const flatten = require("flat");

export const getUserToken = async () => {
  const doc = await yaml.load(
    fs.readFileSync(join(homedir(), ".datree/config.yaml"), "utf8")
  );
  return doc.token;
};

export const getDatreeVersion = async () => {
  return new Promise((resolve, reject) => {
    const child = spawn("datree", ["version"]);
    let data: any[] = [];
    child.stdout.on("data", (chunk: any) => {
      data.push(chunk);
    });
    child.stdout.on("close", () => {
      let version = Buffer.concat(data).toString();
      resolve(version.trim());
    });
  });
};


export const loadConfig = async () => {
  return new Promise(async (resolve, reject) => {
    const files = await vscode.workspace.findFiles("**/**.datree");
    delete process.env[POLICY];
    delete process.env[K8S_SCHEMA_VERSION];
    if (files.length) {
      process.env[CONFIG_PATH] = files[0].path;
      let fileContent = readFileSync(files[0].fsPath).toString();
      fileContent.split("\n").forEach((line) => {
        let [label, value] = line.split("=");
        process.env[label.trim()] = value.trim();
      });
    }
    resolve(true);
  });
};

export const getK8sSchemaVersion = async (filePath: string) => {
  return new Promise((resolve, reject) => {
    if (process.env[K8S_SCHEMA_VERSION]) {
      resolve(process.env[K8S_SCHEMA_VERSION]);
      return;
    }
    const child = spawn("head", ["-1", filePath]);
    let data: any[] = [];
    child.stdout.on("data", (chunk: any) => {
      data.push(chunk);
    });
    child.stdout.on("close", () => {
      let content = Buffer.concat(data).toString();
      if (content.startsWith("#")) {
        let version = content.split(":")[1].trim();
        resolve(version);
      } else {
        vscode.window
          .showInputBox({
            value: DEFAULT_SCHEMA_VERSION,
            prompt: "Enter K8s Schema Version",
            title: "Enter K8s Schema Version",
          })
          .then((value) => {
            resolve(value);
          });
      }
    });
  });
};

export const getDatreeOutput = (filePath: string, k8sSchemaVersion: string) => {
  return new Promise((resolve, reject) => {
    let policy = process.env[POLICY];
    const child =
      policy !== "default"
        ? spawn("datree", [
          "test",
          filePath,
          "--output",
          "json",
          "--schema-version",
          k8sSchemaVersion,
          "--policy",
          policy,
        ])
        : spawn("datree", [
          "test",
          filePath,
          "--output",
          "json",
          "--schema-version",
          k8sSchemaVersion,
        ]);
    let data: any = [];
    child.stdout.on("data", (chunk: any) => {
      data.push(chunk);
    });
    child.stdout.on("close", () => {
      let temp = Buffer.concat(data).toString();
      if (policy && temp.includes(policy)) {
        reject(temp.trim());
        return;
      }
      let json = JSON.parse(temp);
      json["K8sSchemaVersion"] = k8sSchemaVersion;
      json["ts"] = new Date().toString();
      json["type"] = "YAML";
      json["policy"] = process.env[POLICY];
      json[CONFIG_PATH] = process.env[CONFIG_PATH];
      let base64 = Buffer.from(JSON.stringify(json)).toString("base64");
      resolve([json, base64]);
    });

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
        overviewRulerColor: "yellow",
      })
      : vscode.window.createTextEditorDecorationType({
        textDecoration: "underline",
        overviewRulerColor: "yellow",
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
    let lineNo = parseInt(temp[1].trim().replace(/[^\d.]/g, ""));
    let message = temp[2].trim();
    errors.push({ lineNo, message });
  });
  return errors;
};

export const decorateYamlError = (err: { lineNo: number; message: string }) => {
  let errorPosition = new vscode.Position(err.lineNo - 1, 0);
  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "red",
    overviewRulerColor: "red",
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

export const getK8sErrors = (invalidK8sFile: any, k8sSchemaVersion: string) => {
  let validationErrors = invalidK8sFile.ValidationErrors;
  let errors: string[] = [];
  validationErrors.forEach((err: any) => {
    errors.push(`K8s schema (${k8sSchemaVersion}) error: ${err.ErrorMessage}`);
  });
  return errors;
};

export const decorateK8sError = (err: string) => {
  const decorationType: vscode.TextEditorDecorationType =
    vscode.window.createTextEditorDecorationType({
      textDecoration: "underline",
      color: "red",
      overviewRulerColor: "red",
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
      hoverMessage: err,
    };
    vscode.window.activeTextEditor?.setDecorations(decorationType, [
      decoration,
    ]);
    vscode.workspace.onDidChangeTextDocument(() => {
      vscode.window.activeTextEditor?.setDecorations(decorationType, []);
    });
  }
};

export const getHtmlContent = async (extensionUri: string) => {
  let data = readFileSync(join(extensionUri, "media", "index.html")).toString();
  return data;
};

export const openSolution = async (suggestion: string) => {
  let rules = defaultRules.policies[0].rules;
  for (let rule of rules) {
    if (rule.messageOnFailure === suggestion) {
      vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(rule.url));
      return;
    }
  }
};
