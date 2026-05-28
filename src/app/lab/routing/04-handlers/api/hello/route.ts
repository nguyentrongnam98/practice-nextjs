export async function GET() {
  return Response.json({
    message: 'Hello from a Route Handler!',
    at: new Date().toISOString(),
  })
}
