import { NextResponse } from "next/server";
import { createJob } from "@/lib/jobStore";
import { runJob } from "@/lib/runner";

export async function POST(req: Request) {
  const { repoUrl } = await req.json();

  const job = createJob(repoUrl);

  // Run async (DON’T await)
  runJob(job.id, repoUrl);

  return NextResponse.json(job);
}
