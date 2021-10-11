# Defining environment
ARG APP_ENV=prod

FROM adoptopenjdk/openjdk8:alpine-jre as base
ARG HB_PROXY_CURL_OPT
ENV DOCKERIZE_VERSION v0.6.1
RUN apk --no-cache add curl tar \
    && curl ${HB_PROXY_CURL_OPT} -L https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz | tar -C /usr/local/bin -xzv

# Workaround alpine issue with /lib64 not being in the ld library path
# https://gitlab.alpinelinux.org/alpine/aports/-/issues/10140
ENV LD_LIBRARY_PATH=/lib64

FROM openjdk:8 as prod-build
ARG HB_PROXY_GRADLE_OPT
COPY . datahub-src
RUN cd datahub-src && ./gradlew ${HB_PROXY_GRADLE_OPT} :datahub-upgrade:build
RUN cd datahub-src && cp datahub-upgrade/build/libs/datahub-upgrade.jar ../datahub-upgrade.jar

FROM base as prod-install
COPY --from=prod-build /datahub-upgrade.jar /datahub/datahub-upgrade/bin/
COPY --from=prod-build /datahub-src/metadata-models/src/main/resources/entity-registry.yml /datahub/datahub-gms/resources/entity-registry.yml

FROM base as dev-install
# Dummy stage for development. Assumes code is built on your machine and mounted to this image.
# See this excellent thread https://github.com/docker/cli/issues/1134

FROM ${APP_ENV}-install as final

RUN addgroup -S datahub && adduser -S datahub -G datahub
USER datahub

ENTRYPOINT ["java", "-jar", "/datahub/datahub-upgrade/bin/datahub-upgrade.jar"]
