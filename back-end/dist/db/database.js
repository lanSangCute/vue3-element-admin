"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dbPath = path_1.default.join(__dirname, '../../data/app.db');
const db = new better_sqlite3_1.default(dbPath);
// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
// Create roles table
db.exec(`
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roleCode TEXT UNIQUE NOT NULL,
    roleName TEXT NOT NULL,
    description TEXT,
    status INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
// Create role_user association table
db.exec(`
  CREATE TABLE IF NOT EXISTS role_user (
    roleId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    PRIMARY KEY (roleId, userId),
    FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`);
// Create departments table
db.exec(`
  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deptCode TEXT UNIQUE NOT NULL,
    deptName TEXT NOT NULL,
    parentId INTEGER,
    description TEXT,
    status INTEGER DEFAULT 1,
    sortOrder INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES departments(id) ON DELETE SET NULL
  )
`);
// Create menus table
db.exec(`
  CREATE TABLE IF NOT EXISTS menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parentId INTEGER,
    name TEXT NOT NULL,
    path TEXT,
    icon TEXT,
    type TEXT NOT NULL,
    permission TEXT,
    sortOrder INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES menus(id) ON DELETE SET NULL
  )
`);
// Create role_menu association table
db.exec(`
  CREATE TABLE IF NOT EXISTS role_menu (
    roleId INTEGER NOT NULL,
    menuId INTEGER NOT NULL,
    PRIMARY KEY (roleId, menuId),
    FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (menuId) REFERENCES menus(id) ON DELETE CASCADE
  )
`);
// Create sample user if not exists (password: admin123)
const hashedPassword = bcryptjs_1.default.hashSync('admin123', 10);
db.exec(`
  INSERT OR IGNORE INTO users (username, password, email) 
  VALUES ('admin', '${hashedPassword}', 'admin@example.com')
`);
// Create sample roles if not exist
db.exec(`
  INSERT OR IGNORE INTO roles (roleCode, roleName, description, status) 
  VALUES 
    ('ADMIN', '管理员', '系统管理员，拥有所有权限', 1),
    ('USER', '普通用户', '普通用户，拥有基本权限', 1),
    ('GUEST', '访客', '访客用户，只读权限', 1)
`);
// Create sample departments if not exist
db.exec(`
  INSERT OR IGNORE INTO departments (deptCode, deptName, parentId, description, status, sortOrder) 
  VALUES 
    ('HQ', '总公司', NULL, '集团总部', 1, 1),
    ('TECH', '技术部', 1, '负责技术研发', 1, 1),
    ('HR', '人力资源部', 1, '负责人力资源管理', 1, 2),
    ('FIN', '财务部', 1, '负责财务管理', 1, 3),
    ('DEV', '开发组', 2, '负责软件开发', 1, 1),
    ('TEST', '测试组', 2, '负责质量测试', 1, 2),
    ('REC', '招聘组', 3, '负责人才招聘', 1, 1)
`);
// Create sample menus if not exist
db.exec(`
  INSERT OR IGNORE INTO menus (parentId, name, path, icon, type, permission, sortOrder) 
  VALUES 
    (NULL, '系统管理', '/system', 'Setting', 'directory', 'system', 1),
    (1, '用户管理', '/users', 'User', 'menu', 'system:user:list', 1),
    (1, '角色管理', '/roles', 'UserFilled', 'menu', 'system:role:list', 2),
    (1, '部门管理', '/departments', 'OfficeBuilding', 'menu', 'system:dept:list', 3),
    (1, '菜单管理', '/menus', 'Menu', 'menu', 'system:menu:list', 4),
    (2, '用户新增', NULL, NULL, 'button', 'system:user:add', 1),
    (2, '用户编辑', NULL, NULL, 'button', 'system:user:edit', 2),
    (2, '用户删除', NULL, NULL, 'button', 'system:user:delete', 3),
    (3, '角色新增', NULL, NULL, 'button', 'system:role:add', 1),
    (3, '角色编辑', NULL, NULL, 'button', 'system:role:edit', 2),
    (3, '角色删除', NULL, NULL, 'button', 'system:role:delete', 3),
    (3, '分配权限', NULL, NULL, 'button', 'system:role:assign', 4),
    (4, '部门新增', NULL, NULL, 'button', 'system:dept:add', 1),
    (4, '部门编辑', NULL, NULL, 'button', 'system:dept:edit', 2),
    (4, '部门删除', NULL, NULL, 'button', 'system:dept:delete', 3),
    (5, '菜单新增', NULL, NULL, 'button', 'system:menu:add', 1),
    (5, '菜单编辑', NULL, NULL, 'button', 'system:menu:edit', 2),
    (5, '菜单删除', NULL, NULL, 'button', 'system:menu:delete', 3)
