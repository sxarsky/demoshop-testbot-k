import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductItem from "../products/ProductItem";
import { NavBar } from '../ui/navbar';

export default function OrderDetail() {
  const { order_id } = useParams<{ order_id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!order_id) return;
    setLoading(true);
    fetch(`https://demoshop.skyramp.dev/api/v1/orders/${order_id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch order details");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setError(null);
        // Fetch product details for each order item
        if (data.items && data.items.length > 0) {
          Promise.all(
            data.items.map((item: any) =>
              fetch(`https://demoshop.skyramp.dev/api/v1/products/${item.product_id}`)
                .then((res) => res.ok ? res.json() : null)
                .catch(() => null)
            )
          ).then((products) => setProducts(products.filter(Boolean)));
        } else {
          setProducts([]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [order_id]);

  const handleCancelOrder = async () => {
    if (!order_id) return;
    setCancelling(true);
    try {
      const res = await fetch(`https://demoshop.skyramp.dev/api/v1/orders/${order_id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to cancel order');
      // Show banner on /orders
      localStorage.setItem(
        'deletedOrderBanner',
        JSON.stringify({ customer_email: order.customer_email, itemCount: order.items.length })
      );
      navigate('/orders');
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading order details...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!order) return <div className="text-center py-8">Order not found.</div>;

  return (
    <div className="min-h-screen bg-white px-6 py-10" style={{ width: '100%', maxWidth: '64rem', margin: '0 auto' }}>
      {/* Top Navigation */}
      <NavBar active="orders" />
      {/* Page Heading directly below nav */}
      <h1
        className="text-4xl font-bold text-gray-900 tracking-tight"
        style={{
          textAlign: 'center',
          width: '100%',
          margin: 0,
          paddingTop: '0.5rem',
          marginBottom: '1.5rem', // space below heading
        }}
      >
        Order Details
      </h1>
      <div className="w-full" style={{ width: '100%', maxWidth: '48rem', margin: '0 auto', padding: '0 1.5rem 1.5rem 1.5rem' }}>
        <div className="mb-8">
          <div style={{ marginBottom: '1rem' }} className="mb-1 text-left">
            <span style={{ color: '#9ca3af' }}>Customer Email:</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 500 }} className="text-gray-900 mt-1">{order.customer_email}</div>
          </div>
          <div style={{ marginBottom: '1rem' }} className="mb-1 text-left">
            <span style={{ color: '#9ca3af' }}>Status:</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 500, textTransform: 'capitalize' }} className="text-gray-900 mt-1">{order.status === 'confirmed' ? 'Confirmed' : order.status}</div>
          </div>
          <div style={{ marginBottom: '1rem' }} className="mb-1 text-left">
            <span style={{ color: '#9ca3af' }}>Total:</span>
            <div style={{ fontSize: '1.125rem', fontWeight: 500 }} className="text-gray-900 mt-1">${order.total_amount.toFixed(2)}</div>
          </div>
        </div>
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: '2rem' }} className="mb-4 text-left">Order Items</h2>
        <div className="flex flex-col gap-4 mb-8">
          {products.length === 0 && <div className="text-gray-500 text-left">No products found for this order.</div>}
          {products.map((product, idx) => (
            <ProductItem key={product.product_id || idx} product={product} />
          ))}
        </div>
        {/* Add extra space below order items */}
        <div style={{ height: '2.5rem' }} />
        <div className="flex flex-col items-center" style={{ marginTop: '1.5rem', gap: '1rem' }}>
          {order.status !== 'cancelled' && (
            <Button
              variant="destructive"
              className="w-fit"
              onClick={handleCancelOrder}
              disabled={cancelling}
              style={{
                color: '#fff',
                background: '#dc2626', // Default red
                border: '1.5px solid transparent', // Reserve space for border
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#f87171'; // Lighter red
                e.currentTarget.style.borderColor = '#991b1b'; // Dark red border
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#dc2626'; // Default red
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          )}
          <Button
            variant="link"
            className="w-48"
            onClick={() => navigate('/orders')}
            style={{
              color: '#111', // Black text
              background: '#e5e7eb', // Slightly darker than #f3f4f6
              border: '1.5px solid transparent', // Reserve space for border
              transition: 'background 0.2s, border-color 0.2s, color 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#d1d5db'; // Darker grey on hover
              e.currentTarget.style.borderColor = '#111'; // Black border
              e.currentTarget.style.color = '#111'; // Keep text black on hover
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#e5e7eb'; // Slightly darker default
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.color = '#111'; // Keep text black
            }}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
