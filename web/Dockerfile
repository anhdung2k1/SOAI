FROM node:23.1.0-alpine

ARG COMMIT
ARG APP_VERSION
ARG BUILD_TIME

LABEL \
    soai.app.commit=$COMMIT \
    soai.app.version=$APP_VERSION \
    soai.image.title="SOAI Frontend React Service" \
    soai.image.created="$BUILD_TIME"

WORKDIR /frontend
# Copy the app source code
COPY main-app/ ./
COPY loader.sh ./
# Define non-root user and group
ARG USER_ID=1001
# Create group and user with specific UID/GID
RUN addgroup -g ${USER_ID} soai-group && \
    adduser -u ${USER_ID} -G soai-group -S soai-user

# Install dependencies
RUN npm ci

# Ensure the working directory and build folder are owned by the new user
RUN chown -R soai-user:soai-group /frontend

# Switch to non-root user
USER soai-user

EXPOSE 3000

ENTRYPOINT ["./loader.sh"]