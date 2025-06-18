FROM node:23.1.0-alpine

ARG USER_ID=1001
ARG COMMIT
ARG APP_VERSION
ARG BUILD_TIME

LABEL \
    soai.app.commit=$COMMIT \
    soai.app.version=$APP_VERSION \
    soai.image.title="SOAI Frontend React Service" \
    soai.image.created="$BUILD_TIME"

RUN addgroup -g ${USER_ID} soai_web && \
    adduser -u ${USER_ID} -G soai_web -s /bin/false -D soai_web && \
    npm install -g serve

WORKDIR /frontend
# Copy the app source code
COPY --chmod=0755 --chown=soai_web:soai_web main-app/ /frontend/

RUN npm install && \
    npm run build && \
    chown -R soai_web:soai_web /frontend

USER ${USER_ID}

EXPOSE 3000

CMD ["serve", "-s", "build"]