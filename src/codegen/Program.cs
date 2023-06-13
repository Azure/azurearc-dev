
namespace Codegen;

using System;
using System.CommandLine;
using System.CommandLine.Parsing;

internal enum OverwriteOptions
{
    None = 0,
    Overwrite = 1,
    Rename = 2
}

internal class Program
{
    /// <summary>
    /// Suffix to rename generated files for the current run.
    /// </summary>
    private static string suffix = string.Empty;

    /// <summary>
    /// Base directory path for codegen.
    /// </summary>
    private static string baseDirPath = string.Empty;

    /// <summary>
    /// If any files to be generated already exists, select overwrite to replace them.
    /// </summary>
    private static OverwriteOptions overwrite = OverwriteOptions.None;

    /// <summary>
    /// Whether storage accounts biceps should be generated.
    /// </summary>
    private static bool hasSa = false;

    static int Main(string[] args)
    {
        Console.WriteLine("Generating Bicep");
        suffix = Guid.NewGuid().ToString()[..8];

        var bicepDirOption = new Option<string>(
            new string[] { "--directory", "-d" },
            "The base directory of the codegen files.")
        {
            IsRequired = true,
            Arity = ArgumentArity.ExactlyOne,
        };

        var overwriteOption = new Option<OverwriteOptions>(
            new string[] { "--overwriteOption" },
            () => OverwriteOptions.None,
            "Codegen overwrite option.");

        var saOption = new Option<bool>(
            new string[] { "--storage-account", "-sa" },
            () => false,
            "Generate Storage Account Bicep.");

        var rootCommand = new RootCommand("Arc VS code extension codegen");
        var bicepCommand = new Command("bicep", "Bicep command")
        {
            bicepDirOption, overwriteOption, saOption
        };

        rootCommand.AddCommand(bicepCommand);
        bicepCommand.SetHandler(
            (dir, ow, sa) =>
            {
                baseDirPath = dir;
                overwrite = ow;
                hasSa = sa;

                PrintArgs();
                GenerateNecessities();
                if (hasSa)
                {
                    var storageDir = Directory.CreateDirectory(Path.Combine(dir, "storage"));
                    GenerateFile(
                        Path.Combine(storageDir.FullName, "storage-account.bicep"),
                        new StorageAccount().TransformText());
                }

                var mainBicep = new MainBicep()
                {
                    createStorageAccount = hasSa,
                };

                GenerateFile(Path.Combine(dir, "main.bicep"), mainBicep.TransformText());
            },
            bicepDirOption,
            overwriteOption,
            saOption);

        rootCommand.Invoke(args);

        Console.WriteLine("Done");
        return 0;
    }

    private static void PrintArgs()
    {
        string msg = "Codegen params:\n";
        msg += $"Codegen dir: {baseDirPath}\n";
        msg += $"Storage Accounts: {hasSa}\n";

        Console.WriteLine(msg);
    }

    private static void GenerateFile(string path, string content)
    {
        bool exists = File.Exists(path);
        bool rename = false;
        switch (overwrite)
        {
            case OverwriteOptions.None:
                if (exists)
                {
                    Console.WriteLine(
                        $"File {path} already exists. Use --overwriteOption to specify overwrite behaviors.");
                    Environment.Exit(1);
                }
                break;

            case OverwriteOptions.Overwrite:
                Console.WriteLine($"Overwritting existing file {path}");
                break;

            case OverwriteOptions.Rename:
                rename = exists;
                break;

            default:
                throw new ArgumentException($"Unsupported overwrite option {overwrite}");
        }

        if (rename)
        {
            var fi = new FileInfo(path);
            string filenameWithoutExt = fi.Name[..^fi.Extension.Length];
            path = Path.Combine(
                fi.Directory.FullName, $"{filenameWithoutExt}-{suffix}{fi.Extension}");
        }

        File.WriteAllText(path, content);
    }

    private static void GenerateNecessities()
    {
        _ = Directory.CreateDirectory(baseDirPath);
        GenerateFile(
            Path.Combine(baseDirPath, "main.json"), new mainJson().TransformText());
        GenerateFile(
            Path.Combine(baseDirPath, "main.parameters.json"), new mainParamsJson().TransformText());
        GenerateFile(
            Path.Combine(baseDirPath, "abbreviations.json"), new abbreviationsJson().TransformText());
    }
}
