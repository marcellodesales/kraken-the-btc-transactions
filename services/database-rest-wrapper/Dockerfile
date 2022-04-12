ARG BASE_IMAGE
FROM ${BASE_IMAGE} AS postgrest

FROM alpine as runtime

RUN apk add wget

COPY --from=postgrest /bin/postgrest /usr/local/bin

ENTRYPOINT ["/usr/local/bin/postgrest"]