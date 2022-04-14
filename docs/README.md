Welcome to the kraken-the-btc-transactions wiki!

* More documents in the main docs folder.
* For the tools used for operations, go to `tools/` dir
  * tools-docker-compose.yaml on the root dir.

# ☁️ Cloud-native ready?

> Handle all the 12-factor apps checks: https://12factor.net/

* ✅ **Codebase**: git
* ✅ **Dependencies**: `package.json`
* ✅ **Config**: All configs are provided via env vars in `docker-compose.yaml`
* ✅ **Backing services**: All connectable
* ⚠️ **Build, release, run**: We have Dockerized builds, not the CI/CD yet.
* ✅ **Processes**: single process are stateless
* ⚠️  **Port binding**: our service still doesn't export port, but it can.
* ✅ **Concurrency**: supports concurrency if chose a volume specific for each process
* ⚠️ **Disposability**: some level of error handling, but missing crash signals: `SIGTERM`, etc.
* ✅ ** Dev/prod parity**: works properly and env vars config can switch dirs, etc for different envs.
* ✅ **Admin processes**: We define and `ENTRYPOINT` in `Dockerfile` bootstrapping the app.

# 📽️ Make sure there's CI/CD properly

* Source-code must be built at every commit
* Docker image must be built and pushed to the repo's container registry
* App can be deployed as a Node library library???
* Prepare Kubernetes execution?

## 🥅  Failure Modes

> Make sure the service is fault-tolerant and handles all failure modes

* Handles Network Failures properly without breaking
* Handles Volume permissions properly