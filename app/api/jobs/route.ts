import { NextResponse } from "next/server";

// !!! SET YOUR NGROK HOST !!!
const KESTRA_HOST = 'https://7d9449dadfe4.ngrok-free.app';
const KESTRA_NAMESPACE = 'bughunter';
const KESTRA_FLOW_ID = 'autonomous-bug-fixer';

// Base64 encoding of 'admin@kestra.io:Admin1234'
const KESTRA_AUTH_HEADER = 'Basic YWRtaW5Aa2VzdHJhLmlvOkFkbWluMTIzNA=='; 

export async function POST(req: Request) {
  const { repoUrl } = await req.json();

  if (!repoUrl) {
    return NextResponse.json({ error: 'Missing repoUrl' }, { status: 400 });
  }

  try {
    // 1. Trigger the Kestra Flow
    const kestraApiUrl = `${KESTRA_HOST}/api/v1/executions/execute/${KESTRA_NAMESPACE}/${KESTRA_FLOW_ID}`;
    
    const kestraResponse = await fetch(kestraApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': KESTRA_AUTH_HEADER, 
      },
      body: JSON.stringify({ inputs: { repoUrl } }),
    });

    if (!kestraResponse.ok) {
      const errorText = await kestraResponse.text();
      throw new Error(`Kestra API failed (${kestraResponse.status}) at ${kestraApiUrl}: ${errorText}`);
    }

    const kestraData = await kestraResponse.json();
    
    // 2. Return the Kestra Execution ID as the job ID
    return NextResponse.json({
      id: kestraData.id,
      status: kestraData.state,
      createdAt: new Date().toISOString(),
      repoUrl: repoUrl,
      kestraHost: KESTRA_HOST 
    });

  } catch (error) {
    console.error('Error starting job:', error);
    return NextResponse.json({ error: 'Failed to trigger Kestra job' }, { status: 500 });
  }
}