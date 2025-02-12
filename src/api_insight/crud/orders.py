"""
CRUD operations for orders.
"""
from sqlmodel import Session, select
from api_insight.models.order import Order, OrderStatus
from sqlalchemy.exc import SQLAlchemyError

def get_orders(session: Session, limit: int, offset: int) -> list[Order]:
    """Get all orders."""
    statement = select(Order).limit(limit).offset(offset)
    orders = session.exec(statement).all()
    return orders

def get_order(session: Session, order_id: int) -> Order:
    """Get an order by ID."""
    statement = select(Order).where(Order.order_id == order_id)
    order = session.exec(statement).first()
    return order

def create_order(session: Session, order: Order) -> Order:
    """Create a new order."""
    session.add(order)
    session.commit()
    session.refresh(order)
    return order

def cancel_order(session: Session, order_id: int) -> None:
    """Cancel an order."""
    order = get_order(session, order_id)
    if not order:
        raise SQLAlchemyError("Order not found")
    if order:
        order.status = OrderStatus.CANCELLED
        session.commit()
