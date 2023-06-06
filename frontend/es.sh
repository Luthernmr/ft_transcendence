#!/bin/sh

npm install vite

npm rebuild esbuild

exec "$@"