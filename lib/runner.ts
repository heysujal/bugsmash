import { updateJob } from "./jobStore";
import { execa } from "execa";

export async function runJob(jobId: string, repoUrl: string) {
  const workdir = `/tmp/bughunter-${jobId}`;

  try {
    updateJob(jobId, j => {
      j.status = "cloning";
      j.logs.push("Cloning repository...");
    });

    await execa("git", ["clone", repoUrl, workdir]);

    updateJob(jobId, j => {
      j.status = "linting";
      j.logs.push("Installing dependencies...");
    });

    await execa("npm", ["ci"], { cwd: workdir, reject: false });

    updateJob(jobId, j => {
      j.logs.push("Running ESLint...");
    });

    await execa(
      "npx",
      ["eslint", ".", "-f", "json", "-o", "/tmp/lint.json"],
      { cwd: workdir, reject: false }
    );

    updateJob(jobId, j => {
      j.status = "done";
      j.logs.push("Lint completed");
    });

  } catch (err: any) {
    updateJob(jobId, j => {
      j.status = "failed";
      j.logs.push("Error: " + err.message);
    });
  }
}
