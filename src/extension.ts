import * as vscode from 'vscode';
import * as process from 'process';
import { HelpProvider } from './help';
import { getContainerRegistryFromInputBox } from './common';
import { showArcExtCmdQuickpick } from './quickpicks';
import path = require('path');

export async function activate(context: vscode.ExtensionContext)
{
    console.log('Congratulations, your extension "azurearc" is now active!');
    const helpprovider = new HelpProvider();
    vscode.window.registerTreeDataProvider('helpandfeedback', helpprovider);

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.showInfo', (msg) => {
        vscode.window.showInformationMessage(`Log: ${msg}`);
    }));

    vscode.commands.registerCommand('azurearc.openWalkthrough', () => {
        vscode.commands.executeCommand(
            'workbench.action.openWalkthrough', 
            { category: 'peterwu.azurearc#walkthrough'}
        );
    });

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.openWebpage', (uri) => {
        vscode.env.openExternal(vscode.Uri.parse(uri));
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.openHelp', () => {
        vscode.commands.executeCommand('workbench.view.extension.arc-extension');
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.gettingStarted', async () => {
        await showArcExtCmdQuickpick(context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.provisionK8s', async () => {
        await showArcExtCmdQuickpick(context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.build2Deploy', async () => {
        var input = await getContainerRegistryFromInputBox();
        let t = vscode.window.createTerminal();
        t.show(true);
        t.sendText(`docker build -t ${input} -f Dockerfile .`);
        t.sendText(`docker push ${input}`);
        t.sendText(`kubectl apply -f .\\template\\101.deployment.yaml`);
    }));
}

export function deactivate() {}
