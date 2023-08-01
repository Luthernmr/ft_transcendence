#!/bin/sh

npm install vite

npm i express

npm rebuild esbuild

#npm run build

exec "$@"