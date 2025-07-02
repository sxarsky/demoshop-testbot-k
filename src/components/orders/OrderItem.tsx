import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Order } from "./OrderList";

export default function OrderItem({ order }: { order: Order }) {
  return (
    <Card className="shadow-none border-0" style={{ width: '100%' }}>
      <CardContent
        className="flex items-center py-2 px-4 min-h-0 border-0 !gap-4 !p-0"
        style={{ gap: '1rem', padding: 0, width: '100%' }}
      >
        {/* Order Info */}
        <div className="flex flex-col flex-grow items-start gap-2" style={{ gap: '0.5rem' }}>
          <h2 className="text-lg font-semibold leading-none m-0 p-0" style={{ margin: 0, padding: 0, lineHeight: 1 }}>
            {order.customer_email} - {order.items.length} items
          </h2>
          <p className="text-xs text-muted-foreground leading-none m-0 p-0" style={{ margin: 0, padding: 0, lineHeight: 1 }}>
            ${order.total_amount.toFixed(2)}
          </p>
        </div>

        {/* View Details */}
        <Button variant="link" className="text-blue-600 ml-auto" onClick={() => {}}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
