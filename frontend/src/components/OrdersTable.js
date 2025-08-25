import React from 'react';

function OrdersTable({ orders }) {
  return (
    <table border="1" cellPadding="8" style={{ marginTop: 20, width: '100%' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Vendor</th>
          <th>Order ID</th>
          <th>Details</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(o => (
          <tr key={o.id}>
            <td>{o.id}</td>
            <td>{o.vendor}</td>
            <td>{o.order_id}</td>
            <td>{o.details}</td>
            <td>{o.created_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default OrdersTable;
