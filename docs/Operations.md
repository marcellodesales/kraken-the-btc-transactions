> This document contains information how to operation this app.

# Build the microservices

* We have a couple of services running
* We have our own service for orchestrating data collection that requires building

```console
☁️  aws-cli@2.2.32 🔖 aws-iam-authenticator@0.5.3 
☸️  kubectl@1.22.5 📛 kustomize@v4.4.0 🎡 helm@3.7.0 👽 argocd@2.2.0 🤹 argocd@3.2.8 ✈️  glooctl@1.9.0  🐙 docker-compose@1.29.2
👤 AWS_PS1_PROFILE 🗂️  806101772216 🌎 sa-east-1 
🏗  1.21.5-eks-bc4871b 🔐 arn:aws:eks:sa-east-1:806101772216:cluster/eks-ppd-prdt-super-cash 🍱 default 
~/dev/github.com/marcellodesales/kraken-the-btc-transactions on  feature/add-support-load-transactions-data-from-listsinceblock! 📅 04-12-2022 ⌚22:54:41
$ docker-compose build
postgres uses an image, skipping
Building postgREST
[+] Building 0.1s (9/9) FINISHED                                                                                                                                                                                                                                                                                                                              
 => [internal] load build definition from Dockerfile                                                                                                                                                                                                                                                                                                     0.0s
 => => transferring dockerfile: 37B                                                                                                                                                                                                                                                                                                                      0.0s
 => [internal] load .dockerignore                                                                                                                                                                                                                                                                                                                        0.0s
 => => transferring context: 2B                                                                                                                                                                                                                                                                                                                          0.0s
 => [internal] load metadata for docker.io/library/alpine:latest                                                                                                                                                                                                                                                                                         0.0s
 => [internal] load metadata for docker.io/postgrest/postgrest:v9.0.0.20220211                                                                                                                                                                                                                                                                           0.0s
 => [runtime 1/3] FROM docker.io/library/alpine                                                                                                                                                                                                                                                                                                          0.0s
 => [postgrest 1/1] FROM docker.io/postgrest/postgrest:v9.0.0.20220211                                                                                                                                                                                                                                                                                   0.0s
 => CACHED [runtime 2/3] RUN apk add wget                                                                                                                                                                                                                                                                                                                0.0s
 => CACHED [runtime 3/3] COPY --from=postgrest /bin/postgrest /usr/local/bin                                                                                                                                                                                                                                                                             0.0s
 => exporting to image                                                                                                                                                                                                                                                                                                                                   0.0s
 => => exporting layers                                                                                                                                                                                                                                                                                                                                  0.0s
 => => writing image sha256:0a3b92e62ae3936e99562ebb44ce9a8867435b22932e051c407ab59244104280                                                                                                                                                                                                                                                             0.0s
 => => naming to docker.io/marcellodesales/kraken-blockchain-postgres-rest-wrapper                                                                                                                                                                                                                                                                       0.0s
Building bitcoin-transactions-data-watcher
[+] Building 1.2s (13/13) FINISHED                                                                                                                                                                                                                                                                                                                            
 => [internal] load build definition from Dockerfile                                                                                                                                                                                                                                                                                                     0.0s
 => => transferring dockerfile: 622B                                                                                                                                                                                                                                                                                                                     0.0s
 => [internal] load .dockerignore                                                                                                                                                                                                                                                                                                                        0.0s
 => => transferring context: 34B                                                                                                                                                                                                                                                                                                                         0.0s
 => [internal] load metadata for docker.io/library/node:16.13.2-alpine3.14                                                                                                                                                                                                                                                                               1.0s
 => [builder 1/5] FROM docker.io/library/node:16.13.2-alpine3.14@sha256:d5ff6716e21e03983f8522b6e84f15f50a56e183085553e96d2801fc45dc3c74                                                                                                                                                                                                                 0.0s
 => [internal] load build context                                                                                                                                                                                                                                                                                                                        0.0s
 => => transferring context: 956B                                                                                                                                                                                                                                                                                                                        0.0s
 => CACHED [builder 2/5] WORKDIR /build                                                                                                                                                                                                                                                                                                                  0.0s
 => CACHED [builder 3/5] ADD package.json yarn.lock /build/                                                                                                                                                                                                                                                                                              0.0s
 => CACHED [builder 4/5] RUN yarn --pure-lockfile                                                                                                                                                                                                                                                                                                        0.0s
 => CACHED [builder 5/5] COPY . /build/                                                                                                                                                                                                                                                                                                                  0.0s
 => CACHED [stage-1 2/4] WORKDIR /app                                                                                                                                                                                                                                                                                                                    0.0s
 => CACHED [stage-1 3/4] COPY --from=builder /build/node_modules /app/node_modules                                                                                                                                                                                                                                                                       0.0s
 => [stage-1 4/4] COPY . .                                                                                                                                                                                                                                                                                                                               0.0s
 => exporting to image                                                                                                                                                                                                                                                                                                                                   0.0s
 => => exporting layers                                                                                                                                                                                                                                                                                                                                  0.0s
 => => writing image sha256:b78026ff06f8afaa659ddd4d7d95c3175fbf58a4aaad394cb16c13d4db69b315                                                                                                                                                                                                                                                             0.0s
 => => naming to docker.io/marcellodesales/kraken-blockchain-transactions-data-watcher                                                                                                                                                                                                                                                                   0.0s
```

