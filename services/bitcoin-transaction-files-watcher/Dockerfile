##
# Copyright ©️ Marcello DeSales - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential for the purpose of Interview with Kraken's Engineering.
# Written by Marcello DeSales <marcello.desales@gmail.com>, April 2022.
##

ARG BASE_IMAGE

FROM ${BASE_IMAGE} as builder

# set /app directory as default working directory
WORKDIR /build

# only copy package.json initially so that `RUN yarn` layer is recreated only
# if there are changes in package.json
ADD package.json yarn.lock /build/

# --pure-lockfile: Don’t generate a yarn.lock lockfile
RUN yarn --pure-lockfile

# copy all file from current dir to /app in container
COPY . /build/

FROM ${BASE_IMAGE}

WORKDIR /app

COPY --from=builder /build/node_modules /app/node_modules

COPY . .

# cmd to start service
CMD [ "node", "/app/service.js"]
