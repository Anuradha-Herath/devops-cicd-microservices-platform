'use client'

import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  price: number
  description: string
}

interface ServiceStatus {
  api: 'ok' | 'error' | 'loading'
  auth: 'ok' | 'error' | 'loading'
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<ServiceStatus>({
    api: 'loading',
    auth: 'loading',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Determine base URL - use current origin (works with nginx on port 80)
        // If accessed directly on port 3000, use relative paths which nginx will handle
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        
        // Check API service health
        try {
          const apiHealthRes = await fetch(`${baseUrl}/api/health`)
          if (apiHealthRes.ok) {
            setStatus((prev) => ({ ...prev, api: 'ok' }))
          } else {
            setStatus((prev) => ({ ...prev, api: 'error' }))
          }
        } catch (err) {
          setStatus((prev) => ({ ...prev, api: 'error' }))
        }

        // Check Auth service health
        try {
          const authHealthRes = await fetch(`${baseUrl}/auth/health`)
          if (authHealthRes.ok) {
            setStatus((prev) => ({ ...prev, auth: 'ok' }))
          } else {
            setStatus((prev) => ({ ...prev, auth: 'error' }))
          }
        } catch (err) {
          setStatus((prev) => ({ ...prev, auth: 'error' }))
        }

        // Fetch products
        const productsRes = await fetch(`${baseUrl}/api/products`)
        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data)
        } else {
          setError('Failed to fetch products')
        }
      } catch (err) {
        setError('Failed to connect to services')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="container">
      <h1>Microservices Dashboard</h1>

      <div className="status-section">
        <h2>Service Status</h2>
        <div className="status-item">
          <span className="status-label">API Service</span>
          <span
            className={`status-value ${
              status.api === 'ok' ? 'ok' : status.api === 'error' ? 'error' : ''
            }`}
          >
            {status.api === 'loading' ? 'Checking...' : status.api.toUpperCase()}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Auth Service</span>
          <span
            className={`status-value ${
              status.auth === 'ok'
                ? 'ok'
                : status.auth === 'error'
                ? 'error'
                : ''
            }`}
          >
            {status.auth === 'loading'
              ? 'Checking...'
              : status.auth.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="products-section">
        <h2>Products</h2>
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : products.length === 0 ? (
          <div className="loading">No products available</div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-name">{product.name}</div>
                <div className="product-description">{product.description}</div>
                <div className="product-price">${product.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