# Start the containers

* Starts all containers

> If you have changed `Dockerfile`, make sure to rebuild as discussed above.

```console
docker-compose up -d
```

# Verify healthcheck

```console
docker-compose ps
```

# Troubleshooting

## Healthcheck Not working

* Make sure to verify the root causes
  * File-based healthchecks: https://stackoverflow.com/questions/40082346/how-to-check-if-a-file-exists-in-a-shell-script/57803080#57803080
  * Testing healthchecks

```console
$ docker-compose ps                                                                       
                   Name                                 Command                   State                Ports         
---------------------------------------------------------------------------------------------------------------------
bitcoin-transactions-data-watcher            docker-entrypoint.sh node  ...   Up (unhealthy)                         
bitcoin-transactions-postgres-data-service   /usr/local/bin/postgrest         Up (healthy)     0.0.0.0:4565->3000/tcp
bitcoin-transactions-postgres-server         docker-entrypoint.sh postgres    Up (healthy)     0.0.0.0:5432->5432/tcp
```

* At this point, you must verify the assumptions of the service.
* You can start by the status code of the healthcheck probe.

```console
$ docker inspect --format "{{json .State.Health }}" bitcoin-transactions-data-watcher | jq
```
```json
{
  "Status": "starting",
  "FailingStreak": 3,
  "Log": [
    {
      "Start": "2022-04-13T05:49:54.0135576Z",
      "End": "2022-04-13T05:49:54.1076525Z",
      "ExitCode": 1,
      "Output": ""
    },
    {
      "Start": "2022-04-13T05:50:04.1117122Z",
      "End": "2022-04-13T05:50:04.1814905Z",
      "ExitCode": 1,
      "Output": ""
    },
    {
      "Start": "2022-04-13T05:50:14.1508115Z",
      "End": "2022-04-13T05:50:14.2200502Z",
      "ExitCode": 1,
      "Output": ""
    }
  ]
}
```

* Given that it has been failing, then we can validate the docker image through a container.

```console
$ docker exec -it bitcoin-transactions-data-watcher bash                                                 
bash-5.1# bash -c '[ -S /tmp/kraken-transactions-healthcheck ]'
bash-5.1# echo $?
1
bash-5.1# bash ls -la /tmp/kraken-transactions-healthcheck 
/bin/ls: /bin/ls: cannot execute binary file
bash-5.1# ls 
data          kraken        node_modules  package.json  service.js    yarn.lock
bash-5.1# ls /tmp/
kraken-transactions-healthcheck  v8-compile-cache-0
bash-5.1# ls /tmp/kraken-transactions-healthcheck 
/tmp/kraken-transactions-healthcheck
bash-5.1# ls -la /tmp/kraken-transactions-healthcheck 
-rw-r--r--    1 root     root             0 Apr 13 05:49 /tmp/kraken-transactions-healthcheck
bash-5.1# test -f /tmp/kraken-transactions-healthcheck
bash-5.1# echo $?
0
bash-5.1# test -f /tmp/kraken-transactions-healthcheckdddd
bash-5.1# echo $?
1
bash-5.1# exit
exit

$ docker-compose stop bitcoin-transactions-data-watcher
Stopping bitcoin-transactions-data-watcher ... 
Stopping bitcoin-transactions-data-watcher ... done

$ docker-compose rm bitcoin-transactions-data-watcher
Going to remove bitcoin-transactions-data-watcher
Are you sure? [yN] y
Removing bitcoin-transactions-data-watcher ... done

$ docker-compose up -d bitcoin-transactions-data-watcher
bitcoin-transactions-postgres-server is up-to-date
bitcoin-transactions-postgres-data-service is up-to-date
Creating bitcoin-transactions-data-watcher ... done

$ docker-compose ps
                   Name                                 Command                       State                   Ports         
----------------------------------------------------------------------------------------------------------------------------
bitcoin-transactions-data-watcher            docker-entrypoint.sh node  ...   Up (health: starting)                         
bitcoin-transactions-postgres-data-service   /usr/local/bin/postgrest         Up (healthy)            0.0.0.0:4565->3000/tcp
bitcoin-transactions-postgres-server         docker-entrypoint.sh postgres    Up (healthy)            0.0.0.0:5432->5432/tcp
```

* At this point, you can use the output of the reporting for the details...

```console
$ docker inspect --format "{{json .State.Health }}" bitcoin-transactions-data-watcher | jq
```
```json
{
  "Status": "healthy",
  "FailingStreak": 0,
  "Log": [
    {
      "Start": "2022-04-13T05:55:08.9054504Z",
      "End": "2022-04-13T05:55:08.9766525Z",
      "ExitCode": 0,
      "Output": ""
    }
  ]
}
```

* Finally, the service is fixed!

```console
$ docker-compose ps                                                                       
                   Name                                 Command                  State               Ports         
-------------------------------------------------------------------------------------------------------------------
bitcoin-transactions-data-watcher            docker-entrypoint.sh node  ...   Up (healthy)                         
bitcoin-transactions-postgres-data-service   /usr/local/bin/postgrest         Up (healthy)   0.0.0.0:4565->3000/tcp
bitcoin-transactions-postgres-server         docker-entrypoint.sh postgres    Up (healthy)   0.0.0.0:5432->5432/tcp
```