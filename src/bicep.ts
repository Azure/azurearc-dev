import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import * as common from './common';
import { showMultipleChoiceQuickpick, showSingularChoiceQuickpick } from './quickpicks';

export class EnabledResources
{
    storageAccounts: boolean = false;
    connectedCluster: boolean = false;
    managedSqlInstance: boolean = false;
    pmec: boolean = false;

    constructor() { }
}

const enabledResources: EnabledResources = new EnabledResources();
const codegenBasePathKeyName = "codegenbase";

const resourcesOptions: common.ArcExtOption[] =
[
    new common.ArcExtOption(
        'Connected Cluster',
        async (context?: vscode.ExtensionContext) => {
            enabledResources.connectedCluster = true;
        },
        '',
        'Connect an existing K8S cluster to Arc.',
    ),
    new common.ArcExtOption(
        'Storage Account',
        async (context?: vscode.ExtensionContext) => {
            enabledResources.storageAccounts = true;
        },
        '',
        'Create storage accounts.'
    ),
    new common.ArcExtOption(
        'Managed SQL Instance',
        async (context?: vscode.ExtensionContext) => {
            enabledResources.managedSqlInstance = true;
        },
        '',
        'Create managed SQL instances with Arc-enabled Data Services.'
    ),
    new common.ArcExtOption(
        'Private MEC',
        async (context?: vscode.ExtensionContext) => {
            enabledResources.pmec = true;
        },
        '',
        'Create a private MEC.'
    ),
];

export async function generateDependencyBicep(context?: vscode.ExtensionContext)
{
    var baseDirPath: string | undefined = '';
    if (context !== undefined)
    {
        // Check if the codegen base is already set.
        const codegenBasePathValue = context.workspaceState.get<string>(codegenBasePathKeyName);
        if (codegenBasePathValue !== undefined)
        {
            const options: common.ArcExtOption[] =
            [
                new common.ArcExtOption(
                    `Use current dir '${codegenBasePathValue}'`,
                    async () => { baseDirPath = codegenBasePathValue; }
                ),
                new common.ArcExtOption(
                    'Pick a new resource definition base dir',
                    async () => { baseDirPath = ''; }
                )
            ];

            await showSingularChoiceQuickpick(
                options, 'Select resource definition based dir', 'Base dir where bicep files will be generated');
        }

        if (baseDirPath === '')
        {
            // Get base dir path and store in workspace state.
            baseDirPath = await common.openFileDialog(false, true, false, 'Select Bicep base folder');
            if (baseDirPath === undefined)
            {
                return;
            }

            context.workspaceState.update(codegenBasePathKeyName, baseDirPath);
        }
    }

    await showMultipleChoiceQuickpick(
        resourcesOptions, 'Resource provisioning', 'Select resources to provision');

    codegen(baseDirPath!);
}

export async function codegen(codegenBaseDir: string)
{
    const execPath = path.join(__dirname, 'codegen', 'codegen.exe');

    try
    {
        var args= ['bicep', '-d', codegenBaseDir];

        if (enabledResources.storageAccounts)
        {
            args.push('-sa');
        }

        const result = cp.spawnSync(execPath, args);
        if (result.status === 1)
        {
            const overwrite = "Overwrite";
            const rename = "Rename";
            await vscode.window.showInformationMessage(
                'Detected exsiting Bicep files that will be overwritten.',
                {
                    modal: true,
                    detail: "Select how you wouldl ike to resolve conflicts."
                },
                overwrite,
                rename,
            ).then(async result => {
                if (result === overwrite || result === rename)
                {
                    args.push('--overwriteOption', result);
                }

                const res = cp.spawnSync(execPath, args);
                if (res.status !== 0)
                {
                    await vscode.window.showErrorMessage(
                        `Unable to generate Bicep. Error: ${res.stderr.toString('utf-8').trim()}`);
                }
                else
                {
                    await vscode.window.showInformationMessage(
                        `Generated resource Bicep definitions.`);
                }
            });
        }
    }
    catch (err)
    {
        console.error(`spawnSync error: ${err}`);
    }
}