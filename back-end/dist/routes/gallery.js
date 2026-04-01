"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../db/database"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/gallery');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// Get gallery categories list
router.get('/categories', async (req, res) => {
    try {
        const { parentId } = req.query;
        let query = 'SELECT * FROM gallery_categories WHERE 1=1';
        if (parentId !== undefined && parentId !== '') {
            if (parentId === 'null') {
                query += ' AND parentId IS NULL';
            }
            else {
                query += ' AND parentId = ?';
            }
        }
        query += ' ORDER BY sortOrder ASC, createdAt DESC';
        const categories = database_1.default.prepare(query).all(parentId !== undefined && parentId !== '' && parentId !== 'null' ? Number(parentId) : undefined);
        // Build tree structure
        const buildTree = (parentId) => {
            return categories
                .filter((cat) => cat.parentId === parentId)
                .map((cat) => ({
                ...cat,
                children: buildTree(cat.id)
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
// Create category
router.post('/categories', async (req, res) => {
    try {
        const { name, parentId, sortOrder = 0 } = req.body;
        if (!name) {
            return res.status(400).json({
                code: 400,
                message: 'name is required'
            });
        }
        const now = new Date().toISOString();
        const result = database_1.default.prepare('INSERT INTO gallery_categories (name, parentId, sortOrder, createdAt) VALUES (?, ?, ?, ?)').run(name, parentId || null, sortOrder, now);
        res.json({
            code: 200,
            data: {
                id: result.lastInsertRowid,
                name,
                parentId,
                sortOrder
            },
            message: 'Category created successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Update category
router.put('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parentId, sortOrder } = req.body;
        const now = new Date().toISOString();
        const result = database_1.default.prepare('UPDATE gallery_categories SET name = ?, parentId = ?, sortOrder = ? WHERE id = ?').run(name, parentId || null, sortOrder, id);
        if (result.changes === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Category not found'
            });
        }
        res.json({
            code: 200,
            message: 'Category updated successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Delete category
router.delete('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Check if category has children
        const children = database_1.default.prepare('SELECT * FROM gallery_categories WHERE parentId = ?').get(id);
        if (children) {
            return res.status(400).json({
                code: 400,
                message: 'Cannot delete category with child categories'
            });
        }
        // Check if category has images
        const images = database_1.default.prepare('SELECT * FROM gallery_images WHERE categoryId = ?').get(id);
        if (images) {
            return res.status(400).json({
                code: 400,
                message: 'Cannot delete category with images'
            });
        }
        const result = database_1.default.prepare('DELETE FROM gallery_categories WHERE id = ?').run(id);
        if (result.changes === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Category not found'
            });
        }
        res.json({
            code: 200,
            message: 'Category deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Get images list
router.get('/images', async (req, res) => {
    try {
        const { page = 1, pageSize = 20, categoryId, keyword } = req.query;
        const offset = (Number(page) - 1) * Number(pageSize);
        let query = `
      SELECT gi.*, gc.name as categoryName 
      FROM gallery_images gi 
      LEFT JOIN gallery_categories gc ON gi.categoryId = gc.id 
      WHERE 1=1
    `;
        let countQuery = `
      SELECT COUNT(*) as total 
      FROM gallery_images gi 
      LEFT JOIN gallery_categories gc ON gi.categoryId = gc.id 
      WHERE 1=1
    `;
        const params = [];
        if (categoryId) {
            query += ' AND gi.categoryId = ?';
            countQuery += ' AND gi.categoryId = ?';
            params.push(Number(categoryId));
        }
        if (keyword) {
            query += ' AND (gi.originalName LIKE ? OR gi.filename LIKE ?)';
            countQuery += ' AND (gi.originalName LIKE ? OR gi.filename LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }
        query += ' ORDER BY gi.createdAt DESC LIMIT ? OFFSET ?';
        params.push(Number(pageSize), offset);
        const images = database_1.default.prepare(query).all(...params);
        const countResult = database_1.default.prepare(countQuery).get(...params.slice(0, params.length - 2));
        res.json({
            code: 200,
            data: {
                list: images,
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
// Upload images
router.post('/upload', upload.array('files', 10), async (req, res) => {
    try {
        const { categoryId } = req.body;
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                code: 400,
                message: 'No files uploaded'
            });
        }
        if (!categoryId) {
            return res.status(400).json({
                code: 400,
                message: 'categoryId is required'
            });
        }
        const files = req.files;
        const now = new Date().toISOString();
        const insertedIds = [];
        const insertStmt = database_1.default.prepare('INSERT INTO gallery_images (categoryId, filename, originalName, path, size, mimeType, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
        const insertMany = database_1.default.transaction((items) => {
            for (const item of items) {
                const result = insertStmt.run(item.categoryId, item.filename, item.originalName, item.path, item.size, item.mimeType, now);
                insertedIds.push(Number(result.lastInsertRowid));
            }
        });
        const items = files.map(file => ({
            categoryId: Number(categoryId),
            filename: file.filename,
            originalName: file.originalname,
            path: `/uploads/gallery/${file.filename}`,
            size: file.size,
            mimeType: file.mimetype
        }));
        insertMany(items);
        res.json({
            code: 200,
            data: {
                ids: insertedIds,
                count: insertedIds.length
            },
            message: 'Images uploaded successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});
// Delete image
router.delete('/images/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Get image info
        const image = database_1.default.prepare('SELECT * FROM gallery_images WHERE id = ?').get(id);
        if (!image) {
            return res.status(404).json({
                code: 404,
                message: 'Image not found'
            });
        }
        // Delete file from disk
        const filePath = path_1.default.join(__dirname, '../../', image.path);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        // Delete from database
        const result = database_1.default.prepare('DELETE FROM gallery_images WHERE id = ?').run(id);
        if (result.changes === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Image not found'
            });
        }
        res.json({
            code: 200,
            message: 'Image deleted successfully'
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
//# sourceMappingURL=gallery.js.map