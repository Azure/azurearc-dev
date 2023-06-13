import * as vscode from 'vscode';
import * as path from 'path';

export class HelpProvider implements vscode.TreeDataProvider<HelpItem>
{
    constructor() { }

    getTreeItem(element: HelpItem): vscode.TreeItem
    {
        return element;
    }

    getChildren(element?: HelpItem): HelpItem[]
    {
        if (!element)
        {
            return [
                new HelpItem(
                    "Open Walkthrough",
                    vscode.TreeItemCollapsibleState.None,
                    new vscode.ThemeIcon('mortar-board'),
                    {
                        command: 'azurearc.openWalkthrough',
                        title: 'Walkthrough'
                    }),

                new HelpItem(
                    "View Arc Extension Documentations",
                    vscode.TreeItemCollapsibleState.None,
                    new vscode.ThemeIcon('book'),
                    {
                        command: 'azurearc.openWebpage',
                        title: 'Doc',
                        arguments: ['https://learn.microsoft.com/en-us/training/modules/intro-to-azure-arc/']
                    }),
                new HelpItem(
                    "Send feedbacks to us",
                    vscode.TreeItemCollapsibleState.None,
                    new vscode.ThemeIcon('smiley'),
                    {
                        command: 'azurearc.openWebpage',
                        title: 'Feedback',
                        arguments: ['https://github.com/Azure/azurearc-dev/issues/new']
                    })
            ];
        }

        return [];
    }
}

export class HelpItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly iconPath: vscode.ThemeIcon,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);

        this.tooltip = this.label;
        this.iconPath = iconPath;

        if (command === undefined || command === null)
        {
            this.command = {
                command: 'azurearc.showInfo',
                title: 'Show info',
                arguments: [`${this.label} clicked.`]
            };
        }
        else
        {
            this.command = command;
        }
    }

    contextValue = 'devsession';
}
