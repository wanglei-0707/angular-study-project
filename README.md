# angular-study-project

## Route
### 配置
1. **path中的路径不能使用‘/’开头**，路由器会解析和构建最终的url，这样当我们在应用的多个视图之间导航时，可以任意使用相对路径和绝对路径
2. 通配符匹配(**两个星号**)：
{path: '\*\*', component: NotFoundComponent}
3. <router-outlet>位于模板中作为占位符
4. 路由器链接：
`<a routerLink="/home" routerLinkActive="active">首页</a>`
routerLinkActive指令可以帮助用户在外观上区分出当前选中的活动路由，当与它关联的RouterLink被激活时，路由器会把css类active添加到这个元素上。
5. <base href>: 位于index.html中的head标签中，只有添加的这个元素pushState才能正常工作。当引用css文件，标本和图片时，浏览器会用<base href>的值作为相对URL的前缀。
6. 在路由中传递参数：
  1. 在查询参数中传递数据：
  /product?id=1&name=2  =>  ActivatedRoute.queryParams[id]
  2. 在路由路径中传递数据：
  {path:/product/:id}   =>  /product/1   =>   ActivatedRoute.params[id]
  3. 在路由配置中传递数据：
  {path:/product, component: ProductComponent, data:[{isProd:true}]}  =>  ActivatedRoute.data[0][isProd]
7. 参数快照和参数订阅
8. 路由守卫：
  1. CanActivate:处理导航到某路由的情况
  2. CanDeactivate:处理从当前路由离开的情况
  3. Resolve：在路由激活之前获取路由数据

## 依赖注入（Dependency Injection，简称DI）
### 依赖注入解决的问题
如果对象A需要依赖对象B，A不需要明确地实例化B，B由外部机制注入进来，A只需要声明需要一个B类型的对象实例
### 控制反转（Inversion of Control，简称IOC）
### 依赖注入的好处

@Injectable()标识一个类可以被注入器实例化，建议为每个服务类都添加@Injectable()

## 生命周期
