#!/bin/sh

# Remove 'https://' from WEBDOMAIN if present
WEBDOMAIN=${WEBDOMAIN#https://}

cat << EOF > /traefik-config/dynamic.yml
http:
  routers:
    frontend-service-router-80:
      rule: "Host(\`${WEBDOMAIN}\`)"
      service: frontend-service
      entrypoints: web
      middlewares:
        - redirect-to-https

    frontend-service-router-443:
      entrypoints:
        - websecure
      rule: "Host(\`${WEBDOMAIN}\`)"
      service: frontend-service
      tls:
        certResolver: myresolver

    backend-service-router-80:
      rule: "Host(\`${WEBDOMAIN}\`) && PathPrefix(\`/cms\`)"
      service: backend-service
      entrypoints: web
      middlewares:
        - redirect-to-https
        - cms-stripprefix

    backend-service-router-443:
      entrypoints:
        - websecure
      rule: "Host(\`${WEBDOMAIN}\`) && PathPrefix(\`/cms\`)"
      service: backend-service
      tls:
        certResolver: myresolver
      middlewares:
        - cms-stripprefix


  middlewares:
    redirect-to-https:
      redirectScheme:
        scheme: "https"
        permanent: true
    cms-stripprefix:
      stripPrefix:
        prefixes:
          - "/cms"


  services:
    frontend-service:
      loadBalancer:
        servers:
          - url: "http://frontend:3000"

    backend-service:
      loadBalancer:
        servers:
          - url: "http://backend:1337"

EOF
