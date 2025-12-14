import { execa } from "execa";
import fs from "fs";
import path from "path";

export async function runClineFix(workdir: string, lintReportPath?: string, testOutput?: string) {
  // Copy the prompt file to the workdir so Cline can access it
  const promptPath = path.join(workdir, "cline_prompt.md");
  // Use absolute path for reading the original prompt
  const originalPromptPath = path.join(process.cwd(), "prompts", "fix-dry-run.md");
  const originalPrompt = fs.readFileSync(originalPromptPath, "utf8");
  fs.writeFileSync(promptPath, originalPrompt);

  // Build the prompt with context
  let prompt = originalPrompt;
  
  if (lintReportPath && fs.existsSync(lintReportPath)) {
    const lintContent = fs.readFileSync(lintReportPath, "utf8");
    prompt += `\n\n## ESLint Report\n\`\`\`json\n${lintContent}\n\`\`\`\n`;
  }
  
  if (testOutput) {
    prompt += `\n\n## Test Output\n\`\`\`\n${testOutput}\n\`\`\`\n`;
  }

  // Write the enhanced prompt
  fs.writeFileSync(promptPath, prompt);

  // Run Cline with the prompt file
  // Cline should make actual edits based on the prompt instructions
  // The prompt explicitly tells Cline to modify files directly
  const result = await execa(
    "cline",
    [
      "run",
      `--prompt-file=cline_prompt.md`, // Relative path since we're in workdir
      "--repo=.",
    ],
    {
      cwd: workdir,
      reject: false,
      env: {
        ...process.env,
        // Set environment variables that might help Cline make changes
        CI: "true", // Indicate we're in CI mode
      }
    }
  );

  return {
    stdout: result.stdout || "Cline finished with no output",
    stderr: result.stderr || "",
    exitCode: result.exitCode || 0,
  };
}
