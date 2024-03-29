import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';
import { executeInTerminal, openFileDialog } from '../common';
import { ensureLoggedIn, loadResourceGroupItems, loadSubscriptionItems } from '../utils/azure';
import { TelemetryEvent, sendTelemetryEvent } from '../telemetry';

const k8s = require('@kubernetes/client-node');
const askCreateClusterContextName = 'askCreateCluster';

const arcExtConnectedClusterCorrelationId = "05efd7da-1449-4307-9a92-33322d5cb899";

const supportedViewItemLabel = "Supported";
const unsupportedViewItemLabel = "Not Supported";

enum K8sDistros{
    aks = "AKS",
    aksee = "AKS EE",
    akshci = "AKS HCI",
    unsupported = "Not supported"
}

enum viewItemInlineContext
{
    canConnect = "canConnect",
    canSetContext = "canSetContext",
    canConnectAndSetContext = "canConnectAndSetContext",
    none = "none"
}

export class LocalClustersProvider implements vscode.TreeDataProvider<vscode.TreeItem>
{
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> =
        new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    private kubeconfig: KubeConfig = new k8s.KubeConfig();
    private clusters: LocalClusterViewItem[] = [];

    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor()
    {
        this.refresh();
    }

    async refresh()
    {
        this.clusters = await vscode.window.withProgress({
            location: { viewId: 'localcluster' },
            title: 'Refreshing local K8S clusters...'
        }, async (progress, token) => {
            const children: LocalClusterViewItem[] = [];
            try
            {
                this.kubeconfig.loadFromDefault();
    
                const contexts = this.kubeconfig.getContexts();
                if (contexts === undefined || contexts.length === 0)
                {
                    return [];
                }
    
                // Check cluster compatibility
                const currentContext = this.kubeconfig.getCurrentContext();
                try
                {
                    for (const ctx of contexts)
                    {
                        var scanRes: [K8sDistros, boolean] = [K8sDistros.unsupported, false];
                        try
                        {
                            this.kubeconfig.setCurrentContext(ctx.name);
                            const k8sApi = this.kubeconfig.makeApiClient(CoreV1Api);
                            scanRes = await this.scanNativeCluster(k8sApi);
                        }
                        catch (error)
                        {
                            console.log(error);
                        }
                        finally
                        {
                            children.push(
                                new LocalClusterViewItem(
                                    ctx.cluster,
                                    ctx.name,
                                    vscode.TreeItemCollapsibleState.None,
                                    scanRes[0],
                                    scanRes[1],
                                    ctx.name === currentContext));
                        }
                    }
                }
                finally
                {
                    this.kubeconfig.setCurrentContext(currentContext);
                }
            }
            finally
            {
                const askCreateCluster = children.length === 0;
                await vscode.commands.executeCommand('setContext', askCreateClusterContextName, askCreateCluster);
                return children;
            }
        });

        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem
    {
        return element;
    }

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]>
    {
        if (element)
        {
            if (element instanceof ClusterCategoryViewItem)
            {
                const categoryItem = element as ClusterCategoryViewItem;
                if (categoryItem.label === supportedViewItemLabel)
                {
                    return this.clusters.filter(_ => _.distro !== K8sDistros.unsupported);
                }
                else if (categoryItem.label === unsupportedViewItemLabel)
                {
                    return this.clusters.filter(_ => _.distro === K8sDistros.unsupported);
                }
            }
        }
        else
        {
            return [
                new ClusterCategoryViewItem(supportedViewItemLabel, vscode.TreeItemCollapsibleState.Expanded),
                new ClusterCategoryViewItem(unsupportedViewItemLabel, vscode.TreeItemCollapsibleState.Expanded)
            ];
        }

        return [];
    }

    async setCurrentContext(cluster: LocalClusterViewItem)
    {
        this.kubeconfig.loadFromDefault();
        const contexts = this.kubeconfig.getContexts();
        if (contexts.some(_ => _.name === cluster.k8sContextName))
        {
            executeInTerminal(`kubectl config use-context ${cluster.k8sContextName}`);
        }

        setTimeout(() => this.refresh(), 1500);
    }

    // Detects native cluster distro and whether the cluster is already connected to Arc
    private async scanNativeCluster(k8sApi: CoreV1Api): Promise<[K8sDistros, boolean]>
    {
        var distro = K8sDistros.unsupported;
        var isConnected = false;
        try
        {
            await k8sApi.listNode().then(async (res) =>
            {
                if (res?.body?.items?.every(_ => _.spec?.providerID?.startsWith('azure')))
                {
                    // AKS nodes have a providerID that starts with 'azure://'
                    distro = K8sDistros.aks;
                }
                else if (res?.body?.items?.every(_ =>
                    _.metadata?.annotations?.['node.aksedge.io/distro']?.startsWith('aks_edge')))
                {
                    // AKS EE nodes has an annotation with its distro
                    distro = K8sDistros.aksee;
                }
                else if (res?.body?.items?.every(_ =>
                    _.metadata?.annotations?.['csi.volume.kubernetes.io/nodeid']?.includes('akshci')))
                {
                    distro = K8sDistros.akshci;
                }

                if (distro !== K8sDistros.unsupported)
                {
                    // Check if the cluster is already connected to Arc
                    await k8sApi.listNamespacedPod('azure-arc').then((res) =>
                    {
                        if (res?.body?.items?.length > 0)
                        {
                            isConnected = true;
                        }
                    });
                }
            });
        }
        catch (error)
        {
            console.log(`Failed to scan native cluster. Error: ${error}.`);
        }

        return [distro, isConnected];
    }
}

