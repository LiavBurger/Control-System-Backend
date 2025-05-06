#!/usr/bin/env bash
set -e

echo "--- Running wait-for-it for mongo ---"
/opt/wait-for-it.sh mongo:27017

# --- DEBUGGING START ---
echo "--- Current Directory: $(pwd) ---"
echo "--- Listing files in current directory ---"
ls -la
# Verify the env file exists and has content (assuming WORKDIR is /usr/src/app)
echo "--- Contents of /usr/src/app/env-example-document ---"
cat /usr/src/app/env-example-document || echo "env-example-document not found or cannot be read."
echo "--- Checking specific COGNITO env vars from printenv ---"
printenv | grep COGNITO || echo "No COGNITO vars found via printenv."
# --- DEBUGGING END ---

echo "--- Starting NestJS Application ---"
npm run start:prod > prod.log 2>&1 &

echo "--- Running wait-for-it for NestJS app ---"
/opt/wait-for-it.sh localhost:3000

echo "--- Running Lint ---"
npm run lint

echo "--- Running E2E Tests ---"
npm run test:e2e:ci