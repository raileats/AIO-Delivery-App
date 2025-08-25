import { Router } from 'express';
import { db } from '../db/sqlite.js';

const router = Router();

router.get('/', (req,res)=>{
  const rows = db.prepare('SELECT id, name, email FROM vendors ORDER BY name').all();
  res.json({ok:true, vendors: rows});
});

router.post('/', (req,res)=>{
  const { name, email } = req.body || {};
  if(!name || !email) return res.status(400).json({error:'name,email required'});
  try{
    const info = db.prepare('INSERT INTO vendors (name,email) VALUES (?,?)').run(name, email);
    res.json({ok:true, id: info.lastInsertRowid});
  }catch(e){
    res.status(400).json({error: e.message});
  }
});

export default router;
