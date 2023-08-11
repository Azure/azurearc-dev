import * as vscode from 'vscode';
import * as path from 'path';
import * as common from './common';
import { showSingularChoiceQuickpick } from './quickpicks';

export async function getDockerCmds(dockerfile: string)
{
    var img = await common.getImageName();
    if (img === undefined)
    {
        return;
    }

    if (dockerfile === undefined)
    {
        const dockerFiles = await vscode.workspace.findFiles("**/*Dockerfile");
        const options = dockerFiles.map(_ => {
            return { label: _.fsPath } as common.ArcExtOption;
        });

        const selection = await showSingularChoiceQuickpick(
            options, 'Dockerfile Location', 'Select a Dockerfile', false);
        
        if (selection === undefined)
        {
            return;
        }

        dockerfile = selection!.label;
    }

    const imageNameWithTag = `${img}:latest`;
    return [ `docker build -t ${imageNameWithTag} -f ${dockerfile} ${path.dirname(dockerfile)}`, `docker push ${imageNameWithTag}` ];
}

export async function getHelmCmd()
{
    var chartRepo = await common.getChartRepo();
    if (chartRepo === undefined)
    {
        return;
    }
    return `helm install ${chartRepo} --generate-name`;
}

