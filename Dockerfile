###############################################################################
###############################################################################
##                      _______ _____ ______ _____                           ##
##                     |__   __/ ____|  ____|  __ \                          ##
##                        | | | (___ | |__  | |  | |                         ##
##                        | |  \___ \|  __| | |  | |                         ##
##                        | |  ____) | |____| |__| |                         ##
##                        |_| |_____/|______|_____/                          ##
##                                                                           ##
## description     : Dockerfile for WRASCAL API Application                  ##
## author          : WRASCAL Team                                            ##
## date            : 2024-09-29                                              ##
## version         : 3.0                                                     ##
##                                                                           ##
###############################################################################
###############################################################################
ARG NODE_VERSION=18.20.2

FROM node:${NODE_VERSION}-alpine as build
WORKDIR /opt

# Copy package files
COPY package.json yarn.lock tsconfig.json tsconfig.compile.json .barrelsby.json ./

# Install dependencies
RUN yarn install --pure-lockfile

# Copy source code
COPY ./src ./src

# Build the application
RUN yarn build

FROM node:${NODE_VERSION}-alpine as runtime
WORKDIR /opt

# Install system dependencies
RUN apk update && apk add --no-cache \
    build-base \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# Install PM2 globally
RUN npm install -g pm2

# Copy built application from build stage
COPY --from=build /opt/dist ./dist
COPY --from=build /opt/node_modules ./node_modules
COPY --from=build /opt/package.json ./package.json

# Copy additional files
COPY ./views ./views
COPY ./public ./public
COPY ./processes.config.js ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S wrascal -u 1001

# Change ownership of the app directory
RUN chown -R wrascal:nodejs /opt
USER wrascal

# Expose port
EXPOSE 8081

# Set environment variables
ENV PORT=8081
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8081/ || exit 1

# Start the application
CMD ["pm2-runtime", "start", "processes.config.js", "--env", "production"]
