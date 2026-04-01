"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../db/database"));
const router = (0, express_1.Router)();
// Get all menus (flat list)
router.get('/', async (req, res) => {
    try {
        const { name, permission } = req.query;
        let query = 'SELECT * FROM menus WHERE 1=1';
        const params = [];
        if (name) {
            query += ' AND name LIKE ?';
            params.push(`%${name}%`);
        }
        if (permission) {
            query += ' AND permission LIKE ?';
            params.push(`%${permission}%`);
        }
        query += ' ORDER BY sortOrder, id ASC';
        const menus = database_1.default.prepare(query).all(...params);
        res.json({
            code: 200,
            data: menus
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Get menu tree
router.get('/tree', async (req, res) => {
    try {
        const menus = database_1.default.prepare('SELECT * FROM menus ORDER BY sortOrder, id ASC').all();
        // Build tree structure
        const buildTree = (parentId) => {
            return menus
                .filter((menu) => menu.parentId === parentId)
                .map((menu) => ({
                ...menu,
                children: buildTree(menu.id)
            }));
        };
        const tree = buildTree(null);
        res.json({
            code: 200,
            data: tree
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Get menu detail
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const menu = database_1.default.prepare('SELECT * FROM menus WHERE id = ?').get(id);
        if (!menu) {
            return res.status(404).json({
                code: 404,
                message: 'Menu not found'
            });
        }
        // Get parent menu
        let parent = null;
        const menuItem = menu;
        if (menuItem.parentId) {
            parent = database_1.default.prepare('SELECT id, name, path FROM menus WHERE id = ?').get(menuItem.parentId);
        }
        // Get all children recursively
        const getAllChildren = (parentId) => {
            const children = database_1.default.prepare('SELECT * FROM menus WHERE parentId = ?').all(parentId);
            return children.map((child) => ({
                ...child,
                children: getAllChildren(child.id)
            }));
        };
        const children = getAllChildren(Number(id));
        res.json({
            code: 200,
            data: {
                ...menuItem,
                parent,
                children
            }
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Create menu
router.post('/', async (req, res) => {
    try {
        const { parentId, name, path, icon, type, permission, sortOrder = 0 } = req.body;
        if (!name || !type) {
            return res.status(400).json({
                code: 400,
                message: 'name and type are required'
            });
        }
        // Validate type
        const validTypes = ['directory', 'menu', 'button'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                code: 400,
                message: 'type must be directory, menu, or button'
            });
        }
        // Check if self is set as parent
        if (parentId && Number(parentId) === 0) {
            return res.status(400).json({
                code: 400,
                message: 'Cannot set self as parent'
            });
        }
        const now = new Date().toISOString();
        const result = database_1.default.prepare('INSERT INTO menus (parentId, name, path, icon, type, permission, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(parentId || null, name, path || null, icon || null, type, permission || null, sortOrder, now, now);
        res.json({
            code: 200,
            data: {
                id: result.lastInsertRowid,
                parentId: parentId || null,
                name,
                path,
                icon,
                type,
                permission,
                sortOrder
            },
            message: 'Menu created successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Update menu
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { parentId, name, path, icon, type, permission, sortOrder } = req.body;
        // Check if menu exists
        const menu = database_1.default.prepare('SELECT * FROM menus WHERE id = ?').get(id);
        if (!menu) {
            return res.status(404).json({
                code: 404,
                message: 'Menu not found'
            });
        }
        // Check if self is set as parent
        if (parentId && Number(parentId) === Number(id)) {
            return res.status(400).json({
                code: 400,
                message: 'Cannot set self as parent'
            });
        }
        // Check if new parent is a child of current menu (would create cycle)
        if (parentId) {
            const getAllChildren = (parentId) => {
                const children = database_1.default.prepare('SELECT id FROM menus WHERE parentId = ?').all(parentId);
                let allChildren = children.map((c) => c.id);
                for (const child of children) {
                    allChildren = [...allChildren, ...getAllChildren(child.id)];
                }
                return allChildren;
            };
            const childIds = getAllChildren(Number(id));
            if (childIds.includes(Number(parentId))) {
                return res.status(400).json({
                    code: 400,
                    message: 'Cannot set a child menu as parent'
                });
            }
        }
        // Build dynamic update query with only provided fields
        const updates = [];
        const params = [];
        if (parentId !== undefined) {
            updates.push('parentId = ?');
            params.push(parentId || null);
        }
        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (path !== undefined) {
            updates.push('path = ?');
            params.push(path || null);
        }
        if (icon !== undefined) {
            updates.push('icon = ?');
            params.push(icon || null);
        }
        if (type !== undefined) {
            updates.push('type = ?');
            params.push(type);
        }
        if (permission !== undefined) {
            updates.push('permission = ?');
            params.push(permission || null);
        }
        if (sortOrder !== undefined) {
            updates.push('sortOrder = ?');
            params.push(sortOrder);
        }
        if (updates.length === 0) {
            return res.status(400).json({
                code: 400,
                message: 'No fields to update'
            });
        }
        updates.push('updatedAt = ?');
        params.push(new Date().toISOString());
        params.push(id);
        const query = `UPDATE menus SET ${updates.join(', ')} WHERE id = ?`;
        const result = database_1.default.prepare(query).run(...params);
        if (result.changes === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Menu not found'
            });
        }
        res.json({
            code: 200,
            message: 'Menu updated successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Delete menu
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Recursively delete all children
        const deleteChildren = (parentId) => {
            const children = database_1.default.prepare('SELECT id FROM menus WHERE parentId = ?').all(parentId);
            for (const child of children) {
                deleteChildren(child.id);
                database_1.default.prepare('DELETE FROM menus WHERE id = ?').run(child.id);
            }
        };
        // Delete role_menu associations
        database_1.default.prepare('DELETE FROM role_menu WHERE menuId = ?').run(id);
        deleteChildren(Number(id));
        database_1.default.prepare('DELETE FROM menus WHERE id = ?').run(id);
        res.json({
            code: 200,
            message: 'Menu deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=menu.js.map