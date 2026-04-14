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

interface OrderItem {
  order_item_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

interface EditItem {
  product_id: string;
  quantity: number;
}

interface EditState {
  customer_email: string;
  status: string;
  items: EditItem[];
  discount_type: string;
  discount_value: string;
}

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const DISCOUNT_TYPES = [
  { value: "", label: "No discount" },
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed amount ($)" },
];

export default function OrderDetail() {
  const { order_id } = useParams<{ order_id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editState, setEditState] = useState<EditState>({
    customer_email: "",
    status: "pending",
    items: [],
    discount_type: "",
    discount_value: "",
  });

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
        if (data.items && data.items.length > 0) {
          Promise.all(
            data.items.map((item: any) =>
              fetch(apiUrl(`/api/v1/products/${item.product_id}`), {
                headers: { 'Authorization': `Bearer ${sessionId}` }
              })
                .then((res) => res.ok ? res.json() : null)
                .catch(() => null)
            )
          ).then((prods) => setProducts(prods.filter(Boolean)));
        } else {
          setProducts([]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [order_id]);

  useEffect(() => {
    const sessionId = getSessionIdFromCookie();
    fetch(apiUrl("/api/v1/products?limit=100"), {
      headers: { 'Authorization': `Bearer ${sessionId}` }
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setAllProducts(data))
      .catch(() => setAllProducts([]));
  }, []);

  const handleStartEdit = () => {
    if (!order) return;
    setEditState({
      customer_email: order.customer_email,
      status: order.status,
      items: (order.items || []).map((item: OrderItem) => ({
        product_id: String(item.product_id),
        quantity: item.quantity,
      })),
      discount_type: order.discount_type ?? "",
      discount_value: order.discount_value != null ? String(order.discount_value) : "",
    });
    setEditing(true);
  };

  const handleEditChange = (field: keyof EditState, value: string) => {
    setEditState((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (idx: number, field: keyof EditItem, value: string | number) => {
    setEditState((prev) => {
      const items = prev.items.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      );
      return { ...prev, items };
    });
  };

  const handleAddItem = () => {
    setEditState((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: 1 }],
    }));
  };

  const handleRemoveItem = (idx: number) => {
    setEditState((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleSaveEdit = async () => {
    if (!order_id) return;
    setSaving(true);
    const sessionId = getSessionIdFromCookie();

    const payload: Record<string, any> = {};
    if (editState.customer_email !== order.customer_email) {
      payload.customer_email = editState.customer_email;
    }
    if (editState.status !== order.status) {
      payload.status = editState.status;
    }
    payload.items = editState.items
      .filter((item) => item.product_id !== "")
      .map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

    if (editState.discount_type) {
      payload.discount_type = editState.discount_type;
      payload.discount_value = editState.discount_value !== "" ? parseFloat(editState.discount_value) : 0;
    }

    try {
      const res = await fetch(apiUrl(`/api/v1/orders/${order_id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update order");
      setOrder((prev: any) => ({
        ...prev,
        customer_email: payload.customer_email ?? prev.customer_email,
        status: payload.status ?? prev.status,
        items: payload.items ?? prev.items,
        discount_type: payload.discount_type ?? prev.discount_type,
        discount_value: payload.discount_value ?? prev.discount_value,
        discount_amount: payload.discount_type === "percentage"
          ? prev.total_amount * (payload.discount_value ?? 0) / 100
          : payload.discount_type === "fixed"
            ? (payload.discount_value ?? 0)
            : prev.discount_amount,
      }));
      setEditing(false);
    } catch (err: any) {
      alert(err.message || "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order_id) return;
    setCancelling(true);
    const sessionId = getSessionIdFromCookie();
    try {
      const res = await fetch(apiUrl(`/api/v1/orders/${order_id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionId}` }
      });
      if (!res.ok) throw new Error('Failed to cancel order');
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

  return (
    <div className="min-h-screen bg-white px-6 py-10" style={{ width: '100%', maxWidth: '64rem', margin: '0 auto', boxSizing: 'border-box' }} data-testId="order-detail-root">
      <NavBar active="orders" />
      <div className="w-full" style={{ width: '100%', maxWidth: '48rem', margin: '0 auto', padding: 0 }} data-testId="order-detail-main">
        <h1
          style={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: '2rem', textAlign: 'left', margin: 0, marginTop: '1.5rem', marginBottom: '1.5rem', paddingLeft: 0 }}
          data-testId="order-detail-heading"
        >
          Order Details
        </h1>

        {editing ? (
          <div data-testId="order-edit-form">
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>Customer Email:</label>
              <Input
                type="email"
                value={editState.customer_email}
                onChange={(e) => handleEditChange("customer_email", e.target.value)}
                data-testId="order-edit-customer-email"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>Status:</label>
              <Select value={editState.status} onValueChange={(v) => handleEditChange("status", v)}>
                <SelectTrigger className="w-full" data-testId="order-edit-status-trigger">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#9ca3af', display: 'block', marginBottom: '0.5rem' }}>Items:</label>
              {editState.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 2 }}>
                    <Select value={item.product_id} onValueChange={(v) => handleItemChange(idx, "product_id", v)}>
                      <SelectTrigger className="w-full" data-testId={`order-edit-item-product-${idx}`}>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {allProducts.map((p: any) => (
                          <SelectItem key={p.product_id} value={String(p.product_id)}>
                            {p.name} (${p.price?.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value) || 1)}
                      placeholder="Qty"
                      data-testId={`order-edit-item-qty-${idx}`}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveItem(idx)}
                    data-testId={`order-edit-item-remove-${idx}`}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddItem} data-testId="order-edit-add-item">
                + Add Item
              </Button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>Discount Type:</label>
              <Select value={editState.discount_type} onValueChange={(v) => handleEditChange("discount_type", v)}>
                <SelectTrigger className="w-full" data-testId="order-edit-discount-type">
                  <SelectValue placeholder="No discount" />
                </SelectTrigger>
                <SelectContent>
                  {DISCOUNT_TYPES.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editState.discount_type && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>
                  Discount Value {editState.discount_type === "percentage" ? "(%)" : "($)"}:
                </label>
                <Input
                  type="number"
                  min={0}
                  step={editState.discount_type === "percentage" ? 1 : 0.01}
                  value={editState.discount_value}
                  onChange={(e) => handleEditChange("discount_value", e.target.value)}
                  placeholder={editState.discount_type === "percentage" ? "e.g. 10" : "e.g. 5.00"}
                  data-testId="order-edit-discount-value"
                />
              </div>
            )}

            {editState.discount_type && editState.discount_value && (
              <div style={{ marginBottom: '1rem', color: '#374151' }}>
                <span style={{ color: '#9ca3af' }}>Net Total (preview): </span>
                <strong>
                  ${(
                    order.total_amount -
                    (editState.discount_type === "percentage"
                      ? order.total_amount * parseFloat(editState.discount_value || "0") / 100
                      : parseFloat(editState.discount_value || "0"))
                  ).toFixed(2)}
                </strong>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'center' }}>
              <Button onClick={handleSaveEdit} disabled={saving} data-testId="order-edit-save">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} disabled={saving} data-testId="order-edit-cancel">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
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
                <div style={{ marginBottom: '1rem' }} className="mb-1" data-testId="order-detail-discount">
                  <span style={{ color: '#9ca3af' }} data-testId="order-detail-label-discount">
                    Discount ({order.discount_type === "percentage" ? `${order.discount_value}%` : `$${order.discount_value?.toFixed(2)}`}):
                  </span>
                  <div style={{ fontSize: '1.125rem', fontWeight: 500, color: '#16a34a' }} className="mt-1" data-testId="order-detail-value-discount">
                    -${order.discount_amount.toFixed(2)}
                  </div>
                </div>
              )}
              {order.discount_amount != null && order.discount_amount > 0 && (
                <div style={{ marginBottom: '1rem' }} className="mb-1" data-testId="order-detail-net-total">
                  <span style={{ color: '#9ca3af' }} data-testId="order-detail-label-net-total">Net Total:</span>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700 }} className="text-gray-900 mt-1" data-testId="order-detail-value-net-total">${netTotal}</div>
                </div>
              )}
            </div>

            <h2 style={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: '2rem', textAlign: 'left', margin: 0, marginBottom: '1.5rem', paddingLeft: 0 }} data-testId="order-detail-items-heading">
              Order Items
            </h2>
            <div className="flex flex-col gap-4 mb-8" style={{ textAlign: 'left', paddingLeft: 0 }} data-testId="order-detail-items">
              {products.length === 0 && <div className="text-gray-500" data-testId="order-detail-no-products">No products found for this order.</div>}
              {products.map((product, idx) => {
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

            <div style={{ height: '1.5rem' }} />
            <div className="flex flex-col items-center" style={{ marginTop: '0.5rem', gap: '1rem', alignItems: 'center', justifyContent: 'center', display: 'flex' }} data-testId="order-detail-buttons">
              {order.status !== 'cancelled' && (
                <Button
                  variant="default"
                  className="w-fit"
                  onClick={handleStartEdit}
                  style={{ background: '#2563eb', color: '#fff', border: '1.5px solid transparent', transition: 'background 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#1d4ed8'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#2563eb'; }}
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
                  style={{ color: '#fff', background: '#dc2626', border: '1.5px solid transparent', transition: 'background 0.2s, border-color 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#f87171'; e.currentTarget.style.borderColor = '#991b1b'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.borderColor = 'transparent'; }}
                  data-testId="order-detail-cancel-btn"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </Button>
              )}
              <Button
                variant="link"
                className="w-48"
                onClick={() => navigate('/orders')}
                style={{ color: '#111', background: '#e5e7eb', border: '1.5px solid transparent', transition: 'background 0.2s, border-color 0.2s, color 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#d1d5db'; e.currentTarget.style.borderColor = '#111'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#e5e7eb'; e.currentTarget.style.borderColor = 'transparent'; }}
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
