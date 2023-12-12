
# FC API
## 代理平台地址：https://sell.fcpublic.com
## open ai/midjourney 全系列模型招代理 价格可谈 量大有优惠

> **Note**
> 本项目为开源项目，在[One API](https://github.com/songquanpeng/one-api)的基础上进行二次开发，感谢原作者的无私奉献。 
> 使用者必须在遵循 OpenAI 的[使用条款](https://openai.com/policies/terms-of-use)以及**法律法规**的情况下使用，不得用于非法用途。


> **Warning**
> 本项目为个人学习使用，不保证稳定性，且不提供任何技术支持，使用者必须在遵循 OpenAI 的使用条款以及法律法规的情况下使用，不得用于非法用途。  
> 根据[《生成式人工智能服务管理暂行办法》](http://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm)的要求，请勿对中国地区公众提供一切未经备案的生成式人工智能服务。

> **Note**
> 最新版Docker镜像 添加微信获取 (持续更新中....)

## 此分叉版本的主要变更
1. 全新的UI界面（部分界面还待更新）
2. 添加[Midjourney-Proxy](https://github.com/novicezk/midjourney-proxy)接口的支持：
    + [x] /mj/submit/imagine
    + [x] /mj/submit/action (绘图之后所有的操作都是通过这个链接)
    + [x] /mj/submit/modal (部分action需要调用这个链接去做二次确认)
    + [x] /mj/submit/blend (多图合并)
    + [x] /mj/submit/describe
    + [x] /mj/image/{id} （通过此接口获取图片，**请必须在系统设置中填写服务器地址！！**）
    + [x] /mj/task/{id}/fetch （此接口返回的图片地址为经过One API转发的地址）
3. 支持在线充值功能，可在系统设置中设置，当前支持的支付接口：
    + [x] 易支付
4. 渠道显示已使用额度，支持指定组织访问
5. 分页支持选择每页显示数量
6. 支持gpt-4-1106-vision-preview，dall-e-3，tts-1

## 联系微信
<img src="https://ai-1257122692.cos.accelerate.myqcloud.com/common/541702083204_.pic.jpg" style="width: 160px;height: 160px;" alt="联系微信">

## 界面截图
![image](https://ai-1257122692.cos.accelerate.myqcloud.com/common/WX20231212-121341%402x.png)

![image](https://ai-1257122692.cos.accelerate.myqcloud.com/common/WX20231212-121409%402x.png)  
![image](https://ai-1257122692.cos.accelerate.myqcloud.com/common/WX20231212-121429%402x.png)  
![image](https://ai-1257122692.cos.accelerate.myqcloud.com/common/WX20231212-121450%402x.png)

## 部署
### 基于 Docker 进行部署
```shell
# 使用 SQLite 的部署命令：
docker run --name one-api -d --restart always -p 3000:3000 -e TZ=Asia/Shanghai -v /home/ubuntu/data/one-api:/data yuzf340/one-api-fc:v1
# 使用 MySQL 的部署命令，在上面的基础上添加 `-e SQL_DSN="root:123456@tcp(localhost:3306)/oneapi"`，请自行修改数据库连接参数，不清楚如何修改请参见下面环境变量一节。
# 例如：
docker run --name one-api -d --restart always -p 3000:3000 -e SQL_DSN="root:123456@tcp(localhost:3306)/oneapi" -e TZ=Asia/Shanghai -v /home/ubuntu/data/one-api:/data yuzf340/one-api-fc:v1
```

其中，`-p 3000:3000` 中的第一个 `3000` 是宿主机的端口，可以根据需要进行修改。

数据和日志将会保存在宿主机的 `/home/ubuntu/data/one-api` 目录，请确保该目录存在且具有写入权限，或者更改为合适的目录。

如果启动失败，请添加 `--privileged=true`，具体参考 https://github.com/songquanpeng/one-api/issues/482 。

如果上面的镜像无法拉取，可以尝试使用 GitHub 的 Docker 镜像，将上面的 `justsong/one-api` 替换为 `ghcr.io/songquanpeng/one-api` 即可。

如果你的并发量较大，**务必**设置 `SQL_DSN`，详见下面[环境变量](#环境变量)一节。

更新命令：`docker run --rm -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower -cR`

Nginx 的参考配置：
```
server{
   server_name openai.justsong.cn;  # 请根据实际情况修改你的域名
   
   location / {
          client_max_body_size  64m;
          proxy_http_version 1.1;
          proxy_pass http://localhost:3000;  # 请根据实际情况修改你的端口
          proxy_set_header Host $host;
          proxy_set_header X-Forwarded-For $remote_addr;
          proxy_cache_bypass $http_upgrade;
          proxy_set_header Accept-Encoding gzip;
          proxy_read_timeout 300s;  # GPT-4 需要较长的超时时间，请自行调整
   }
}
```

之后使用 Let's Encrypt 的 certbot 配置 HTTPS：
```bash
# Ubuntu 安装 certbot：
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
# 生成证书 & 修改 Nginx 配置
sudo certbot --nginx
# 根据指示进行操作
# 重启 Nginx
sudo service nginx restart
```

初始账号用户名为 `root`，密码为 `123456`。


### 基于 Docker Compose 进行部署

> 仅启动方式不同，参数设置不变，请参考基于 Docker 部署部分

```shell
# 目前支持 MySQL 启动，数据存储在 ./data/mysql 文件夹内
docker-compose up -d

# 查看部署状态
docker-compose ps
```

### 手动部署
1. 从 [GitHub Releases](https://github.com/yuzf-single/fc-one-api?tab=readme-ov-file) 下载可执行文件或者从源码编译：
   ```shell
   git clone https://github.com/yuzf-single/fc-one-api.git
   
   # 构建前端
   cd one-api/web
   npm install
   npm run build
   
   # 构建后端
   cd ..
   go mod download
   go build -ldflags "-s -w" -o one-api
   ````
2. 运行：
   ```shell
   chmod u+x one-api
   ./one-api --port 3000 --log-dir ./logs
   ```
3. 访问 [http://localhost:3000/](http://localhost:3000/) 并登录。初始账号用户名为 `root`，密码为 `123456`。 。

### 多机部署
1. 所有服务器 `SESSION_SECRET` 设置一样的值。
2. 必须设置 `SQL_DSN`，使用 MySQL 数据库而非 SQLite，所有服务器连接同一个数据库。
3. 所有从服务器必须设置 `NODE_TYPE` 为 `slave`，不设置则默认为主服务器。
4. 设置 `SYNC_FREQUENCY` 后服务器将定期从数据库同步配置，在使用远程数据库的情况下，推荐设置该项并启用 Redis，无论主从。
5. 从服务器可以选择设置 `FRONTEND_BASE_URL`，以重定向页面请求到主服务器。
6. 从服务器上**分别**装好 Redis，设置好 `REDIS_CONN_STRING`，这样可以做到在缓存未过期的情况下数据库零访问，可以减少延迟。
7. 如果主服务器访问数据库延迟也比较高，则也需要启用 Redis，并设置 `SYNC_FREQUENCY`，以定期从数据库同步配置。

环境变量的具体使用方法详见[此处](#环境变量)。

### 宝塔部署教程

详见 [#175](https://github.com/songquanpeng/one-api/issues/175)。

如果部署后访问出现空白页面，详见 [#97](https://github.com/songquanpeng/one-api/issues/97)。

## 配置
系统本身开箱即用。

你可以通过设置环境变量或者命令行参数进行配置。

等到系统启动后，使用 `root` 用户登录系统并做进一步的配置。

**Note**：如果你不知道某个配置项的含义，可以临时删掉值以看到进一步的提示文字。

## 使用方法
在`渠道`页面中添加你的 API Key，之后在`令牌`页面中新增访问令牌。

之后就可以使用你的令牌访问 One API 了，使用方式与 [OpenAI API](https://platform.openai.com/docs/api-reference/introduction) 一致。

你需要在各种用到 OpenAI API 的地方设置 API Base 为你的 One API 的部署地址，例如：`https://sell.fcpublic.com`，API Key 则为你在 One API 中生成的令牌。

注意，具体的 API Base 的格式取决于你所使用的客户端。

例如对于 OpenAI 的官方库：
```bash
OPENAI_API_KEY="sk-xxxxxx"
OPENAI_API_BASE="https://<HOST>:<PORT>/v1" 
```

```mermaid
graph LR
    A(用户)
    A --->|使用 One API 分发的 key 进行请求| B(One API)
    B -->|中继请求| C(OpenAI)
    B -->|中继请求| D(Azure)
    B -->|中继请求| E(其他 OpenAI API 格式下游渠道)
    B -->|中继并修改请求体和返回体| F(非 OpenAI API 格式下游渠道)
```

可以通过在令牌后面添加渠道 ID 的方式指定使用哪一个渠道处理本次请求，例如：`Authorization: Bearer ONE_API_KEY-CHANNEL_ID`。
注意，需要是管理员用户创建的令牌才能指定渠道 ID。

不加的话将会使用负载均衡的方式使用多个渠道。

### 环境变量
1. `REDIS_CONN_STRING`：设置之后将使用 Redis 作为缓存使用。
   + 例子：`REDIS_CONN_STRING=redis://default:redispw@localhost:49153`
   + 如果数据库访问延迟很低，没有必要启用 Redis，启用后反而会出现数据滞后的问题。
2. `SESSION_SECRET`：设置之后将使用固定的会话密钥，这样系统重新启动后已登录用户的 cookie 将依旧有效。
   + 例子：`SESSION_SECRET=random_string`
3. `SQL_DSN`：设置之后将使用指定数据库而非 SQLite，请使用 MySQL 或 PostgreSQL。
   + 例子：
      + MySQL：`SQL_DSN=root:123456@tcp(localhost:3306)/oneapi`
      + PostgreSQL：`SQL_DSN=postgres://postgres:123456@localhost:5432/oneapi`（适配中，欢迎反馈）
   + 注意需要提前建立数据库 `oneapi`，无需手动建表，程序将自动建表。
   + 如果使用本地数据库：部署命令可添加 `--network="host"` 以使得容器内的程序可以访问到宿主机上的 MySQL。
   + 如果使用云数据库：如果云服务器需要验证身份，需要在连接参数中添加 `?tls=skip-verify`。
   + 请根据你的数据库配置修改下列参数（或者保持默认值）：
      + `SQL_MAX_IDLE_CONNS`：最大空闲连接数，默认为 `100`。
      + `SQL_MAX_OPEN_CONNS`：最大打开连接数，默认为 `1000`。
         + 如果报错 `Error 1040: Too many connections`，请适当减小该值。
      + `SQL_CONN_MAX_LIFETIME`：连接的最大生命周期，默认为 `60`，单位分钟。
4. `FRONTEND_BASE_URL`：设置之后将重定向页面请求到指定的地址，仅限从服务器设置。
   + 例子：`FRONTEND_BASE_URL=https://sell.fcpublic.com`
5. `MEMORY_CACHE_ENABLED`：启用内存缓存，会导致用户额度的更新存在一定的延迟，可选值为 `true` 和 `false`，未设置则默认为 `false`。
   + 例子：`MEMORY_CACHE_ENABLED=true`
6. `SYNC_FREQUENCY`：在启用缓存的情况下与数据库同步配置的频率，单位为秒，默认为 `600` 秒。
   + 例子：`SYNC_FREQUENCY=60`
7. `NODE_TYPE`：设置之后将指定节点类型，可选值为 `master` 和 `slave`，未设置则默认为 `master`。
   + 例子：`NODE_TYPE=slave`
8. `CHANNEL_UPDATE_FREQUENCY`：设置之后将定期更新渠道余额，单位为分钟，未设置则不进行更新。
   + 例子：`CHANNEL_UPDATE_FREQUENCY=1440`
9. `CHANNEL_TEST_FREQUENCY`：设置之后将定期检查渠道，单位为分钟，未设置则不进行检查。
   + 例子：`CHANNEL_TEST_FREQUENCY=1440`
10. `POLLING_INTERVAL`：批量更新渠道余额以及测试可用性时的请求间隔，单位为秒，默认无间隔。
   + 例子：`POLLING_INTERVAL=5`
11. `BATCH_UPDATE_ENABLED`：启用数据库批量更新聚合，会导致用户额度的更新存在一定的延迟可选值为 `true` 和 `false`，未设置则默认为 `false`。
   + 例子：`BATCH_UPDATE_ENABLED=true`
   + 如果你遇到了数据库连接数过多的问题，可以尝试启用该选项。
12. `BATCH_UPDATE_INTERVAL=5`：批量更新聚合的时间间隔，单位为秒，默认为 `5`。
   + 例子：`BATCH_UPDATE_INTERVAL=5`
13. 请求频率限制：
   + `GLOBAL_API_RATE_LIMIT`：全局 API 速率限制（除中继请求外），单 ip 三分钟内的最大请求数，默认为 `180`。
   + `GLOBAL_WEB_RATE_LIMIT`：全局 Web 速率限制，单 ip 三分钟内的最大请求数，默认为 `60`。
14. 编码器缓存设置：
   + `TIKTOKEN_CACHE_DIR`：默认程序启动时会联网下载一些通用的词元的编码，如：`gpt-3.5-turbo`，在一些网络环境不稳定，或者离线情况，可能会导致启动有问题，可以配置此目录缓存数据，可迁移到离线环境。
   + `DATA_GYM_CACHE_DIR`：目前该配置作用与 `TIKTOKEN_CACHE_DIR` 一致，但是优先级没有它高。
15. `RELAY_TIMEOUT`：中继超时设置，单位为秒，默认不设置超时时间。

### 命令行参数
1. `--port <port_number>`: 指定服务器监听的端口号，默认为 `3000`。
   + 例子：`--port 3000`
2. `--log-dir <log_dir>`: 指定日志文件夹，如果没有设置，默认保存至工作目录的 `logs` 文件夹下。
   + 例子：`--log-dir ./logs`
3. `--version`: 打印系统版本号并退出。
4. `--help`: 查看命令的使用帮助和参数说明。

## 常见问题
1. 额度是什么？怎么计算的？One API 的额度计算有问题？
   + 额度 = 分组倍率 * 模型倍率 * （提示 token 数 + 补全 token 数 * 补全倍率）
   + 其中补全倍率对于 GPT3.5 固定为 1.33，GPT4 为 2，与官方保持一致。
   + 如果是非流模式，官方接口会返回消耗的总 token，但是你要注意提示和补全的消耗倍率不一样。
   + 注意，One API 的默认倍率就是官方倍率，是已经调整过的。
2. 账户额度足够为什么提示额度不足？
   + 请检查你的令牌额度是否足够，这个和账户额度是分开的。
   + 令牌额度仅供用户设置最大使用量，用户可自由设置。
3. 提示无可用渠道？
   + 请检查的用户分组和渠道分组设置。
   + 以及渠道的模型设置。
4. 渠道测试报错：`invalid character '<' looking for beginning of value`
   + 这是因为返回值不是合法的 JSON，而是一个 HTML 页面。
   + 大概率是你的部署站的 IP 或代理的节点被 CloudFlare 封禁了。
5. ChatGPT Next Web 报错：`Failed to fetch`
   + 部署的时候不要设置 `BASE_URL`。
   + 检查你的接口地址和 API Key 有没有填对。
   + 检查是否启用了 HTTPS，浏览器会拦截 HTTPS 域名下的 HTTP 请求。
6. 报错：`当前分组负载已饱和，请稍后再试`
   + 上游通道 429 了。
7. 升级之后我的数据会丢失吗？
   + 如果使用 MySQL，不会。
   + 如果使用 SQLite，需要按照我所给的部署命令挂载 volume 持久化 one-api.db 数据库文件，否则容器重启后数据会丢失。
8. 升级之前数据库需要做变更吗？
   + 一般情况下不需要，系统将在初始化的时候自动调整。
   + 如果需要的话，我会在更新日志中说明，并给出脚本。

## 相关项目
* [FastGPT](https://github.com/labring/FastGPT): 基于 LLM 大语言模型的知识库问答系统
* [ChatGPT Next Web](https://github.com/Yidadaa/ChatGPT-Next-Web):  一键拥有你自己的跨平台 ChatGPT 应用

## 注意

本项目使用 MIT 协议进行开源，**在此基础上**，必须在页面底部保留署名以及指向本项目的链接。如果不想保留署名，必须首先获得授权。

同样适用于基于本项目的二开项目。

依据 MIT 协议，使用者需自行承担使用本项目的风险与责任，本开源项目开发者与此无关。



