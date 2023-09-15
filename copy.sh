#!/bin/bash
cd app
npm run build
cd ..

cp -r app/build/static/* server/static/
cp -r app/build/index.html server/templates/
cp -r app/build/favicon.ico server/static/

