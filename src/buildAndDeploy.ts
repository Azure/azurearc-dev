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
    return [ `docker build -t ${imageNameWithTag} -f ${dockerfile} ${path.dirname(dockerfile)};`, `docker push ${imageNameWithTag}` ];
}

export async function getKubectlCmd()
{
    const yamls = await vscode.workspace.findFiles("**/*.yaml");
    const options = yamls.map(_ => {
        return { label: _.fsPath } as common.ArcExtOption;
    });

    const selection = await showSingularChoiceQuickpick(
        options, 'Kubernetes Deployment Yaml Location', 'Select a deployment yaml', false);
    
    if (selection === undefined)
    {
        return;
    }

    return `kubectl apply -f ${selection!.label}`;
}
