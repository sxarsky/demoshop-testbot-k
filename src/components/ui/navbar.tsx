import React from 'react';

export function NavBar({ active, forceUnderlineProducts }: { active: 'products' | 'orders', forceUnderlineProducts?: boolean }) {
  const [ordersHover, setOrdersHover] = React.useState(false);
  const [productsHover, setProductsHover] = React.useState(false);
  return (
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
            style={{
              color: '#60a5fa',
              textDecoration: forceUnderlineProducts ? 'underline' : productsHover ? 'underline' : 'none',
              textUnderlineOffset: (forceUnderlineProducts || productsHover) ? '4px' : undefined
            }}
            onMouseEnter={() => setProductsHover(true)}
            onMouseLeave={() => setProductsHover(false)}
          >
            Products
          </a>
          <a
            href="/orders"
            style={{
              color: '#60a5fa',
              textDecoration: ordersHover ? 'underline' : 'none',
              textUnderlineOffset: ordersHover ? '4px' : undefined
            }}
            onMouseEnter={() => setOrdersHover(true)}
            onMouseLeave={() => setOrdersHover(false)}
          >
            Orders
          </a>
        </nav>
      </div>
    </header>
  );
}