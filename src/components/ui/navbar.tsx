import React from 'react';

export function NavBar({ active, forceUnderlineProducts, hideLinks }: { active: 'products' | 'orders', forceUnderlineProducts?: boolean, hideLinks?: boolean }) {
  const [ordersHover, setOrdersHover] = React.useState(false);
  const [productsHover, setProductsHover] = React.useState(false);
  const [newSessionHover, setNewSessionHover] = React.useState(false);

  // Responsive width and spacing
  const navWidth = '100%';
  const navMaxWidth = '64rem';
  const logoGap = '0.5rem';
  const textMarginLeft = '0.5rem';
  // Add extra space between brand and nav links on OrderDetail page
  const navLinksGap = active === 'orders' ? '2.5rem' : '1rem';

  return (
    <header className="w-full">
      <div
        className={`mx-auto px-0 py-4 flex items-center justify-between`}
        style={{ width: hideLinks ? '800px' : navWidth, maxWidth: hideLinks ? '800px' : navMaxWidth }}
      >
        {/* Logo + Brand (always left-aligned) */}
        <div className="flex items-center" style={{ gap: logoGap }}>
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
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
              marginLeft: textMarginLeft,
              letterSpacing: '-0.01em',
              userSelect: 'none',
              textAlign: 'left',
              whiteSpace: 'nowrap',
            }}
          >
            Demo Shop Admin Console
          </span>
        </div>
        {/* Nav Links */}
        {!hideLinks && (
          <nav className="flex items-center text-sm font-medium justify-end" style={{ gap: '0.5rem', marginLeft: 'auto' }}>
            <a
              href="/products"
              style={{
                color: '#60a5fa',
                textDecoration: forceUnderlineProducts ? 'underline' : productsHover ? 'underline' : 'none',
                textUnderlineOffset: (forceUnderlineProducts || productsHover) ? '4px' : undefined,
                fontWeight: 500,
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                transition: 'background 0.2s',
                background: 'transparent',
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
                textUnderlineOffset: ordersHover ? '4px' : undefined,
                fontWeight: 500,
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                transition: 'background 0.2s',
                background: 'transparent',
              }}
              onMouseEnter={() => setOrdersHover(true)}
              onMouseLeave={() => setOrdersHover(false)}
            >
              Orders
            </a>
            <a
              href="#"
              style={{
                color: '#fff',
                background: newSessionHover ? '#2563eb' : '#3b82f6',
                borderRadius: '0.5rem',
                padding: '0.5rem 1.25rem',
                fontWeight: 600,
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                border: 'none',
                textDecoration: 'none',
                transition: 'background 0.2s, color 0.2s',
                display: 'inline-block',
              }}
              onMouseEnter={() => setNewSessionHover(true)}
              onMouseLeave={() => setNewSessionHover(false)}
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
        )}
      </div>
    </header>
  );
}