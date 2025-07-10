#!/bin/sh

# =============================
# MinIO client and bucket setup
# =============================

# Set MinIO credentials
mc alias set local http://s3:9000 hetudevelop hetudevelop

# Create buckets
mc mb local/textures --ignore-existing

# Set bucket policies
mc anonymous set download local/textures
