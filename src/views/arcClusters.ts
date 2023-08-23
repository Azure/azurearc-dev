import * as vscode from 'vscode';
import { SubscriptionItem, buildSubscriptionItems, isLoggedIn } from '../utils/azure';
import { executeInTerminal, reportProgress } from '../common';

const askSubRgContextName = 'askSubRg';
const askAzLoginContextName = 'askAzLogin';

const subRgSelectionKeyName = "subRgSelection";

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
    private context?: vscode.ExtensionContext;

    constructor(context?: vscode.ExtensionContext)
    {
        this.context = context;
    }

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

    async setWelcomeViewVisibility(status: ClusterViewStatus)
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
    async refreshClusters(loadArmResource: boolean = true, forceLoadSubRg: boolean = false)
    {
        return await vscode.window.withProgress({
            location: { viewId: 'arccluster' },
            title: 'Reloading Arc clusters...'
        }, async (progress, token) => {
            const startProgress = 0;
            const loginProgress = 20;
            const loadArmResourcesProgress = 90;
            const completeProgress = 100;

            var currProg = reportProgress(progress, startProgress, startProgress);
            var status = ClusterViewStatus.ok;
            try
            {
                // Arc clusters
                const loggedIn = await isLoggedIn();
                if (!loggedIn)
                {
                    this.subItems = [];
                    status = ClusterViewStatus.notLoggedIn;
                    currProg = reportProgress(progress, currProg, loadArmResourcesProgress);
                }
                else
                {
                    currProg = reportProgress(progress, currProg, loginProgress);
                    const subRgSelection = this.getSubRgSelection();

                    if ((this.subItems.length === 0 || this.subItems.every(_ => _.resourceGroups.length === 0) || forceLoadSubRg) &&
                        subRgSelection !== undefined &&
                        Object.keys(subRgSelection).length > 0)
                    {
                        var subItems = await buildSubscriptionItems(false, subRgSelection);
                        if (subItems === undefined)
                        {
                            return;
                        }
                        this.subItems = subItems;
                        loadArmResource = true;
                    }

                    const inc = (loadArmResourcesProgress - loginProgress) / this.subItems.length;
                    if (loadArmResource && this.subItems.length > 0)
                    {
                        for (const sub of this.subItems)
                        {
                            await sub.loadResources(
                                [this.connectedClustersResourceType, this.provisionedClustersResourceType]);
                            currProg = reportProgress(progress, currProg, currProg + inc);
                            await new Promise((resolve) => setTimeout(resolve, 200));
                        }
                    }

                    currProg = reportProgress(progress, currProg, loadArmResourcesProgress);
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
                await this.setWelcomeViewVisibility(status);
                currProg = reportProgress(progress, currProg, completeProgress);
            }
        });
    }

    // Prompt users to make new sub/rg selection and refresh
    async selectSubRg(context?: vscode.ExtensionContext)
    {
        const subRgSelection = this.getSubRgSelection();
        const newSubItems = await buildSubscriptionItems(true, subRgSelection);
        if (newSubItems === undefined)
        {
            return;
        }
        this.subItems = newSubItems;
        if (context !== undefined)
        {
            const subRgSelection: { [key: string]: string[] } = {};
            this.subItems.forEach(subItem => {
                subRgSelection![subItem.subscription.subscriptionId!] = subItem.resourceGroups.map(rg => rg.label);
            });

            context?.workspaceState.update(subRgSelectionKeyName, subRgSelection);
        }
    }

    getSubRgSelection()
    {
        return this.context?.workspaceState.get<{ [key: string]: string[] }>(subRgSelectionKeyName);
    }
}

export class ArcClustersProvider implements vscode.TreeDataProvider<ArcClusterViewItemBase>
{
    private _onDidChangeTreeData: vscode.EventEmitter<ArcClusterViewItemBase | undefined | void> =
        new vscode.EventEmitter<ArcClusterViewItemBase | undefined | void>();
    private clustersInfo: ArcClustersInfo;
    private context?: vscode.ExtensionContext;

