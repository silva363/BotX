#!/bin/bash

source .env.pm2

pm2 start ecosystem.config.js --only $APP_NAME
