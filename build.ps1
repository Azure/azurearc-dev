npm run compile

$ProjectFile = Join-Path $PSScriptRoot "src\codegen\Codegen.csproj"
$PublishProfile = Join-Path $PSScriptRoot "src\codegen\Properties\PublishProfiles\FolderProfile.pubxml"

Write-Host "$purojectFile, $PublishProfile"
$cmd = "dotnet publish $ProjectFile /p:PublishProfile=$PublishProfile -c release"
Invoke-Expression $cmd

$scriptDir = "$PSScriptRoot\dist\Scripts"
if (!(Test-Path $scriptDir))
{
    New-Item $scriptDir -ItemType Directory -Force
}

Copy-Item $PSScriptRoot\src\Scripts\* $scriptDir -Recurse -Force

vsce package
