import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import OrderList from "./OrderList";

const AddOrderForm = React.lazy(() => import("./AddOrderForm"));

export default function OrderCatalog() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletedBanner, setDeletedBanner] = useState<{
    customer_email: string;
    itemCount: number;
  } | null>(null);

  // Show deleted banner if present in localStorage
  useEffect(() => {
    const banner = localStorage.getItem("deletedOrderBanner");
    if (banner) {
      setDeletedBanner(JSON.parse(banner));
      localStorage.removeItem("deletedOrderBanner");
    }
  }, []);

  return (
    <div className="min-h-screen bg-white px-6 py-10" style={{ width: '100%', maxWidth: '64rem', margin: '0 auto', paddingLeft: '1rem' }}>
      {/* Deleted Banner */}
      {deletedBanner && (
        <div className="max-w-xl mx-auto mb-6">
          <div
            className="flex items-center justify-between text-red-800 shadow-sm text-sm"
            style={{
              background: "#fee2e2",
              borderRadius: "0.5rem",
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              border: "none",
            }}
          >
            <span>
              The order for <b>{deletedBanner.customer_email}</b> with <b>{deletedBanner.itemCount}</b> items has been cancelled.
            </span>
            <button
              className="ml-4 text-red-500 hover:text-red-700 font-bold text-lg px-2"
              aria-label="Dismiss"
              onClick={() => setDeletedBanner(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <header className="w-full" style={{ marginLeft: '1rem' }}>
        <div className="max-w-4xl mx-auto px-0 py-4 flex items-center justify-between" style={{ width: '100%' }}>
          {/* Logo + Brand */}
          <div className="flex items-center" style={{ gap: '0.5rem' }}>
            <a href="https://skyramp.dev" target="_blank" rel="noopener noreferrer">
              <img
                src="/logo.avif"
                alt="Skyramp Logo"
                width={150}
                height={100}
                className="object-contain"
                style={{ cursor: 'pointer' }}
              />
            </a>
            <span
              style={{
                fontSize: '1.25rem', // text-xl
                fontWeight: 600, // semi-bold
                color: '#111827', // gray-900
                marginLeft: '0.5rem',
                letterSpacing: '-0.01em',
                userSelect: 'none',
              }}
            >
              Demo Shop Admin Console
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center text-sm font-medium" style={{ gap: '1rem', marginLeft: 'auto' }}>
            <a 
              href="/products" 
              style={{ color: '#60a5fa' }}
              onMouseOver={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '4px'; }}
              onMouseOut={e => { e.currentTarget.style.textDecoration = 'none'; }}
            >
              Products
            </a>
            <a href="/orders" style={{ color: '#60a5fa', textDecoration: 'underline', textUnderlineOffset: '4px' }}
              onMouseOver={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '4px'; }}
              onMouseOut={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '4px'; }}
              >
              Orders
            </a>
            <a href="/" style={{
              color: '#fff',
              background: '#3b82f6',
              borderRadius: '0.5rem',
              padding: '0.5rem 1.25rem',
              fontWeight: 600,
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              border: 'none',
              textDecoration: 'none',
              transition: 'background 0.2s, color 0.2s',
              display: 'inline-block',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#2563eb'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#3b82f6'; }}
            onClick={async (e) => {
              e.preventDefault();
              try {
                await fetch('https://demoshop.skyramp.dev/api/v1/reset', { method: 'POST' });
                window.location.reload();
              } catch (err) {
                alert('Failed to reset state.');
              }
            }}
          >
            Clear State
          </a>
          </nav>
        </div>
      </header>

      {/* Page Heading directly below nav */}
      <div style={{ width: '100%', marginLeft: '1rem' }}>
        <h1
          className="text-4xl font-bold text-gray-900"
          style={{
            textAlign: 'center',
            width: '100%',
            margin: 0,
            paddingTop: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          Order Catalog
        </h1>
      </div>
      {/* Add extra space below heading before orders list */}
      <div style={{ height: '1.5rem' }} />

      {/* Add Order Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <Button
          style={{
            width: '12rem',
            color: '#fff',
            background: '#111',
            border: '1.5px solid #111',
            transition: 'background 0.2s, border-color 0.2s, color 0.2s',
            fontWeight: 600,
            fontSize: '1.1rem',
            borderRadius: '0.5rem',
            padding: '0.75rem 0',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            outline: 'none',
            cursor: 'pointer',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'rgba(17,17,17,0.7)';
            e.currentTarget.style.borderColor = '#111';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#111';
            e.currentTarget.style.borderColor = '#111';
            e.currentTarget.style.color = '#fff';
          }}
          onClick={() => setShowAddForm(true)}
        >
          Add Order
        </Button>
      </div>

      {/* AddOrderForm Modal */}
      {showAddForm && (
        <React.Suspense fallback={<div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(31,41,55,0.35)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',color:'#374151'}}>Loading...</div>}>
          <AddOrderForm onClose={() => setShowAddForm(false)} />
        </React.Suspense>
      )}

      <div style={{ width: '100%' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <OrderList />
        </div>
      </div>
    </div>
  );
}
