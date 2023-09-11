param (
    [Parameter(Mandatory=$true, HelpMessage="The path to the directory where the AKS EE binaries will be installed")]
    [ValidateNotNullOrEmpty()]
    [string] $InstallDir
)

Write-Host "Using installation directory '$InstallDir'."

if (!(Test-Path $InstallDir -PathType Container))
{
    New-Item $InstallDir -ItemType Directory
}

try
{
    try
    {
        Write-Progress -Activity "Install AKS EE" -Status "Start..."
        $installedAksEE = Get-Package | ? Name -like "*AKS Edge Essentials*"
        if ($installedAksEE)
        {
            Write-Host "Found AKS EE already installed" -ForegroundColor Green
        }
        else
        {
            Write-Progress -Activity "Install AKS EE" -Status "Downloading AKS EE MSI..." -PercentComplete 10
            $msiPath = Join-Path $InstallDir "AksEdge-k3s.msi"
            if (!(Test-Path $msiPath))
            {
                Write-Host "Downloading AKS EE MSI to $msiPath"
                Start-BitsTransfer -Source "https://aka.ms/aks-edge/k3s-msi" -Destination $msiPath
            }
            else
            {
                Write-Host "Found AKS EE MSI at $msiPath, skip downloading" -ForegroundColor Green
            }

            Write-Progress -Activity "Install AKS EE" -Status "Installing AKS EE MSI..." -PercentComplete 50
            Write-Host "Installing AKS EE at $InstallDir, please follow instructions in the MSI installer"
            Start-Process -FilePath msiexec.exe -ArgumentList "/i $msiPath INSTALLDIR=$InstallDir VHDXDIR=$InstallDir\vhdx" -Wait

            Write-Host "AKS EE installation completed, please make sure the installation is successful or subequent installation steps may fail."
        }
    }
    finally
    {
        Write-Progress -Activity "Install AKS EE" -Status "Completed" -Completed
    }

    try
    {
        Set-ExecutionPolicy RemoteSigned -Scope Process -Force
        Import-Module AksEdge -DisableNameChecking

        Write-Warning "Enabling Windows features might require reboot, please make sure you have saved all your work before continuing."
        $confirmation = Read-Host "Press Enter to continue or any other key to cancel"
        if ($confirmation -ne "")
        {
            Write-Host "Script cancelled."
        }
        else
        {
            Write-Progress -Activity "Installing required Windows features" -Status "Installing..."
            Install-AksEdgeHostFeatures
        }
    }
    finally
    {
        Write-Progress -Activity "Installing required Windows features" -Status "Completed" -Completed
    }

    try
    {
        $aksEeInfo = Get-AksEdgeDeploymentInfo

        if ($null -ne $aksEeInfo)
        {
            Write-Host "An AKS EE deployment already exists, skip creating a new one." -ForegroundColor Green
        }
        else
        {
            Write-Progress -Activity "Creating AKS EE cluster, this could take a while." -Status "Creating..."
            $configPath = Join-Path $InstallDir "aksedge-config.json"
            New-AksEdgeConfig -DeploymentType SingleMachineCluster -outFile $configPath | Out-Null
            New-AksEdgeDeployment -JsonConfigFilePath $configPath
        }
    }
    finally
    {
        Write-Progress -Activity "Creating AKS EE cluster" -Status "Completed" -Completed
    }
}
catch
{
    Write-Host "An error occurred:"
    Write-Host $_
}
finally
{
    Write-Host "Installation completed.`nIf there were any failures, please check out these manual installation steps`nhttps://learn.microsoft.com/en-us/azure/aks/hybrid/aks-edge-howto-setup-machine" -ForegroundColor Cyan
    Write-Host "Press any key to exit..."
    while ($true)
    {
        if ([System.Console]::KeyAvailable)
        {
            break
        }
    }
}
