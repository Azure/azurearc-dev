import * as vscode from 'vscode';
import { ResourceManagementClient } from '@azure/arm-resources';
import { SubscriptionClient, SubscriptionModels } from '@azure/arm-subscriptions';
import { apiUtils } from '@microsoft/vscode-azext-utils';
import { AzureAccountExtensionApi, AzureSession } from '../external/azure-account.api';
import { GenericResourceExpanded, ResourceGroup } from '@azure/arm-resources/esm/models';
import { ArcExtOption, reportProgress } from '../common';
import { showMultipleChoiceQuickpick, showSingularChoiceQuickpick } from '../quickpicks';

export class ResourceGroupItem implements ArcExtOption
{
    public label: string;
    action: (context?: vscode.ExtensionContext) => Promise<void>;
    public description: string;
    public resourceGroup: ResourceGroup;
    public resources: GenericResourceExpanded[];
    picked: boolean = false;

    constructor(
        label: string,
        action: (context?: vscode.ExtensionContext) => Promise<void>,
        description: string,
        resourceGroup: ResourceGroup,
        resources: GenericResourceExpanded[],
        picked: boolean = false)
    {
        this.label = label;
        this.action = action;
        this.description = description;
        this.resourceGroup = resourceGroup;
        this.resources = resources;
        this.picked = picked;
    }
}

export class SubscriptionItem implements ArcExtOption
{
    label: string;
    action: (context?: vscode.ExtensionContext) => Promise<void>;
    description: string;
    session: AzureSession;
    subscription: SubscriptionModels.Subscription;
    resourceGroups: ResourceGroupItem[];
    picked: boolean = false;

    constructor(
        label: string,
        action: (context?: vscode.ExtensionContext) => Promise<void>,
        description: string,
        session: AzureSession,
        subscription: SubscriptionModels.Subscription,
        resourceGroups: ResourceGroupItem[],
        picked: boolean = false)
    {
        this.label = label;
        this.action = action;
        this.description = description;
        this.session = session;
        this.subscription = subscription;
        this.resourceGroups = resourceGroups;
        this.picked = picked;
    }

    getResourceCount()
    {
        return this.resourceGroups.reduce((acc, rg) => acc + rg.resources.length, 0);
    }

    // Return number of all resources
    async loadResources(resourceTypes?: string[])
    {
        const armClient = new ResourceManagementClient(
            this.session.credentials2, this.subscription.subscriptionId!);

        for (const rgItem of this.resourceGroups)
        {
            var resources = await armClient.resources.listByResourceGroup(rgItem.label);
            rgItem.resources = resources;
            while (resources.nextLink)
            {
                resources = await armClient.resources.listByResourceGroupNext(resources.nextLink);
                rgItem.resources = rgItem.resources.concat(resources);
            }

            if (resourceTypes && resourceTypes.length > 0)
            {
                rgItem.resources = rgItem.resources.filter(r =>
                {
                    if (r.type)
                    {
                        return resourceTypes.includes(r.type);
                    }

                    return false;
                });
            }
        }

        return this.getResourceCount();
    }
}

interface PartialList<T> extends Array<T>
{
    nextLink?: string;
}

export const azureAccountProvider = vscode.extensions.getExtension('ms-vscode.azure-account')!.exports;
const azureAccountApi: AzureAccountExtensionApi =
    (<apiUtils.AzureExtensionApiProvider>azureAccountProvider).getApi('1.0.0');

export async function isLoggedIn()
{
    const loggedIn = await azureAccountApi.waitForLogin();
    return loggedIn;
}

export async function ensureLoggedIn()
{
    var loggedIn = await azureAccountApi.waitForLogin();
    if (!loggedIn)
    {
        loggedIn = await vscode.commands.executeCommand('azure-account.askForLogin');
    }
    return loggedIn;
}

export async function buildSubscriptionItems(
    interactive: boolean = true,
    subRgSelection?: { [key: string]: string[] }): Promise<SubscriptionItem[]>
{
    return await vscode.window.withProgress({
        location: { viewId: 'arccluster' },
        title: 'Selecting subscriptions and resource groups...'
    }, async (progress, token) => {
        const startProgress = 0;
        const loginProgress = 20;
        const loadSubProgress = 40;
        const loadRgProgress = 90;
        const completeProgress = 100;

        var currProg = reportProgress(progress, startProgress, startProgress);
        ensureLoggedIn();

        currProg = reportProgress(progress, currProg, loginProgress);

        const subscriptionItems = await loadSubscriptionItems(interactive, false, Object.keys(subRgSelection || {}));
        currProg = reportProgress(progress, currProg, loadSubProgress);
        if (subscriptionItems === undefined || subscriptionItems.length === 0)
        {
            return [];
        }

        const rgSelectionProgressInc = (loadRgProgress - loadSubProgress) / subscriptionItems.length;
        for (const sub of subscriptionItems)
        {
            const key: string = sub.subscription.subscriptionId!;
            const rgList: string[] = subRgSelection ? subRgSelection[key] : [];
            await loadResourceGroupItems(sub, interactive, false, rgList);
            currProg = reportProgress(progress, currProg, currProg + rgSelectionProgressInc);
        };

        currProg = reportProgress(progress, currProg, completeProgress);
        return subscriptionItems;
    });
}

