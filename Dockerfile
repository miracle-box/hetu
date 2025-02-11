# 第一阶段：构建阶段
FROM oven/bun:1 AS build

# 设置环境变量（让 Bun 可执行）
#ENV PATH="/root/.bun/bin:$PATH"

# 设置工作目录
WORKDIR /app

# 复制项目代码到容器
COPY apps/backend .

ENV NODE_ENV=production
RUN bun install

# 安装项目依赖（包括 sharp）
RUN bun build \
   	--compile \
   	--minify-whitespace \
   	--minify-syntax \
   	--target bun \
   	--outfile server \
   	./src/index.ts
# 第二阶段：精简运行时环境

FROM gcr.io/distroless/base

#RUN apk add --no-cache curl bash libstdc++ libgcc vips vips-dev

# 设置工作目录
WORKDIR /app

# 从第一阶段复制构建产物
COPY --from=build /app/server /app/

# 设置 Bun 作为默认运行时
#ENTRYPOINT ["bun"]
ENV NODE_ENV=production

# 默认启动命令
CMD ["/app/server"]

EXPOSE 3000
