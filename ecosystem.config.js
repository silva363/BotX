module.exports = {
  apps: [
    {
      name: "BotX_backend",
      script: "yarn start",
      instances: 1,
      max_memory_restart: "500M",
    },
  ],
};
