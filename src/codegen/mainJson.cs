﻿// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version: 17.0.0.0
//  
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
namespace Codegen
{
    using System;
    
    /// <summary>
    /// Class to produce the template output
    /// </summary>
    
    #line 1 "F:\arcdev\azurearc-dev\src\codegen\mainJson.tt"
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Microsoft.VisualStudio.TextTemplating", "17.0.0.0")]
    public partial class mainJson : mainJsonBase
    {
#line hidden
        /// <summary>
        /// Create the template output
        /// </summary>
        public virtual string TransformText()
        {
            this.Write("\r\n{\r\n  \"$schema\": \"https://schema.management.azure.com/schemas/2018-05-01/subscri" +
                    "ptionDeploymentTemplate.json#\",\r\n  \"contentVersion\": \"1.0.0.0\",\r\n  \"metadata\": {" +
                    "\r\n    \"_generator\": {\r\n      \"name\": \"bicep\",\r\n      \"version\": \"0.17.1.54307\",\r" +
                    "\n      \"templateHash\": \"13006005159208596981\"\r\n    }\r\n  },\r\n  \"parameters\": {\r\n " +
                    "   \"environmentName\": {\r\n      \"type\": \"string\",\r\n      \"metadata\": {\r\n        \"" +
                    "description\": \"Name of the the environment which is used to generate a short uni" +
                    "que hash used in all resources.\"\r\n      },\r\n      \"maxLength\": 64,\r\n      \"minLe" +
                    "ngth\": 1\r\n    },\r\n    \"location\": {\r\n      \"type\": \"string\",\r\n      \"metadata\": " +
                    "{\r\n        \"description\": \"Primary location for all resources\"\r\n      },\r\n      " +
                    "\"minLength\": 1\r\n    },\r\n    \"resourceGroupName\": {\r\n      \"type\": \"string\",\r\n   " +
                    "   \"defaultValue\": \"\"\r\n    }\r\n  },\r\n  \"variables\": {\r\n    \"$fxv#0\": {\r\n      \"an" +
                    "alysisServicesServers\": \"as\",\r\n      \"apiManagementService\": \"apim-\",\r\n      \"ap" +
                    "pConfigurationConfigurationStores\": \"appcs-\",\r\n      \"appManagedEnvironments\": \"" +
                    "cae-\",\r\n      \"appContainerApps\": \"ca-\",\r\n      \"authorizationPolicyDefinitions\"" +
                    ": \"policy-\",\r\n      \"automationAutomationAccounts\": \"aa-\",\r\n      \"blueprintBlue" +
                    "prints\": \"bp-\",\r\n      \"blueprintBlueprintsArtifacts\": \"bpa-\",\r\n      \"cacheRedi" +
                    "s\": \"redis-\",\r\n      \"cdnProfiles\": \"cdnp-\",\r\n      \"cdnProfilesEndpoints\": \"cdn" +
                    "e-\",\r\n      \"cognitiveServicesAccounts\": \"cog-\",\r\n      \"cognitiveServicesFormRe" +
                    "cognizer\": \"cog-fr-\",\r\n      \"cognitiveServicesTextAnalytics\": \"cog-ta-\",\r\n     " +
                    " \"computeAvailabilitySets\": \"avail-\",\r\n      \"computeCloudServices\": \"cld-\",\r\n  " +
                    "    \"computeDiskEncryptionSets\": \"des\",\r\n      \"computeDisks\": \"disk\",\r\n      \"c" +
                    "omputeDisksOs\": \"osdisk\",\r\n      \"computeGalleries\": \"gal\",\r\n      \"computeSnaps" +
                    "hots\": \"snap-\",\r\n      \"computeVirtualMachines\": \"vm\",\r\n      \"computeVirtualMac" +
                    "hineScaleSets\": \"vmss-\",\r\n      \"containerInstanceContainerGroups\": \"ci\",\r\n     " +
                    " \"containerRegistryRegistries\": \"cr\",\r\n      \"containerServiceManagedClusters\": " +
                    "\"aks-\",\r\n      \"databricksWorkspaces\": \"dbw-\",\r\n      \"dataFactoryFactories\": \"a" +
                    "df-\",\r\n      \"dataLakeAnalyticsAccounts\": \"dla\",\r\n      \"dataLakeStoreAccounts\":" +
                    " \"dls\",\r\n      \"dataMigrationServices\": \"dms-\",\r\n      \"dBforMySQLServers\": \"mys" +
                    "ql-\",\r\n      \"dBforPostgreSQLServers\": \"psql-\",\r\n      \"devicesIotHubs\": \"iot-\"," +
                    "\r\n      \"devicesProvisioningServices\": \"provs-\",\r\n      \"devicesProvisioningServ" +
                    "icesCertificates\": \"pcert-\",\r\n      \"documentDBDatabaseAccounts\": \"cosmos-\",\r\n  " +
                    "    \"eventGridDomains\": \"evgd-\",\r\n      \"eventGridDomainsTopics\": \"evgt-\",\r\n    " +
                    "  \"eventGridEventSubscriptions\": \"evgs-\",\r\n      \"eventHubNamespaces\": \"evhns-\"," +
                    "\r\n      \"eventHubNamespacesEventHubs\": \"evh-\",\r\n      \"hdInsightClustersHadoop\":" +
                    " \"hadoop-\",\r\n      \"hdInsightClustersHbase\": \"hbase-\",\r\n      \"hdInsightClusters" +
                    "Kafka\": \"kafka-\",\r\n      \"hdInsightClustersMl\": \"mls-\",\r\n      \"hdInsightCluster" +
                    "sSpark\": \"spark-\",\r\n      \"hdInsightClustersStorm\": \"storm-\",\r\n      \"hybridComp" +
                    "uteMachines\": \"arcs-\",\r\n      \"insightsActionGroups\": \"ag-\",\r\n      \"insightsCom" +
                    "ponents\": \"appi-\",\r\n      \"keyVaultVaults\": \"kv-\",\r\n      \"kubernetesConnectedCl" +
                    "usters\": \"arck\",\r\n      \"kustoClusters\": \"dec\",\r\n      \"kustoClustersDatabases\":" +
                    " \"dedb\",\r\n      \"logicIntegrationAccounts\": \"ia-\",\r\n      \"logicWorkflows\": \"log" +
                    "ic-\",\r\n      \"machineLearningServicesWorkspaces\": \"mlw-\",\r\n      \"managedIdentit" +
                    "yUserAssignedIdentities\": \"id-\",\r\n      \"managementManagementGroups\": \"mg-\",\r\n  " +
                    "    \"migrateAssessmentProjects\": \"migr-\",\r\n      \"networkApplicationGateways\": \"" +
                    "agw-\",\r\n      \"networkApplicationSecurityGroups\": \"asg-\",\r\n      \"networkAzureFi" +
                    "rewalls\": \"afw-\",\r\n      \"networkBastionHosts\": \"bas-\",\r\n      \"networkConnectio" +
                    "ns\": \"con-\",\r\n      \"networkDnsZones\": \"dnsz-\",\r\n      \"networkExpressRouteCircu" +
                    "its\": \"erc-\",\r\n      \"networkFirewallPolicies\": \"afwp-\",\r\n      \"networkFirewall" +
                    "PoliciesWebApplication\": \"waf\",\r\n      \"networkFirewallPoliciesRuleGroups\": \"waf" +
                    "rg\",\r\n      \"networkFrontDoors\": \"fd-\",\r\n      \"networkFrontdoorWebApplicationFi" +
                    "rewallPolicies\": \"fdfp-\",\r\n      \"networkLoadBalancersExternal\": \"lbe-\",\r\n      " +
                    "\"networkLoadBalancersInternal\": \"lbi-\",\r\n      \"networkLoadBalancersInboundNatRu" +
                    "les\": \"rule-\",\r\n      \"networkLocalNetworkGateways\": \"lgw-\",\r\n      \"networkNatG" +
                    "ateways\": \"ng-\",\r\n      \"networkNetworkInterfaces\": \"nic-\",\r\n      \"networkNetwo" +
                    "rkSecurityGroups\": \"nsg-\",\r\n      \"networkNetworkSecurityGroupsSecurityRules\": \"" +
                    "nsgsr-\",\r\n      \"networkNetworkWatchers\": \"nw-\",\r\n      \"networkPrivateDnsZones\"" +
                    ": \"pdnsz-\",\r\n      \"networkPrivateLinkServices\": \"pl-\",\r\n      \"networkPublicIPA" +
                    "ddresses\": \"pip-\",\r\n      \"networkPublicIPPrefixes\": \"ippre-\",\r\n      \"networkRo" +
                    "uteFilters\": \"rf-\",\r\n      \"networkRouteTables\": \"rt-\",\r\n      \"networkRouteTabl" +
                    "esRoutes\": \"udr-\",\r\n      \"networkTrafficManagerProfiles\": \"traf-\",\r\n      \"netw" +
                    "orkVirtualNetworkGateways\": \"vgw-\",\r\n      \"networkVirtualNetworks\": \"vnet-\",\r\n " +
                    "     \"networkVirtualNetworksSubnets\": \"snet-\",\r\n      \"networkVirtualNetworksVir" +
                    "tualNetworkPeerings\": \"peer-\",\r\n      \"networkVirtualWans\": \"vwan-\",\r\n      \"net" +
                    "workVpnGateways\": \"vpng-\",\r\n      \"networkVpnGatewaysVpnConnections\": \"vcn-\",\r\n " +
                    "     \"networkVpnGatewaysVpnSites\": \"vst-\",\r\n      \"notificationHubsNamespaces\": " +
                    "\"ntfns-\",\r\n      \"notificationHubsNamespacesNotificationHubs\": \"ntf-\",\r\n      \"o" +
                    "perationalInsightsWorkspaces\": \"log-\",\r\n      \"portalDashboards\": \"dash-\",\r\n    " +
                    "  \"powerBIDedicatedCapacities\": \"pbi-\",\r\n      \"purviewAccounts\": \"pview-\",\r\n   " +
                    "   \"recoveryServicesVaults\": \"rsv-\",\r\n      \"resourcesResourceGroups\": \"rg-\",\r\n " +
                    "     \"searchSearchServices\": \"srch-\",\r\n      \"serviceBusNamespaces\": \"sb-\",\r\n   " +
                    "   \"serviceBusNamespacesQueues\": \"sbq-\",\r\n      \"serviceBusNamespacesTopics\": \"s" +
                    "bt-\",\r\n      \"serviceEndPointPolicies\": \"se-\",\r\n      \"serviceFabricClusters\": \"" +
                    "sf-\",\r\n      \"signalRServiceSignalR\": \"sigr\",\r\n      \"sqlManagedInstances\": \"sql" +
                    "mi-\",\r\n      \"sqlServers\": \"sql-\",\r\n      \"sqlServersDataWarehouse\": \"sqldw-\",\r\n" +
                    "      \"sqlServersDatabases\": \"sqldb-\",\r\n      \"sqlServersDatabasesStretch\": \"sql" +
                    "strdb-\",\r\n      \"storageStorageAccounts\": \"st\",\r\n      \"storageStorageAccountsVm" +
                    "\": \"stvm\",\r\n      \"storSimpleManagers\": \"ssimp\",\r\n      \"streamAnalyticsCluster\"" +
                    ": \"asa-\",\r\n      \"synapseWorkspaces\": \"syn\",\r\n      \"synapseWorkspacesAnalyticsW" +
                    "orkspaces\": \"synw\",\r\n      \"synapseWorkspacesSqlPoolsDedicated\": \"syndp\",\r\n     " +
                    " \"synapseWorkspacesSqlPoolsSpark\": \"synsp\",\r\n      \"timeSeriesInsightsEnvironmen" +
                    "ts\": \"tsi-\",\r\n      \"webServerFarms\": \"plan-\",\r\n      \"webSitesAppService\": \"app" +
                    "-\",\r\n      \"webSitesAppServiceEnvironment\": \"ase-\",\r\n      \"webSitesFunctions\": " +
                    "\"func-\",\r\n      \"webStaticSites\": \"stapp-\"\r\n    },\r\n    \"abbrs\": \"[variables(\'$f" +
                    "xv#0\')]\",\r\n    \"tags\": {\r\n      \"azd-env-name\": \"[parameters(\'environmentName\')]" +
                    "\"\r\n    },\r\n    \"resourceToken\": \"[toLower(uniqueString(subscription().id, parame" +
                    "ters(\'environmentName\'), parameters(\'location\')))]\",\r\n    \"apiServiceName\": \"pyt" +
                    "hon-api\"\r\n  },\r\n  \"resources\": [\r\n    {\r\n      \"type\": \"Microsoft.Resources/reso" +
                    "urceGroups\",\r\n      \"apiVersion\": \"2021-04-01\",\r\n      \"name\": \"[if(not(empty(pa" +
                    "rameters(\'resourceGroupName\'))), parameters(\'resourceGroupName\'), format(\'{0}{1}" +
                    "\', variables(\'abbrs\').resourcesResourceGroups, parameters(\'environmentName\')))]\"" +
                    ",\r\n      \"location\": \"[parameters(\'location\')]\",\r\n      \"tags\": \"[variables(\'tag" +
                    "s\')]\"\r\n    }\r\n  ],\r\n  \"outputs\": {\r\n    \"AZURE_LOCATION\": {\r\n      \"type\": \"stri" +
                    "ng\",\r\n      \"value\": \"[parameters(\'location\')]\"\r\n    },\r\n    \"AZURE_TENANT_ID\": " +
                    "{\r\n      \"type\": \"string\",\r\n      \"value\": \"[tenant().tenantId]\"\r\n    }\r\n  }\r\n}");
            return this.GenerationEnvironment.ToString();
        }
    }
    
