import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import "@/styles/select-zindex-workaround.css";
import ProductItem from "../products/ProductItem";
import { NavBar } from "@/components/ui/navbar";
import { getSessionIdFromCookie } from '../../lib/utils';
import { apiUrl } from '../../config';

interface EditItem {
  product_id: string;
  quantity: number;
}

export default function OrderDetail() {
  const { order_id } = useParams<{ order_id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editItems, setEditItems] = useState<EditItem[]>([]);
  const [editDiscountType, setEditDiscountType] = useState("");
  const [editDiscountValue, setEditDiscountValue] = useState("");
  const [addingProduct, setAddingProduct] = useState<EditItem>({ product_id: "", quantity: 1 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order_id) return;
    setLoading(true);
    const sessionId = getSessionIdFromCookie();
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
          ).then((prods) => setProducts(prods.filter(Boolean)));
        } else {
          setProducts([]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [order_id]);

  // Fetch full products list for edit mode dropdowns
  useEffect(() => {
    const sessionId = getSessionIdFromCookie();
    fetch(apiUrl("/api/v1/products?limit=50"), {
      headers: { 'Authorization': `Bearer ${sessionId}` }
    })
      .then(res => res.json())
      .then(data => setProductsList(Array.isArray(data) ? data : []))
      .catch(() => setProductsList([]));
  }, []);

  const handleEditStart = () => {
    if (!order) return;
    setEditEmail(order.customer_email);
    setEditStatus(order.status);
    setEditItems((order.items || []).map((item: any) => ({
      product_id: String(item.product_id),
      quantity: item.quantity,
    })));
    setEditDiscountType(order.discount_type || "");
    setEditDiscountValue(order.discount_value != null ? String(order.discount_value) : "");
    setAddingProduct({ product_id: "", quantity: 1 });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleAddItemInEdit = () => {
    if (!addingProduct.product_id || addingProduct.quantity < 1) return;
    if (editItems.some(i => i.product_id === addingProduct.product_id)) return;
    setEditItems(prev => [...prev, { ...addingProduct }]);
    setAddingProduct({ product_id: "", quantity: 1 });
  };

  const handleRemoveItemInEdit = (idx: number) => {
    setEditItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!order_id) return;
    setSaving(true);
    const sessionId = getSessionIdFromCookie();
    const payload: any = {
      customer_email: editEmail,
      status: editStatus,
      items: editItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      discount_type: editDiscountType && editDiscountType !== 'none' ? editDiscountType : null,
      discount_value: editDiscountType && editDiscountType !== 'none' && editDiscountValue ? parseFloat(editDiscountValue) : null,
    };
    try {
      const res = await fetch(apiUrl(`/api/v1/orders/${order_id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update order');

      // Compute discount_amount client-side
      let discountAmount: number | null = null;
      if (editDiscountType && editDiscountValue) {
        const dv = parseFloat(editDiscountValue);
        if (editDiscountType === 'percentage') {
          discountAmount = order.total_amount * dv / 100;
        } else if (editDiscountType === 'fixed') {
          discountAmount = dv;
        }
      }

      // Merge only the edited fields into state
      setOrder((prev: any) => ({
        ...prev,
        customer_email: editEmail,
        status: editStatus,
        items: editItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          order_item_id: 0,
          order_id: parseInt(order_id),
          unit_price: 0,
        })),
        discount_type: editDiscountType || null,
        discount_value: editDiscountType && editDiscountValue ? parseFloat(editDiscountValue) : null,
        discount_amount: discountAmount,
      }));

      // Refresh product display for updated item list
      const uniqueProductIds = [...new Set(editItems.map(i => i.product_id))];
      Promise.all(
        uniqueProductIds.map(pid =>
          fetch(apiUrl(`/api/v1/products/${pid}`), {
            headers: { 'Authorization': `Bearer ${sessionId}` }
          })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      ).then(prods => setProducts(prods.filter(Boolean)));

      setIsEditing(false);
    } catch (_err: any) {
      // Keep form in submitted state so user can retry; do not restore previous state
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) return <div className="text-center py-8" data-testId="order-detail-loading">Loading order details...</div>;
  if (error) return <div className="text-center text-red-500 py-8" data-testId="order-detail-error">{error}</div>;
  if (!order) return <div className="text-center py-8" data-testId="order-detail-notfound">Order not found.</div>;

  const netTotal = (order.total_amount - (order.discount_amount ?? 0)).toFixed(2);
  const editComputedDiscount = editDiscountType && editDiscountValue
    ? editDiscountType === 'percentage'
      ? order.total_amount * parseFloat(editDiscountValue) / 100
      : parseFloat(editDiscountValue)
    : 0;

  return (
    <div className="min-h-screen bg-white px-6 py-10" style={{ width: '100%', maxWidth: '64rem', margin: '0 auto', boxSizing: 'border-box' }} data-testId="order-detail-root">
      {/* Top Navigation */}
      <NavBar active="orders" />
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

        {isEditing ? (
          /* ─── Edit Mode ─── */
          <div data-testId="order-detail-edit-form">
            {/* Customer Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>Customer Email:</label>
              <Input
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                placeholder="e.g. user@email.com"
                style={{ border: '1.5px solid #d1d5db', fontSize: '1rem', width: '100%' }}
                onFocus={e => { e.currentTarget.style.border = '1.5px solid #6b7280'; e.currentTarget.style.boxShadow = '0 0 0 1.5px #6b7280'; }}
                onBlur={e => { e.currentTarget.style.border = '1.5px solid #d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                data-testId="order-edit-input-email"
              />
            </div>

            {/* Status */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>Status:</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger style={{ border: '1.5px solid #d1d5db', width: '100%', background: '#fff', fontSize: '1rem', borderRadius: '0.375rem', padding: '0.5rem 1rem' }} data-testId="order-edit-select-status">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                    <SelectItem key={s} value={s} style={{ textTransform: 'capitalize' }} data-testId={`order-edit-status-option-${s}`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>Order Items:</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Select
                    value={addingProduct.product_id}
                    onValueChange={val => setAddingProduct(ap => ({ ...ap, product_id: val }))}
                  >
                    <SelectTrigger style={{ border: '1.5px solid #d1d5db', width: '100%', background: '#fff', fontSize: '1rem', borderRadius: '0.375rem', padding: '0.5rem 1rem' }}>
                      <SelectValue placeholder="Select product...">
                        {addingProduct.product_id && productsList.length > 0
                          ? (() => {
                              const sel = productsList.find(p => String(p.product_id) === addingProduct.product_id);
                              return sel
                                ? <span style={{ fontWeight: 500 }}>{sel.name} <span style={{ color: '#6b7280', fontWeight: 400 }}>${sel.price}</span></span>
                                : null;
                            })()
                          : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {[...productsList].sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                        <SelectItem key={p.product_id} value={String(p.product_id)} style={{ paddingLeft: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                          {p.name} (${p.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  min={1}
                  value={addingProduct.quantity}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setAddingProduct(ap => ({ ...ap, quantity: val > 0 ? val : 1 }));
                  }}
                  style={{ border: '1.5px solid #d1d5db', fontSize: '1rem', width: '3.5rem', textAlign: 'center', paddingLeft: 0, paddingRight: 0, borderRadius: '0.375rem', height: '2.5rem' }}
                />
                <Button
                  type="button"
                  onClick={handleAddItemInEdit}
                  style={{ background: '#f3f4f6', color: '#111', border: '1.5px solid transparent', height: '2.5rem', borderRadius: '0.375rem', fontWeight: 500 }}
                  onMouseOver={e => { e.currentTarget.style.background = '#d1d5db'; e.currentTarget.style.border = '1.5px solid #000'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.border = '1.5px solid transparent'; }}
                  data-testId="order-edit-add-item-btn"
                >Add</Button>
              </div>
              {editItems.length > 0 && (
                <div style={{ border: '1.5px solid #e5e7eb', borderRadius: '0.5rem', background: '#f9fafb', padding: '0.5rem', marginBottom: '0.5rem' }} data-testId="order-edit-items-list">
                  <div style={{ display: 'flex', fontWeight: 600, color: '#374151', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                    <span style={{ flex: 2 }}>Name</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>Qty</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>Unit Price</span>
                    <span style={{ flex: 0.5 }}></span>
                  </div>
                  {editItems.map((item, idx) => {
                    const prod = productsList.find(p => String(p.product_id) === item.product_id);
                    return (
                      <div key={item.product_id + idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.95rem', background: '#fff', borderRadius: '0.375rem', padding: '0.25rem 0.5rem' }} data-testId={`order-edit-item-row-${prod?.name || item.product_id}`}>
                        <span style={{ flex: 2 }}>{prod ? prod.name : item.product_id}</span>
                        <span style={{ flex: 1, textAlign: 'center' }}>x{item.quantity}</span>
                        <span style={{ flex: 1, textAlign: 'center', color: '#374151' }}>{prod ? `$${prod.price}` : '-'}</span>
                        <Button
                          type="button"
                          variant="link"
                          style={{ color: '#dc2626', marginLeft: 'auto', flex: 0.5, fontWeight: 500 }}
                          onClick={() => handleRemoveItemInEdit(idx)}
                          data-testId={`order-edit-item-remove-${prod?.name || item.product_id}`}
                        >Remove</Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Discount */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>Discount:</label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ minWidth: '160px' }}>
                  <Select value={editDiscountType} onValueChange={setEditDiscountType}>
                    <SelectTrigger style={{ border: '1.5px solid #d1d5db', width: '100%', background: '#fff', fontSize: '1rem', borderRadius: '0.375rem', padding: '0.5rem 1rem' }} data-testId="order-edit-select-discount-type">
                      <SelectValue placeholder="No discount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" data-testId="order-edit-discount-none">No discount</SelectItem>
                      <SelectItem value="percentage" data-testId="order-edit-discount-percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed" data-testId="order-edit-discount-fixed">Fixed ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editDiscountType && editDiscountType !== 'none' && (
                  <Input
                    type="number"
                    min={0}
                    step={editDiscountType === 'percentage' ? '1' : '0.01'}
                    value={editDiscountValue}
                    onChange={e => setEditDiscountValue(e.target.value)}
                    placeholder={editDiscountType === 'percentage' ? '% off' : '$ off'}
                    style={{ border: '1.5px solid #d1d5db', fontSize: '1rem', width: '6rem', borderRadius: '0.375rem' }}
                    onFocus={e => { e.currentTarget.style.border = '1.5px solid #6b7280'; e.currentTarget.style.boxShadow = '0 0 0 1.5px #6b7280'; }}
                    onBlur={e => { e.currentTarget.style.border = '1.5px solid #d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                    data-testId="order-edit-input-discount-value"
                  />
                )}
                {editDiscountType && editDiscountType !== 'none' && editDiscountValue && (
                  <span style={{ color: '#16a34a', fontWeight: 500, fontSize: '0.95rem' }}>
                    -{editDiscountType === 'percentage' ? `${editDiscountValue}%` : `$${parseFloat(editDiscountValue).toFixed(2)}`}
                    {' '}(Net: ${(order.total_amount - editComputedDiscount).toFixed(2)})
                  </span>
                )}
              </div>
            </div>

            {/* Save / Cancel buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              <Button
                onClick={handleSave}
                disabled={saving}
                style={{ background: '#111827', color: '#fff', border: '1.5px solid transparent', borderRadius: '0.375rem', fontWeight: 500, transition: 'background 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#374151'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#111827'; }}
                data-testId="order-edit-save-btn"
              >{saving ? 'Saving...' : 'Save Changes'}</Button>
              <Button
                variant="link"
                onClick={handleEditCancel}
                disabled={saving}
                style={{ background: '#e5e7eb', color: '#111', border: '1.5px solid transparent', borderRadius: '0.375rem', transition: 'background 0.2s, border-color 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#d1d5db'; e.currentTarget.style.borderColor = '#111'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#e5e7eb'; e.currentTarget.style.borderColor = 'transparent'; }}
                data-testId="order-edit-cancel-btn"
              >Cancel</Button>
            </div>
          </div>
        ) : (
          /* ─── View Mode ─── */
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
                <span style={{ color: '#9ca3af' }} data-testId="order-detail-label-total">Total:</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 500 }} className="text-gray-900 mt-1" data-testId="order-detail-value-total">${order.total_amount.toFixed(2)}</div>
              </div>
              {order.discount_amount != null && order.discount_amount > 0 && (
                <>
                  <div style={{ marginBottom: '1rem' }} className="mb-1" data-testId="order-detail-discount">
                    <span style={{ color: '#9ca3af' }} data-testId="order-detail-label-discount">Discount:</span>
                    <div style={{ fontSize: '1.125rem', fontWeight: 500, color: '#dc2626' }} className="mt-1" data-testId="order-detail-value-discount">
                      -{order.discount_type === 'percentage' ? `${order.discount_value}%` : `$${order.discount_amount.toFixed(2)}`}
                      {' '}(${order.discount_amount.toFixed(2)} off)
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }} className="mb-1" data-testId="order-detail-net-total">
                    <span style={{ color: '#9ca3af' }} data-testId="order-detail-label-net-total">Net Total:</span>
                    <div style={{ fontSize: '1.125rem', fontWeight: 500, color: '#16a34a' }} className="mt-1" data-testId="order-detail-value-net-total">${netTotal}</div>
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
            {/* Add extra space below order items */}
            <div style={{ height: '1.5rem' }} />
            <div className="flex flex-col items-center" style={{ marginTop: '0.5rem', gap: '1rem', alignItems: 'center', justifyContent: 'center', display: 'flex' }} data-testId="order-detail-buttons">
              {order.status !== 'cancelled' && (
                <Button
                  onClick={handleEditStart}
                  style={{
                    color: '#fff',
                    background: '#111827',
                    border: '1.5px solid transparent',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#374151'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#111827'; }}
                  data-testId="order-detail-edit-btn"
                >
                  Edit Order
                </Button>
              )}
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
