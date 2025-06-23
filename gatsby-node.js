const path = require("path");
const { createFilePath } = require("gatsby-source-filesystem");

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;
  

  // 1. Handle markdown pages (blog, work-sub-page, exhibitions, etc.)
  const markdownResult = await graphql(`
    {
      allMarkdownRemark(limit: 1000, sort: { frontmatter: { date: DESC } }) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              templateKey
              title
              date(formatString: "DD:MM:YYYY hh:mm")
            }
          }
        }
      }
    }
  `);

  if (markdownResult.errors) throw markdownResult.errors;

  
  const posts = markdownResult.data.allMarkdownRemark.edges;

  const templates = {
    "blog-post": "blog-post.js",
    "work-sub-page": "work-sub-page.js",
    "exhibitions-sub-page": "exhibitions-sub-page.js",
  };

  posts.forEach((post, index) => {
    const templateKey = post.node.frontmatter.templateKey;
    const slug = post.node.fields.slug;
    // const shortPath = slug.split("/").slice(2, -1).join("/") || "/";

    if (!templates[templateKey]) {
      reporter.warn(`No template found for templateKey: ${templateKey}`);
      return;
    }

    if (templates[templateKey]) {
      createPage({
        path: slug,
        component: path.resolve(`src/templates/${templates[templateKey]}`),
        context: {
          slug,
          previous: index < posts.length - 1 ? posts[index + 1].node : null,
          next: index > 0 ? posts[index - 1].node : null,
        },
      });
    } else {
      createPage({
        path: slug,
        component: path.resolve(`src/templates/${templateKey}.js`),
        context: { slug },
      });
    }
  });

  // 2. Handle dynamic album pages from images
  const albumsResult = await graphql(`
    {
      allFile(filter: { sourceInstanceName: { eq: "work" } }) {
        nodes {
          relativeDirectory
        }
      }
    }
  `);

  if (albumsResult.errors) {
    reporter.panic("Error loading albums", albumsResult.errors);
  }

  const albums = Array.from(
    new Set(albumsResult.data.allFile.nodes.map(node => node.relativeDirectory))
  );

  albums.forEach(album => {
    createPage({
      path: `/work/${album}`,
      component: path.resolve(`./src/templates/work-sub-page.js`),
      context: { 
        album,
        slug: `/work/${album}/`, // or however your slugs are structured
      },
    });
  });
};

// For generating slugs for markdown content
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  if (node.internal.type === "MarkdownRemark") {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: "slug",
      node,
      value,
    });
  }
};
