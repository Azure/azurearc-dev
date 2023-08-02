import * as vscode from 'vscode';
import { HelpProvider } from './help';
import { showArcExtCmdQuickpick } from './quickpicks';
import path = require('path');
import { CloudGPTViewProvider } from './cloudGpt';
import { getDockerCmds as getDockerCmds, getKubectlCmd } from './buildAndDeploy';
import {AppSettings} from './common'

export async function activate(context: vscode.ExtensionContext)
{
    console.log('Congratulations, your extension "azurearc" is now active!');
    const helpprovider = new HelpProvider();
    vscode.window.registerTreeDataProvider('helpandfeedback', helpprovider);

    const provider = new CloudGPTViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(
        CloudGPTViewProvider.viewType, provider,  { webviewOptions: { retainContextWhenHidden: true } })
    );

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

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.build2Deploy', async (selected) => {
        const dockerCmds = await getDockerCmds(selected?.fsPath);
        const kubectlCmd = await getKubectlCmd();
        if (dockerCmds === undefined || kubectlCmd === undefined)
        {
            return;
        }
        var t = vscode.window.terminals.find(terminal => terminal.name === AppSettings.TERMINAL)
        var terminal = t == undefined ? vscode.window.createTerminal(AppSettings.TERMINAL):t
        terminal.show(true);
        dockerCmds.forEach(cmd => terminal.sendText(cmd));
        terminal.sendText(kubectlCmd);
    }));

    vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
        if (event.affectsConfiguration('cloudgpt.apiKey'))
        {
            const config = vscode.workspace.getConfiguration('azurearc');
            provider.setAuthenticationInfo({ apiKey: config.get('apiKey') });
        }
        else if (event.affectsConfiguration('cloudgpt.apiUrl')) {
            const config = vscode.workspace.getConfiguration('chatgpt');
            let url = config.get('apiUrl') as string;
            provider.setSettings({ apiUrl: url });
        }
    });
}

export function deactivate() {}
