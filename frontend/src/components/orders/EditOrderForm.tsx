import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { NavBar } from '@/components/ui/navbar';
import { getSessionIdFromCookie } from '../../lib/utils';
import { apiUrl } from '../../config';
import '@/styles/select-zindex-workaround.css';

export default function EditOrderForm() {
  const { order_id } = useParams<{ order_id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Order fields
  const [order, setOrder] = useState<any>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [status, setStatus] = useState('pending');
  const [discountType, setDiscountType] = useState<string>('');
  const [discountValue, setDiscountValue] = useState<string>('');

  // Order items
  const [items, setItems] = useState<Array<{ product_id: string; quantity: number }>>([]);

  // Available products for the dropdown
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!order_id) return;
    setLoading(true);
    const sessionId = getSessionIdFromCookie();

    // Fetch order details
    fetch(apiUrl(`/api/v1/orders/${order_id}`), {
      headers: { Authorization: `Bearer ${sessionId}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch order details');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setCustomerEmail(data.customer_email);
        setStatus(data.status);
        setDiscountType(data.discount_type || '');
        setDiscountValue(data.discount_value?.toString() || '');
        setItems(
          data.items.map((item: any) => ({
            product_id: String(item.product_id),
            quantity: item.quantity,
          }))
        );
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // Fetch available products
    fetch(apiUrl('/api/v1/products?limit=100'), {
      headers: { Authorization: `Bearer ${sessionId}` },
    })
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]));
  }, [order_id]);

  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'product_id' | 'quantity', value: string | number) => {
    const newItems = [...items];
    if (field === 'product_id') {
      newItems[index].product_id = value as string;
    } else {
      newItems[index].quantity = Number(value);
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Build the update payload
    const payload: any = {
      customer_email: customerEmail,
      status,
      items: items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: item.quantity,
      })),
    };

    // Include discount if provided
    if (discountType && discountValue) {
      payload.discount_type = discountType;
      payload.discount_value = parseFloat(discountValue);
    }

    const sessionId = getSessionIdFromCookie();

    try {
      const res = await fetch(apiUrl(`/api/v1/orders/${order_id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to update order');
      }

      const updatedOrder = await res.json();
      
      // Update only the edited fields in state
      setOrder((prev: any) => ({
        ...prev,
        customer_email: updatedOrder.customer_email,
        status: updatedOrder.status,
        discount_type: updatedOrder.discount_type,
        discount_value: updatedOrder.discount_value,
        discount_amount: updatedOrder.discount_amount,
      }));

      navigate(`/orders/${order_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8" data-testId="edit-order-loading">
        Loading order details...
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="text-center text-red-500 py-8" data-testId="edit-order-error">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8" data-testId="edit-order-notfound">
        Order not found.
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white px-6 py-10"
      style={{ width: '100%', maxWidth: '64rem', margin: '0 auto', boxSizing: 'border-box' }}
      data-testId="edit-order-root"
    >
      <NavBar active="orders" />
      <div
        className="w-full"
        style={{ width: '100%', maxWidth: '48rem', margin: '0 auto', padding: 0 }}
        data-testId="edit-order-main"
      >
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
          data-testId="edit-order-heading"
        >
          Edit Order
        </h1>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            data-testId="edit-order-error-banner"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} data-testId="edit-order-form">
          {/* Customer Email */}
          <div className="mb-4">
            <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Email
            </label>
            <Input
              id="customer_email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              data-testId="edit-order-customer-email"
            />
          </div>

          {/* Status */}
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testId="edit-order-status">
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Items</label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2" data-testId={`edit-order-item-${index}`}>
                <Select
                  value={item.product_id}
                  onValueChange={(value) => handleItemChange(index, 'product_id', value)}
                >
                  <SelectTrigger className="flex-1" data-testId={`edit-order-item-product-${index}`}>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.product_id} value={String(product.product_id)}>
                        {product.name} (${product.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="w-24"
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
            <Button type="button" onClick={handleAddItem} className="mt-2" data-testId="edit-order-add-item">
              Add Item
            </Button>
          </div>

          {/* Discount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
            <div className="flex gap-2">
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger className="flex-1" data-testId="edit-order-discount-type">
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Discount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="Value"
                className="w-32"
                disabled={!discountType}
                data-testId="edit-order-discount-value"
              />
            </div>
          </div>

          {/* Display calculated total */}
          {order && (
            <div className="mb-4 p-4 bg-gray-50 rounded" data-testId="edit-order-summary">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Original Total:</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
              {discountType && discountValue && (
                <>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Discount:</span>
                    <span>
                      {discountType === 'percentage'
                        ? `${discountValue}%`
                        : `$${parseFloat(discountValue).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Net Total:</span>
                    <span>
                      $
                      {discountType === 'percentage'
                        ? (order.total_amount - (order.total_amount * parseFloat(discountValue)) / 100).toFixed(2)
                        : (order.total_amount - parseFloat(discountValue)).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mt-6">
            <Button type="submit" disabled={submitting} data-testId="edit-order-submit">
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => navigate(`/orders/${order_id}`)}
              data-testId="edit-order-cancel"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
