import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function App(){
  const API_BASE = import.meta.env.VITE_API || 'http://localhost:4000';
  const [email, setEmail] = useState('paitpooja.orders@gmail.com');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [vendors, setVendors] = useState([]);

  useEffect(()=>{
    fetch(API_BASE + '/api/vendors').then(r=>r.json()).then(d=>{ if(d.ok) setVendors(d.vendors); });
  },[]);

  const login = async () => {
    const res = await fetch(API_BASE + '/api/auth/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email, password})
    });
    const d = await res.json();
    if(d.ok){ setToken(d.token); fetchOrders(d.token); }
    else alert(d.error || 'login failed');
  };

  const fetchOrders = async (tk=token) => {
    setLoading(true);
    const params = new URLSearchParams();
    if(q) params.set('q', q);
    if(vendorId) params.set('vendorId', vendorId);
    const res = await fetch(API_BASE + '/api/orders?' + params.toString(), {
      headers:{ Authorization: 'Bearer ' + tk }
    });
    const d = await res.json();
    setLoading(false);
    if(d.ok) setOrders(d.orders);
  };

  const ingest = async () => {
    setLoading(true);
    const res = await fetch(API_BASE + '/api/ingest', {
      method:'POST',
      headers:{ Authorization: 'Bearer ' + token }
    });
    const d = await res.json();
    setLoading(false);
    alert('Ingested: ' + (d.ingested || 0));
    fetchOrders();
  };

  return (
    <div style={{fontFamily:'ui-sans-serif', padding:20}}>
      <h1>Vendor Orders Dashboard</h1>

      {!token && (
        <div style={{display:'grid', gap:8, maxWidth:360, marginBottom:16}}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Vendor email" />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (demo)" type="password" />
          <button onClick={login}>Login</button>
        </div>
      )}

      {token && (
        <div style={{display:'grid', gap:8, marginBottom:16}}>
          <div style={{display:'flex', gap:8}}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." />
            <select value={vendorId} onChange={e=>setVendorId(e.target.value)}>
              <option value="">All Vendors</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <button onClick={()=>fetchOrders()}>Filter</button>
            <button onClick={()=>{ setQ(''); setVendorId(''); fetchOrders(); }}>Clear</button>
            <button onClick={ ingest }>Fetch Emails</button>
          </div>

          {loading ? <p>Loading...</p> : (
            <table border="1" cellPadding="8" style={{borderCollapse:'collapse', width:'100%'}}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Vendor</th>
                  <th>Platform</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>{new Date(o.created_at).toLocaleString()}</td>
                    <td>{o.vendor_name || '-'}</td>
                    <td>{o.platform}</td>
                    <td>{o.order_id || '-'}</td>
                    <td>{o.customer_name || '-'}</td>
                    <td>{o.customer_phone || '-'}</td>
                    <td>{o.total_amount || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
