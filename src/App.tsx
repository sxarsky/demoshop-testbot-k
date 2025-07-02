import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProductCatalog from './components/ProductCatalog'
import ProductDetail from './components/ProductDetail'
import { useState } from 'react'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/" element={<Navigate to="/products" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
