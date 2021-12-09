// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
		overviewRulerColor: 'yellow',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		light: {
			// this color will be used in light color themes
			borderColor: 'darkyellow'
		},
		dark: {
			// this color will be used in dark color themes
			borderColor: 'lightyellow'
		}
	});

	let decorate = vscode.commands.registerCommand('demo.decorate',()=>{
		const regEx = /name+/g;
		const text = vscode.window.activeTextEditor?.document.getText();
		let match;
		const smallNumbers: vscode.DecorationOptions[] = [];
		const largeNumbers: vscode.DecorationOptions[] = [];
		let activeEditor = vscode.window.activeTextEditor;
		if(!text || !activeEditor) 
		{return;}	

		while ((match = regEx.exec(text))) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
			smallNumbers.push(decoration);
		}	
		activeEditor.setDecorations(smallNumberDecorationType, smallNumbers);
	});


	let scanFile = vscode.commands.registerCommand('demo.scanFile',()=>{

	});



	let btn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right,200);
	btn.text="run";
	btn.command = 'demo.scanFile';
	btn.show();
	context.subscriptions.push(btn);
	context.subscriptions.push(scanFile);
	context.subscriptions.push(decorate);
}

// this method is called when your extension is deactivated
export function deactivate() {}
