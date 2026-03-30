import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { NavBar } from "@/components/ui/navbar";
import { getSessionIdFromCookie } from '../../lib/utils';
import { apiUrl } from '../../config';

interface Product {
  product_id: string;
  name: string;
  price: number;
}

interface OrderItem {
  product_id: string;
  quantity: number;
}

interface Order {
  order_id: number;
  customer_email: string;
  status: string;
  total_amount: number;
  discount_type?: string | null;
  discount_value?: number | null;
  discount_amount?: number | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export default function EditOrderForm() {
  const { order_id } = useParams<{ order_id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingProduct, setAddingProduct] = useState<OrderItem>({ product_id: "", quantity: 1 });

  useEffect(() => {
    if (!order_id) return;
    setLoading(true);
    const sessionId = getSessionIdFromCookie();
    
    // Fetch order and products in parallel
    Promise.all([
      fetch(apiUrl(`/api/v1/orders/${order_id}`), {
        headers: { 'Authorization': `Bearer ${sessionId}` }
      }).then(res => res.ok ? res.json() : null),
      fetch(apiUrl("/api/v1/products?limit=100"), {
        headers: { 'Authorization': `Bearer ${sessionId}` }
      }).then(res => res.ok ? res.json() : [])
    ])
      .then(([orderData, productsData]) => {
        if (orderData) {
          setOrder(orderData);
          setError(null);
        } else {
          setError("Order not found");
        }
        setProductsList(productsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [order_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !order_id) return;

    setSubmitting(true);
    setError(null);

    const sessionId = getSessionIdFromCookie();
    const payload: any = {
      customer_email: order.customer_email,
      status: order.status,
      items: order.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    // Add discount fields if present
    if (order.discount_type && order.discount_value != null) {
      payload.discount_type = order.discount_type;
      payload.discount_value = order.discount_value;
    }

    try {
      const res = await fetch(apiUrl(`/api/v1/orders/${order_id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Failed to update order' }));
        throw new Error(errorData.detail || 'Failed to update order');
      }

      const updatedOrder = await res.json();
      // Merge only the edited fields to keep discount_amount consistent
      setOrder(prevOrder => prevOrder ? {
        ...prevOrder,
        customer_email: updatedOrder.customer_email,
        status: updatedOrder.status,
        items: updatedOrder.items,
        discount_type: updatedOrder.discount_type,
        discount_value: updatedOrder.discount_value,
        discount_amount: updatedOrder.discount_amount
      } : updatedOrder);
      
      navigate(`/orders/${order_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddItem = () => {
    if (!order || !addingProduct.product_id) return;
    
    const existingItemIndex = order.items.findIndex(
      item => item.product_id === addingProduct.product_id
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const newItems = [...order.items];
      newItems[existingItemIndex].quantity += addingProduct.quantity;
      setOrder({ ...order, items: newItems });
    } else {
      // Add new item
      setOrder({
        ...order,
        items: [...order.items, { ...addingProduct }]
      });
    }

    // Reset adding product
    setAddingProduct({ product_id: "", quantity: 1 });
  };

  const handleRemoveItem = (index: number) => {
    if (!order) return;
    const newItems = order.items.filter((_, i) => i !== index);
    setOrder({ ...order, items: newItems });
  };

  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    if (!order) return;
    const newItems = [...order.items];
    newItems[index].quantity = Math.max(1, quantity);
    setOrder({ ...order, items: newItems });
  };

  const getProductName = (productId: string) => {
    const product = productsList.find(p => p.product_id === productId);
    return product?.name || `Product ${productId}`;
  };

  const getProductPrice = (productId: string) => {
    const product = productsList.find(p => p.product_id === productId);
    return product?.price || 0;
  };

  const calculateItemSubtotal = (item: OrderItem) => {
    const price = getProductPrice(item.product_id);
    return (price * item.quantity).toFixed(2);
  };

  const calculateTotal = () => {
    if (!order) return "0.00";
    const subtotal = order.total_amount;
    const discount = order.discount_amount ?? 0;
    return (subtotal - discount).toFixed(2);
  };

  if (loading) return <div className="text-center py-8" data-testId="edit-order-loading">Loading order...</div>;
  if (error && !order) return <div className="text-center text-red-500 py-8" data-testId="edit-order-error">{error}</div>;
  if (!order) return <div className="text-center py-8" data-testId="edit-order-notfound">Order not found.</div>;

  return (
    <div className="min-h-screen bg-white px-6 py-10" style={{ width: '100%', maxWidth: '64rem', margin: '0 auto' }} data-testId="edit-order-root">
      <NavBar active="orders" />
      <div className="w-full" style={{ maxWidth: '48rem', margin: '0 auto', paddingTop: '1.5rem' }}>
        <h1 className="text-2xl font-bold mb-6" data-testId="edit-order-heading">Edit Order</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded" data-testId="edit-order-error-banner">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Customer Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Customer Email</label>
            <Input
              type="email"
              value={order.customer_email}
              onChange={(e) => setOrder({ ...order, customer_email: e.target.value })}
              required
              data-testId="edit-order-email-input"
            />
          </div>

          {/* Order Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={order.status}
              onValueChange={(value) => setOrder({ ...order, status: value })}
            >
              <SelectTrigger data-testId="edit-order-status-select">
                <SelectValue placeholder="Select status" />
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

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">Order Items</h2>
            {order.items.length === 0 ? (
              <div className="text-gray-500 mb-4">No items in this order</div>
            ) : (
              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded" data-testId={`edit-order-item-${index}`}>
                    <div className="flex-1">
                      <div className="font-medium">{getProductName(item.product_id)}</div>
                      <div className="text-sm text-gray-500">
                        ${getProductPrice(item.product_id).toFixed(2)} × {item.quantity} = ${calculateItemSubtotal(item)}
                      </div>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItemQuantity(index, parseInt(e.target.value) || 1)}
                      className="w-20"
                      data-testId={`edit-order-item-quantity-${index}`}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleRemoveItem(index)}
                      data-testId={`edit-order-item-remove-${index}`}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Product */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Add Product</h3>
              <div className="flex gap-2">
                <Select
                  value={addingProduct.product_id}
                  onValueChange={(value) => setAddingProduct({ ...addingProduct, product_id: value })}
                >
                  <SelectTrigger className="flex-1" data-testId="edit-order-add-product-select">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {productsList.map((product) => (
                      <SelectItem key={product.product_id} value={product.product_id}>
                        {product.name} - ${product.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={addingProduct.quantity}
                  onChange={(e) => setAddingProduct({ ...addingProduct, quantity: parseInt(e.target.value) || 1 })}
                  className="w-20"
                  placeholder="Qty"
                  data-testId="edit-order-add-product-quantity"
                />
                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!addingProduct.product_id}
                  data-testId="edit-order-add-product-button"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Discount */}
          <div className="mb-6 border-t pt-4">
            <h2 className="text-lg font-bold mb-3">Discount</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount Type</label>
                <Select
                  value={order.discount_type || "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      setOrder({ ...order, discount_type: null, discount_value: null });
                    } else {
                      setOrder({ ...order, discount_type: value, discount_value: order.discount_value || 0 });
                    }
                  }}
                >
                  <SelectTrigger data-testId="edit-order-discount-type-select">
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Discount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {order.discount_type === "percentage" ? "Discount (%)" : "Discount Amount"}
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={order.discount_value ?? ""}
                  onChange={(e) => setOrder({ ...order, discount_value: parseFloat(e.target.value) || 0 })}
                  disabled={!order.discount_type || order.discount_type === "none"}
                  data-testId="edit-order-discount-value-input"
                />
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${order.total_amount.toFixed(2)}</span>
            </div>
            {order.discount_amount != null && order.discount_amount > 0 && (
              <div className="flex justify-between mb-2 text-red-600">
                <span>Discount:</span>
                <span>-${order.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span data-testId="edit-order-total">${calculateTotal()}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={submitting || order.items.length === 0}
              className="flex-1"
              data-testId="edit-order-submit-button"
            >
              {submitting ? 'Updating...' : 'Update Order'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/orders/${order_id}`)}
              className="flex-1"
              data-testId="edit-order-cancel-button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
