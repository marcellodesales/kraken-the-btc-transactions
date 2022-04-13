ARG BASE_IMAGE
FROM ${BASE_IMAGE} AS postgrest

# Base image needed so we have wget for healthcheck implementation
FROM alpine as runtime

RUN apk add wget

COPY --from=postgrest /bin/postgrest /usr/local/bin

ENTRYPOINT ["/usr/local/bin/postgrest"]