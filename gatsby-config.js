// const urljoin = require("url-join")
// import urlJoin from 'url-join';
const siteConfig = require("./siteConfig")
// import siteConfig from "./siteConfig"

module.exports = {
  siteMetadata: {
    title: siteConfig.shortName,
    author: siteConfig.author,
    description: siteConfig.description,
    image: siteConfig.image,
    siteUrl: "https://markaustin.photo",
    social: {
      instagram: siteConfig.instagram,
      // facebook: siteConfig.facebook,
      twitter: siteConfig.twitter,
      github: siteConfig.github,
    },
  },
  plugins: [
    `gatsby-plugin-sass`,
    {
      // keep as first gatsby-source-filesystem plugin for gatsby image support
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/static/img`,
        name: "uploads",
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/src/img/work/`,
        name: "work",
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/src/img/home/`,
        name: "home",
      },
    }, 
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src`,
        name: `pages`,
      },
    },
    `gatsby-transformer-remark`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-relative-images",
            options: {
              name: "uploads",
            },
          },
          {
            resolve: "gatsby-remark-copy-linked-files",
            options: {
              // destinationDir: "public",
              ignoreFileExtensions: [`png`, `jpg`, `jpeg`, `bmp`, `tiff` ,`webp`],
          
            },
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1360,
              withWebp: true,
              showCaptions: false,
              quality: 75,
              wrapperStyle: `margin: 7vw 0;`,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,

        ],
      },
    },

    {
      resolve: "gatsby-plugin-netlify-cms",
      options: {
        modulePath: `${__dirname}/src/cms/cms.js`,
      },
    },
    {
      resolve: `gatsby-plugin-postcss`,
      options: {
        postCssPlugins: [
          require("postcss-easy-import")(),
          require("postcss-custom-properties")({ preserve: false }),
          require("postcss-color-function")(),
          require("autoprefixer")({ overrideBrowserslist: ["last 1 version"] }),
        ],
      },
    },
    {
      resolve: `gatsby-plugin-purgecss`,
      options: {
        printRejected: true, // Print removed selectors and processed file names
        safelist: [
          /^yarl/, // all yarl classes
          /yet-another-react-lightbox/, // package name
          // Add patterns to safelist all classes from the lightbox CSS files
          /^yarl-/, // common prefix for yet-another-react-lightbox classes
          /^yarl__/, // BEM style classes
        ],
        purgeCSSOptions: {
          safelist: [
            /^yarl/, // all yarl classes
            /yet-another-react-lightbox/, // package name
            // Add patterns to safelist all classes from the lightbox CSS files
            /^yarl-/, // common prefix for yet-another-react-lightbox classes
            /^yarl__/, // BE
          ],// Don't remove this selector
        },
      },
    },    
       {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [
          "G-S33L4X4WHL", // your GA4 Measurement ID
        ],
        pluginConfig: {
          head: true,
        },
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: siteConfig.name,
        short_name: siteConfig.shortName,
        start_url: siteConfig.prefix,
        background_color: `#ffffff`,
        theme_color: `#ffffff`,
        display: `standalone`,
        icon: siteConfig.manifest_icon,
      },
    },
    `gatsby-plugin-netlify`,
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sitemap`
  ],
}

