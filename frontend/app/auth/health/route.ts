import { NextResponse } from 'next/server'

// Determine Auth service URL based on environment
const getAuthServiceUrl = () => {
  // Use explicit URL if provided
  if (process.env.AUTH_SERVICE_URL) {
    return process.env.AUTH_SERVICE_URL
  }
  // In Docker, use service name; locally, use localhost
  const authServiceHost = process.env.AUTH_SERVICE_HOST || (process.env.NODE_ENV === 'production' ? 'auth-service' : 'localhost')
  const authServicePort = process.env.AUTH_SERVICE_PORT || '5001'
  return `http://${authServiceHost}:${authServicePort}`
}

export async function GET() {
  try {
    const authServiceUrl = getAuthServiceUrl()
    
    // Create abort controller for timeout (compatible with older Node versions)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${authServiceUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', message: 'Auth service is not healthy' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error checking Auth service health:', error)
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { status: 'error', message: 'Request timeout' },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { status: 'error', message: 'Failed to connect to Auth service' },
      { status: 503 }
    )
  }
}
