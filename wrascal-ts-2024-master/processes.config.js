module.exports = {
  apps: [
    {
      name: 'wrascal-api',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      node_args: '--require tsconfig-paths/register',  // <- 👈 KEY LINE
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

  