import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as common from './common';
import { provisionK8S } from './k8s';
import { generateDependencyBicep } from './bicep';
import { validateHelm } from './helm';

export const arcExtCmdOptions: common.ArcExtOption[] =
[
    new common.ArcExtOption(
        'Start with a sample',
        selectSample,
        '',
        'Check out what Arc-enabled services can do from a list of samples.'
    ),
    new common.ArcExtOption(
        'Provision a K8S cluster',
        provisionK8S,
        '',
        'Provision an K8S cluster for development.'
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

export async function selectSample()
{
    // petw: use this url when release
    // const url = "https://raw.githubusercontent.com/Azure/azurearc-dev/main/src/templates.json";
    const url = "https://petwsa.blob.core.windows.net/vscext/templates.json";
    const response = await axios.get(url);
    const templates = response.data as { name: string, description: string, repositoryPath: string }[];
    const options = templates.map(t => {
        return {
            label: t.name,
            detail: t.description,
            data: t.repositoryPath,
            action: async context => {
                var dir = await common.openFileDialog(false, true, false, "Select Sample Working Directory");

                if (dir === undefined)
                {
                    return;
                }

                const dest = path.join(dir, t.repositoryPath!);
                if (fs.existsSync(path.join(dest, 'azure.yaml')))
                {
                    // Repo already exists, open directory.
                    await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(`${dest}`));
                }
                else
                {
                    await vscode.commands.executeCommand(
                        'git.clone', `https://github.com/Azure-Samples/${t.repositoryPath}`, dir);
                }
            }
        } as common.ArcExtOption;
    });

    await showSingularChoiceQuickpick(options, 'Arc Extension Samples', 'Select a sample');
}
