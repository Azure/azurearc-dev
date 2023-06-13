npm run compile

$ProjectFile = Join-Path $PSScriptRoot "src\codegen\Codegen.csproj"
$PublishProfile = Join-Path $PSScriptRoot "src\codegen\Properties\PublishProfiles\FolderProfile.pubxml"

Write-Host "$purojectFile, $PublishProfile"
$cmd = "dotnet publish $ProjectFile /p:PublishProfile=$PublishProfile -c release"
Invoke-Expression $cmd