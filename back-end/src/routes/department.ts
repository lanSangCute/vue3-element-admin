import { Router, Request, Response } from 'express'
import db from '../db/database'

const router = Router()

// Get all departments (flat list for select)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { deptCode, deptName } = req.query
    let query = 'SELECT * FROM departments WHERE 1=1'
    const params: any[] = []
    
    if (deptCode) {
      query += ' AND deptCode LIKE ?'
      params.push(`%${deptCode}%`)
    }
    
    if (deptName) {
      query += ' AND deptName LIKE ?'
      params.push(`%${deptName}%`)
    }
    
    query += ' ORDER BY sortOrder, id ASC'
    
    const departments = db.prepare(query).all(...params)
    
    res.json({
      code: 200,
      data: departments
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Get department tree
router.get('/tree', async (req: Request, res: Response) => {
  try {
    const departments: any[] = db.prepare('SELECT * FROM departments ORDER BY sortOrder, id ASC').all()
    
    // Build tree structure
    const buildTree = (parentId: number | null): any[] => {
      return departments
        .filter((dept: any) => dept.parentId === parentId)
        .map((dept: any) => ({
          ...dept,
          children: buildTree(dept.id)
        }))
    }
    
    const tree = buildTree(null)
    
    res.json({
      code: 200,
      data: tree
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Get department detail with children
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const department = db.prepare('SELECT * FROM departments WHERE id = ?').get(id)
    
    if (!department) {
      return res.status(404).json({
        code: 404,
        message: 'Department not found'
      })
    }
    
    // Get parent department
    let parent = null
    const dept = department as any
    if (dept.parentId) {
      parent = db.prepare('SELECT id, deptCode, deptName FROM departments WHERE id = ?').get(dept.parentId)
    }
    
    // Get all children recursively
    const getAllChildren = (parentId: number): any[] => {
      const children: any[] = db.prepare('SELECT * FROM departments WHERE parentId = ?').all(parentId)
      return children.map((child: any) => ({
        ...child,
        children: getAllChildren(child.id)
      }))
    }
    
    const children = getAllChildren(Number(id))
    
    res.json({
      code: 200,
      data: {
        ...dept,
        parent,
        children
      }
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Create department
router.post('/', async (req: Request, res: Response) => {
  try {
    const { deptCode, deptName, parentId, description, status = 1, sortOrder = 0 } = req.body
    
    if (!deptCode || !deptName) {
      return res.status(400).json({
        code: 400,
        message: 'deptCode and deptName are required'
      })
    }
    
    // Check if deptCode exists
    const existing = db.prepare('SELECT * FROM departments WHERE deptCode = ?').get(deptCode)
    if (existing) {
      return res.status(400).json({
        code: 400,
        message: 'Department code already exists'
      })
    }
    
    // Check if self is set as parent
    if (parentId && Number(parentId) === 0) {
      return res.status(400).json({
        code: 400,
        message: 'Cannot set self as parent'
      })
    }
    
    const now = new Date().toISOString()
    const result = db.prepare(
      'INSERT INTO departments (deptCode, deptName, parentId, description, status, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(deptCode, deptName, parentId || null, description, status, sortOrder, now, now)
    
    res.json({
      code: 200,
      data: {
        id: result.lastInsertRowid,
        deptCode,
        deptName,
        parentId: parentId || null,
        description,
        status
      },
      message: 'Department created successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Update department
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { deptName, parentId, description, status, sortOrder } = req.body
    
    // Check if department exists
    const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(id)
    if (!dept) {
      return res.status(404).json({
        code: 404,
        message: 'Department not found'
      })
    }
    
    // Check if self is set as parent
    if (parentId && Number(parentId) === Number(id)) {
      return res.status(400).json({
        code: 400,
        message: 'Cannot set self as parent'
      })
    }
    
    // Check if new parent is a child of current department (would create cycle)
    if (parentId) {
      const getAllChildren = (parentId: number): number[] => {
        const children: any[] = db.prepare('SELECT id FROM departments WHERE parentId = ?').all(parentId)
        let allChildren: number[] = children.map((c: any) => c.id)
        for (const child of children) {
          allChildren = [...allChildren, ...getAllChildren(child.id)]
        }
        return allChildren
      }
      
      const childIds = getAllChildren(Number(id))
      if (childIds.includes(Number(parentId))) {
        return res.status(400).json({
          code: 400,
          message: 'Cannot set a child department as parent'
        })
      }
    }
    
    const now = new Date().toISOString()
    const result = db.prepare(
      'UPDATE departments SET deptName = ?, parentId = ?, description = ?, status = ?, sortOrder = ?, updatedAt = ? WHERE id = ?'
    ).run(deptName, parentId || null, description, status, sortOrder, now, id)
    
    if (result.changes === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Department not found'
      })
    }
    
    res.json({
      code: 200,
      message: 'Department updated successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Delete department
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    // Recursively delete all children
    const deleteChildren = (parentId: number) => {
      const children = db.prepare('SELECT id FROM departments WHERE parentId = ?').all(parentId)
      for (const child of children as any[]) {
        deleteChildren(child.id)
        db.prepare('DELETE FROM departments WHERE id = ?').run(child.id)
      }
    }
    
    deleteChildren(Number(id))
    db.prepare('DELETE FROM departments WHERE id = ?').run(id)
    
    res.json({
      code: 200,
      message: 'Department deleted successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

export default router
