#!/bin/bash

git pull
pm2 reload app
pm2 log app
