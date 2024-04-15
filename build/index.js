"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json()); //middleware that transforms req.body in format json
const PORT = 3000;
app.get('/', (_req, res) => {
    console.log('Here goes the PING');
    res.send('PONG');
});
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});
