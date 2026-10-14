FROM node:22-alpine
WORKDIR /app
COPY staging/jessie-qa/public /app/public
COPY staging/jessie-qa/qa-server.mjs /app/server.mjs
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","/app/server.mjs"]
