#!/bin/sh
set -e

# Create a temporary directory for environment variable storage
TMP_DIR="/tmp/app-env"
mkdir -p "$TMP_DIR"

# Create the __ENV.js file with the environment variables
echo "window.__ENV = {" > "$TMP_DIR/__ENV.js"

# Loop through environment variables starting with NEXT_PUBLIC_
for var in $(env | grep '^NEXT_PUBLIC_' | cut -d'=' -f1); do
  value=$(printenv "$var")
  echo "  $var: '${value}'," >> "$TMP_DIR/__ENV.js"
done

# Close the JSON object
echo "};" >> "$TMP_DIR/__ENV.js"

# Copy the generated __ENV.js file to the public directory
cp "$TMP_DIR/__ENV.js" /app/public/

# Clean up the temporary directory
rm -rf "$TMP_DIR"

# Run the command as not root user if exists
if [ `id -u node 2>/dev/null || echo -1` -ge 0 ]; then
  su - node
fi

# Run command with node if the first argument contains a "-" or is not a system command. The last
# part inside the "{}" is a workaround for the following bug in ash/dash:
# https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=874264
if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ] || { [ -f "${1}" ] && ! [ -x "${1}" ]; }; then
  set -- node "$@"
fi

exec "$@"
