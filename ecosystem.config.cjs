module.exports = {
  apps: [{
    name: 'conexiaplus-psicologico',
    script: './server.mjs',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
