export async function GET() {
  return Response.json({ lastClaimTime: new Date().getTime() })
}