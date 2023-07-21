import * as vscode from 'vscode';
import TelemetryReporter from '@vscode/extension-telemetry';

const key = '18928eba-0a47-4f83-be49-2327a400774d';

var telemetryEnabled = false;
var reporter: TelemetryReporter | undefined = undefined;

export enum TelemetryEvent {
    activate = 'activate',
}

export function configureTelemetryReporter(context: vscode.ExtensionContext)
{
    if (reporter === undefined)
    {
        reporter = new TelemetryReporter(key);
        context.subscriptions.push(reporter);
    }

    const telemetryLevel = vscode.workspace.getConfiguration().get('telemetry.telemetryLevel');

    telemetryEnabled = !(telemetryLevel === "off")
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
