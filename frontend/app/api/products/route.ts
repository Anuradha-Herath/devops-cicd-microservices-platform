import { NextResponse } from 'next/server'

// Determine API service URL based on environment
const getApiServiceUrl = () => {
  // Use explicit URL if provided
  if (process.env.API_SERVICE_URL) {
    return process.env.API_SERVICE_URL
  }
  // In Docker, use service name; locally, use localhost
  const apiServiceHost = process.env.API_SERVICE_HOST || (process.env.NODE_ENV === 'production' ? 'api-service' : 'localhost')
  const apiServicePort = process.env.API_SERVICE_PORT || '5000'
  return `http://${apiServiceHost}:${apiServicePort}`
}

export async function GET() {
  try {
    const apiServiceUrl = getApiServiceUrl()
    
    // Create abort controller for timeout (compatible with older Node versions)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch(`${apiServiceUrl}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching products:', error)
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to connect to API service' },
      { status: 503 }
    )
  }
}
