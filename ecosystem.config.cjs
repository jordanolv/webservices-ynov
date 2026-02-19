/**
 * PM2 - Next.js + API Hono
 */
module.exports = {
  apps: [
    {
      name: 'dylanolivier-api',
      cwd: './api',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 4091, DOTENV_CONFIG_PATH: '.env.prod' },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      max_restarts: 10,
      watch: false,
    },
    {
      name: 'dylanolivier-frontend',
      cwd: './animaux-portfolio',
      script: 'node_modules/.bin/next',
      args: 'start -p 4090',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 4090 },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      max_restarts: 10,
      watch: false,
    },
  ],
}
