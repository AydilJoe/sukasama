/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://www.suka-sama-suka.com',
    generateRobotsTxt: true,
    robotsTxtOptions: {
      additionalSitemaps: [
        'https://www.suka-sama-suka.com/server-sitemap.xml',
      ],
    },
  }