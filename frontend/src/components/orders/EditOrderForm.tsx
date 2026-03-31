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

interface OrderItemEdit {
  product_id: string;
  quantity: number;
}

interface EditOrderFormProps {
  order: any;
  onClose: () => void;
  onSaved: (updatedFields: Partial<any>) => void;
}

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const DISCOUNT_TYPES = [
  { value: "", label: "No Discount" },
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount ($)" },
];

const EditOrderForm: React.FC<EditOrderFormProps> = ({ order, onClose, onSaved }) => {
  const [customerEmail, setCustomerEmail] = useState<string>(order.customer_email ?? "");
  const [status, setStatus] = useState<string>(order.status ?? "pending");
  const [items, setItems] = useState<OrderItemEdit[]>(
    (order.items ?? []).map((i: any) => ({
      product_id: String(i.product_id),
      quantity: i.quantity,
    }))
  );
  const [discountType, setDiscountType] = useState<string>(order.discount_type ?? "");
  const [discountValue, setDiscountValue] = useState<string>(
    order.discount_value != null ? String(order.discount_value) : ""
  );
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [addingProduct, setAddingProduct] = useState<OrderItemEdit>({ product_id: "", quantity: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiUrl("/api/v1/products?limit=50"), {
      headers: { Authorization: `Bearer ${getSessionIdFromCookie()}` },
    })
      .then((res) => res.json())
      .then((data) => setProductsList(Array.isArray(data) ? data : []))
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

  const handleQuantityChange = (idx: number, val: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, quantity: val > 0 ? val : 1 } : item))
    );
  };

  const computedDiscount = (() => {
    const val = parseFloat(discountValue);
    if (!discountType || isNaN(val) || val <= 0) return null;
    if (discountType === "percentage") return (order.total_amount * val) / 100;
    if (discountType === "fixed") return val;
    return null;
  })();

  const netTotal = order.total_amount - (computedDiscount ?? order.discount_amount ?? 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!customerEmail) {
      setError("Customer email is required.");
      return;
    }
    if (items.length === 0) {
      setError("At least one item is required.");
      return;
    }

    const payload: Record<string, any> = {
      customer_email: customerEmail,
      status,
      items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
    };
    if (discountType) {
      payload.discount_type = discountType;
      payload.discount_value = discountValue !== "" ? parseFloat(discountValue) : null;
    } else {
      payload.discount_type = null;
      payload.discount_value = null;
    }

    setSubmitting(true);
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
      const updated = await res.json();
      onSaved({
        customer_email: updated.customer_email,
        status: updated.status,
        items: updated.items,
        discount_type: updated.discount_type,
        discount_value: updated.discount_value,
        discount_amount: updated.discount_amount,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update order.");
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
          maxWidth: "42rem",
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
          overflowY: "auto",
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

        <form className="flex flex-col" style={{ gap: "1rem" }} onSubmit={handleSubmit}>
          {/* Customer Email */}
          <div data-testId="edit-order-email-container">
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
          <div data-testId="edit-order-status-container">
            <label
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
              data-testId="edit-order-label-status"
            >
              Status
            </label>
            <Select value={status} onValueChange={(val) => setStatus(val)}>
              <SelectTrigger
                style={{
                  border: "1.5px solid #d1d5db",
                  width: "100%",
                  padding: "0.5rem 1rem",
                  background: "#fff",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                }}
                data-testId="edit-order-status-trigger"
              >
                <SelectValue placeholder="Select status...">
                  <span style={{ textTransform: "capitalize" }}>{status}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
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

          {/* Items */}
          <div data-testId="edit-order-items-container">
            <label
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
              data-testId="edit-order-label-items"
            >
              Items
            </label>

            {/* Add item row */}
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              data-testId="edit-order-add-item-row"
            >
              <div style={{ flex: 1 }}>
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
                  >
                    <SelectValue placeholder="Select product...">
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
                      .map((p) => (
                        <SelectItem
                          key={p.product_id}
                          value={String(p.product_id)}
                          data-testId={`edit-order-product-option-${p.name}`}
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
                  paddingLeft: 0,
                  paddingRight: 0,
                  borderRadius: "0.375rem",
                  height: "2.5rem",
                }}
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

            {/* Item list */}
            {items.length > 0 && (
              <div
                style={{
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  background: "#f9fafb",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                }}
                data-testId="edit-order-items-list"
              >
                <div
                  style={{
                    display: "flex",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.25rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ flex: 2 }}>Name</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Qty</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Unit Price</span>
                  <span style={{ flex: 0.5 }}></span>
                </div>
                {items.map((item, idx) => {
                  const prod = productsList.find(
                    (p) =>
                      String(p.product_id).trim() === String(item.product_id).trim()
                  );
                  return (
                    <div
                      key={item.product_id + idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                        fontSize: "0.95rem",
                        background: "#fff",
                        borderRadius: "0.375rem",
                        padding: "0.25rem 0.5rem",
                      }}
                      data-testId={`edit-order-item-row-${prod?.name || item.product_id}`}
                    >
                      <span style={{ flex: 2 }}>
                        {prod ? prod.name : item.product_id}
                      </span>
                      <span style={{ flex: 1, textAlign: "center" }}>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(idx, Number(e.target.value))
                          }
                          style={{
                            border: "1.5px solid #d1d5db",
                            width: "3.5rem",
                            textAlign: "center",
                            paddingLeft: 0,
                            paddingRight: 0,
                            borderRadius: "0.375rem",
                            height: "2rem",
                            fontSize: "0.9rem",
                          }}
                          data-testId={`edit-order-item-qty-${prod?.name || item.product_id}`}
                        />
                      </span>
                      <span
                        style={{ flex: 1, textAlign: "center", color: "#374151" }}
                      >
                        {prod ? `$${prod.price}` : "-"}
                      </span>
                      <Button
                        type="button"
                        variant="link"
                        style={{
                          color: "#dc2626",
                          flex: 0.5,
                          fontWeight: 500,
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
          </div>

          {/* Discount */}
          <div data-testId="edit-order-discount-container">
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
                    data-testId="edit-order-discount-type-trigger"
                  >
                    <SelectValue placeholder="No Discount">
                      {DISCOUNT_TYPES.find((d) => d.value === discountType)?.label ??
                        "No Discount"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_TYPES.map((d) => (
                      <SelectItem
                        key={d.value}
                        value={d.value}
                        data-testId={`edit-order-discount-type-option-${d.value || "none"}`}
                      >
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {discountType && (
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={discountType === "percentage" ? "e.g. 10" : "e.g. 5.00"}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  style={{
                    border: "1.5px solid #d1d5db",
                    width: "7rem",
                    borderRadius: "0.375rem",
                    height: "2.5rem",
                    textAlign: "right",
                  }}
                  data-testId="edit-order-discount-value-input"
                />
              )}
            </div>
            {/* Discount preview */}
            {discountType && computedDiscount != null && (
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.95rem",
                  color: "#374151",
                  display: "flex",
                  gap: "1.5rem",
                }}
                data-testId="edit-order-discount-preview"
              >
                <span>
                  Discount:{" "}
                  <span style={{ color: "#dc2626", fontWeight: 600 }}>
                    -${computedDiscount.toFixed(2)}
                  </span>
                </span>
                <span>
                  Net Total:{" "}
                  <span style={{ color: "#16a34a", fontWeight: 600 }}>
                    ${netTotal.toFixed(2)}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full mt-2"
            style={{
              background: "#f3f4f6",
              color: "#111",
              border: "1.5px solid transparent",
              outline: "none",
              transition: "background 0.2s, border-color 0.2s",
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
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditOrderForm;
