import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import "@/styles/select-zindex-workaround.css";
import ProductItem from "../products/ProductItem";
import { NavBar } from "@/components/ui/navbar";
import { getSessionIdFromCookie } from '../../lib/utils';
import { apiUrl } from '../../config';

export default function OrderDetail() {
  const { order_id } = useParams<{ order_id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Edit form state
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editItems, setEditItems] = useState<any[]>([]);
  const [editDiscountType, setEditDiscountType] = useState("");
  const [editDiscountValue, setEditDiscountValue] = useState("");

  useEffect(() => {
    if (!order_id) return;
    setLoading(true);
    const sessionId = getSessionIdFromCookie();
    
    // Fetch order details
    fetch(apiUrl(`/api/v1/orders/${order_id}`), {
      headers: { 'Authorization': `Bearer ${sessionId}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch order details");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setError(null);
        
        // Initialize edit form with current values
        setEditEmail(data.customer_email);
        setEditStatus(data.status);
        setEditItems(data.items || []);
        setEditDiscountType(data.discount_type || "");
        setEditDiscountValue(data.discount_value?.toString() || "");
        
        // Fetch product details for each order item
        if (data.items && data.items.length > 0) {
          Promise.all(
            data.items.map((item: any) => {
              return fetch(apiUrl(`/api/v1/products/${item.product_id}`), {
                headers: { 'Authorization': `Bearer ${sessionId}` }
              })
                .then((res) => res.ok ? res.json() : null)
                .catch(() => null)
            })
          ).then((products) => setProducts(products.filter(Boolean)));
        } else {
          setProducts([]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    
    // Fetch all products for dropdown
    fetch(apiUrl(`/api/v1/products`), {
      headers: { 'Authorization': `Bearer ${sessionId}` }
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setAllProducts(data))
      .catch(() => setAllProducts([]));
  }, [order_id]);

  const handleCancelOrder = async () => {
    if (!order_id) return;
    setCancelling(true);
    const sessionId = getSessionIdFromCookie();
    try {
      const res = await fetch(apiUrl(`/api/v1/orders/${order_id}`), { method: 'DELETE', headers: { 'Authorization': `Bearer ${sessionId}` } });
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

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - reset form to current order values
      setEditEmail(order.customer_email);
      setEditStatus(order.status);
      setEditItems(order.items || []);
      setEditDiscountType(order.discount_type || "");
      setEditDiscountValue(order.discount_value?.toString() || "");
    }
    setIsEditing(!isEditing);
  };

  const handleSaveOrder = async () => {
    if (!order_id) return;
    setSaving(true);
    const sessionId = getSessionIdFromCookie();
    
    // Build update payload
    const payload: any = {
      customer_email: editEmail,
      status: editStatus,
      items: editItems.map((item: any) => ({
        order_item_id: item.order_item_id,
        quantity: item.quantity,
        product_id: String(item.product_id)
      }))
    };
    
    // Add discount if both type and value are set
    if (editDiscountType && editDiscountValue) {
      payload.discount_type = editDiscountType;
      payload.discount_value = parseFloat(editDiscountValue);
    }
    
    try {
      const res = await fetch(apiUrl(`/api/v1/orders/${order_id}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to update order');
      
      // Update local state with edited values only
      setOrder({
        ...order,
        customer_email: editEmail,
        status: editStatus,
        items: editItems,
        discount_type: editDiscountType || null,
        discount_value: editDiscountValue ? parseFloat(editDiscountValue) : null,
        discount_amount: editDiscountType && editDiscountValue
          ? editDiscountType === "percentage"
            ? order.total_amount * parseFloat(editDiscountValue) / 100
            : parseFloat(editDiscountValue)
          : null
      });
      
      // Refresh product list for updated items
      if (editItems && editItems.length > 0) {
        Promise.all(
          editItems.map((item: any) => {
            return fetch(apiUrl(`/api/v1/products/${item.product_id}`), {
              headers: { 'Authorization': `Bearer ${sessionId}` }
            })
              .then((res) => res.ok ? res.json() : null)
              .catch(() => null)
          })
        ).then((products) => setProducts(products.filter(Boolean)));
      }
      
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = () => {
    if (allProducts.length === 0) return;
    setEditItems([
      ...editItems,
      {
        order_item_id: null,
        quantity: 1,
        product_id: String(allProducts[0].product_id)
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...editItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditItems(newItems);
  };

  if (loading) return <div className="text-center py-8" data-testId="order-detail-loading">Loading order details...</div>;
  if (error) return <div className="text-center text-red-500 py-8" data-testId="order-detail-error">{error}</div>;
  if (!order) return <div className="text-center py-8" data-testId="order-detail-notfound">Order not found.</div>;

  const netTotal = order.total_amount - (order.discount_amount ?? 0);

  return (
    <div className="min-h-screen bg-white px-6 py-10" style={{ width: '100%', maxWidth: '64rem', margin: '0 auto', boxSizing: 'border-box' }} data-testId="order-detail-root">
      {/* Top Navigation */}
      <NavBar active="orders" />
      {/* Move heading and details to align with nav bar (same left padding) */}
      <div className="w-full" style={{ width: '100%', maxWidth: '48rem', margin: '0 auto', padding: 0 }} data-testId="order-detail-main">
        <h1
          style={{
            fontWeight: 700,
            fontSize: '1.5rem',
            lineHeight: '2rem',
            textAlign: 'left',
            margin: 0,
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
            paddingLeft: 0,
          }}
          data-testId="order-detail-heading"
        >
          Order Details
        </h1>
        
        {!isEditing ? (
          // View Mode
          <>
            <div className="mb-8" style={{ textAlign: 'left', paddingLeft: 0, marginBottom: '2.5rem' }} data-testId="order-detail-info">
              <div style={{ marginBottom: '1rem', textAlign: 'left' }} className="mb-1" data-testId="order-detail-customer-email">
                <span style={{ color: '#9ca3af', display: 'block', textAlign: 'left' }} data-testId="order-detail-label-customer-email">Customer Email:</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 500 }} className="text-gray-900 mt-1" data-testId="order-detail-value-customer-email">{order.customer_email}</div>
              </div>
              <div style={{ marginBottom: '1rem' }} className="mb-1" data-testId="order-detail-status">
                <span style={{ color: '#9ca3af' }} data-testId="order-detail-label-status">Status:</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 500, textTransform: 'capitalize' }} className="text-gray-900 mt-1" data-testId="order-detail-value-status">{order.status === 'confirmed' ? 'Confirmed' : order.status}</div>
              </div>
              <div style={{ marginBottom: '1rem' }} className="mb-1" data-testId="order-detail-total">
                <span style={{ color: '#9ca3af' }} data-testId="order-detail-label-total">Subtotal:</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 500 }} className="text-gray-900 mt-1" data-testId="order-detail-value-total">${order.total_amount.toFixed(2)}</div>
              </div>
              {order.discount_type && order.discount_value && (
                <>
                  <div style={{ marginBottom: '1rem' }} className="mb-1" data-testId="order-detail-discount">
                    <span style={{ color: '#9ca3af' }} data-testId="order-detail-label-discount">Discount ({order.discount_type === 'percentage' ? `${order.discount_value}%` : `$${order.discount_value.toFixed(2)}`}):</span>
                    <div style={{ fontSize: '1.125rem', fontWeight: 500, color: '#16a34a' }} className="mt-1" data-testId="order-detail-value-discount">-${(order.discount_amount ?? 0).toFixed(2)}</div>
                  </div>
                  <div style={{ marginBottom: '1rem' }} className="mb-1" data-testId="order-detail-net-total">
                    <span style={{ color: '#9ca3af' }} data-testId="order-detail-label-net-total">Total:</span>
                    <div style={{ fontSize: '1.125rem', fontWeight: 600 }} className="text-gray-900 mt-1" data-testId="order-detail-value-net-total">${netTotal.toFixed(2)}</div>
                  </div>
                </>
              )}
            </div>
            <h2 style={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: '2rem', textAlign: 'left', margin: 0, marginBottom: '1.5rem', paddingLeft: 0 }} data-testId="order-detail-items-heading">
              Order Items
            </h2>
            <div className="flex flex-col gap-4 mb-8" style={{ textAlign: 'left', paddingLeft: 0 }} data-testId="order-detail-items">
              {products.length === 0 && <div className="text-gray-500" data-testId="order-detail-no-products">No products found for this order.</div>}
              {products.map((product, idx) => {
                // Find the quantity for this product from order.items
                const item = order.items?.find((i: any) => String(i.product_id) === String(product.product_id));
                const quantity = item?.quantity ?? 1;
                return (
                  <div key={product.product_id || idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ minWidth: '2.5rem', textAlign: 'center', fontWeight: 600, color: '#374151', fontSize: '1.1rem', flexShrink: 0 }} data-testId={`order-detail-product-qty-${product.name || idx}`}>x{quantity}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <ProductItem product={product} horizontal={true} data-testId={`order-detail-product-${product.name || idx}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          // Edit Mode
          <>
            <div className="mb-8" style={{ textAlign: 'left', paddingLeft: 0, marginBottom: '2.5rem' }} data-testId="order-detail-edit-form">
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#374151', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Customer Email:</label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  data-testId="order-detail-edit-email"
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#374151', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Status:</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger data-testId="order-detail-edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#374151', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Discount Type:</label>
                <Select value={editDiscountType} onValueChange={setEditDiscountType}>
                  <SelectTrigger data-testId="order-detail-edit-discount-type">
                    <SelectValue placeholder="No discount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No discount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {editDiscountType && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ color: '#374151', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                    Discount Value {editDiscountType === 'percentage' ? '(%)' : '($)'}:
                  </label>
                  <Input
                    type="number"
                    value={editDiscountValue}
                    onChange={(e) => setEditDiscountValue(e.target.value)}
                    placeholder="Enter discount value"
                    data-testId="order-detail-edit-discount-value"
                  />
                </div>
              )}
            </div>
            
            <h2 style={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: '2rem', textAlign: 'left', margin: 0, marginBottom: '1.5rem', paddingLeft: 0 }}>
              Order Items
            </h2>
            <div className="flex flex-col gap-4 mb-4" style={{ textAlign: 'left', paddingLeft: 0 }}>
              {editItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#374151', fontWeight: 500, marginBottom: '0.5rem', display: 'block', fontSize: '0.875rem' }}>Product:</label>
                    <Select
                      value={String(item.product_id)}
                      onValueChange={(val) => handleItemChange(index, 'product_id', val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allProducts.map((p) => (
                          <SelectItem key={p.product_id} value={String(p.product_id)}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div style={{ width: '100px' }}>
                    <label style={{ color: '#374151', fontWeight: 500, marginBottom: '0.5rem', display: 'block', fontSize: '0.875rem' }}>Quantity:</label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveItem(index)}
                    style={{ marginBottom: '0' }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="link"
              onClick={handleAddItem}
              style={{ marginBottom: '1.5rem' }}
            >
              + Add Item
            </Button>
          </>
        )}
        
        {/* Add extra space below order items */}
        <div style={{ height: '1.5rem' }} />
        <div className="flex flex-col items-center" style={{ marginTop: '0.5rem', gap: '1rem', alignItems: 'center', justifyContent: 'center', display: 'flex' }} data-testId="order-detail-buttons">
          {!isEditing ? (
            <>
              <Button
                variant="default"
                className="w-fit"
                onClick={handleEditToggle}
                style={{
                  color: '#fff',
                  background: '#2563eb',
                  border: '1.5px solid transparent',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#3b82f6';
                  e.currentTarget.style.borderColor = '#1e40af';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                Edit Order
              </Button>
              {order.status !== 'cancelled' && (
                <Button
                  variant="destructive"
                  className="w-fit"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  style={{
                    color: '#fff',
                    background: '#dc2626',
                    border: '1.5px solid transparent',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#f87171';
                    e.currentTarget.style.borderColor = '#991b1b';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = '#dc2626';
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
                  color: '#111',
                  background: '#e5e7eb',
                  border: '1.5px solid transparent',
                  transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#d1d5db';
                  e.currentTarget.style.borderColor = '#111';
                  e.currentTarget.style.color = '#111';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#e5e7eb';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.color = '#111';
                }}
              >
                Back
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                className="w-fit"
                onClick={handleSaveOrder}
                disabled={saving}
                style={{
                  color: '#fff',
                  background: '#16a34a',
                  border: '1.5px solid transparent',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#22c55e';
                  e.currentTarget.style.borderColor = '#15803d';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#16a34a';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="link"
                className="w-48"
                onClick={handleEditToggle}
                disabled={saving}
                style={{
                  color: '#111',
                  background: '#e5e7eb',
                  border: '1.5px solid transparent',
                  transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#d1d5db';
                  e.currentTarget.style.borderColor = '#111';
                  e.currentTarget.style.color = '#111';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#e5e7eb';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.color = '#111';
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
