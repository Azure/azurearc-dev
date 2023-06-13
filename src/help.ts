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
                        arguments: ['https://www.microsoft.com/azure/partners/resources/azure-arc-jumpstart']
                    }),
                new HelpItem(
                    "Send feedbacks to Microsoft",
                    vscode.TreeItemCollapsibleState.None,
                    new vscode.ThemeIcon('smiley'),
                    {
                        command: 'azurearc.openWebpage',
                        title: 'Feedback',
                        arguments: ['https://learn.microsoft.com/en-us/microsoft-365/admin/misc/feedback-provide-microsoft?view=o365-worldwide']
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
