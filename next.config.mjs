/** @type {import('next').NextConfig} */
const nextConfig = {

    
        reactStrictMode: true,
        env: {
          MAILJET_API_KEY: process.env.MAILJET_API_KEY,
          MAILJET_API_SECRET: process.env.MAILJET_API_SECRET,
        },
};

export default nextConfig;
