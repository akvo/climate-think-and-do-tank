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

    # Legacy domain (tdt.akvo.org) moved to drylandsinvest.org. Search engines
    # still hold the old URLs, so we keep these routers to issue a permanent
    # (301) redirect that preserves the path. The 443 router exists mainly so
    # Traefik obtains a Let's Encrypt cert for the old domain; without it,
    # HTTPS hits would fail the TLS handshake before the redirect could fire.
    old-domain-router-80:
      rule: "Host(\`tdt.akvo.org\`)"
      service: frontend-service
      entrypoints: web
      middlewares:
        - old-domain-redirect

    old-domain-router-443:
      entrypoints:
        - websecure
      rule: "Host(\`tdt.akvo.org\`)"
      service: frontend-service
      tls:
        certResolver: myresolver
      middlewares:
        - old-domain-redirect


  middlewares:
    redirect-to-https:
      redirectScheme:
        scheme: "https"
        permanent: true
    cms-stripprefix:
      stripPrefix:
        prefixes:
          - "/cms"
    # Path-preserving 301 to the new domain. The regex captures everything
    # after the host so /some/page lands on the same path on drylandsinvest.org,
    # which keeps per-URL search ranking signals intact. Matching http? as well
    # collapses plain-HTTP hits into a single redirect to the new HTTPS URL.
    old-domain-redirect:
      redirectRegex:
        # Single-quoted YAML: backslashes pass through literally to the regex
        # engine. Double quotes would make YAML choke on \. as an invalid
        # escape and reject the whole dynamic config.
        regex: '^https?://tdt\\.akvo\\.org/(.*)'
        replacement: 'https://drylandsinvest.org/\${1}'
        permanent: true


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
