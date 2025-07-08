import React from 'react';

export function NavBar({ active }: { active: 'products' | 'orders' }) {
  const [ordersHover, setOrdersHover] = React.useState(false);
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
        </div>
        {/* Nav Links */}
        <nav className="flex items-center text-sm font-medium" style={{ gap: '1rem' }}>
          <a
            href="/products"
            className={active === 'products' ? 'underline underline-offset-4' : ''}
            style={{ color: '#60a5fa', textDecoration: active === 'products' ? 'underline' : ordersHover ? 'underline' : 'none', textUnderlineOffset: active === 'products' || ordersHover ? '4px' : undefined }}
            onMouseEnter={() => setOrdersHover(true)}
            onMouseLeave={() => setOrdersHover(false)}
          >
            Products
          </a>
          <a
            href="/orders"
            className={active === 'orders' ? 'underline underline-offset-4' : ''}
            style={{ color: '#60a5fa', textDecoration: active === 'orders' ? 'underline' : 'none', textUnderlineOffset: active === 'orders' ? '4px' : undefined }}
          >
            Orders
          </a>
        </nav>
      </div>
    </header>
  );
}