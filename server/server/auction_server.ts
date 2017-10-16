import * as express from 'express';
import * as path from 'path';
import { Server } from 'ws';

const app = express();

app.use('/', express.static(path.join(__dirname, '..', 'client')));

export class Product {
  constructor(
    public id:number,
    public title:string,
    public price:number,
    public rating:number,
    public desc:string,
    public category:Array<string>
  ){}
}

export class Comment {
  constructor(
    public id:number,
    public productId:number,
    public timeStamp:string,
    public user:string,
    public rating:number,
    public content:string
  ){}
}

const products: Product[] = [
  new Product(1, "第一个商品", 1.99, 3.5, "第一个创建的商品", ["电子产品", "硬件产品"]),
  new Product(2, "第二个商品", 1.99, 4.5, "第二个创建的商品", ["电子产品"]),
  new Product(3, "第三个商品", 1.99, 2.5, "第三个创建的商品", ["电子产品", "图书"]),
  new Product(4, "第四个商品", 1.99, 4.5, "第四个创建的商品", ["硬件产品"]),
  new Product(5, "第五个商品", 1.99, 3.0, "第五个创建的商品", ["图书", "硬件产品"]),
  new Product(6, "第六个商品", 1.99, 3.0, "第六个创建的商品", ["电子产品", "硬件产品", "图书"]),
]

const comments: Comment[] = [
  new Comment(1, 1, '2017-10-10 22:22:22', '张三', 3.5, '东西不错'),
  new Comment(2, 1, '2017-10-11 22:22:22', '李四', 4, '挺好'),
  new Comment(3, 1, '2017-10-11 22:23:22', '王五', 3, '还行'),
  new Comment(4, 2, '2017-10-12 22:22:22', '赵六', 4.5, '东西不错，好用'),
]

app.get('/', (req, res) => {
  res.send("Hello Express");
})

app.get('/api/products', (req, res) => {
  let result = products;
  let {title, price, category = '-1'} = req.query;
  if (title) {
    result = result.filter((p) => p.title.indexOf(title) !== -1);
  }
  if (price && result.length > 0) {
    result = result.filter((p) => p.price <= parseInt(price));
  }
  if (category !== '-1' && result.length > 0) {
    result = result.filter((p) => p.category.indexOf(category) !== -1)
  }
  res.json(result);
})

app.get('/api/product/:id', (req, res) => {
  res.json(products.find(product => product.id == req.params.id));
})

app.get('/api/product/:id/comments', (req, res) => {
  res.json(comments.filter(comment => comment.productId == req.params.id));
})

const server = app.listen(8000, "localhost", () => {
  console.log("服务器已启动，地址是：http://localhost:8000");
});

const subscriptions = new Map<any, number[]>();

const wsServer = new Server({ port: 8085 });
wsServer.on("connect", websocket => {
  console.log('connect')
  websocket.send("这个消息是服务器主动推送的");
  websocket.on('message', message => {
    console.log('message', message);
    let messageObj = JSON.parse(message);
    let productIds = subscriptions.get(websocket) || [];
    subscriptions.set(websocket, [...productIds, messageObj.productId]);
  })
})

const currentBids = new Map<number, number>();

setInterval(() => {
  products.forEach(p => {
    let currentBid = currentBids.get(p.id) || p.price;
    let newBid = currentBid + Math.random() * 5;
    currentBids.set(p.id, newBid);
  });

  subscriptions.forEach((productIds:number[], ws) => {
    if (ws.readyState === 1) {
      let newBids = productIds.map(productId => ({
        productId: productId,
        bid: currentBids.get(productId)
      }))
      ws.send(JSON.stringify(newBids));
    } else {
      subscriptions.delete(ws);
    }
  });
}, 2000)
