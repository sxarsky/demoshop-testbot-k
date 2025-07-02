import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import ProductItem from "./ProductItem"

interface Product {
  product_id: number
  name: string
  price: number
  category: string
  description: string
  image_url: string
  created_at: string
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation();

  const fetchProducts = () => {
    setLoading(true)
    fetch("https://demoshop.skyramp.dev/api/v1/products?limit=50")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch products")
        return res.json()
      })
      .then((data: Product[]) => {
        const sorted = (data || []).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setProducts(sorted)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [location])

  if (loading) return <div>Loading products...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="flex flex-col" style={{ gap: '1.5rem' }}>
      {products.map(product => (
        <ProductItem key={product.product_id} product={product} />
      ))}
    </div>
  )
}