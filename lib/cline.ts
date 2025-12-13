import { execa } from "execa";

export async function runClineDryRun(workdir: string) {
  const result = await execa(
    "cline",
    [
      "run",
      "--prompt-file=prompts/fix-dry-run.md",
      "--repo=.",
    ],
    {
      cwd: workdir,
      reject: false
    }
  );

  return result.stdout || "Cline finished with no output";
}
