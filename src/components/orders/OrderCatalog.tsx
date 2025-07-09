import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import OrderList from "./OrderList";

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
    <div className="min-h-screen bg-white px-6 py-10" style={{ width: '100%', maxWidth: '64rem', margin: '0 auto' }}>
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
      <header className="w-full">
        <div className="max-w-4xl mx-auto px-0 py-4 flex items-center justify-between" style={{ width: '100%' }}>
          {/* Logo + Brand */}
          <div className="flex items-center gap-2">
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
            <span style={{ marginRight: '2.5rem' }} />
          </div>

          {/* Nav Links */}
          <nav className="flex items-center text-sm font-medium" style={{ gap: '1rem' }}>
            <a 
              href="/products" 
              style={{ color: '#60a5fa' }}
              onMouseOver={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '4px'; }}
              onMouseOut={e => { e.currentTarget.style.textDecoration = 'none'; }}
            >
              Products
            </a>
            <a href="/orders" className="underline underline-offset-4" style={{ color: '#60a5fa' }}>
              Orders
            </a>
          </nav>
        </div>
      </header>

      {/* Page Heading directly below nav */}
      <h1
        className="text-4xl font-bold text-gray-900 text-center"
        style={{
          textAlign: 'center',
          width: '100%',
          margin: 0,
          paddingTop: '0.5rem',
          marginBottom: '1.5rem', // space below heading
        }}
      >
        Order Catalog
      </h1>
      {/* Add extra space below heading before orders list */}
      <div style={{ height: '1.5rem' }} />

      <div style={{ width: '100%', maxWidth: '64rem', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <OrderList />
      </div>
    </div>
  );
}
