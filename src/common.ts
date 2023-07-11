import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { showSingularChoiceQuickpick } from './quickpicks';

export const outputChannelName = "Azure Arc";

const imageNameKeyName = "imgName";

export class ArcExtOption implements vscode.QuickPickItem
{
    id?: string;
    label: string;
    action: (context?: vscode.ExtensionContext) => Promise<void>;
    description?: string;
    detail?: string;
    data?: string;

    constructor(
        label: string,
        action: (context?: vscode.ExtensionContext) => Promise<void>,
        description?: string,
        detail?: string,
        data?: string)
    {
        this.id = uuidv4();
        this.label = label;
        this.action = action;

        this.description = description;
        this.detail = detail;
        this.data = data;
    }
}

export async function openFileDialog(
    canSelectFiles: boolean,
    canSelectFolders: boolean,
    canSelectMany: boolean,
    title?: string,
    filters?: { [name: string]: string[] })
{
    const options: vscode.OpenDialogOptions =
    {
        title: title,
        canSelectFiles: canSelectFiles,
        canSelectFolders: canSelectFolders,
        canSelectMany: canSelectMany,
        filters: filters
    };
  
    const result = await vscode.window.showOpenDialog(options);
    if (result && result.length > 0)
    {
        return result[0].fsPath;
    }
}

export async function getNullableBoolResponseFromInputBox(prompt: string)
{
    const input = await vscode.window.showInputBox({
        prompt: prompt,
        placeHolder: 'Y/N',
        validateInput: (input) => {
            if (!input.match(/^[ynYN]$/)) {
                return 'Please enter Y/y or N/n.';
            }
        },
    });

    return (input === undefined) ? undefined : input.toLocaleLowerCase() === 'y';
}

export async function getImageName(context?: vscode.ExtensionContext)
{
    var res;
    if (context !== undefined)
    {
        const imageName = context.workspaceState.get<string>(imageNameKeyName);
        if (imageName !== undefined)
        {
            const options: ArcExtOption[] =
            [
                new ArcExtOption(
                    `Use image name '${imageName}'`,
                    async () => { res = imageName; }
                ),
                new ArcExtOption(
                    'Use another image name',
                    async () => { res = undefined; }
                )
            ];

            await showSingularChoiceQuickpick(
                options, 'Select resource definition based dir', 'Base dir where bicep files will be generated');
        }
    }

    if (res === undefined)
    {
        res = await vscode.window.showInputBox({
            placeHolder: "The image name including container registry uri",
            prompt: "e.g., mycr.io/mytest"
        });

        if (res === undefined)
        {
            return;
        }

        res = res.toLocaleLowerCase();
        context?.workspaceState.update(imageNameKeyName, res);
    }

    return res;
}