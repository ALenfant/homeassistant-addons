ARG BUILD_FROM=ghcr.io/hassio-addons/base-nodejs:0.2.5
# https://github.com/hassio-addons/addon-base-nodejs/releases
# hadolint ignore=DL3006
FROM ${BUILD_FROM}

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Environment configuration
ENV \
    S6_KILL_GRACETIME=30000 \
    S6_SERVICES_GRACETIME=30000

# Setup base
# https://github.com/outline/outline/releases
ARG OUTLINE_VERSION=0.81.1

# Install dependencies, fetch outline source
RUN \
    apk add --no-cache --virtual .build-deps \
        # To build aws-crt dependency on aarch64
        g++=13.2.1_git20231014-r0 \
        make=4.4.1-r2 \
        cmake=3.27.8-r0 \
    && apk add --no-cache \
        postgresql15=15.10-r0 \
        postgresql15-contrib=15.10-r0 \
        redis=7.2.4-r1 \
    \
    && curl -J -L -o /tmp/outline.tar.gz \
        "https://github.com/outline/outline/archive/refs/tags/v${OUTLINE_VERSION}.tar.gz" \
    && mkdir -p /opt/outline \
    && tar zxf /tmp/outline.tar.gz -C \
        /opt/outline --strip-components=1 \
    && rm /tmp/outline.tar.gz

# Create Postgres run directory
RUN mkdir -p /run/postgresql \
	&& chown -R postgres:postgres /run/postgresql


# # Debug: force custom code (create archive with tar czf outline.tar.gz outline)
# RUN rm -rf /opt/outline
# COPY outline.tar.gz /tmp/outline.tar.gz
# RUN mkdir -p /opt/outline \
#     && tar zxf /tmp/outline.tar.gz -C \
#         /opt/outline --strip-components=1 \
#     && rm /tmp/outline.tar.gz

# Replace rollup by wasm version to handle unsupported platforms (https://github.com/rollup/rollup/issues/5194 and https://github.com/nuxt/nuxt/issues/24490)
# Otherwise, error: 8.322 Error: Your current platform "linux" and architecture "arm" combination is not yet supported by the native Rollup build. Please use the WASM build "@rollup/wasm-node" instead.
RUN \
    jq '.resolutions.rollup = "@rollup/wasm-node\(.resolutions.rollup)"' /opt/outline/package.json > /opt/outline/package.json.tmp \
    && mv /opt/outline/package.json.tmp /opt/outline/package.json

# Install NodeJS dependencies with Yarn
RUN \
    cd /opt/outline \
    \
    && NODE_ENV=development \
    && yarn install --frozen-lockfile

# Build with Yarn
RUN \
    cd /opt/outline \
    \
    && NODE_ENV=development \
    && yarn build

# Clean up file system
RUN \
    cd /opt/outline \
    \
    && yarn cache clean \
    && apk del .build-deps \
    && rm -f -r \
         /tmp/*

# Timestamp the build
RUN date +%Y%m%d%H%M%S > /build-timestamp

# Copy data for add-on
COPY rootfs /

# S6-Overlay
ENTRYPOINT ["/init"]

# Labels
ARG BUILD_ARCH
ARG BUILD_DATE
ARG BUILD_DESCRIPTION
ARG BUILD_NAME
ARG BUILD_REF
ARG BUILD_REPOSITORY
ARG BUILD_VERSION
LABEL \
    io.hass.name="${BUILD_NAME}" \
    io.hass.description="${BUILD_DESCRIPTION}" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version=${BUILD_VERSION} \
    maintainer="ALenfant (https://github.com/ALenfant)" \
    org.opencontainers.image.title="${BUILD_NAME}" \
    org.opencontainers.image.description="${BUILD_DESCRIPTION}" \
    org.opencontainers.image.vendor="Home Assistant Add-ons" \
    org.opencontainers.image.authors="ALenfant (https://github.com/ALenfant)" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.url="https://github.com/ALenfant" \
    org.opencontainers.image.source="https://github.com/${BUILD_REPOSITORY}" \
    org.opencontainers.image.documentation="https://github.com/${BUILD_REPOSITORY}/blob/main/README.md" \
    org.opencontainers.image.created=${BUILD_DATE} \
    org.opencontainers.image.revision=${BUILD_REF} \
    org.opencontainers.image.version=${BUILD_VERSION}
