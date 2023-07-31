import * as vscode from 'vscode';
import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';
import { reportProgress } from '../common';

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
        return await vscode.window.withProgress({
            location: { viewId: 'localcluster' },
            title: 'Refreshing local K8S clusters...'
        }, async (progress, token) => {
            const startProgress = 0;
            const kubeCfgLoadProgress = 10;
            const kubeCtxLoadProgress = 90;
            const completeProgress = 100;

            var currProg = reportProgress(progress, startProgress, startProgress);
            this.kubeconfig.loadFromDefault();

            currProg = reportProgress(progress, currProg, kubeCfgLoadProgress);
            const contexts = this.kubeconfig.getContexts();
            if (contexts === undefined || contexts.length === 0)
            {
                return [];
            }

            // Check cluster compatibility
            const children: LocalCluster[] = [];
            const currentContext = this.kubeconfig.getCurrentContext();

            const ctxLoadProgressInc = (kubeCtxLoadProgress - kubeCfgLoadProgress) / contexts.length;
            try
            {
                for (const ctx of contexts)
                {
                    var isCompliant = false;
                    try
                    {
                        this.kubeconfig.setCurrentContext(ctx.name);
                        const k8sApi = this.kubeconfig.makeApiClient(CoreV1Api);
                        isCompliant = await this.isNativeClusterCompliant(k8sApi);
                    }
                    catch (error)
                    {
                        console.log(error);
                    }
                    finally
                    {
                        children.push(
                            new LocalCluster(ctx.name, vscode.TreeItemCollapsibleState.None, isCompliant));
                            currProg = reportProgress(progress, currProg, currProg + ctxLoadProgressInc);
                    }
                }
            }
            finally
            {
                this.kubeconfig.setCurrentContext(currentContext);
                currProg = reportProgress(progress, currProg, kubeCtxLoadProgress);
            }

            currProg = reportProgress(progress, currProg, completeProgress);
            return children;
        });
    }

    connectToArc(cluster: LocalCluster)
    {
        vscode.window.showInformationMessage(`TODO: Connected ${cluster.label} to Azure Arc.`);
    }

    private async isNativeClusterCompliant(k8sApi: CoreV1Api): Promise<boolean>
    {
        var isAks = false;
        var isAksEe = false;
        return await k8sApi.listNode().then((res) =>
        {
            // AKS nodes have a providerID that starts with 'azure://'
            isAks = res?.body?.items?.every(_ => _.spec?.providerID?.startsWith('azure'));

            // AKS EE nodes has an annotation with its distro
            isAksEe = res?.body?.items?.every(_ =>
                _.metadata?.annotations?.['node.aksedge.io/distro']?.startsWith('aks_edge'));

            return isAks || isAksEe;
        });
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
