import { NextResponse } from "next/server";
import { getJob } from "@/lib/jobStore";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const job = getJob(params.id);
if (!job) {
  return NextResponse.json(null, { status: 404 });
}

return NextResponse.json(job);

}
