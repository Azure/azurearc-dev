import * as vscode from 'vscode';
import TelemetryReporter from '@vscode/extension-telemetry';

const key = '0c6ae279ed8443289764825290e4f9e2-1a736e7c-1324-4338-be46-fc2a58ae4d14-7255';

var telemetryEnabled = false;
var reporter: TelemetryReporter | undefined = undefined;

export enum TelemetryEvent {
    activate = 'azurearc.activate',
    createAksEE = "azurearc.createAksEE",
    downloadAksEE = "azurearc.downloadAksEE",
    cloneArcSample = "azurearc.cloneArcSample",
    cloneJumpstart = "azurearc.cloneJumpStart",
    connectToArc = "azurearc.connectToArc"
}

export function configureTelemetryReporter(context: vscode.ExtensionContext)
{
    if (reporter === undefined)
    {
        reporter = new TelemetryReporter(key);
        context.subscriptions.push(reporter);
    }

    const telemetryLevel = vscode.workspace.getConfiguration().get('telemetry.telemetryLevel');

    telemetryEnabled = !(telemetryLevel === "off");
    console.log(`Telemetry is ${telemetryEnabled ? 'enabled' : 'disabled'}`);
}

export function sendTelemetryEvent(eventType: TelemetryEvent, properties?: { [key: string]: string; })
{
    if (telemetryEnabled)
    {
        reporter?.sendTelemetryEvent(eventType, properties);
    }
    else
    {
        console.log(`Telemetry is disabled, ${eventType} telemetry not sent.`);
    }
}
