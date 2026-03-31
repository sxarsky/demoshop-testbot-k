import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import "@/styles/select-zindex-workaround.css";
import { getSessionIdFromCookie } from "../../lib/utils";
import { apiUrl } from "../../config";

interface Product {
  product_id: string;
  name: string;
  price: number;
}

interface EditItem {
  product_id: string;
  quantity: number;
}

interface EditOrderFormProps {
  order: any;
  onClose: () => void;
  onUpdate: (updatedFields: any) => void;
}

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function EditOrderForm({ order, onClose, onUpdate }: EditOrderFormProps) {
  const [customerEmail, setCustomerEmail] = useState<string>(order.customer_email || "");
  const [status, setStatus] = useState<string>(order.status || "pending");
  const [items, setItems] = useState<EditItem[]>(
    (order.items || []).map((item: any) => ({
      product_id: String(item.product_id),
      quantity: item.quantity,
    }))
  );
  const [discountType, setDiscountType] = useState<string>(order.discount_type || "none");
  const [discountValue, setDiscountValue] = useState<string>(
    order.discount_value != null ? String(order.discount_value) : ""
  );
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [addingProduct, setAddingProduct] = useState<EditItem>({ product_id: "", quantity: 1 });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/v1/products?limit=50"), {
      headers: { Authorization: `Bearer ${getSessionIdFromCookie()}` },
    })
      .then((res) => res.json())
      .then((data) => setProductsList(data))
      .catch(() => setProductsList([]));
  }, []);

  const getProductName = (product_id: string) => {
    const p = productsList.find((p) => String(p.product_id) === product_id);
    return p ? p.name : `Product #${product_id}`;
  };

  const handleAddItem = () => {
    if (!addingProduct.product_id || addingProduct.quantity < 1) return;
    if (items.some((i) => i.product_id === addingProduct.product_id)) return;
    setItems((prev) => [...prev, { ...addingProduct }]);
    setAddingProduct({ product_id: "", quantity: 1 });
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuantityChange = (idx: number, val: string) => {
    const qty = parseInt(val, 10);
    if (!isNaN(qty) && qty > 0) {
      setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, quantity: qty } : item)));
    }
  };

  const computeDiscountAmount = (): number => {
    const total = order.total_amount ?? 0;
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0 || discountType === "none") return 0;
    if (discountType === "percentage") return total * val / 100;
    if (discountType === "fixed") return val;
    return 0;
  };

  const netTotal = Math.max(0, (order.total_amount ?? 0) - computeDiscountAmount()).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload: any = {};

    if (customerEmail !== order.customer_email) {
      payload.customer_email = customerEmail;
    }
    if (status !== order.status) {
      payload.status = status;
    }

    // Check if items changed
    const origItems = (order.items || []).map((i: any) => ({
      product_id: String(i.product_id),
      quantity: i.quantity,
    }));
    const itemsChanged =
      items.length !== origItems.length ||
      items.some(
        (item, idx) =>
          item.product_id !== origItems[idx]?.product_id ||
          item.quantity !== origItems[idx]?.quantity
      );
    if (itemsChanged) {
      payload.items = items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }));
    }

    // Discount
    if (discountType !== "none" && discountValue !== "") {
      payload.discount_type = discountType;
      payload.discount_value = parseFloat(discountValue);
    }

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    try {
      const res = await fetch(apiUrl(`/api/v1/orders/${order.order_id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getSessionIdFromCookie()}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update order");

      // Build the merged fields including client-computed discount_amount
      const updatedFields: any = { ...payload };
      if (payload.discount_type && payload.discount_value != null) {
        const total = order.total_amount ?? 0;
        if (payload.discount_type === "percentage") {
          updatedFields.discount_amount = total * payload.discount_value / 100;
        } else if (payload.discount_type === "fixed") {
          updatedFields.discount_amount = payload.discount_value;
        }
      }
      onUpdate(updatedFields);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(31, 41, 55, 0.35)",
        position: "fixed",
        inset: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "40rem",
          minWidth: "28rem",
          width: "100%",
          background: "#fff",
          borderRadius: "0.75rem",
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
          padding: "1.5rem",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        data-testId="edit-order-modal-box"
      >
        {/* Close button */}
        <button
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            color: "#6b7280",
            background: "white",
            borderRadius: "9999px",
            fontSize: "1.25rem",
            fontWeight: 700,
            width: "1.75rem",
            height: "1.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
            zIndex: 10,
            border: "1.5px solid #888",
            cursor: "pointer",
            transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#000";
            e.currentTarget.style.borderColor = "#222";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#6b7280";
            e.currentTarget.style.borderColor = "#888";
          }}
          onClick={onClose}
          aria-label="Close"
          type="button"
          data-testId="edit-order-dismiss-btn"
        >
          ×
        </button>

        <h3 className="text-2xl font-semibold text-center mb-6" data-testId="edit-order-heading">
          Edit Order
        </h3>
        {error && (
          <div className="text-red-500 text-center mb-2" data-testId="edit-order-error">
            {error}
          </div>
        )}

        <form className="flex flex-col" style={{ gap: "1rem" }} onSubmit={handleSubmit}>
          {/* Customer Email */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
              data-testId="edit-order-label-email"
            >
              Customer Email
            </label>
            <Input
              name="customer_email"
              placeholder="e.g. user@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full"
              style={{
                fontFamily: "inherit",
                fontSize: "1rem",
                border: "1.5px solid #d1d5db",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1.5px solid #6b7280";
                e.currentTarget.style.boxShadow = "0 0 0 1.5px #6b7280";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1.5px solid #d1d5db";
                e.currentTarget.style.boxShadow = "none";
              }}
              data-testId="edit-order-input-email"
            />
          </div>

          {/* Status */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
              data-testId="edit-order-label-status"
            >
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger
                style={{
                  border: "1.5px solid #d1d5db",
                  width: "100%",
                  background: "#fff",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  padding: "0.5rem 1rem",
                }}
                data-testId="edit-order-select-status-trigger"
              >
                <SelectValue placeholder="Select status" data-testId="edit-order-select-status-value" />
              </SelectTrigger>
              <SelectContent data-testId="edit-order-select-status-content">
                {ORDER_STATUSES.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    style={{ textTransform: "capitalize" }}
                    data-testId={`edit-order-status-option-${s}`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Order Items */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
              data-testId="edit-order-label-items"
            >
              Order Items
            </label>

            {/* Current items list */}
            {items.length > 0 && (
              <div
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
                data-testId="edit-order-items-list"
              >
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "#f3f4f6",
                      borderRadius: "0.375rem",
                      padding: "0.5rem 0.75rem",
                    }}
                    data-testId={`edit-order-item-${idx}`}
                  >
                    <span
                      style={{ flex: 1, fontSize: "0.95rem", color: "#374151" }}
                      data-testId={`edit-order-item-name-${idx}`}
                    >
                      {getProductName(item.product_id)}
                    </span>
                    <Input
                      type="number"
                      min={1}
                      value={String(item.quantity)}
                      onChange={(e) => handleQuantityChange(idx, e.target.value)}
                      style={{
                        width: "5rem",
                        textAlign: "center",
                        border: "1.5px solid #d1d5db",
                        borderRadius: "0.375rem",
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.95rem",
                      }}
                      data-testId={`edit-order-item-qty-${idx}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      style={{
                        color: "#ef4444",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        padding: "0 0.25rem",
                        lineHeight: 1,
                      }}
                      data-testId={`edit-order-item-remove-${idx}`}
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add item row */}
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              data-testId="edit-order-add-item-row"
            >
              <div style={{ flex: 1 }}>
                <Select
                  value={addingProduct.product_id}
                  onValueChange={(val) => setAddingProduct((ap) => ({ ...ap, product_id: val }))}
                >
                  <SelectTrigger
                    style={{
                      border: "1.5px solid #d1d5db",
                      width: "100%",
                      background: "#fff",
                      borderRadius: "0.375rem",
                      fontSize: "0.95rem",
                      padding: "0.4rem 0.75rem",
                    }}
                    data-testId="edit-order-add-item-select-trigger"
                  >
                    <SelectValue
                      placeholder="Add product…"
                      data-testId="edit-order-add-item-select-value"
                    />
                  </SelectTrigger>
                  <SelectContent data-testId="edit-order-add-item-select-content">
                    {productsList
                      .filter((p) => !items.some((i) => i.product_id === String(p.product_id)))
                      .map((p) => (
                        <SelectItem
                          key={p.product_id}
                          value={String(p.product_id)}
                          data-testId={`edit-order-add-item-option-${p.name}`}
                        >
                          {p.name} (${p.price.toFixed(2)})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                min={1}
                value={String(addingProduct.quantity)}
                onChange={(e) =>
                  setAddingProduct((ap) => ({
                    ...ap,
                    quantity: parseInt(e.target.value) || 1,
                  }))
                }
                style={{
                  width: "5rem",
                  textAlign: "center",
                  border: "1.5px solid #d1d5db",
                  borderRadius: "0.375rem",
                  padding: "0.4rem 0.5rem",
                  fontSize: "0.95rem",
                }}
                data-testId="edit-order-add-item-qty-input"
              />
              <Button
                type="button"
                variant="link"
                onClick={handleAddItem}
                style={{
                  color: "#111",
                  background: "#e5e7eb",
                  border: "1.5px solid transparent",
                  borderRadius: "0.375rem",
                  fontWeight: 500,
                  padding: "0.4rem 0.75rem",
                  fontSize: "0.9rem",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#d1d5db";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#e5e7eb";
                }}
                data-testId="edit-order-add-item-btn"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Discount */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
              data-testId="edit-order-label-discount"
            >
              Discount
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger
                    style={{
                      border: "1.5px solid #d1d5db",
                      width: "100%",
                      background: "#fff",
                      borderRadius: "0.375rem",
                      fontSize: "1rem",
                      padding: "0.5rem 1rem",
                    }}
                    data-testId="edit-order-select-discount-type-trigger"
                  >
                    <SelectValue
                      placeholder="Discount type"
                      data-testId="edit-order-select-discount-type-value"
                    />
                  </SelectTrigger>
                  <SelectContent data-testId="edit-order-select-discount-type-content">
                    <SelectItem value="none" data-testId="edit-order-discount-type-none">
                      No Discount
                    </SelectItem>
                    <SelectItem
                      value="percentage"
                      data-testId="edit-order-discount-type-percentage"
                    >
                      Percentage (%)
                    </SelectItem>
                    <SelectItem value="fixed" data-testId="edit-order-discount-type-fixed">
                      Fixed Amount ($)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {discountType !== "none" && (
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "0–100" : "Amount"}
                  style={{
                    width: "7rem",
                    border: "1.5px solid #d1d5db",
                    borderRadius: "0.375rem",
                    padding: "0.5rem 0.75rem",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1.5px solid #6b7280";
                    e.currentTarget.style.boxShadow = "0 0 0 1.5px #6b7280";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1.5px solid #d1d5db";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  data-testId="edit-order-discount-value-input"
                />
              )}
            </div>
            {discountType !== "none" && discountValue !== "" && (
              <div
                style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280" }}
                data-testId="edit-order-net-total-preview"
              >
                Net total:{" "}
                <span
                  style={{ fontWeight: 600, color: "#0f766e" }}
                  data-testId="edit-order-net-total-value"
                >
                  ${netTotal}
                </span>
                <span style={{ marginLeft: "0.35rem", color: "#9ca3af" }}>
                  (subtotal: ${(order.total_amount ?? 0).toFixed(2)})
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
              marginTop: "0.5rem",
            }}
          >
            <Button
              type="button"
              variant="link"
              onClick={onClose}
              style={{
                color: "#111",
                background: "#e5e7eb",
                border: "1.5px solid transparent",
                borderRadius: "0.375rem",
                fontWeight: 500,
                padding: "0.5rem 1.25rem",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#d1d5db";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#e5e7eb";
              }}
              data-testId="edit-order-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              style={{
                color: "#fff",
                background: "#111827",
                border: "1.5px solid transparent",
                borderRadius: "0.375rem",
                fontWeight: 500,
                padding: "0.5rem 1.25rem",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => {
                if (!submitting) e.currentTarget.style.background = "#374151";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#111827";
              }}
              data-testId="edit-order-submit-btn"
            >
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
