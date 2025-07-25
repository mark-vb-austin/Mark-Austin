const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);
const fs = require(`fs`);

// Load exif data for album sorting
const exifDataPath = path.join(__dirname, 'src/img/exif-data.json');
let exifData = {};
if (fs.existsSync(exifDataPath)) {
  exifData = JSON.parse(fs.readFileSync(exifDataPath, 'utf8'));
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  // Query all markdown content
  const result = await graphql(`
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

  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`, result.errors);
    return;
  }

  // Filter out posts that do not have a templateKey or are albums
  const posts = result.data.allMarkdownRemark.edges.filter(edge => {
    const filePath = edge.node.fields.slug || '';
    const templateKey = edge.node.frontmatter.templateKey;
    return templateKey && !filePath.includes('/album');
  });
  
  // Create blog post pages
  const blogPosts = posts.filter(
    item => item.node.frontmatter.templateKey === "blog-post"
  );
  
  blogPosts.forEach((post, index) => {
    const previous = index === blogPosts.length - 1 ? null : blogPosts[index + 1].node;
    const next = index === 0 ? null : blogPosts[index - 1].node;

    // Extract the filename from the slug and create a simple path
    const slug = post.node.fields.slug;
    // Remove trailing slash, split, and get the last non-empty part
    const slugParts = slug.replace(/\/$/, '').split('/');
    const filename = slugParts[slugParts.length - 1];
    const blogPath = `/blog/${filename}/`;

    createPage({
      path: blogPath,
      component: path.resolve(`src/templates/blog-post.js`),
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    });
  });

  // Create work sub-pages
  const workPages = posts.filter(
    item => item.node.frontmatter.templateKey === "work-sub-page"
  );
  workPages.forEach((post, index) => {
    const previous = index === workPages.length - 1 ? null : workPages[index + 1].node;
    const next = index === 0 ? null : workPages[index - 1].node;

    createPage({
      path:
        post.node.fields.slug.split("/").slice(2, -1).join("/") === ""
          ? "/"
          : `/${post.node.fields.slug.split("/").slice(2, -1).join("/")}`,
      component: path.resolve(`src/templates/work-sub-page.js`),
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    });
  });

  // Create exhibitions sub-pages
  const exhibitionsPages = posts.filter(
    item => item.node.frontmatter.templateKey === "exhibitions-sub-page"
  );
  exhibitionsPages.forEach((post, index) => {
    const previous = index === exhibitionsPages.length - 1 ? null : exhibitionsPages[index + 1].node;
    const next = index === 0 ? null : exhibitionsPages[index - 1].node;

    createPage({
      path:
        post.node.fields.slug.split("/").slice(2, -1).join("/") === ""
          ? "/"
          : `/${post.node.fields.slug.split("/").slice(2, -1).join("/")}`,
      component: path.resolve(`src/templates/exhibitions-sub-page.js`),
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    });
  });

  // Catch-all for other templateKey values
  const otherPages = posts.filter(
    item =>
      item.node.frontmatter.templateKey !== "blog-post" &&
      item.node.frontmatter.templateKey !== "work-sub-page" &&
      item.node.frontmatter.templateKey !== "exhibitions-sub-page"
  );
  otherPages.forEach((post, index) => {
    const previous = index === otherPages.length - 1 ? null : otherPages[index + 1].node;
    const next = index === 0 ? null : otherPages[index - 1].node;

    createPage({
      path:
        post.node.fields.slug.split("/").slice(2, -1).join("/") === ""
          ? "/"
          : `/${post.node.fields.slug.split("/").slice(2, -1).join("/")}`,
      component: path.resolve(
        `src/templates/${post.node.frontmatter.templateKey}.js`
      ), //
      context: {
        slug: post.node.fields.slug,
        // previous,
        // next,
      },
    });
  });

  // Create dynamic album pages from folders in /static/img/work
  const albumResult = await graphql(`
    {
      allFile(filter: { sourceInstanceName: { eq: "work" } }) {
        nodes {
          relativeDirectory
        }
      }
    }
  `);

  if (albumResult.errors) {
    reporter.panic("Error loading images", albumResult.errors);
    return;
  }

  // Helper function to parse EXIF date format
  const parseExifDate = (exifDateString) => {
    const match = exifDateString.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})(.*)$/);
    if (!match) return null;
    
    const [, year, month, day, hour, minute, second, timezone] = match;
    const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}${timezone}`;
    return new Date(isoString);
  };

  // Helper function to get the most recent MetadataDate from an album
  const getAlbumMetadataDate = (albumDir) => {
    let mostRecentMetadataDate = null;
    
    // Look for all images in this album directory
    Object.keys(exifData).forEach(imagePath => {
      if (imagePath.startsWith(`work/${albumDir}/`)) {
        const imageExif = exifData[imagePath];
        if (imageExif && imageExif.MetadataDate) {
          const metadataDate = parseExifDate(imageExif.MetadataDate.rawValue);
          if (metadataDate && (!mostRecentMetadataDate || metadataDate > mostRecentMetadataDate)) {
            mostRecentMetadataDate = metadataDate;
          }
        }
      }
    });
    
    return mostRecentMetadataDate;
  };

  const albums = Array.from(
    new Set(albumResult.data.allFile.nodes.map(node => node.relativeDirectory))
  ).sort((a, b) => {
    // Sort by MetadataDate descending (most recent first)
    const aDate = getAlbumMetadataDate(a);
    const bDate = getAlbumMetadataDate(b);
    
    if (aDate && bDate) {
      return bDate - aDate;
    } else if (aDate) {
      return -1; // a has metadata date, b doesn't - a comes first
    } else if (bDate) {
      return 1; // b has metadata date, a doesn't - b comes first
    } else {
      return a.localeCompare(b); // fallback to alphabetical sorting
    }
  }); // Sort albums by MetadataDate for consistent navigation order

  albums.forEach((dir, index) => {
    const parts = dir.split("/"); // e.g. ['work', '2024', 'album-one'] or ['2024', 'album-one']
    // Support both cases: with or without 'work' as the first part
    let year, album;
    if (parts.length === 3 && parts[0] === 'work') {
      [ , year, album] = parts;
    } else if (parts.length === 2) {
      [year, album] = parts;
    } else {
      return;
    }

    // Get previous and next albums for navigation
    const previousAlbum = index > 0 ? albums[index - 1] : null;
    const nextAlbum = index < albums.length - 1 ? albums[index + 1] : null;

    // Parse previous album details
    let previousYear, previousAlbumName;
    if (previousAlbum) {
      const prevParts = previousAlbum.split("/");
      if (prevParts.length === 3 && prevParts[0] === 'work') {
        [ , previousYear, previousAlbumName] = prevParts;
      } else if (prevParts.length === 2) {
        [previousYear, previousAlbumName] = prevParts;
      }
    }

    // Parse next album details
    let nextYear, nextAlbumName;
    if (nextAlbum) {
      const nextParts = nextAlbum.split("/");
      if (nextParts.length === 3 && nextParts[0] === 'work') {
        [ , nextYear, nextAlbumName] = nextParts;
      } else if (nextParts.length === 2) {
        [nextYear, nextAlbumName] = nextParts;
      }
    }

    createPage({
      path: `/work/${year}/${album}/`,
      component: path.resolve(`./src/templates/work-sub-page.js`),
      context: {
        year,
        album,
        relativeDirectory: dir, // used in GraphQL query to find .md file
        regex: `/${dir}/`,
        // Navigation context
        previousAlbum: previousAlbum ? {
          year: previousYear,
          album: previousAlbumName,
          path: `/work/${previousYear}/${previousAlbumName}/`
        } : null,
        nextAlbum: nextAlbum ? {
          year: nextYear,
          album: nextAlbumName,
          path: `/work/${nextYear}/${nextAlbumName}/`
        } : null,
      },
    });
  });
};

// Add slug field to markdown nodes
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};
