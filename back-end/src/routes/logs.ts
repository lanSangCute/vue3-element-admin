import { Router, Request, Response } from 'express'
import db from '../db/database'

const router = Router()

// Get operation logs list
router.get('/operation', async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, username, module, action, startDate, endDate } = req.query
    const offset = (Number(page) - 1) * Number(pageSize)
    
    let query = 'SELECT * FROM operation_logs WHERE 1=1'
    let countQuery = 'SELECT COUNT(*) as total FROM operation_logs WHERE 1=1'
    const params: any[] = []
    
    if (username) {
      query += ' AND username LIKE ?'
      countQuery += ' AND username LIKE ?'
      params.push(`%${username}%`)
    }
    
    if (module) {
      query += ' AND module LIKE ?'
      countQuery += ' AND module LIKE ?'
      params.push(`%${module}%`)
    }
    
    if (action) {
      query += ' AND action LIKE ?'
      countQuery += ' AND action LIKE ?'
      params.push(`%${action}%`)
    }
    
    if (startDate) {
      query += ' AND createdAt >= ?'
      countQuery += ' AND createdAt >= ?'
      params.push(startDate)
    }
    
    if (endDate) {
      query += ' AND createdAt <= ?'
      countQuery += ' AND createdAt <= ?'
      params.push(endDate)
    }
    
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?'
    params.push(Number(pageSize), offset)
    
    const logs = db.prepare(query).all(...params)
    const countResult: any = db.prepare(countQuery).get(...params.slice(0, params.length - 2))
    
    res.json({
      code: 200,
      data: {
        list: logs,
        total: countResult.total
      }
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Get login logs list
router.get('/login', async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, username, status, startDate, endDate } = req.query
    const offset = (Number(page) - 1) * Number(pageSize)
    
    let query = 'SELECT * FROM login_logs WHERE 1=1'
    let countQuery = 'SELECT COUNT(*) as total FROM login_logs WHERE 1=1'
    const params: any[] = []
    
    if (username) {
      query += ' AND username LIKE ?'
      countQuery += ' AND username LIKE ?'
      params.push(`%${username}%`)
    }
    
    if (status) {
      query += ' AND status = ?'
      countQuery += ' AND status = ?'
      params.push(status)
    }
    
    if (startDate) {
      query += ' AND createdAt >= ?'
      countQuery += ' AND createdAt >= ?'
      params.push(startDate)
    }
    
    if (endDate) {
      query += ' AND createdAt <= ?'
      countQuery += ' AND createdAt <= ?'
      params.push(endDate)
    }
    
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?'
    params.push(Number(pageSize), offset)
    
    const logs = db.prepare(query).all(...params)
    const countResult: any = db.prepare(countQuery).get(...params.slice(0, params.length - 2))
    
    res.json({
      code: 200,
      data: {
        list: logs,
        total: countResult.total
      }
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Record operation log
router.post('/operation', async (req: Request, res: Response) => {
  try {
    const { userId, username, module, action, description, ip, userAgent } = req.body
    
    if (!username || !module || !action) {
      return res.status(400).json({
        code: 400,
        message: 'username, module and action are required'
      })
    }
    
    const now = new Date().toISOString()
    const result = db.prepare(
      'INSERT INTO operation_logs (userId, username, module, action, description, ip, userAgent, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(userId || null, username, module, action, description || null, ip || null, userAgent || null, now)
    
    res.json({
      code: 200,
      data: {
        id: result.lastInsertRowid
      },
      message: 'Operation log recorded successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Record login log
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { userId, username, ip, userAgent, status } = req.body
    
    if (!username || !status) {
      return res.status(400).json({
        code: 400,
        message: 'username and status are required'
      })
    }
    
    const now = new Date().toISOString()
    const result = db.prepare(
      'INSERT INTO login_logs (userId, username, ip, userAgent, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId || null, username, ip || null, userAgent || null, status, now)
    
    res.json({
      code: 200,
      data: {
        id: result.lastInsertRowid
      },
      message: 'Login log recorded successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

export default router
