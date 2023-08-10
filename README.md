# Azure Arc for Visual Studio Code 

Use the Azure Arc extension to quickly start developing your Arc enabled applications. This extension will help you: 

- Set up your Arc-enabled development environment
- Browse different sample applications, including "Hello World"
- Explore Jumpstart Agora Contoso Supermarket application in your Azure environment
- Use built-in tooling to generate bicep templates for your application dependencies, simplify development tasks, validate your helm charts and more 

> Sign up today for your free Azure account and receive 12 months of free popular services, $200 free credit and 25+ always free services 👉 [Start Free](https://azure.microsoft.com/free/open-source).

We welcome feedbacks and feature requests via the issues page in [GitHub repository](https://github.com/Azure/azurearc-dev).

## Deploy your first Arc-enabled environment
1. Select the plus icon to start creating your AKS Edge Essentials cluster.
<br/>
<img src="https://petwsa.blob.core.windows.net/vscext/provisionAksEE.png" alt="alt text">
<br/>
<img src="https://petwsa.blob.core.windows.net/vscext/provisionAksEeNotification.png" alt="alt text">

2. Ensure that your machine meets the requirements from single node deployment for Edge Ess entials. For a successful install, you will also need to ensure:
    - No VPN connection 
    - No existing eflow, or other Kubernetes setup on the system 
    - Static wifi configuration during the installation

3. Navigate to the folder where you want you download the install script and click “select folder” 

4. Once the install scipt has downloaded, open an evelated poweshell console and run the scipt.

> Testing Notes: We are investigating if we can open elevated powershell from users from VS Code ** 

5. Your cluster will appear in the Native K8s Cluster view. Click the connect to Arc button to Arc enable your cluster.
<br/>
<img src="https://petwsa.blob.core.windows.net/vscext/connectToArcIcon.png" alt="alt text">

6. Your cluster will appear in the Native K8s Cluster view. Click the connect to Arc button to Arc enable your cluster. 

7. Using the command palette, please provide an azure subscription, resource group and a name for your cluster.

> - Note: This environment is intended to be used for development and testing purposes only. You are able to use this environment for 30 days for free once you connect to Arc.  
>   - **Testing notes: We are investigating if we can show a notification to users close to the 30d mark.
 We also chose to deploy the cluster as not arc enabled because we would need certain inputs (RG, name, sub) from the user. I like this experience because:
>   - This decouples process of installing EE (which may or may not succeed and arc enabling. If we do them both at once, it becomes harder to identify what failed in the process. 
>   - I think the flow would also be confusing because we would need to ask up front from RG, sub, etc before we download anything. 
>   - I also like the idea of making progress in small steps vs one step, which I think strikes a good balance between enabling learning and automation. 
Please provide feedback here.** 


## Create your first Arc-enabled application
Note: No arc dependencies in 101, but 201 will have KeyVault  

1. Download Docker Desktop, and follow the instructions above to create a local Kubernetes cluster.

2. Select “Get Samples” from the walkthough, or use the command palette to find the Get Samples command.
<img src="https://petwsa.blob.core.windows.net/vscext/selectSample.png" alt="alt text">

3. Use Set current context command to select your Kubernetes cluster if there are multiple clusters.
<img src="https://petwsa.blob.core.windows.net/vscext/setCurrentContext.png" alt="alt text">

4. Open Values.yaml and update the repository value with:

```yaml
docker.io/{usermame}/{imagename} 
```

5. Use the command pallette (F1 or CMD + Shift + P) to trigger the Build command.

6. In the command pallette, provide your repository path (step 4), choose a docker file, and helm chart. 

7. View your pods by running "kubectl get pods" in the VS Code console.

### Deploy Jumpstart Agora applications  

1. Select “Get Samples” from the walkthrough, or use the command palette to find the Get Samples command.


2. Follow the Azd CLI instructions in the ReadMe
> Testing Notes: We are investigating if we can pop up most probable read me in the editor for users

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