export async function loadSubscriptionItems(
    interactive: boolean = true,
    singleSelection: boolean = false,
    subscriptionFilter?: string[]) : Promise<SubscriptionItem[]>
{
    await azureAccountApi.waitForFilters();
    var subscriptionItems: SubscriptionItem[] = [];
    const hasFilter = subscriptionFilter !== undefined && subscriptionFilter.length > 0;
    for (const session of azureAccountApi.sessions)
    {
        try
        {
            const subscriptionClient = new SubscriptionClient(session.credentials2);
            console.log(`Sub client created for '${session.userId}, ${session.environment}'.`);

            var subscriptions = await listAll(
                subscriptionClient.subscriptions, subscriptionClient.subscriptions.list());

            // Apply subscription filter silently if filter is specified in non-interactive subscription load.
            // Pre-select the selected subscriptions for interactive subscription load with filter.
            if (hasFilter && !interactive)
            {
                subscriptions =
                    subscriptions.filter(_ => subscriptionFilter.includes(_.subscriptionId || ''));
            }

            subscriptionItems.push(...subscriptions.map(subscription => 
                new SubscriptionItem(
                    subscription.displayName || '',
                    async () => {},
                    subscription.subscriptionId || '',
                    session,
                    subscription,
                    [],
                    hasFilter && subscriptionFilter.includes(subscription.subscriptionId || ''))));
        }
        catch (error)
        {
            console.log(`Error listing subscriptions for '${session.userId}': ${error}`);
        }
    }

    subscriptionItems.sort((a, b) => a.label.localeCompare(b.label));

    if (interactive)
    {
        const selectedSubs: SubscriptionItem[] = [];
        if (singleSelection)
        {
            selectedSubs.push(await showSingularChoiceQuickpick(
                subscriptionItems, 'Select subscriptions', 'Select subscriptions', false) as SubscriptionItem);
        }
        else
        {
            var chosenSubs = await showMultipleChoiceQuickpick(subscriptionItems, 'Select subscriptions', 'Select subscriptions', false);
            if (chosenSubs === undefined)
            {
                return [];
            }
            selectedSubs.push(... chosenSubs as SubscriptionItem[]);
        }

        if (selectedSubs === undefined || selectedSubs.length === 0 || selectedSubs[0] === undefined)
        {
            return [];
        }

        return selectedSubs;
    }

    return subscriptionItems;
}

export async function loadResourceGroupItems(
    subscriptionItem: SubscriptionItem,
    interactive: boolean = true,
    singleSelection: boolean = false,
    resourceGroupFilter?: string[]) : Promise<ResourceGroupItem[]>
{
    const { session, subscription } = subscriptionItem;
    var rgItems: ResourceGroupItem[] = [];
    const hasFilter = resourceGroupFilter !== undefined && resourceGroupFilter.length > 0;

    try
    {
        const armClient = new ResourceManagementClient(session.credentials2, subscription.subscriptionId!);
        var resourceGroups = await listAll(armClient.resourceGroups, armClient.resourceGroups.list());
    
        // Apply resource group filter silently if filter is specified in non-interactive resource group load.
        // Pre-select the selected resource groups for interactive resource group load with filter.
        if (hasFilter && !interactive)
        {
            resourceGroups = resourceGroups.filter(_ => resourceGroupFilter.includes(_.name || ''));
        }

        rgItems.push(...resourceGroups.map(rg => ({
            label: rg.name || '',
            action: async () => {},
            description: rg.location,
            resourceGroup: rg,
            resources: [],
            picked: hasFilter && resourceGroupFilter.includes(rg.name || '')
        })));
    }
    catch (error)
    {
        console.log(`Error listing resource groups for '${session.userId}': ${error}`);
    }

    rgItems.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
    if (rgItems.length === 0)
    {
        return [];
    }

    if (interactive)
    {
        const selectedRgs: ResourceGroupItem[] = [];
        if (singleSelection)
        {
            selectedRgs.push(await showSingularChoiceQuickpick(
                rgItems,
                `Select Resource Groups from '${subscriptionItem.label}'`,
                'Select Resource Groups',
                false) as ResourceGroupItem);
        }
        else
        {
            var chosenRgs = await showMultipleChoiceQuickpick(
                rgItems,
                `Select Resource Groups from '${subscriptionItem.label}'`,
                'Select Resource Groups',
                false);
            if (chosenRgs === undefined)
            {
                return [];
            }
            selectedRgs.push(... chosenRgs as ResourceGroupItem[]);
        }
    
        if (selectedRgs === undefined || selectedRgs.length === 0 || selectedRgs[0] === undefined)
        {
            return [];
        }

        rgItems = selectedRgs;
    }

    subscriptionItem.resourceGroups = [];
    subscriptionItem.resourceGroups.push(...rgItems);
    return rgItems;
}

async function listAll<T>(
    client: { listNext(nextPageLink: string): Promise<PartialList<T>>; },
    first: Promise<PartialList<T>>): Promise<T[]>
{
    const all: T[] = [];
    for (let list = await first;
        list !== undefined && (list.length || list.nextLink);
        list = list.nextLink ? await client.listNext(list.nextLink) : [])
    {
        all.push(...list);
    }

    return all;
}
