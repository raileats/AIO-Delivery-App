export async function getOrders() {
  const res = await fetch(process.env.REACT_APP_API_URL + '/api/orders');
  return res.json();
}
