#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MAIN_SH="$SCRIPT_DIR/main.sh"
ARGS="$*"

su -l "$_REMOTE_USER" -c "
  cd \"$PWD\"
  /bin/bash \"$MAIN_SH\" $ARGS
"