export async function connectToArc(cluster: LocalClusterViewItem)
{
    if (!await ensureLoggedIn())
    {
        return;
    }

    var subItems = await loadSubscriptionItems(true, true);
    if (subItems === undefined || subItems.length === 0)
    {
        return;
    }

    const subItem = subItems[0];
    var rgItems = await loadResourceGroupItems(subItem, true, true);
    if (rgItems === undefined || subItem.resourceGroups.length === 0)
    {
        return;
    }

    const clusterName = await vscode.window.showInputBox({
        prompt: 'Please specify a name for the connected cluster.',
        placeHolder: 'Your cluster name'
    });

    if (clusterName === undefined)
    {
        return;
    }

    sendTelemetryEvent(TelemetryEvent.connectToArc);
    executeInTerminal(`az login`);
    executeInTerminal(`az account set --subscription "${subItem.subscription.subscriptionId!}"`);
    executeInTerminal(`az connectedk8s connect --name "${clusterName}" --resource-group "${subItem.resourceGroups[0].resourceGroup.name!}" --location "${subItem.resourceGroups[0].resourceGroup.location}" --correlation-id "${arcExtConnectedClusterCorrelationId}"`);
    return subItem;
}

export async function createAksEE()
{
    const proceed = "Proceed";
    const cancel = "Cancel";
    sendTelemetryEvent(TelemetryEvent.createAksEE);
    await vscode.window.showInformationMessage(
        `Before proceeding with the download, please ensure you meet the Edge Essentials [hardware requirements](https://learn.microsoft.com/en-us/azure/aks/hybrid/aks-edge-system-requirements).`,
        {
            detail: `[Learn more](https://learn.microsoft.com/en-us/azure/aks/hybrid/aks-edge-overview)`
        },
        proceed,
        cancel
    ).then(async result => {
        if (result === proceed)
        {
            sendTelemetryEvent(TelemetryEvent.downloadAksEE);
            var dir = await openFileDialog(false, true, false, 'Select a folder to install AKS EE');
            if (dir === undefined)
            {
                return;
            }

            const installScriptSrc = path.join(__dirname, 'scripts', 'Install-AksEE.ps1');
            const dest = path.join(dir, 'Install-AksEE.ps1');
            fs.copyFile(installScriptSrc, dest, (err) => {
                if (err)
                {
                    throw err;
                }

                console.log('Installation script copied successfully!');
            });

            vscode.window.showInformationMessage(
                `Installation script copied to ${dest} and will be executed in a new powershell console with admin privilege.`);
            var cmd = `Start-Process powershell -verb runas -ArgumentList ("-Command ${dest} -InstallDir ${dir}")`;
            executeInTerminal(cmd);
        }
    });
}

export class ClusterCategoryViewItem extends vscode.TreeItem
{
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState)
    {
        super(label, collapsibleState);
        this.tooltip = this.label;
    }
}

export class LocalClusterViewItem extends vscode.TreeItem
{
    constructor(
        public readonly label: string,
        public readonly k8sContextName: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly distro: K8sDistros,
        public readonly isConnected: boolean,
        public readonly isCurrentContext: boolean)
    {
        super(label, collapsibleState);

        this.k8sContextName = k8sContextName;
        this.distro = distro;
        this.isConnected = isConnected;
        this.isCurrentContext = isCurrentContext;
        this.tooltip = this.label;
    }

    contextValue = this.treeItemContext;
    description = this.descriptionDetails;
    iconPath = this.isCurrentContext ? new vscode.ThemeIcon('star-full') : undefined;

    private get treeItemContext(): string
    {
        const canConnect = (this.distro !== K8sDistros.unsupported) && !this.isConnected;

        if (canConnect && this.isCurrentContext)
        {
            return viewItemInlineContext.canConnect;
        }
        else if (canConnect && !this.isCurrentContext)
        {
            return viewItemInlineContext.canConnectAndSetContext;
        }
        else if (!canConnect && this.isCurrentContext)
        {
            return viewItemInlineContext.none;
        }
        else
        {
            return viewItemInlineContext.canSetContext;
        }
    }

    private get descriptionDetails(): string
    {
        if (this.distro === K8sDistros.unsupported)
        {
            return this.distro;
        }

        return `${this.distro} - ${this.isConnected ? 'Connected' : 'Not Connected'}`;
    }
}