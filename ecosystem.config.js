module.exports = {
  apps: [
    {
      name: "opbk-backend",
      script: "src/server.js",
      instances: 2, // t3.small = 2 vCPUs
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "400M",
      autorestart: true,
      watch: false,
    },
  ],
};
