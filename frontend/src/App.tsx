import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProductCatalog from './components/products/ProductCatalog'
import ProductDetail from './components/products/ProductDetail'
import OrderCatalog from './components/orders/OrderCatalog'
import OrderDetail from './components/orders/OrderDetail'
import EditOrderForm from './components/orders/EditOrderForm'
import { useState, useEffect } from 'react'
import { ensureSessionId, getSessionIdFromCookie } from './lib/utils'
import './App.css'

function App() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    (async () => {
      const id = await ensureSessionId();
      setSessionId(id);
    })();
  }, []);

  if (!sessionId) {
    // Optionally show a loading spinner while sessionId is being set
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Initializing session...</div>;
  }
  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/orders" element={<OrderCatalog />} />
        <Route path="/orders/:order_id" element={<OrderDetail />} />
        <Route path="/orders/:order_id/edit" element={<EditOrderForm />} />
        <Route path="/" element={<Navigate to="/products" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
