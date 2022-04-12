FROM node:16.13.2-alpine3.14 as builder

# set /app directory as default working directory
WORKDIR /build

# only copy package.json initially so that `RUN yarn` layer is recreated only
# if there are changes in package.json
ADD package.json yarn.lock /build/

# --pure-lockfile: Don’t generate a yarn.lock lockfile
RUN yarn --pure-lockfile

# copy all file from current dir to /app in container
COPY . /build/

# Generate the dist dir with the deploy artifacts
RUN yarn build

FROM node:16.13.2-alpine3.14

WORKDIR /app

COPY --from=builder /build/dist /app/dist
COPY --from=builder /build/node_modules /app/node_modules

# expose port 4000
EXPOSE 4000

# cmd to start service
CMD [ "node", "dist/index.js"]
