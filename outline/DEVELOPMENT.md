# Development Notes
For personal usage, they might help you as well!

## Build Docker image locally
### Official builder
```bash
docker run \
  --rm \
  -it \
  --name builder \
  --privileged \
  -v .:/data \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  ghcr.io/home-assistant/aarch64-builder \
  -t /data \
  --all \
  --test \
  -i outline-{arch} \
  -d local
```

Use `amd64-base` if you're on a x86-64 CPU

Replace `--all` by `--aarch64` to only build for ARM64 (M1 Mac).

### Without official builder
```bash
docker build \
  -t local/outline \
  .
```

## Run container
```bash
docker run \
  --rm \
  -p 127.0.0.1:5000:5000/tcp \
  local/outline

docker run \
  --rm \
  -p 127.0.0.1:5000:5000/tcp \
  local/outline-aarch64
```