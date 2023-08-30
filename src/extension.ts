import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { HelpProvider } from './views/help';
import { selectSampleType, showArcExtCmdQuickpick } from './quickpicks';
import path = require('path');
import { executeInTerminal } from './common';
import { CloudGPTViewProvider } from './views/cloudGpt';
import { getDockerCmds as getDockerCmds, getHelmCmd } from './buildAndDeploy';
import { outputChannel, validateHelm } from './helm';
import { TelemetryEvent, configureTelemetryReporter, sendTelemetryEvent } from './telemetry';
import { azureAccountProvider } from './utils/azure';
import { ArcClusterViewItem, ArcClustersProvider, disconnectFromArc } from './views/arcClusters';
import { LocalClusterViewItem, LocalClustersProvider, connectToArc, createAksEE } from './views/localClusters';

const instanceId = uuidv4();

export async function activate(context: vscode.ExtensionContext)
{
    configureTelemetryReporter(context);

    console.log('Activating extension "azurearc"');
    sendTelemetryEvent(TelemetryEvent.activate, { instanceId: instanceId });

    const helpprovider = new HelpProvider();
    vscode.window.registerTreeDataProvider('helpandfeedback', helpprovider);

    const arcClusterProvider = new ArcClustersProvider(context);
    vscode.window.registerTreeDataProvider('arccluster', arcClusterProvider);

    const localClusterProvider = new LocalClustersProvider();
    vscode.window.registerTreeDataProvider('localcluster', localClusterProvider);

    // const provider = new CloudGPTViewProvider(context.extensionUri);
    // context.subscriptions.push(vscode.window.registerWebviewViewProvider(
    //     CloudGPTViewProvider.viewType, provider,  { webviewOptions: { retainContextWhenHidden: true } })
    // );

    context.subscriptions.push(azureAccountProvider.onSessionsChanged(() => {
        arcClusterProvider.refresh();
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('telemetry.telemetryLevel'))
        {
            configureTelemetryReporter(context);
        }
        // else if (event.affectsConfiguration('azurearc.apiKey'))
        // {
        //     const config = vscode.workspace.getConfiguration('azurearc');
        //     provider.setAuthenticationInfo({ apiKey: config.get('apiKey') });
        // }
        // else if (event.affectsConfiguration('azurearc.apiUrl')) {
        //     const config = vscode.workspace.getConfiguration('azurearc');
        //     let url = config.get('apiUrl') as string;
        //     provider.setSettings({ apiUrl: url });
        // }
    }));

    vscode.commands.registerCommand('azurearc.openWalkthrough', () => {
        vscode.commands.executeCommand(
            'workbench.action.openWalkthrough', 
            { category: 'azurearc-dev.azurearc#walkthrough'}
        );
    });

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.getSamples', async () => {
        await selectSampleType();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.provisionCluster', async () => {
        await createAksEE();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.openWebpage', (uri) => {
        vscode.env.openExternal(vscode.Uri.parse(uri));
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.openHelp', () => {
        vscode.commands.executeCommand('workbench.view.extension.arc-extension');
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.gettingStarted', async () => {
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

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.azLoginAndLoadCache', async () => {
        await arcClusterProvider.azLoginAndLoadCache();
    }));

    context.subscriptions.push(vscode.commands.registerCommand(
        'azurearc.disconnectFromArc',
        async (cluster: ArcClusterViewItem) => await disconnectFromArc(cluster)));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.createAksEE', async () => {
        await createAksEE();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.refreshNativeClusters', async () => {
        await localClusterProvider.refresh();
    }));

    context.subscriptions.push(vscode.commands.registerCommand(
        'azurearc.connectToArc',
        async (cluster: LocalClusterViewItem) => {
            await localClusterProvider.setCurrentContext(cluster);
            var subitem = await connectToArc(cluster);
            if (subitem !== undefined)
            {
                await arcClusterProvider.updateChosenSubItem(subitem);
            }
        }));

    context.subscriptions.push(vscode.commands.registerCommand(
            'azurearc.setNativeClusterContext',
            async (cluster: LocalClusterViewItem) => await localClusterProvider.setCurrentContext(cluster)));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.buildImage', async (selected) => {
        const dockerCmds = await getDockerCmds(selected?.fsPath);
        if (dockerCmds === undefined)
        {
            return;
        }

        dockerCmds.forEach(cmd => executeInTerminal(cmd));
    }));

    context.subscriptions.push(vscode.commands.registerCommand('azurearc.installHelmchart', async () => {
        const helmCmd = await getHelmCmd();
        if (helmCmd === undefined)
        {
            return;
        }

        executeInTerminal(helmCmd);
    }));
}

export function deactivate() {
    outputChannel?.dispose();
}