`);
// Create operation_logs table
db.exec(`
  CREATE TABLE IF NOT EXISTS operation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    username TEXT NOT NULL,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    ip TEXT,
    userAgent TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
// Create login_logs table
db.exec(`
  CREATE TABLE IF NOT EXISTS login_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    username TEXT NOT NULL,
    ip TEXT,
    userAgent TEXT,
    status TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
// Create dict_types table
db.exec(`
  CREATE TABLE IF NOT EXISTS dict_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dictType TEXT UNIQUE NOT NULL,
    dictName TEXT NOT NULL,
    status INTEGER DEFAULT 1,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
// Create dict_data table
db.exec(`
  CREATE TABLE IF NOT EXISTS dict_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dictType TEXT NOT NULL,
    dictLabel TEXT NOT NULL,
    dictValue TEXT NOT NULL,
    sortOrder INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dictType) REFERENCES dict_types(dictType) ON DELETE CASCADE
  )
`);
// Create gallery_categories table
db.exec(`
  CREATE TABLE IF NOT EXISTS gallery_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parentId INTEGER,
    sortOrder INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES gallery_categories(id) ON DELETE SET NULL
  )
`);
// Create gallery_images table
db.exec(`
  CREATE TABLE IF NOT EXISTS gallery_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryId INTEGER,
    filename TEXT NOT NULL,
    originalName TEXT NOT NULL,
    path TEXT NOT NULL,
    size INTEGER,
    mimeType TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES gallery_categories(id) ON DELETE SET NULL
  )
`);
// Create sample dict types
db.exec(`
  INSERT OR IGNORE INTO dict_types (dictType, dictName, status, description) 
  VALUES 
    ('user_sex', '用户性别', 1, '用户性别字典'),
    ('user_status', '用户状态', 1, '用户状态字典'),
    ('yes_no', '是否', 1, '是否选择字典'),
    ('notice_type', '通知类型', 1, '系统通知类型字典')
`);
// Create sample dict data
db.exec(`
  INSERT OR IGNORE INTO dict_data (dictType, dictLabel, dictValue, sortOrder, status) 
  VALUES 
    ('user_sex', '男', '1', 1, 1),
    ('user_sex', '女', '2', 2, 1),
    ('user_sex', '未知', '0', 0, 1),
    ('user_status', '正常', '1', 1, 1),
    ('user_status', '禁用', '0', 2, 1),
    ('yes_no', '是', '1', 1, 1),
    ('yes_no', '否', '0', 2, 1),
    ('notice_type', '通知', '1', 1, 1),
    ('notice_type', '公告', '2', 2, 1),
    ('notice_type', '警告', '3', 3, 1)
`);
// Create sample gallery categories
db.exec(`
  INSERT OR IGNORE INTO gallery_categories (name, parentId, sortOrder) 
  VALUES 
    ('默认分类', NULL, 1),
    ('系统图片', 1, 1),
    ('用户头像', 1, 2),
    ('产品图片', NULL, 2),
    ('Banner 图', 4, 1),
    ('缩略图', 4, 2)
`);
exports.default = db;
//# sourceMappingURL=database.js.map