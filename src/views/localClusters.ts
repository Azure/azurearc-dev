import * as vscode from 'vscode';
import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';

const k8s = require('@kubernetes/client-node');

export class LocalClustersProvider implements vscode.TreeDataProvider<LocalCluster>
{
    private _onDidChangeTreeData: vscode.EventEmitter<LocalCluster | undefined | void> =
        new vscode.EventEmitter<LocalCluster | undefined | void>();
    private kubeconfig: KubeConfig = new k8s.KubeConfig();

    readonly onDidChangeTreeData: vscode.Event<LocalCluster | undefined | void> = this._onDidChangeTreeData.event;

    constructor() {}

    async refresh()
    {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: LocalCluster): vscode.TreeItem
    {
        return element;
    }

    async getChildren(element?: LocalCluster): Promise<LocalCluster[]>
    {
        this.kubeconfig.loadFromDefault();
        const clusters = this.kubeconfig.getClusters();
        if (clusters === undefined || clusters.length === 0)
        {
            return [];
        }

        // Check cluster compatibility
        const children: LocalCluster[] = [];
        const currentContext = this.kubeconfig.getCurrentContext();
        try
        {
            for (const cluster of clusters)
            {
                var isCompatible = false;
                try
                {
                    this.kubeconfig.setCurrentContext(cluster.name);
                    const k8sApi = this.kubeconfig.makeApiClient(CoreV1Api);
                    await k8sApi.listNode().then((res) =>
                    {
                        isCompatible = res?.body?.items?.every(_ => _.spec?.providerID?.startsWith('azure'));
                    });
                }
                catch (error)
                {
                    // Ignore error
                }
                finally
                {
                    children.push(
                        new LocalCluster(cluster.name, vscode.TreeItemCollapsibleState.None, isCompatible));
                }
            }
        }
        finally
        {
            this.kubeconfig.setCurrentContext(currentContext);
        }

        return children;
    }

    connectToArc(cluster: LocalCluster)
    {
        vscode.window.showInformationMessage(`TODO: Connected ${cluster.label} to Azure Arc.`);
    }
}

export class LocalCluster extends vscode.TreeItem
{
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly isSupported: boolean,
        public readonly command?: vscode.Command)
    {
        super(label, collapsibleState);

        this.isSupported = isSupported;
        this.tooltip = this.label;
    }

    iconPath = this.isSupported ? new vscode.ThemeIcon('check') : new vscode.ThemeIcon('close');
    contextValue = this.isSupported ? 'canConnect' : '';
}
