import * as assert from 'assert';
import * as vscode from 'vscode';
import * as quickpicks from '../../quickpicks';
import { provisionK8S } from '../../k8s';
import { generateDependencyBicep } from '../../bicep';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Test UI element invocation', async () => {
        // Quick picks
        await quickpicks.showArcExtCmdQuickpick();
        await quickpicks.selectSample();
        await provisionK8S();
        await generateDependencyBicep();

        // Walkthrough
        vscode.commands.executeCommand(
            'workbench.action.openWalkthrough', 
            { category: 'peterwu.azurearc#walkthrough'}
        );

        // View
        vscode.commands.executeCommand('workbench.view.extension.arc-extension');
    });
});