    #line default
    #line hidden
    #region Base class
    /// <summary>
    /// Base class for this transformation
    /// </summary>
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Microsoft.VisualStudio.TextTemplating", "17.0.0.0")]
    public class mainJsonBase
    {
        #region Fields
        private global::System.Text.StringBuilder generationEnvironmentField;
        private global::System.CodeDom.Compiler.CompilerErrorCollection errorsField;
        private global::System.Collections.Generic.List<int> indentLengthsField;
        private string currentIndentField = "";
        private bool endsWithNewline;
        private global::System.Collections.Generic.IDictionary<string, object> sessionField;
        #endregion
        #region Properties
        /// <summary>
        /// The string builder that generation-time code is using to assemble generated output
        /// </summary>
        protected System.Text.StringBuilder GenerationEnvironment
        {
            get
            {
                if ((this.generationEnvironmentField == null))
                {
                    this.generationEnvironmentField = new global::System.Text.StringBuilder();
                }
                return this.generationEnvironmentField;
            }
            set
            {
                this.generationEnvironmentField = value;
            }
        }
        /// <summary>
        /// The error collection for the generation process
        /// </summary>
        public System.CodeDom.Compiler.CompilerErrorCollection Errors
        {
            get
            {
                if ((this.errorsField == null))
                {
                    this.errorsField = new global::System.CodeDom.Compiler.CompilerErrorCollection();
                }
                return this.errorsField;
            }
        }
        /// <summary>
        /// A list of the lengths of each indent that was added with PushIndent
        /// </summary>
        private System.Collections.Generic.List<int> indentLengths
        {
            get
            {
                if ((this.indentLengthsField == null))
                {
                    this.indentLengthsField = new global::System.Collections.Generic.List<int>();
                }
                return this.indentLengthsField;
            }
        }
        /// <summary>
        /// Gets the current indent we use when adding lines to the output
        /// </summary>
        public string CurrentIndent
        {
            get
            {
                return this.currentIndentField;
            }
        }
        /// <summary>
        /// Current transformation session
        /// </summary>
        public virtual global::System.Collections.Generic.IDictionary<string, object> Session
        {
            get
            {
                return this.sessionField;
            }
            set
            {
                this.sessionField = value;
            }
        }
        #endregion
        #region Transform-time helpers
        /// <summary>
        /// Write text directly into the generated output
        /// </summary>
        public void Write(string textToAppend)
        {
            if (string.IsNullOrEmpty(textToAppend))
            {
                return;
            }
            // If we're starting off, or if the previous text ended with a newline,
            // we have to append the current indent first.
            if (((this.GenerationEnvironment.Length == 0) 
                        || this.endsWithNewline))
            {
                this.GenerationEnvironment.Append(this.currentIndentField);
                this.endsWithNewline = false;
            }
            // Check if the current text ends with a newline
            if (textToAppend.EndsWith(global::System.Environment.NewLine, global::System.StringComparison.CurrentCulture))
            {
                this.endsWithNewline = true;
            }
            // This is an optimization. If the current indent is "", then we don't have to do any
            // of the more complex stuff further down.
            if ((this.currentIndentField.Length == 0))
            {
                this.GenerationEnvironment.Append(textToAppend);
                return;
            }
            // Everywhere there is a newline in the text, add an indent after it
            textToAppend = textToAppend.Replace(global::System.Environment.NewLine, (global::System.Environment.NewLine + this.currentIndentField));
            // If the text ends with a newline, then we should strip off the indent added at the very end
            // because the appropriate indent will be added when the next time Write() is called
            if (this.endsWithNewline)
            {
                this.GenerationEnvironment.Append(textToAppend, 0, (textToAppend.Length - this.currentIndentField.Length));
            }
            else
            {
                this.GenerationEnvironment.Append(textToAppend);
            }
        }
        /// <summary>
        /// Write text directly into the generated output
        /// </summary>
        public void WriteLine(string textToAppend)
        {
            this.Write(textToAppend);
            this.GenerationEnvironment.AppendLine();
            this.endsWithNewline = true;
        }
        /// <summary>
        /// Write formatted text directly into the generated output
        /// </summary>
        public void Write(string format, params object[] args)
        {
            this.Write(string.Format(global::System.Globalization.CultureInfo.CurrentCulture, format, args));
        }
        /// <summary>
        /// Write formatted text directly into the generated output
        /// </summary>
        public void WriteLine(string format, params object[] args)
        {
            this.WriteLine(string.Format(global::System.Globalization.CultureInfo.CurrentCulture, format, args));
        }
        /// <summary>
        /// Raise an error
        /// </summary>
        public void Error(string message)
        {
            System.CodeDom.Compiler.CompilerError error = new global::System.CodeDom.Compiler.CompilerError();
            error.ErrorText = message;
            this.Errors.Add(error);
        }
        /// <summary>
        /// Raise a warning
        /// </summary>
        public void Warning(string message)
        {
            System.CodeDom.Compiler.CompilerError error = new global::System.CodeDom.Compiler.CompilerError();
            error.ErrorText = message;
            error.IsWarning = true;
            this.Errors.Add(error);
        }
        /// <summary>
        /// Increase the indent
        /// </summary>
        public void PushIndent(string indent)
        {
            if ((indent == null))
            {
                throw new global::System.ArgumentNullException("indent");
            }
            this.currentIndentField = (this.currentIndentField + indent);
            this.indentLengths.Add(indent.Length);
        }
        /// <summary>
        /// Remove the last indent that was added with PushIndent
        /// </summary>
        public string PopIndent()
        {
            string returnValue = "";
            if ((this.indentLengths.Count > 0))
            {
                int indentLength = this.indentLengths[(this.indentLengths.Count - 1)];
                this.indentLengths.RemoveAt((this.indentLengths.Count - 1));
                if ((indentLength > 0))
                {
                    returnValue = this.currentIndentField.Substring((this.currentIndentField.Length - indentLength));
                    this.currentIndentField = this.currentIndentField.Remove((this.currentIndentField.Length - indentLength));
                }
            }
            return returnValue;
        }
        /// <summary>
        /// Remove any indentation
        /// </summary>
        public void ClearIndent()
        {
            this.indentLengths.Clear();
            this.currentIndentField = "";
        }
        #endregion
        #region ToString Helpers
        /// <summary>
        /// Utility class to produce culture-oriented representation of an object as a string.
        /// </summary>
        public class ToStringInstanceHelper
        {
            private System.IFormatProvider formatProviderField  = global::System.Globalization.CultureInfo.InvariantCulture;
            /// <summary>
            /// Gets or sets format provider to be used by ToStringWithCulture method.
            /// </summary>
            public System.IFormatProvider FormatProvider
            {
                get
                {
                    return this.formatProviderField ;
                }
                set
                {
                    if ((value != null))
                    {
                        this.formatProviderField  = value;
                    }
                }
            }
            /// <summary>
            /// This is called from the compile/run appdomain to convert objects within an expression block to a string
            /// </summary>
            public string ToStringWithCulture(object objectToConvert)
            {
                if ((objectToConvert == null))
                {
                    throw new global::System.ArgumentNullException("objectToConvert");
                }
                System.Type t = objectToConvert.GetType();
                System.Reflection.MethodInfo method = t.GetMethod("ToString", new System.Type[] {
                            typeof(System.IFormatProvider)});
                if ((method == null))
                {
                    return objectToConvert.ToString();
                }
                else
                {
                    return ((string)(method.Invoke(objectToConvert, new object[] {
                                this.formatProviderField })));
                }
            }
        }
        private ToStringInstanceHelper toStringHelperField = new ToStringInstanceHelper();
        /// <summary>
        /// Helper to produce culture-oriented representation of an object as a string
        /// </summary>
        public ToStringInstanceHelper ToStringHelper
        {
            get
            {
                return this.toStringHelperField;
            }
        }
        #endregion
    }
    #endregion
}