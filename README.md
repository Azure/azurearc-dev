# Azure Arc for Visual Studio Code 

Use the Azure Arc extension to quickly start developing your Arc enabled applications. This extension will help you: 

- Set up your Arc-enabled development environment
- Browse different sample applications, including "Hello World"
- Explore Jumpstart Agora Contoso Supermarket application in your Azure environment
- Use built-in tooling to generate bicep templates for your application dependencies, simplify development tasks, validate your helm charts and more 

> Sign up today for your free Azure account and receive 12 months of free popular services, $200 free credit and 25+ always free services 👉 [Start Free](https://azure.microsoft.com/free/open-source).

We welcome feedbacks and feature requests via the issues page in [GitHub repository](https://github.com/Azure/azurearc-dev).

## Check out the extension Walkthrough
Get familiar with what the extension offers by going through the Walkthrough. You can press "F1" to bring up the command palette and type in "Welcome: Open Walkthrough" command, and then click on it to select the "Get Started with Azure Arc in VS Code" Walkthroughs from the list.
<img src="https://petwsa.blob.core.windows.net/vscext/openWalkthrough.png" alt="alt text">

## Deploy your first Arc-enabled environment
1. Select the plus icon to start creating your AKS Edge Essentials cluster.
<br/>
<img src="https://petwsa.blob.core.windows.net/vscext/provisionAksEE.png" alt="alt text">
<br/>
<img src="https://petwsa.blob.core.windows.net/vscext/provisionAksEeNotification.png" alt="alt text">

2. Ensure that your machine meets the requirements from single node deployment for Edge Essentials. For a successful install, you will also need to ensure:
    - No VPN connection 
    - No existing eFlow, or other Kubernetes setup on the system 
    - Static wifi configuration during the installation

<br/>

3. Navigate to the folder where you want you download the install script and click “select folder” 

4. Once the script is downloaded, the extension automatically opens a powershell console and ask for admin privilege to run the installation script.

5. Your cluster will appear in the Native K8s Cluster view. Click the connect to Arc button to Arc enable your cluster.
<br/>
<img src="https://petwsa.blob.core.windows.net/vscext/connectToArcIcon.png" alt="alt text">
   - To Arc enable your cluster, you'll need to add connectedk8s extension and register some namespaces.
   ```powershell
   az extension add --name connectedk8s
   ```
   ```
   az provider register --namespace Microsoft.Kubernetes
   az provider register --namespace Microsoft.KubernetesConfiguration
   az provider register --namespace Microsoft.ExtendedLocation
   ```
   - Monitor the registration process. Registration may take up to 10 minutes.
   ```
   az provider show -n Microsoft.Kubernetes -o table
   az provider show -n Microsoft.KubernetesConfiguration -o table
   az provider show -n Microsoft.ExtendedLocation -o table
   ```
6. Your cluster will appear in the Native K8s Cluster view. Click the connect to Arc button to Arc enable your cluster. 

7. Using the command palette, please provide an azure subscription, resource group and a name for your cluster.

> - Note: This environment is intended to be used for development and testing purposes only. You are able to use this environment for 30 days for free once you connect to Arc.


## Create your first Arc-enabled application
Select “Get Samples” from the walkthough, or use the command palette to find the Get Samples command. You may start with Arc application samples or Jumpstart samples. Please follow instructions of the cloned sample repositories to proceed.

## Requirements

Some features in this extension require:
- AZ and AZD CLI
- An azure account and subscription
- There are [hardware requirements](https://learn.microsoft.com/en-us/azure/aks/hybrid/aks-edge-system-requirements) to run an Edge Essentials cluster

> Note: This extension currently only supports Connected clusters.

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the Microsoft Open Source Code of Conduct. For more information see the Code of Conduct FAQ or contact opencode@microsoft.com with any additional questions or comments.

## Telemetry
VS Code collects usage data and sends it to Microsoft to help improve our products and services. Read our [privacy statement](https://privacy.microsoft.com/en-us/privacystatement) to learn more. If you don’t wish to send usage data to Microsoft, you can set the `telemetry.enableTelemetry` setting to `false`. Learn more in our [FAQ](https://code.visualstudio.com/docs/supporting/faq#_how-to-disable-telemetry-reporting).

## Known Issues

None.

## Release Notes

### 1.0.0

Initial release
