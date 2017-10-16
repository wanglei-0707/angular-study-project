"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var ws_1 = require("ws");
var app = express();
app.use('/', express.static(path.join(__dirname, '..', 'client')));
var Product = (function () {
    function Product(id, title, price, rating, desc, category) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.rating = rating;
        this.desc = desc;
        this.category = category;
    }
    return Product;
}());
exports.Product = Product;
var Comment = (function () {
    function Comment(id, productId, timeStamp, user, rating, content) {
        this.id = id;
        this.productId = productId;
        this.timeStamp = timeStamp;
        this.user = user;
        this.rating = rating;
        this.content = content;
    }
    return Comment;
}());
exports.Comment = Comment;
var products = [
    new Product(1, "第一个商品", 1.99, 3.5, "第一个创建的商品", ["电子产品", "硬件产品"]),
    new Product(2, "第二个商品", 1.99, 4.5, "第二个创建的商品", ["电子产品"]),
    new Product(3, "第三个商品", 1.99, 2.5, "第三个创建的商品", ["电子产品", "图书"]),
    new Product(4, "第四个商品", 1.99, 4.5, "第四个创建的商品", ["硬件产品"]),
    new Product(5, "第五个商品", 1.99, 3.0, "第五个创建的商品", ["图书", "硬件产品"]),
    new Product(6, "第六个商品", 1.99, 3.0, "第六个创建的商品", ["电子产品", "硬件产品", "图书"]),
];
var comments = [
    new Comment(1, 1, '2017-10-10 22:22:22', '张三', 3.5, '东西不错'),
    new Comment(2, 1, '2017-10-11 22:22:22', '李四', 4, '挺好'),
    new Comment(3, 1, '2017-10-11 22:23:22', '王五', 3, '还行'),
    new Comment(4, 2, '2017-10-12 22:22:22', '赵六', 4.5, '东西不错，好用'),
];
app.get('/', function (req, res) {
    res.send("Hello Express");
});
app.get('/api/products', function (req, res) {
    var result = products;
    var _a = req.query, title = _a.title, price = _a.price, _b = _a.category, category = _b === void 0 ? '-1' : _b;
    if (title) {
        result = result.filter(function (p) { return p.title.indexOf(title) !== -1; });
    }
    if (price && result.length > 0) {
        result = result.filter(function (p) { return p.price <= parseInt(price); });
    }
    if (category !== '-1' && result.length > 0) {
        result = result.filter(function (p) { return p.category.indexOf(category) !== -1; });
    }
    res.json(result);
});
app.get('/api/product/:id', function (req, res) {
    res.json(products.find(function (product) { return product.id == req.params.id; }));
});
app.get('/api/product/:id/comments', function (req, res) {
    res.json(comments.filter(function (comment) { return comment.productId == req.params.id; }));
});
var server = app.listen(8000, "localhost", function () {
    console.log("服务器已启动，地址是：http://localhost:8000");
});
var subscriptions = new Map();
var wsServer = new ws_1.Server({ port: 8085 });
wsServer.on("connect", function (websocket) {
    console.log('connect');
    websocket.send("这个消息是服务器主动推送的");
    websocket.on('message', function (message) {
        console.log('message', message);
        var messageObj = JSON.parse(message);
        var productIds = subscriptions.get(websocket) || [];
        subscriptions.set(websocket, productIds.concat([messageObj.productId]));
    });
});
var currentBids = new Map();
setInterval(function () {
    products.forEach(function (p) {
        var currentBid = currentBids.get(p.id) || p.price;
        var newBid = currentBid + Math.random() * 5;
        currentBids.set(p.id, newBid);
    });
    subscriptions.forEach(function (productIds, ws) {
        if (ws.readyState === 1) {
            var newBids = productIds.map(function (productId) { return ({
                productId: productId,
                bid: currentBids.get(productId)
            }); });
            ws.send(JSON.stringify(newBids));
        }
        else {
            subscriptions.delete(ws);
        }
    });
}, 2000);
