FROM docker-hub-remote.bahnhub.tech.rz.db.de/nginxinc/nginx-unprivileged:mainline-alpine

LABEL maintainer="db.systel.serviceteam-lso@deutschebahn.com" \
      description="Nginx-Webserver" \
      version="1.0"

ARG proxy=http://webproxy.comp.db.de:8080
ARG no_proxy="127.0.0.1, localhost, db.de, amazonaws.com"

ENV http_proxy ${proxy}
ENV HTTP_PROXY ${proxy}
ENV https_proxy ${proxy}
ENV HTTPS_PROXY ${proxy}
ENV no_proxy ${no_proxy}
ENV NO_PROXY ${no_proxy}

USER root
COPY static /usr/share/nginx/html
RUN apk add --upgrade --no-cache apk-tools \
&& apk upgrade --available --no-cache \
&& mv /docker-entrypoint.sh /docker-entrypoint-backup \
&& echo "#!/bin/sh" > /docker-entrypoint.sh \
&& echo "ls -l /config" >> /docker-entrypoint.sh \
&& echo "cp /config/nginx.conf /etc/nginx/nginx.conf" >> /docker-entrypoint.sh \
&& echo "cp /config/env.js /usr/share/nginx/html" >> /docker-entrypoint.sh \
&& tail -n +2 < /docker-entrypoint-backup >> /docker-entrypoint.sh \
&& chmod 750 /docker-entrypoint.sh \
&& chown 101:101 /docker-entrypoint.sh \
&& mkdir -p /config \
&& chown -R 101:101 /usr/share/nginx/html \
&& rm -rf /sbin/apk /etc/apk /lib/apk /usr/share/apk /var/lib/apk /root

USER 101
VOLUME ["/tmp", "/etc/nginx", "/usr/share/nginx/html"]
RUN ls /usr/share/nginx/html
