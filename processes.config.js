module.exports = {
  apps: [
    {
      name: 'wrascal-api',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M', // Reduced for free tier
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

  