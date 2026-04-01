"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../db/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all users (protected)
router.get('/', auth_1.authenticateToken, (req, res) => {
    try {
        const users = database_1.default.prepare('SELECT id, username, email, created_at FROM users').all();
        res.json({ users });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get single user (protected)
router.get('/:id', auth_1.authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const user = database_1.default.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create user (protected)
router.post('/', auth_1.authenticateToken, (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
        const stmt = database_1.default.prepare(`
      INSERT INTO users (username, password, email) VALUES (?, ?, ?)
    `);
        const result = stmt.run(username, hashedPassword, email || null);
        res.status(201).json({
            message: 'User created successfully',
            userId: result.lastInsertRowid
        });
    }
    catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update user (protected)
router.put('/:id', auth_1.authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const { username, email } = req.body;
        const stmt = database_1.default.prepare(`
      UPDATE users SET username = ?, email = ? WHERE id = ?
    `);
        stmt.run(username, email, id);
        res.json({ message: 'User updated successfully' });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete user (protected)
router.delete('/:id', auth_1.authenticateToken, (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        // Prevent deleting yourself
        if (parseInt(id) === req.user?.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }
        const stmt = database_1.default.prepare('DELETE FROM users WHERE id = ?');
        const result = stmt.run(id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map