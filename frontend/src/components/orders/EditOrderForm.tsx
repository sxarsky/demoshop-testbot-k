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
  onSave: (updatedFields: any, allProducts: Product[]) => void;
}

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const EditOrderForm: React.FC<EditOrderFormProps> = ({ order, onClose, onSave }) => {
  const [email, setEmail] = useState<string>(order.customer_email ?? "");
  const [status, setStatus] = useState<string>(order.status ?? "pending");
  const [items, setItems] = useState<EditItem[]>(
    (order.items ?? []).map((item: any) => ({
      product_id: String(item.product_id),
      quantity: item.quantity,
    }))
  );
  const [discountType, setDiscountType] = useState<string>(order.discount_type ?? "");
  const [discountValue, setDiscountValue] = useState<string>(
    order.discount_value != null ? String(order.discount_value) : ""
  );
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [addingProduct, setAddingProduct] = useState<EditItem>({ product_id: "", quantity: 1 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiUrl("/api/v1/products?limit=50"), {
      headers: { Authorization: `Bearer ${getSessionIdFromCookie()}` },
    })
      .then((res) => res.json())
      .then((data) => setProductsList(data))
      .catch(() => setProductsList([]));
  }, []);

  const handleAddItem = () => {
    if (!addingProduct.product_id || addingProduct.quantity < 1) return;
    if (items.some((i) => i.product_id === addingProduct.product_id)) return;
    setItems((prev) => [...prev, { ...addingProduct }]);
    setAddingProduct({ product_id: "", quantity: 1 });
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuantityChange = (idx: number, qty: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, quantity: qty > 0 ? qty : 1 } : item))
    );
  };

  const computeDiscountAmount = (): number | null => {
    const dv = parseFloat(discountValue);
    if (!discountType || isNaN(dv) || dv <= 0) return null;
    if (discountType === "percentage") return order.total_amount * dv / 100;
    if (discountType === "fixed") return Math.min(dv, order.total_amount);
    return null;
  };

  const discountAmount = computeDiscountAmount();
  const netTotal = (order.total_amount - (discountAmount ?? 0)).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("At least one item is required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const payload: any = {
        customer_email: email,
        status,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        discount_type: discountType || null,
        discount_value: discountValue !== "" && discountType ? parseFloat(discountValue) : null,
      };
      const sessionId = getSessionIdFromCookie();
      const res = await fetch(apiUrl(`/api/v1/orders/${order.order_id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update order");
      onSave(
        {
          customer_email: email,
          status,
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          discount_type: discountType || null,
          discount_value: discountValue !== "" && discountType ? parseFloat(discountValue) : null,
          discount_amount: discountAmount,
        },
        productsList
      );
    } catch (err: any) {
      setError(err.message || "Failed to update order");
      // Per spec: keep form in submitted state so user can retry — do NOT reset
    } finally {
      setSaving(false);
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
          maxWidth: "44rem",
          minWidth: "28rem",
          width: "100%",
          maxHeight: "90vh",
          background: "#fff",
          borderRadius: "0.75rem",
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
          padding: "1.5rem",
          position: "relative",
          display: "flex",
          flexDirection: "column",
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

        <h3
          className="text-2xl font-semibold text-center mb-6"
          data-testId="edit-order-heading"
        >
          Edit Order #{order.order_id}
        </h3>

        {error && (
          <div className="text-red-500 text-center mb-2" data-testId="edit-order-error">
            {error}
          </div>
        )}

        <form className="flex flex-col" style={{ gap: "1.25rem" }} onSubmit={handleSubmit}>
          {/* Customer Email */}
          <div data-testId="edit-order-email-field">
            <label
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
              data-testId="edit-order-label-email"
            >
              Customer Email
            </label>
            <Input
              name="customer_email"
              type="email"
              placeholder="e.g. user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              style={{
                fontFamily: "inherit",
                fontSize: "1rem",
                border: "1.5px solid #d1d5db",
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
          <div data-testId="edit-order-status-field">
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
                  padding: "0.5rem 1rem",
                  background: "#fff",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                }}
                data-testId="edit-order-select-status"
              >
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    style={{ paddingLeft: "0.5rem", borderBottom: "1px solid #e5e7eb" }}
                    data-testId={`edit-order-status-option-${s}`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Order Items */}
          <div data-testId="edit-order-items-section">
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
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  background: "#f9fafb",
                  padding: "0.5rem",
                  marginBottom: "0.75rem",
                }}
                data-testId="edit-order-items-list"
              >
                <div
                  style={{
                    display: "flex",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.25rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ flex: 2 }}>Product</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Qty</span>
                  <span style={{ flex: 1, textAlign: "right", color: "#16a34a" }}>Subtotal</span>
                  <span style={{ flex: 0.5 }}></span>
                </div>
                {items.map((item, idx) => {
                  const prod = productsList.find(
                    (p) => String(p.product_id).trim() === String(item.product_id).trim()
                  );
                  return (
                    <div
                      key={item.product_id + idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                        background: "#fff",
                        borderRadius: "0.375rem",
                        padding: "0.35rem 0.5rem",
                      }}
                      data-testId={`edit-order-item-row-${prod?.name || item.product_id}`}
                    >
                      <span
                        style={{ flex: 2, fontSize: "0.95rem" }}
                        data-testId={`edit-order-item-name-${prod?.name || item.product_id}`}
                      >
                        {prod ? prod.name : `Product #${item.product_id}`}
                        {prod && (
                          <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                            {" "}
                            (${prod.price})
                          </span>
                        )}
                      </span>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                        style={{
                          flex: 1,
                          width: "3.5rem",
                          textAlign: "center",
                          border: "1.5px solid #d1d5db",
                          borderRadius: "0.375rem",
                          height: "2rem",
                          fontSize: "0.9rem",
                          padding: "0 0.25rem",
                        }}
                        data-testId={`edit-order-item-qty-${prod?.name || item.product_id}`}
                      />
                      <span
                        style={{
                          flex: 1,
                          textAlign: "right",
                          color: "#16a34a",
                          fontWeight: 500,
                          fontSize: "0.9rem",
                        }}
                        data-testId={`edit-order-item-subtotal-${prod?.name || item.product_id}`}
                      >
                        {prod ? `$${(prod.price * item.quantity).toFixed(2)}` : "-"}
                      </span>
                      <Button
                        type="button"
                        variant="link"
                        style={{
                          color: "#dc2626",
                          flex: 0.5,
                          fontWeight: 500,
                          fontSize: "0.85rem",
                          padding: "0 0.25rem",
                        }}
                        onClick={() => handleRemoveItem(idx)}
                        data-testId={`edit-order-item-remove-${prod?.name || item.product_id}`}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add new item row */}
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              data-testId="edit-order-add-item-row"
            >
              <div
                style={{ position: "relative", flex: 1 }}
                data-testId="edit-order-add-item-select-container"
              >
                <Select
                  value={addingProduct.product_id}
                  onValueChange={(val) =>
                    setAddingProduct((ap) => ({ ...ap, product_id: val }))
                  }
                >
                  <SelectTrigger
                    style={{
                      border: "1.5px solid #d1d5db",
                      width: "100%",
                      padding: "0.5rem 1rem",
                      background: "#fff",
                      borderRadius: "0.375rem",
                      fontSize: "1rem",
                    }}
                    data-testId="edit-order-add-item-select"
                  >
                    <SelectValue placeholder="Add a product...">
                      {addingProduct.product_id && productsList.length > 0
                        ? (() => {
                            const sel = productsList.find(
                              (p) =>
                                String(p.product_id).trim() ===
                                String(addingProduct.product_id).trim()
                            );
                            return sel ? (
                              <span>
                                {sel.name}{" "}
                                <span style={{ color: "#6b7280" }}>${sel.price}</span>
                              </span>
                            ) : null;
                          })()
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[...productsList]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .filter((p) => !items.some((i) => i.product_id === String(p.product_id)))
                      .map((p) => (
                        <SelectItem
                          key={p.product_id}
                          value={String(p.product_id)}
                          style={{ paddingLeft: "0.5rem", borderBottom: "1px solid #e5e7eb" }}
                          data-testId={`edit-order-add-product-option-${p.name}`}
                        >
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
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAddingProduct((ap) => ({ ...ap, quantity: val > 0 ? val : 1 }));
                }}
                style={{
                  border: "1.5px solid #d1d5db",
                  width: "3.5rem",
                  textAlign: "center",
                  padding: "0",
                  borderRadius: "0.375rem",
                  height: "2.5rem",
                  fontSize: "1rem",
                }}
                data-testId="edit-order-add-item-qty"
              />
              <Button
                type="button"
                onClick={handleAddItem}
                style={{
                  background: "#f3f4f6",
                  color: "#111",
                  border: "1.5px solid transparent",
                  height: "2.5rem",
                  borderRadius: "0.375rem",
                  fontWeight: 500,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#d1d5db";
                  e.currentTarget.style.border = "1.5px solid #000";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.border = "1.5px solid transparent";
                }}
                data-testId="edit-order-add-item-btn"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Discount */}
          <div data-testId="edit-order-discount-section">
            <label
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
              data-testId="edit-order-label-discount"
            >
              Discount
            </label>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <Select
                  value={discountType}
                  onValueChange={(val) => {
                    setDiscountType(val);
                    if (!val) setDiscountValue("");
                  }}
                >
                  <SelectTrigger
                    style={{
                      border: "1.5px solid #d1d5db",
                      width: "100%",
                      padding: "0.5rem 1rem",
                      background: "#fff",
                      borderRadius: "0.375rem",
                      fontSize: "1rem",
                    }}
                    data-testId="edit-order-discount-type-select"
                  >
                    <SelectValue placeholder="No discount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value=""
                      style={{ paddingLeft: "0.5rem", borderBottom: "1px solid #e5e7eb" }}
                      data-testId="edit-order-discount-type-none"
                    >
                      No discount
                    </SelectItem>
                    <SelectItem
                      value="percentage"
                      style={{ paddingLeft: "0.5rem", borderBottom: "1px solid #e5e7eb" }}
                      data-testId="edit-order-discount-type-percentage"
                    >
                      Percentage (%)
                    </SelectItem>
                    <SelectItem
                      value="fixed"
                      style={{ paddingLeft: "0.5rem" }}
                      data-testId="edit-order-discount-type-fixed"
                    >
                      Fixed Amount ($)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {discountType && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <span style={{ color: "#6b7280", fontSize: "1rem" }}>
                    {discountType === "percentage" ? "%" : "$"}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={discountType === "percentage" ? 100 : undefined}
                    step="0.01"
                    placeholder="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    style={{
                      border: "1.5px solid #d1d5db",
                      width: "5rem",
                      textAlign: "right",
                      borderRadius: "0.375rem",
                      height: "2.5rem",
                      fontSize: "1rem",
                      padding: "0 0.5rem",
                    }}
                    data-testId="edit-order-discount-value-input"
                  />
                </div>
              )}
            </div>

            {/* Discount preview */}
            {discountType && discountAmount !== null && (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "0.375rem",
                  fontSize: "0.9rem",
                  color: "#15803d",
                }}
                data-testId="edit-order-discount-preview"
              >
                <span>
                  Discount: −${discountAmount.toFixed(2)}
                  {discountType === "percentage" && ` (${discountValue}% of $${order.total_amount.toFixed(2)})`}
                </span>
                <span style={{ marginLeft: "1rem", fontWeight: 600 }}>
                  Net Total: ${netTotal}
                </span>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={saving}
            className="w-full mt-2"
            style={{
              background: "#f3f4f6",
              color: "#111",
              border: "1.5px solid transparent",
              width: "100%",
              marginTop: "0.5rem",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#d1d5db";
              e.currentTarget.style.border = "1.5px solid #000";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.border = "1.5px solid transparent";
            }}
            data-testId="edit-order-submit-btn"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditOrderForm;
