##
# Copyright ©️ Marcello DeSales - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential for the purpose of Interview with Kraken's Engineering.
# Written by Marcello DeSales <marcello.desales@gmail.com>, April 2022.
##

ARG BASE_IMAGE
FROM ${BASE_IMAGE} AS postgrest

# Base image needed so we have wget for healthcheck implementation
FROM alpine as runtime

RUN apk add wget

COPY --from=postgrest /bin/postgrest /usr/local/bin

ENTRYPOINT ["/usr/local/bin/postgrest"]