import * as vscode from 'vscode';
import * as common from './common';
import { generateDependencyBicep } from './bicep';
import { validateHelm } from './helm';
import { SampleTypes, selectSample } from './samples';
import { createAksEE } from './views/localClusters';

export const arcExtCmdOptions: common.ArcExtOption[] =
[
    new common.ArcExtOption(
        'Start with a sample',
        selectSampleType,
        '',
        'Check out what Arc-enabled services can do from a list of samples.'
    ),
    new common.ArcExtOption(
        'Provision a local developlment K8S cluster',
        createAksEE,
        '',
        'Provision a local AKS EE cluster and optinally connect to Arc.'
    ),
    new common.ArcExtOption(
        'Generate Bicep for Azure/Arc dependencies',
        generateDependencyBicep,
        '',
        'Provision Azure/Arc resources on Azure.'
    ),
    new common.ArcExtOption(
        'Helm chart validation',
        validateHelm,
        '',
        'Validate helm charts against Arc requirements.'
    )
];

export async function showSingularChoiceQuickpick(
    items: common.ArcExtOption[],
    title: string,
    placeholder: string,
    execute: boolean = true,
    context?: vscode.ExtensionContext) : Promise<common.ArcExtOption | undefined>
{
    const quickPickOptions = {
        title: title,
        placeHolder: placeholder
    };

    const selected = await vscode.window.showQuickPick(items, quickPickOptions);
    if (execute && selected !== undefined)
    {
        await selected?.action(context).catch(console.error);
    }

    return selected;
}

export async function showMultipleChoiceQuickpick(
    items: common.ArcExtOption[],
    title: string,
    placeholder: string,
    execute: boolean = true,
    context?: vscode.ExtensionContext) : Promise<common.ArcExtOption[] | undefined>
{
    const selected = await vscode.window.showQuickPick(
        items, { canPickMany: true, title: title, placeHolder: placeholder});

    if (execute && selected !== undefined)
    {
        for (const item of selected)
        {
            await item.action(context).catch(console.error);
        }
    }

    return selected;
}

export async function showArcExtCmdQuickpick(context?: vscode.ExtensionContext)
{
    await showSingularChoiceQuickpick(
        arcExtCmdOptions, 'Arc Extension Commands', 'Select a command', true, context);
}

export async function selectSampleType()
{
    const sampleAppLabel = 'Sample applications';
    const jumpstartLabel = 'Jumpstart applications';

    const sampleTypes: common.ArcExtOption[] =
    [
        new common.ArcExtOption(
            sampleAppLabel, async () => {}, '', 'Arc application and Arc extension samples.'
        ),
        new common.ArcExtOption(
            jumpstartLabel, async () => {}, '', 'Jumpstart samples.'
        )
    ];

    const selection = await showSingularChoiceQuickpick(
        sampleTypes, "Select a sample type", "Select a type", false);
    if (selection === undefined)
    {
        return;
    }

    const type = selection.label === sampleAppLabel ? SampleTypes.arcApp : SampleTypes.jumpstart;
    await selectSample(type);
}
