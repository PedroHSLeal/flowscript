FROM anomalyco/opencode AS opencode

FROM node:lts-alpine 

COPY opencode.json ./opencode/

WORKDIR /playground

# just for tests
# RUN apk add curl

# ENTRYPOINT ["/bin/sh"]


COPY --from=opencode /usr/local/bin/opencode /usr/local/bin/opencode

ENTRYPOINT ["opencode"]