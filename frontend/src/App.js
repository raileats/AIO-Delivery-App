import React, { useEffect, useState } from 'react';
import OrdersTable from './components/OrdersTable';
import { getOrders } from './api';

function App() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Vendor Orders Dashboard</h1>
      <OrdersTable orders={orders} />
    </div>
  );
}

export default App;
