import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { HelpProvider } from './views/help';
import { showArcExtCmdQuickpick } from './quickpicks';
import path = require('path');
import {AppSettings} from './common'
import { CloudGPTViewProvider } from './views/cloudGpt';
import { getDockerCmds as getDockerCmds, getHelmCmd } from './buildAndDeploy';
import { outputChannel, validateHelm } from './helm';
import { TelemetryEvent, configureTelemetryReporter, sendTelemetryEvent } from './telemetry';
import { azureAccountProvider, isLoggedIn } from './utils/azure';
import { ArcClustersProvider } from './views/arcClusters';
import { LocalCluster, LocalClustersProvider } from './views/localClusters';

const instanceId = uuidv4();

export async function activate(context: vscode.ExtensionContext)
{
    configureTelemetryReporter(context);

    console.log('Activating extension "azurearc"');
    sendTelemetryEvent(TelemetryEvent.activate, { instanceId: instanceId });

    const helpprovider = new HelpProvider();
    vscode.window.registerTreeDataProvider('helpandfeedback', helpprovider);

    const arcClusterProvider = new ArcClustersProvider();
    vscode.window.registerTreeDataProvider('arccluster', arcClusterProvider);

    const localClusterProvider = new LocalClustersProvider();
    vscode.window.registerTreeDataProvider('localcluster', localClusterProvider);

    const provider = new CloudGPTViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(
        CloudGPTViewProvider.viewType, provider,  { webviewOptions: { retainContextWhenHidden: true } })
    );

    context.subscriptions.push(azureAccountProvider.onSessionsChanged(() => {
        arcClusterProvider.refresh();
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('telemetry.telemetryLevel'))
        {
            configureTelemetryReporter(context);
        }
        else if (event.affectsConfiguration('azurearc.apiKey'))
        {
            const config = vscode.workspace.getConfiguration('azurearc');
            provider.setAuthenticationInfo({ apiKey: config.get('apiKey') });
        }
        else if (event.affectsConfiguration('azurearc.apiUrl')) {
            const config = vscode.workspace.getConfiguration('azurearc');
            let url = config.get('apiUrl') as string;
            provider.setSettings({ apiUrl: url });
        }
    }));

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

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.validateHelm', async () => {
        await validateHelm();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.refreshArcClusters', async () => {
        await arcClusterProvider.refresh();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.rebuildSubItems', async () => {
        await arcClusterProvider.rebuildClustersInfo();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.refreshLocalClusters', async () => {
        await localClusterProvider.refresh();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.connectToArc', async (cluster: LocalCluster) => {
        await localClusterProvider.connectToArc(cluster);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.build2Deploy', async (selected) => {
        const dockerCmds = await getDockerCmds(selected?.fsPath);
        if (dockerCmds === undefined)
        {
            return;
        }

        const helmCmd = await getHelmCmd();
        if (helmCmd === undefined)
        {
            return;
        }
      
        var t = vscode.window.terminals.find(terminal => terminal.name === AppSettings.TERMINAL)
        var terminal = t === undefined ? vscode.window.createTerminal(AppSettings.TERMINAL):t
        terminal.show(true);
        dockerCmds.forEach(cmd => terminal.sendText(cmd));
        terminal.sendText(helmCmd);
    }));
}

export function deactivate() {
    outputChannel?.dispose();
}