    readonly onDidChangeTreeData: vscode.Event<ArcClusterViewItemBase | undefined | void> =
        this._onDidChangeTreeData.event;

    constructor(context?: vscode.ExtensionContext)
    {
        this.context = context;
        this.clustersInfo = new ArcClustersInfo(this.context);
    }

    // Rebuild cluster info with a new sub/rg selection
    async rebuildClustersInfo()
    {
        await this.clustersInfo.selectSubRg(this.context);
        await this.refresh();
    }

    async updateChosenSubItem(newsubitem: SubscriptionItem)
    {
        if (this.context !== undefined)
        {
            var subRgSelection = this.context?.workspaceState.get<{ [key: string]: string[] }>(subRgSelectionKeyName);
            if (subRgSelection![newsubitem.subscription.subscriptionId!] === undefined)
            {
                subRgSelection![newsubitem.subscription.subscriptionId!] = newsubitem.resourceGroups.map(rg => rg.label);
            }
            else
            {
                newsubitem.resourceGroups.forEach(rg => {
                    if (!subRgSelection![newsubitem.subscription.subscriptionId!].includes(rg.label))
                    {
                        subRgSelection![newsubitem.subscription.subscriptionId!].push(rg.label);
                    }
                });
            }

            this.context?.workspaceState.update(subRgSelectionKeyName, subRgSelection);
            await this.refresh(true, true);
        }
    }

    async refresh(loadArmResource: boolean = true, forceLoadSubRg: boolean = false)
    {
        await this.clustersInfo.refreshClusters(loadArmResource, forceLoadSubRg);
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ArcClusterViewItemBase): vscode.TreeItem
    {
        return element;
    }

    async getChildren(element?: ArcClusterViewItemBase): Promise<ArcClusterViewItemBase[]>
    {
        const resourceCount = this.clustersInfo.getResourceCount();
        if (resourceCount === undefined)
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
                        rg.label, vscode.TreeItemCollapsibleState.Expanded, sub.label, rg.resourceGroup.location));
                });
            }
            else if (element instanceof ResourceGroupViewItem)
            {
                const rgItem = element as ResourceGroupViewItem;
                const sub = subItems.find(_ => _.label === rgItem.subscriptionName);
                const rg = sub?.resourceGroups.find(_ => _.label === element.label);
                rg?.resources.forEach(resource => {
                    children.push(new ArcClusterViewItem(
                        resource.name!,
                        vscode.TreeItemCollapsibleState.None,
                        sub!.label,
                        sub!.subscription.subscriptionId!,
                        rg!.label,
                        resource.location));
                });
            }
        }
        else
        {
            children.push(...subItems.map(_ => new SubscriptionViewItem(
                _.label, vscode.TreeItemCollapsibleState.Expanded, _.subscription.subscriptionId)));
        }

        return children;
    }
}

export function disconnectFromArc(cluster: ArcClusterViewItem)
{
    executeInTerminal(`az login`);
    executeInTerminal(`az account set --subscription "${cluster.subscriptionId}"`);
    executeInTerminal(`az connectedk8s delete -g ${cluster.resourceGroupName} -n ${cluster.label}`);
}

abstract class ArcClusterViewItemBase extends vscode.TreeItem
{
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState)
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
        public readonly description?: string)
    {
        super(label, collapsibleState);
        this.description = description;
    }
}

class ResourceGroupViewItem extends ArcClusterViewItemBase
{
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly subscriptionName: string,
        public readonly description?: string)
    {
        super(label, collapsibleState);
        this.subscriptionName = subscriptionName;
        this.description = description;
    }
}

export class ArcClusterViewItem extends ArcClusterViewItemBase
{
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly subscriptionName: string,
        public readonly subscriptionId: string,
        public readonly resourceGroupName: string,
        public readonly description?: string)
    {
        super(label, collapsibleState);
        this.subscriptionName = subscriptionName;
        this.subscriptionId = subscriptionId;
        this.resourceGroupName = resourceGroupName;
        this.description = description;
    }

    iconPath = new vscode.ThemeIcon('cloud');
    contextValue = 'arcclusterItem';
}
