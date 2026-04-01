"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const role_1 = __importDefault(require("./routes/role"));
const department_1 = __importDefault(require("./routes/department"));
const menu_1 = __importDefault(require("./routes/menu"));
const logs_1 = __importDefault(require("./routes/logs"));
const dict_1 = __importDefault(require("./routes/dict"));
const gallery_1 = __importDefault(require("./routes/gallery"));
const auth_2 = require("./middleware/auth");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/roles', auth_2.authenticateToken, role_1.default);
app.use('/api/departments', auth_2.authenticateToken, department_1.default);
app.use('/api/menus', auth_2.authenticateToken, menu_1.default);
app.use('/api/logs', auth_2.authenticateToken, logs_1.default);
app.use('/api/dict', auth_2.authenticateToken, dict_1.default);
app.use('/api/gallery', auth_2.authenticateToken, gallery_1.default);
// Protected route example
app.get('/api/dashboard', auth_2.authenticateToken, (req, res) => {
    res.json({
        message: 'Welcome to the dashboard!',
        user: req.user
    });
});
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map