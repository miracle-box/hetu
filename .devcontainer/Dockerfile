FROM mcr.microsoft.com/devcontainers/base:bookworm

ENV DEBIAN_FRONTEND=noninteractive

# Ensure latest packages and install some necessary utilities.
RUN apt-get update \
	&& apt-get install -y curl git unzip bash tar sed ca-certificates gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
ENV BUN_INSTALL=/usr/local
RUN curl -fsSL https://bun.sh/install | bash

WORKDIR /workspace
