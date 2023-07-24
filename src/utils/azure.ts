import * as vscode from 'vscode';
import { ResourceManagementClient } from '@azure/arm-resources';
import { SubscriptionClient, SubscriptionModels } from '@azure/arm-subscriptions';
import type { apiUtils, AzureExtensionApi } from '@microsoft/vscode-azext-utils';
import { AzureAccountExtensionApi, AzureSession } from '../external/azure-account.api';
import { GenericResourceExpanded, ResourceGroup } from '@azure/arm-resources/esm/models';
import { ArcExtOption } from '../common';
import { showMultipleChoiceQuickpick } from '../quickpicks';

export class ResourceGroupItem implements ArcExtOption
{
    public label: string;
    action: (context?: vscode.ExtensionContext) => Promise<void>;
    public description: string;
    public resourceGroup: ResourceGroup;
    public resources: GenericResourceExpanded[];

    constructor(
        label: string,
        action: (context?: vscode.ExtensionContext) => Promise<void>,
        description: string,
        resourceGroup: ResourceGroup,
        resources: GenericResourceExpanded[])
    {
        this.label = label;
        this.action = action;
        this.description = description;
        this.resourceGroup = resourceGroup;
        this.resources = resources;
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

    constructor(
        label: string,
        action: (context?: vscode.ExtensionContext) => Promise<void>,
        description: string,
        session: AzureSession,
        subscription: SubscriptionModels.Subscription,
        resourceGroups: ResourceGroupItem[])
    {
        this.label = label;
        this.action = action;
        this.description = description;
        this.session = session;
        this.subscription = subscription;
        this.resourceGroups = resourceGroups;
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
                rgItem.resources.concat(resources);
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

export async function buildSubscriptionItems(): Promise<SubscriptionItem[]>
{
    ensureLoggedIn();

    const subscriptionItems = await loadSubscriptionItems();
    const selectedSubs = await showMultipleChoiceQuickpick(
        subscriptionItems, 'Select subscriptions', 'Select subscriptions', false);

    var subItems: SubscriptionItem[] = [];
    for (const sub of selectedSubs as SubscriptionItem[])
    {
        const rgItems = await loadResourceGroupItems(sub);
        const selectedRgs = await showMultipleChoiceQuickpick(
            rgItems, `Select Resource Groups from '${sub.label}'`, 'Select Resource Groups', false);

        sub.resourceGroups = [];
        sub.resourceGroups.push(...selectedRgs as ResourceGroupItem[]);
        subItems.push(sub);
    };

    return subItems;
}

export async function loadSubscriptionItems() : Promise<SubscriptionItem[]>
{
    await azureAccountApi.waitForFilters();
    const subscriptionItems: SubscriptionItem[] = [];
    for (const session of azureAccountApi.sessions)
    {
        const credentials = session.credentials2;
        const subscriptionClient = new SubscriptionClient(credentials);
        const subscriptions = await listAll(
            subscriptionClient.subscriptions, subscriptionClient.subscriptions.list());
        subscriptionItems.push(...subscriptions.map(subscription => 
            new SubscriptionItem(
                subscription.displayName || '',
                async () => {},
                subscription.subscriptionId || '',
                session,
                subscription,
                [])));
    }

    subscriptionItems.sort((a, b) => a.label.localeCompare(b.label));
    return subscriptionItems;
}

export async function loadResourceGroupItems(subscriptionItem: SubscriptionItem) : Promise<ResourceGroupItem[]>
{
    const { session, subscription } = subscriptionItem;
    const rgItems: ResourceGroupItem[] = [];

    const armClient = new ResourceManagementClient(session.credentials2, subscription.subscriptionId!);
    const resourceGroups = await listAll(armClient.resourceGroups, armClient.resourceGroups.list());

    rgItems.push(...resourceGroups.map(rg => ({
        label: rg.name || '',
        action: async () => {},
        description: rg.location,
        resourceGroup: rg,
        resources: [],
    })));

    rgItems.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
    return rgItems;
}

async function listAll<T>(
    client: { listNext(nextPageLink: string): Promise<PartialList<T>>; },
    first: Promise<PartialList<T>>): Promise<T[]>
{
    const all: T[] = [];
    for (let list = await first;
        list.length || list.nextLink;
        list = list.nextLink ? await client.listNext(list.nextLink) : [])
    {
        all.push(...list);
    }

    return all;
}
