export type JobStatus =
  | "queued"
  | "cloning"
  | "linting"
  | "testing"
  | "done"
  | "failed";

export type Job = {
  id: string;
  repoUrl: string;
  status: JobStatus;
  logs: string[];
  createdAt: number;
};

const jobs = new Map<string, Job>();

export function createJob(repoUrl: string): Job {
  const job: Job = {
    id: crypto.randomUUID(),
    repoUrl,
    status: "queued",
    logs: ["Job created"],
    createdAt: Date.now()
  };
  jobs.set(job.id, job);
  return job;
}

export function getJob(id: string) {
  return jobs.get(id);
}

export function updateJob(id: string, updater: (job: Job) => void) {
  const job = jobs.get(id);
  if (!job) return;
  updater(job);
}
