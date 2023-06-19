import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';

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
   canSelectFiles: boolean, canSelectFolders: boolean, canSelectMany: boolean, title?: string)
{
    const options: vscode.OpenDialogOptions =
    {
        title: title,
        canSelectFiles: canSelectFiles,
        canSelectFolders: canSelectFolders,
        canSelectMany: canSelectMany,
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

export async function getContainerRegistryFromInputBox()
{
    const input = await vscode.window.showInputBox({
        placeHolder: "The Uri of the Container Registry with repository",
        prompt: "Give the Uri of the Container Registry with repository"
    });

    return (input === undefined) ? undefined : input.toLocaleLowerCase();
}