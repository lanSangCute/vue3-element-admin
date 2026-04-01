import { Router, Request, Response } from 'express'
import db from '../db/database'

const router = Router()

// Get role list
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, roleCode, roleName } = req.query
    const offset = (Number(page) - 1) * Number(pageSize)
    
    let query = 'SELECT * FROM roles WHERE 1=1'
    let countQuery = 'SELECT COUNT(*) as total FROM roles WHERE 1=1'
    const params: any[] = []
    
    if (roleCode) {
      query += ' AND roleCode LIKE ?'
      countQuery += ' AND roleCode LIKE ?'
      params.push(`%${roleCode}%`)
    }
    
    if (roleName) {
      query += ' AND roleName LIKE ?'
      countQuery += ' AND roleName LIKE ?'
      params.push(`%${roleName}%`)
    }
    
    query += ' ORDER BY id DESC LIMIT ? OFFSET ?'
    params.push(Number(pageSize), offset)
    
    const roles = db.prepare(query).all(...params)
    const countResult: any = db.prepare(countQuery).get(...params.slice(0, params.length - 2))
    
    res.json({
      code: 200,
      data: {
        list: roles,
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

// Get role detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(id)
    
    if (!role) {
      return res.status(404).json({
        code: 404,
        message: 'Role not found'
      })
    }
    
    res.json({
      code: 200,
      data: role
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Create role
router.post('/', async (req: Request, res: Response) => {
  try {
    const { roleCode, roleName, description, status = 1 } = req.body
    
    if (!roleCode || !roleName) {
      return res.status(400).json({
        code: 400,
        message: 'roleCode and roleName are required'
      })
    }
    
    // Check if roleCode exists
    const existing = db.prepare('SELECT * FROM roles WHERE roleCode = ?').get(roleCode)
    if (existing) {
      return res.status(400).json({
        code: 400,
        message: 'Role code already exists'
      })
    }
    
    const now = new Date().toISOString()
    const result = db.prepare(
      'INSERT INTO roles (roleCode, roleName, description, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(roleCode, roleName, description, status, now, now)
    
    res.json({
      code: 200,
      data: {
        id: result.lastInsertRowid,
        roleCode,
        roleName,
        description,
        status
      },
      message: 'Role created successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Update role
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { roleName, description, status } = req.body
    
    const now = new Date().toISOString()
    const result = db.prepare(
      'UPDATE roles SET roleName = ?, description = ?, status = ?, updatedAt = ? WHERE id = ?'
    ).run(roleName, description, status, now, id)
    
    if (result.changes === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Role not found'
      })
    }
    
    res.json({
      code: 200,
      message: 'Role updated successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Delete role
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    // Delete role-user associations first
    db.prepare('DELETE FROM role_user WHERE roleId = ?').run(id)
    
    const result = db.prepare('DELETE FROM roles WHERE id = ?').run(id)
    
    if (result.changes === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Role not found'
      })
    }
    
    res.json({
      code: 200,
      message: 'Role deleted successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Get users by role
router.get('/:id/users', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const users = db.prepare(
      `SELECT u.* FROM users u
       INNER JOIN role_user ru ON u.id = ru.userId
       WHERE ru.roleId = ?`
    ).all(id)
    
    res.json({
      code: 200,
      data: users
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Assign users to role
router.post('/:id/users', async (req: Request, res: Response) => {
  try {
    const roleId = Number(req.params.id)
    const { userIds } = req.body
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'userIds is required'
      })
    }
    
    const insert = db.prepare('INSERT OR IGNORE INTO role_user (roleId, userId) VALUES (?, ?)')
    const insertMany = db.transaction((roleId: number, ids: number[]) => {
      for (const userId of ids) {
        insert.run(roleId, userId)
      }
    })
    
    insertMany(roleId, userIds)
    
    res.json({
      code: 200,
      message: 'Users assigned successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Remove users from role
router.delete('/:id/users', async (req: Request, res: Response) => {
  try {
    const roleId = Number(req.params.id)
    const { userIds } = req.body
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'userIds is required'
      })
    }
    
    const deleteStmt = db.prepare('DELETE FROM role_user WHERE roleId = ? AND userId = ?')
    const deleteMany = db.transaction((roleId: number, ids: number[]) => {
      for (const userId of ids) {
        deleteStmt.run(roleId, userId)
      }
    })
    
    deleteMany(roleId, userIds)
    
    res.json({
      code: 200,
      message: 'Users removed successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Get menus by role
router.get('/:id/menus', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const menus = db.prepare(
      `SELECT m.* FROM menus m
       INNER JOIN role_menu rm ON m.id = rm.menuId
       WHERE rm.roleId = ?
       ORDER BY m.sortOrder, m.id ASC`
    ).all(id)
    
    res.json({
      code: 200,
      data: menus
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

// Get menu tree with role's assigned menu IDs
router.get('/:id/menus/tree', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const roleId = Number(id)
    
    // Get all menus
    const menus: any[] = db.prepare('SELECT * FROM menus ORDER BY sortOrder, id ASC').all()
    
    // Get assigned menu IDs for this role
    const assignedMenus: any[] = db.prepare(
      'SELECT menuId FROM role_menu WHERE roleId = ?'
    ).all(roleId)
    const assignedMenuIds = assignedMenus.map((m: any) => m.menuId)
    
    // Build tree structure with checked status
    const buildTree = (parentId: number | null): any[] => {
      return menus
        .filter((menu: any) => menu.parentId === parentId)
        .map((menu: any) => ({
          ...menu,
          checked: assignedMenuIds.includes(menu.id),
          children: buildTree(menu.id)
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

// Assign menus to role
router.post('/:id/menus', async (req: Request, res: Response) => {
  try {
    const roleId = Number(req.params.id)
    const { menuIds } = req.body
    
    if (!menuIds || !Array.isArray(menuIds)) {
      return res.status(400).json({
        code: 400,
        message: 'menuIds is required'
      })
    }
    
    // Delete existing associations
    db.prepare('DELETE FROM role_menu WHERE roleId = ?').run(roleId)
    
    // Insert new associations
    const insert = db.prepare('INSERT INTO role_menu (roleId, menuId) VALUES (?, ?)')
    const insertMany = db.transaction((roleId: number, ids: number[]) => {
      for (const menuId of ids) {
        insert.run(roleId, menuId)
      }
    })
    
    insertMany(roleId, menuIds)
    
    res.json({
      code: 200,
      message: 'Menus assigned successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message
    })
  }
})

export default router
