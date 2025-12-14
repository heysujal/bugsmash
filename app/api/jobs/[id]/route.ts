import { NextResponse } from "next/server";

const KESTRA_HOST = 'https://7d9449dadfe4.ngrok-free.app'
// Base64 encoding of 'admin@kestra.io:Admin1234'
const KESTRA_AUTH_HEADER = 'Basic YWRtaW5Aa2VzdHJhLmlvOkFkbWluMTIzNA=='; 

// Helper function to convert Kestra logs to a simple array
function formatKestraLogs(logs: any[]): string[] {
    return logs.map((log: any) => {
        const taskId = log.taskId || 'ORCHESTRATOR';
        const date = new Date(log.timestamp).toLocaleTimeString();
        return `[${date}][${taskId}] ${log.message}`;
    });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }  // Change this line
) {
    const { id } = await params; 
    const executionId = id;
    
    // Auth header for fetch options
    const fetchOptions = {
        headers: { 'Authorization': KESTRA_AUTH_HEADER } 
    };

    try {
        const statusUrl = `${KESTRA_HOST}/api/v1/executions/${executionId}`;
        const logsUrl = `${KESTRA_HOST}/api/v1/executions/${executionId}/logs`;
        
        const [statusResponse, logsResponse] = await Promise.all([
            fetch(statusUrl, fetchOptions),
            fetch(logsUrl, fetchOptions)
        ]);

        if (!statusResponse.ok) {
            if (statusResponse.status === 401 || statusResponse.status === 403) {
                console.error("Kestra Auth Failed. Check KESTRA_AUTH_HEADER.");
                return NextResponse.json({ error: 'Kestra Authentication Failed (401/403)' }, { status: 500 });
            }
            return NextResponse.json({ error: 'Job not found in Kestra' }, { status: 404 });
        }

        const statusData = await statusResponse.json();
        const logsData = logsResponse.ok ? await logsResponse.json() : [];

        // PrUrl is correctly extracted from the `outputs` property of the execution status
        const prUrl = statusData.outputs?.prUrl; 
        
        return NextResponse.json({
            id: executionId,
            status: statusData.state.toLowerCase(),
            logs: formatKestraLogs(logsData),
            prUrl: prUrl,
            kestraUrl: `${KESTRA_HOST}/ui/executions/${statusData.namespace}/${statusData.flowId}/${statusData.id}`
        });

    } catch (error) {
        console.error(`Error polling Kestra job ${executionId}:`, error);
        return NextResponse.json({ error: 'Failed to poll Kestra status' }, { status: 500 });
    }
}