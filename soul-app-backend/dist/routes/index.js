"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const moment_routes_1 = __importDefault(require("./moment.routes"));
const content_routes_1 = __importDefault(require("./content.routes"));
const social_routes_1 = __importDefault(require("./social.routes"));
const mock_routes_1 = __importDefault(require("./mock.routes"));
const router = (0, express_1.Router)();
// Core Domain Routing
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/moments', moment_routes_1.default);
// Other domains
router.use('/', content_routes_1.default); // /planet, /explore, /feed
router.use('/', social_routes_1.default); // /chat, /match, /notifications
// Feature Flag: MOCK_ROUTES_ENABLED
if (process.env.MOCK_ROUTES_ENABLED === 'true') {
    console.log('Mock routes are enabled.');
    router.use('/mock', mock_routes_1.default);
}
exports.default = router;
