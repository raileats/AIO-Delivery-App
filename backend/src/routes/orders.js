import { Router } from 'express';
import { db } from '../db/sqlite.js';

const router = Router();

router.get('/', (req,res)=>{
  const { platform, status, vendorId, q } = req.query;
  let sql = `SELECT o.*, v.name as vendor_name FROM orders o 
             LEFT JOIN vendors v ON v.id = o.vendor_id WHERE 1=1`;
  const params = [];
  if(platform){ sql += ' AND o.platform = ?'; params.push(platform); }
  if(status){ sql += ' AND o.status = ?'; params.push(status); }
  if(vendorId){ sql += ' AND o.vendor_id = ?'; params.push(vendorId); }
  if(q){
    sql += ' AND (o.order_id LIKE ? OR o.customer_name LIKE ? OR o.address LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  sql += ' ORDER BY o.created_at DESC LIMIT 500';
  const rows = db.prepare(sql).all(...params);
  rows.forEach(r => { try{ r.items = JSON.parse(r.items || '[]'); }catch{ r.items=[]; } });
  res.json({ok:true, orders: rows});
});

router.get('/:id', (req,res)=>{
  const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if(!o) return res.status(404).json({error:'not found'});
  try{ o.items = JSON.parse(o.items||'[]'); }catch{ o.items=[]; }
  res.json({ok:true, order:o});
});

export default router;
