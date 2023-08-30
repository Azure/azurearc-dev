import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as common from './common';
import { showSingularChoiceQuickpick } from './quickpicks';
import { TelemetryEvent, sendTelemetryEvent } from './telemetry';

export enum SampleTypes
{
    arcApp,
    jumpstart
}

export async function selectSample(type: SampleTypes)
{
    // petw: use this url when release
    // const url = "https://raw.githubusercontent.com/Azure/azurearc-dev/main/src/sample.json";
    const url = "https://petwsa.blob.core.windows.net/vscext/samples.json";
    const response = await axios.get(url);
    const samples = response.data as {
        name: string, type: string, description: string, projectUrl: string, repositoryPath: string }[];
    const options = samples
        .filter(_ => _.type.toLowerCase() === SampleTypes[type].toString().toLowerCase())
        .map(t => {
            return {
                label: t.name,
                detail: t.description,
                data: t.repositoryPath,
                action: async context => {
                    const telEvent = type === SampleTypes.arcApp ?
                        TelemetryEvent.cloneArcSample : TelemetryEvent.cloneJumpstart;

                    sendTelemetryEvent(telEvent);
                    
                    var dir = await common.openFileDialog(false, true, false, "Select Sample Working Directory");
                    if (dir === undefined)
                    {
                        return;
                    }

                    const dest = path.join(dir, t.repositoryPath!);
                    if (fs.existsSync(dest) && fs.readdirSync(dest).length !== 0)
                    {
                        // Repo already exists, open directory.
                        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(`${dest}`));
                    }
                    else
                    {
                        await vscode.commands.executeCommand(
                            'git.clone', `${t.projectUrl}${t.repositoryPath}`, dir);
                    }
                }
            } as common.ArcExtOption;
        });

    await showSingularChoiceQuickpick(options, 'Arc Extension Samples', 'Select a sample');
}
