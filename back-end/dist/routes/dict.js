"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../db/database"));
const router = (0, express_1.Router)();
// Get dict types list
router.get('/types', async (req, res) => {
    try {
        const { page = 1, pageSize = 10, dictType, dictName, status } = req.query;
        const offset = (Number(page) - 1) * Number(pageSize);
        let query = 'SELECT * FROM dict_types WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM dict_types WHERE 1=1';
        const params = [];
        if (dictType) {
            query += ' AND dictType LIKE ?';
            countQuery += ' AND dictType LIKE ?';
            params.push(`%${dictType}%`);
        }
        if (dictName) {
            query += ' AND dictName LIKE ?';
            countQuery += ' AND dictName LIKE ?';
            params.push(`%${dictName}%`);
        }
        if (status !== undefined && status !== '') {
            query += ' AND status = ?';
            countQuery += ' AND status = ?';
            params.push(Number(status));
        }
        query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        params.push(Number(pageSize), offset);
        const dictTypes = database_1.default.prepare(query).all(...params);
        const countResult = database_1.default.prepare(countQuery).get(...params.slice(0, params.length - 2));
        res.json({
            code: 200,
            data: {
                list: dictTypes,
                total: countResult.total
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
// Get dict type detail
router.get('/types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const dictType = database_1.default.prepare('SELECT * FROM dict_types WHERE id = ?').get(id);
        if (!dictType) {
            return res.status(404).json({
                code: 404,
                message: 'Dict type not found'
            });
        }
        res.json({
            code: 200,
            data: dictType
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Create dict type
router.post('/types', async (req, res) => {
    try {
        const { dictType, dictName, status = 1, description } = req.body;
        if (!dictType || !dictName) {
            return res.status(400).json({
                code: 400,
                message: 'dictType and dictName are required'
            });
        }
        // Check if dictType exists
        const existing = database_1.default.prepare('SELECT * FROM dict_types WHERE dictType = ?').get(dictType);
        if (existing) {
            return res.status(400).json({
                code: 400,
                message: 'Dict type already exists'
            });
        }
        const now = new Date().toISOString();
        const result = database_1.default.prepare('INSERT INTO dict_types (dictType, dictName, status, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)').run(dictType, dictName, status, description || null, now, now);
        res.json({
            code: 200,
            data: {
                id: result.lastInsertRowid,
                dictType,
                dictName,
                status,
                description
            },
            message: 'Dict type created successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Update dict type
router.put('/types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { dictName, status, description } = req.body;
        const now = new Date().toISOString();
        const result = database_1.default.prepare('UPDATE dict_types SET dictName = ?, status = ?, description = ?, updatedAt = ? WHERE id = ?').run(dictName, status, description, now, id);
        if (result.changes === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Dict type not found'
            });
        }
        res.json({
            code: 200,
            message: 'Dict type updated successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Delete dict type
router.delete('/types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Delete dict data first
        database_1.default.prepare('DELETE FROM dict_data WHERE dictType = (SELECT dictType FROM dict_types WHERE id = ?)').run(id);
        const result = database_1.default.prepare('DELETE FROM dict_types WHERE id = ?').run(id);
        if (result.changes === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Dict type not found'
            });
        }
        res.json({
            code: 200,
            message: 'Dict type deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Get dict data by type
router.get('/types/:type/data', async (req, res) => {
    try {
        const { type } = req.params;
        const { status } = req.query;
        let query = 'SELECT * FROM dict_data WHERE dictType = ?';
        const params = [type];
        if (status !== undefined && status !== '') {
            query += ' AND status = ?';
            params.push(Number(status));
        }
        query += ' ORDER BY sortOrder ASC, createdAt DESC';
        const dictData = database_1.default.prepare(query).all(...params);
        res.json({
            code: 200,
            data: dictData
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Get dict data list (for management)
router.get('/data', async (req, res) => {
    try {
        const { page = 1, pageSize = 10, dictType, dictLabel, status } = req.query;
        const offset = (Number(page) - 1) * Number(pageSize);
        let query = 'SELECT * FROM dict_data WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM dict_data WHERE 1=1';
        const params = [];
        if (dictType) {
            query += ' AND dictType LIKE ?';
            countQuery += ' AND dictType LIKE ?';
            params.push(`%${dictType}%`);
        }
        if (dictLabel) {
            query += ' AND dictLabel LIKE ?';
            countQuery += ' AND dictLabel LIKE ?';
            params.push(`%${dictLabel}%`);
        }
        if (status !== undefined && status !== '') {
            query += ' AND status = ?';
            countQuery += ' AND status = ?';
            params.push(Number(status));
        }
        query += ' ORDER BY sortOrder ASC, createdAt DESC LIMIT ? OFFSET ?';
        params.push(Number(pageSize), offset);
        const dictData = database_1.default.prepare(query).all(...params);
        const countResult = database_1.default.prepare(countQuery).get(...params.slice(0, params.length - 2));
        res.json({
            code: 200,
            data: {
                list: dictData,
                total: countResult.total
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
// Create dict data
router.post('/data', async (req, res) => {
    try {
        const { dictType, dictLabel, dictValue, sortOrder = 0, status = 1 } = req.body;
        if (!dictType || !dictLabel || !dictValue) {
            return res.status(400).json({
                code: 400,
                message: 'dictType, dictLabel and dictValue are required'
            });
        }
        // Check if dictType exists
        const dictTypeExists = database_1.default.prepare('SELECT * FROM dict_types WHERE dictType = ?').get(dictType);
        if (!dictTypeExists) {
            return res.status(400).json({
                code: 400,
                message: 'Dict type does not exist'
            });
        }
        const now = new Date().toISOString();
        const result = database_1.default.prepare('INSERT INTO dict_data (dictType, dictLabel, dictValue, sortOrder, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(dictType, dictLabel, dictValue, sortOrder, status, now, now);
        res.json({
            code: 200,
            data: {
                id: result.lastInsertRowid,
                dictType,
                dictLabel,
                dictValue,
                sortOrder,
                status
            },
            message: 'Dict data created successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Update dict data
router.put('/data/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { dictLabel, dictValue, sortOrder, status } = req.body;
        const now = new Date().toISOString();
        const result = database_1.default.prepare('UPDATE dict_data SET dictLabel = ?, dictValue = ?, sortOrder = ?, status = ?, updatedAt = ? WHERE id = ?').run(dictLabel, dictValue, sortOrder, status, now, id);
        if (result.changes === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Dict data not found'
            });
        }
        res.json({
            code: 200,
            message: 'Dict data updated successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Delete dict data
router.delete('/data/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = database_1.default.prepare('DELETE FROM dict_data WHERE id = ?').run(id);
        if (result.changes === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Dict data not found'
            });
        }
        res.json({
            code: 200,
            message: 'Dict data deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Public API: Get dict data by type (for dropdown selection)
router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const dictData = database_1.default.prepare('SELECT * FROM dict_data WHERE dictType = ? AND status = 1 ORDER BY sortOrder ASC').all(type);
        res.json({
            code: 200,
            data: dictData
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
//# sourceMappingURL=dict.js.map