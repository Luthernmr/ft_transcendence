#!/bin/sh

npm uninstall bcrypt && npm install bcrypt

exec "$@"