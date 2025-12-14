import { updateJob } from "./jobStore";
import { execa } from "execa";
import { runClineFix } from "./cline";
import fs from "fs";
import path from "path";

export async function runJob(jobId: string, repoUrl: string) {
  const workdir = `/tmp/bughunter-${jobId}`;
  const lintPath = path.join(workdir, "lint.json");

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

    // Install dependencies
    await execa("npm", ["install"], { cwd: workdir, reject: false });

    updateJob(jobId, j => {
      j.logs.push("Running ESLint...");
    });

    // Run ESLint and save to workdir (not /tmp)
    const lintResult = await execa(
      "npm",
      ["run", "lint", "--", "--format", "json", "--output-file", "lint.json"],
      { cwd: workdir, reject: false }
    );

    let lintReport: string | undefined;
    if (fs.existsSync(lintPath)) {
      const size = fs.statSync(lintPath).size;
      lintReport = fs.readFileSync(lintPath, "utf8");
      updateJob(jobId, j => {
        j.logs.push(`ESLint report generated (${size} bytes)`);
        if (size > 2) { // More than just "[]"
          j.logs.push("Issues found by ESLint");
        } else {
          j.logs.push("No ESLint issues found");
        }
      });
    } else {
      updateJob(jobId, j => {
        j.logs.push("ESLint did not generate lint.json (may not be configured)");
      });
    }

    // Run tests to check for failing tests
    updateJob(jobId, j => {
      j.status = "testing";
      j.logs.push("Running tests...");
    });

    let testOutput: string | undefined;
    try {
      const testResult = await execa("npm", ["test"], { 
        cwd: workdir, 
        reject: false,
        timeout: 30000 // 30 second timeout
      });
      
      if (testResult.exitCode !== 0) {
        testOutput = testResult.stdout + "\n" + testResult.stderr;
        updateJob(jobId, j => {
          j.logs.push("Tests are failing - will attempt to fix");
          j.logs.push(testOutput.slice(0, 500));
        });
      } else {
        updateJob(jobId, j => {
          j.logs.push("All tests passed ✓");
        });
      }
    } catch (err: any) {
      updateJob(jobId, j => {
        j.logs.push(`Test run error: ${err.message} (continuing anyway)`);
      });
    }

    // Get git status before Cline runs
    const gitStatusBefore = await execa("git", ["status", "--porcelain"], {
      cwd: workdir,
      reject: false
    });

    updateJob(jobId, j => {
      j.status = "fixing";
      j.logs.push("Running Cline to fix issues...");
    });

    // Run Cline to actually fix the issues
    const clineResult = await runClineFix(workdir, lintPath, testOutput);

    updateJob(jobId, j => {
      j.logs.push("Cline output:");
      j.logs.push(clineResult.stdout);
      if (clineResult.stderr) {
        j.logs.push("Cline stderr:");
        j.logs.push(clineResult.stderr);
      }
    });

    // Check what files were actually changed
    const gitStatusAfter = await execa("git", ["status", "--porcelain"], {
      cwd: workdir,
      reject: false
    });

    if (gitStatusAfter.stdout.trim()) {
      // Files were changed - get the diff
      const diffResult = await execa("git", ["diff"], {
        cwd: workdir,
        reject: false
      });
      
      const patch = diffResult.stdout;
      updateJob(jobId, j => {
        j.patch = patch;
        j.logs.push("✅ Cline made actual changes to files!");
        j.logs.push(`Changed files: ${gitStatusAfter.stdout.split('\n').filter(l => l).length}`);
        j.logs.push("Patch preview:");
        j.logs.push(patch.slice(0, 1000));
      });
    } else {
      updateJob(jobId, j => {
        j.logs.push("⚠️  Cline did not modify any files");
        j.logs.push("Attempting ESLint auto-fix as fallback...");
      });

      // Fallback: Try ESLint auto-fix
      if (lintReport && lintReport.length > 2) {
        try {
          const eslintFixResult = await execa(
            "npm",
            ["run", "lint", "--", "--fix"],
            { cwd: workdir, reject: false }
          );

          const gitStatusAfterFallback = await execa("git", ["status", "--porcelain"], {
            cwd: workdir,
            reject: false
          });

          if (gitStatusAfterFallback.stdout.trim()) {
            const diffResult = await execa("git", ["diff"], {
              cwd: workdir,
              reject: false
            });
            
            updateJob(jobId, j => {
              j.patch = diffResult.stdout;
              j.logs.push("✅ ESLint auto-fix made changes (fallback)");
              j.logs.push("Patch preview:");
              j.logs.push(diffResult.stdout.slice(0, 1000));
            });
          } else {
            updateJob(jobId, j => {
              j.logs.push("⚠️  ESLint auto-fix also didn't make changes");
              j.logs.push("Possible reasons:");
              j.logs.push("- All issues were already fixed");
              j.logs.push("- Issues require manual intervention");
            });
          }
        } catch (err: any) {
          updateJob(jobId, j => {
            j.logs.push(`ESLint fallback error: ${err.message}`);
          });
        }
      }
    }

    // Verify fixes by running ESLint again
    if (lintReport && lintReport.length > 2) {
      updateJob(jobId, j => {
        j.logs.push("Verifying fixes with ESLint...");
      });
      
      const verifyResult = await execa(
        "npm",
        ["run", "lint", "--", "--format", "json", "--output-file", "lint-after.json"],
        { cwd: workdir, reject: false }
      );

      const lintAfterPath = path.join(workdir, "lint-after.json");
      if (fs.existsSync(lintAfterPath)) {
        const lintAfter = fs.readFileSync(lintAfterPath, "utf8");
        if (lintAfter.length <= 2) {
          updateJob(jobId, j => {
            j.logs.push("✅ All ESLint issues fixed!");
          });
        } else {
          updateJob(jobId, j => {
            j.logs.push("⚠️  Some ESLint issues remain");
          });
        }
      }
    }

    // Verify tests if they were failing
    if (testOutput) {
      updateJob(jobId, j => {
        j.logs.push("Re-running tests to verify fixes...");
      });
      
      const testVerifyResult = await execa("npm", ["test"], { 
        cwd: workdir, 
        reject: false,
        timeout: 30000
      });
      
      if (testVerifyResult.exitCode === 0) {
        updateJob(jobId, j => {
          j.logs.push("✅ All tests now pass!");
        });
      } else {
        updateJob(jobId, j => {
          j.logs.push("⚠️  Some tests still failing");
        });
      }
    }

    updateJob(jobId, j => {
      j.status = "done";
      j.logs.push("Job completed");
    });

  } catch (err: any) {
    updateJob(jobId, j => {
      j.status = "failed";
      j.logs.push("Error: " + err.message);
      j.logs.push(err.stack || "");
    });
  }
}
