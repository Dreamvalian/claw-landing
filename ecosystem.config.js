module.exports = {
  apps: [
    {
      name: "hermes-web",
      script: "server.js",
      cwd: "/root/claw-landing-new/.next/standalone",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        DISCORD_CLIENT_ID: "1321426941059792956",
        DISCORD_CLIENT_SECRET: "G61uOF3TewM88dEs5jxAh-8j8WC9ZzPK",
        DISCORD_REDIRECT_URI: "https://ko4lax.dev/api/auth/discord/callback",
        REDIS_HOST: "localhost",
        REDIS_PORT: "6379",
        NEXT_PUBLIC_BASE_URL: "https://ko4lax.dev",
        DEPLOY_WEBHOOK_SECRET: "hermes_deploy_secret_change_me",
      },
    },
  ],
};
