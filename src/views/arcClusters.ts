import * as vscode from 'vscode';
import { SubscriptionItem, buildSubscriptionItems, isLoggedIn } from '../utils/azure';

const askSubRgContextName = 'askSubRg';
const askAzLoginContextName = 'askAzLogin';

enum ClusterViewStatus
{
    notLoggedIn,
    noSubRgSelection,
    noArcClusters,
    ok
}

class ArcClustersInfo
{
    readonly connectedClustersResourceType = 'Microsoft.Kubernetes/connectedClusters';
    readonly provisionedClustersResourceType = 'Microsoft.HybridContainerService/provisionedClusters';

    private subItems: SubscriptionItem[] = [];

    constructor() {}

    getSubItems(): SubscriptionItem[]
    {
        return this.subItems;
    }

    getResourceCount()
    {
        return this.subItems.reduce((acc, sub) => acc + sub.getResourceCount(), 0);
    }

    hasSubRgSelection()
    {
        return this.subItems.length > 0 && this.subItems.some(_ => _.resourceGroups.length > 0);
    }

    async setWelcomViewVisibility(status: ClusterViewStatus)
    {
        var askAzLogin = false;
        var askSubRg = false;
        switch (status)
        {
            case ClusterViewStatus.notLoggedIn:
                askAzLogin = true;
                askSubRg = false;
                break;

            case ClusterViewStatus.noSubRgSelection:
                askAzLogin = false;
                askSubRg = true;
                break;

            case ClusterViewStatus.noArcClusters:
            case ClusterViewStatus.ok:
                askAzLogin = false;
                askSubRg = false;
                break;
        }

        await vscode.commands.executeCommand('setContext', askAzLoginContextName, askAzLogin);
        await vscode.commands.executeCommand('setContext', askSubRgContextName, askSubRg);
    }

    // Refresh local kubeconfig and subscription items with the current sub/rg selection
    async refreshClusters(loadArmResource: boolean = true)
    {
        return await vscode.window.withProgress({
            location: { viewId: 'arccluster' },
            title: 'Reloading Arc clusters...'
        }, async (progress, token) => {
            progress.report({ increment: 0 });
            var status = ClusterViewStatus.ok;
            try
            {
                // Arc clusters
                const loggedIn = await isLoggedIn();
                if (!loggedIn)
                {
                    this.subItems = [];
                    status = ClusterViewStatus.notLoggedIn;
                    progress.report({ increment: 90 });
                }
                else
                {
                    progress.report({ increment: 20 });
                    if (loadArmResource && this.subItems.length > 0)
                    {
                        const inc = (90 - 30) / this.subItems.length;
                        for (const sub of this.subItems)
                        {
                            await sub.loadResources(
                                [this.connectedClustersResourceType, this.provisionedClustersResourceType]);
                            progress.report({ increment: inc });
                            await new Promise((resolve) => setTimeout(resolve, 200));
                        }
                    }
                    else
                    {
                        progress.report({ increment: 90 });
                    }

                    if (!this.hasSubRgSelection())
                    {
                        status = ClusterViewStatus.noSubRgSelection;
                    }
                    else
                    {
                        const resourceCount = this.getResourceCount();
                        status = (resourceCount === undefined || resourceCount === 0) ?
                            ClusterViewStatus.noArcClusters : ClusterViewStatus.ok;
                    }
                }
            }
            finally
            {
                await this.setWelcomViewVisibility(status);
                progress.report({ increment: 10 });
            }
        });
    }

    // Prompt users to make new sub/rg selection and refresh
    async selectSubRg()
    {
        const newSubItems = await buildSubscriptionItems();

        if (newSubItems.length > 0)
        {
            this.subItems = newSubItems;
            await this.refreshClusters();
        }
    }
}

export class ArcClustersProvider implements vscode.TreeDataProvider<ArcClusterViewItemBase>
{
    private _onDidChangeTreeData: vscode.EventEmitter<ArcClusterViewItemBase | undefined | void> =
        new vscode.EventEmitter<ArcClusterViewItemBase | undefined | void>();
    private clustersInfo: ArcClustersInfo = new ArcClustersInfo();

    readonly onDidChangeTreeData: vscode.Event<ArcClusterViewItemBase | undefined | void> =
        this._onDidChangeTreeData.event;

    constructor() {}

    // Rebuild cluster info with a new sub/rg selection
    async rebuildClustersInfo()
    {
        await this.clustersInfo.selectSubRg();
        await this.refresh();
    }

    async refresh()
    {
        await this.clustersInfo.refreshClusters();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ArcClusterViewItemBase): vscode.TreeItem
    {
        return element;
    }

    async getChildren(element?: ArcClusterViewItemBase): Promise<ArcClusterViewItemBase[]>
    {
        const resourceCount = this.clustersInfo.getResourceCount();
        if (resourceCount === undefined || resourceCount === 0)
        {
            return [];
        }

        const children: ArcClusterViewItemBase[] = [];
        const subItems = this.clustersInfo.getSubItems()!;
        if (element)
        {
            if (element instanceof SubscriptionViewItem)
            {
                const sub = subItems.find(_ => _.label === element.label);
                sub?.resourceGroups.forEach(rg =>
                {
                    children.push(new ResourceGroupViewItem(
                        rg.label, vscode.TreeItemCollapsibleState.Expanded, sub.label));
                });
            }
            else if (element instanceof ResourceGroupViewItem)
            {
                const rgItem = element as ResourceGroupViewItem;
                const sub = subItems.find(_ => _.label === rgItem.subscriptionName);
                const rg = sub?.resourceGroups.find(_ => _.label === element.label);
                rg?.resources.forEach(resource => {
                    children.push(new ArcClusterViewItem(
                        resource.name!, vscode.TreeItemCollapsibleState.None, sub!.label, rg?.label));
                });
            }
        }
        else
        {
            children.push(...subItems.map(_ => 
                new SubscriptionViewItem(_.label, vscode.TreeItemCollapsibleState.Expanded)));
        }

        return children;
    }
}

abstract class ArcClusterViewItemBase extends vscode.TreeItem
{
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command)
    {
        super(label, collapsibleState);
        this.tooltip = this.label;
    }
}

class SubscriptionViewItem extends ArcClusterViewItemBase
{
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command)
    {
        super(label, collapsibleState, command);
    }
}

class ResourceGroupViewItem extends ArcClusterViewItemBase
{
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly subscriptionName: string,
        public readonly command?: vscode.Command)
    {
        super(label, collapsibleState, command);
        this.subscriptionName = subscriptionName;
    }
}

class ArcClusterViewItem extends ArcClusterViewItemBase
{
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly subscriptionName: string,
        public readonly resourceGroupName: string,
        public readonly command?: vscode.Command)
    {
        super(label, collapsibleState, command);
        this.subscriptionName = subscriptionName;
        this.resourceGroupName = resourceGroupName;
    }

    iconPath = new vscode.ThemeIcon('cloud');
    contextValue = 'arcclusterItem';
}
