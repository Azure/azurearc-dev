import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as common from './common';

export var outputChannel = vscode.window.createOutputChannel(common.outputChannelName);

export async function validateHelm()
{
    const chartpath = await common.openFileDialog(
        true,
        false,
        false,
        'Select helm chart to validate',
        {
            'HelmChart': ['tgz']
        });

    if (chartpath === undefined)
    {
        return;
    }

    const execPath = path.join(__dirname, 'validator.exe');
    try
    {
        const args = ['-chartpath', chartpath];
        const result = cp.spawnSync(execPath, args);
        var msg = result.stdout.toString();
        const succeeded = (result.status === 0);

        if (!succeeded)
        {
            const error = result.stderr.toString();
            if (result.error !== null)
            {
                msg = msg + `\nError: ${error}`;
            }
        }

        outputChannel.clear();
        outputChannel.show();
        outputChannel.appendLine(msg);

        (succeeded) ?
            await vscode.window.showInformationMessage(`Helm chart validation succeeded.`):
            await vscode.window.showErrorMessage(`Helm chart validation failed.`);
    }
    catch (err)
    {
        console.error(`spawnSync error: ${err}`);
    }
}