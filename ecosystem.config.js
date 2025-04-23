module.exports = {
  apps: [
    {
      name: "BotX",
      script: "yarn start --port 1365",
      instances: 1,
      max_memory_restart: "500M",
    },
  ],
};
