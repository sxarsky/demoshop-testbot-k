import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProductCatalog from './components/products/ProductCatalog'
import ProductDetail from './components/products/ProductDetail'
import OrderCatalog from './components/orders/OrderCatalog'
import OrderDetail from './components/orders/OrderDetail'
import { useState } from 'react'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/orders" element={<OrderCatalog />} />
        <Route path="/orders/:order_id" element={<OrderDetail />} />
        <Route path="/" element={<Navigate to="/products" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
