import * as vscode from 'vscode';
import * as fs from 'fs';
import * as process from 'process';
import * as cp from 'child_process';
import * as common from './common';
import { showSingularChoiceQuickpick } from './quickpicks';

export async function provisionK8S(context?: vscode.ExtensionContext)
{
    const options: common.ArcExtOption[] =
    [
        {
            label: 'Local',
            detail: 'Provision a local K8S cluster.',
            action: async (context?: vscode.ExtensionContext) => {
                vscode.window.showInformationMessage(`Local K8S cluster created successfully.`);
            }
        },
        {
            label: 'AKS',
            detail: 'Provision an AKS cluster.',
            action: async (context?: vscode.ExtensionContext) => {
                const instructions = "Checkout Instructions";
                await vscode.window.showInformationMessage(
                    'AKS cluster created successfully.',
                    {
                        modal: true,
                        detail: "Please make sure to setup ACR for the AKS cluster to access."
                    },
                    instructions
                ).then(async result => {
                    if (result === instructions)
                    {
                        const uri = vscode.Uri.parse(
                            'https://learn.microsoft.com/en-us/azure/aks/cluster-container-registry-integration?tabs=azure-cli');
                        vscode.env.openExternal(uri);
                    }
                });
            }
        }
    ];

    await showSingularChoiceQuickpick(
        options,
        selection => {
            if (selection[0])
            {
                (selection[0] as common.ArcExtOption).action(context).catch(console.error);
            }
        },
        'Provision K8S Cluster',
        'Select K8S cluster type');
}

export async function provisionLocalK8sCluster()
{
    await new Promise(resolve => setTimeout(resolve, 1000));
    vscode.window.showInformationMessage("Let's pretend that the K8S cluster is created");

    // if (!validateKindPath())
    // {
    //     const locate = "Locate";
    //     const install = "Install";
    //     vscode.window.showInformationMessage(
    //         `We couldn't find kind.exe from PATH.`,
    //         {
    //             modal: true,
    //             detail: `If it is installed, please help locate the installation ` +
    //                 `directory. Otherwise we can install it for you.`
    //         },
    //         locate,
    //         install
    //     ).then(async result => {
    //         var shouldInstall: Boolean = true;
    //         if (result === locate)
    //         {
    //             var dir = await pickDirectory();
    //             updatePath(dir);
    //         }
    //         else if (result === install)
    //         {
    //             const input = await vscode.window.showInputBox({
    //                 prompt: "Please specify a directory to install kind",
    //                 placeHolder: '',
    //                 validateInput: (input) => {
    //                     if (!fs.existsSync(input))
    //                     {
    //                         return 'Please enter a valid existing path.';
    //                     }
    //                 },
    //             });

    //             await vscode.window.withProgress({
    //                 location: vscode.ProgressLocation.Notification,
    //                 title: `Installing kind to ${input}`,
    //                 cancellable: false
    //             }, async (progress) => {
    //                 progress.report({ increment: 0 });
    //                 installKind(input);

    //                 progress.report({ increment: 70 });
    //                 updatePath(input);

    //                 progress.report({ increment: 80 });
    //                 var retries: number = 10;
    //                 do
    //                 {
    //                     await new Promise(resolve => setTimeout(resolve, 1000));
    //                     retries--;
    //                 } while (!validateKindPath() && retries > 0);

    //                 progress.report({ increment: 100 });
    //             });
    //         }
    //         else
    //         {
    //             // User clicked Cancel
    //             vscode.window.showErrorMessage(
    //                 "Please manually install kind.exe and update the PATH environment variable.");
    //             return;
    //         }

    //         if (!validateKindPath())
    //         {
    //             vscode.window.showErrorMessage(
    //                 "Still unable to find kind. Please consider manually setting the PATH environment " +
    //                 "variable or reinstall kind.");
    //             return;
    //         }
    //     });
    // }
}

function validateKindPath(): boolean
{
    const result = cp.spawnSync('where', ['kind.exe']);
    return result.status === 0;
}

function updatePath(newPath: string | undefined)
{
    if (newPath === undefined)
    {
        return;
    }

    const path = process.env.PATH;
    const separator = process.platform === 'win32' ? ';' : ':';
    const newPathList = newPath.split(separator);
    const pathList = path?.split(separator) ?? [];
    const combinedPathList = [...newPathList, ...pathList];
    const combinedPath = combinedPathList.join(separator);
    process.env.PATH = combinedPath;
}

export function installKind(destination: string | undefined)
{
    if (destination === undefined)
    {
        throw new Error("Destination is not specified");
    }

    const kindUrl = 'https://github.com/kubernetes-sigs/kind/releases/download/v0.19.0/kind-windows-amd64';
    const kindPath = `${destination}\\kind.exe`;
    const command = `powershell -Command "Invoke-WebRequest -Uri ${kindUrl} -OutFile ${kindPath}"`;
    cp.exec(command, (err, stdout, stderr) => {
        if (err)
        {
            console.error(`Error installing Kind: ${err}`);
            return;
        }

        console.log(`Kind installed successfully at ${kindPath}`);
    });
}

