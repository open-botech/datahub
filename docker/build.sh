#!/bin/bash
set -e
# 如果开启http代理，必须要将HB_PROXY_ON设置为1
export HB_PROXY_ON=0
export HB_PROXY_HTTP_IP=192.168.202.163
export HB_PROXY_HTTP_PORT=7890
export DATAHUB_VERSION=hb

if [ "$HB_PROXY_ON" == "1" ];then
  echo "开启HTTP代理【${HB_PROXY_HTTP_IP}:${HB_PROXY_HTTP_PORT}】"
  export HTTP_PROXY=http://${HB_PROXY_HTTP_IP}:${HB_PROXY_HTTP_PORT}
  export HTTPS_PROXY=http://${HB_PROXY_HTTP_IP}:${HB_PROXY_HTTP_PORT}
  
  COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -p datahub build --build-arg HB_PROXY_CURL_OPT="-x ${HB_PROXY_HTTP_IP}:${HB_PROXY_HTTP_PORT}" --build-arg HB_PROXY_WGET_OPT="-e http_proxy=${HB_PROXY_HTTP_IP}:${HB_PROXY_HTTP_PORT} -e https_proxy=${HB_PROXY_HTTP_IP}:${HB_PROXY_HTTP_PORT} -e use_proxy=on" --build-arg HB_PROXY_GRADLE_OPT="-Dhttp.proxyHost=${HB_PROXY_HTTP_IP} -Dhttp.proxyPort=${HB_PROXY_HTTP_PORT} -Dhttps.proxyHost=${HB_PROXY_HTTP_IP} -Dhttps.proxyPort=${HB_PROXY_HTTP_PORT}"
else
  COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -p datahub build datahub-frontend-react
fi

