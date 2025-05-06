#!/bin/sh
set -e

npm run seed-country
npm run seed-region
npm run seed-topic
npm run seed-value-chain
npm run start
