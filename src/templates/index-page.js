import React from "react";
// import PropTypes from "prop-types";
import { graphql, Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import Seo from "../components/seo";
import { Helmet } from "react-helmet";

// eslint-disable-next-line
const IndexPage = ({ data }) => {
  const siteTitle = data.site.siteMetadata.title;
  const social = data.site.siteMetadata.social;
  const posts = data.allMarkdownRemark.edges;
  const heroImage = data.heroImage;
  const aboutImage = data.aboutImage;
  const recentWorkImages = data.recentWorkImages.nodes;
  const recentAlbums = data.recentAlbums.nodes;
  const albumMetadata = data.albumMetadata.nodes;

  // Create a map of album metadata by directory
  const metadataMap = {};
  albumMetadata.forEach((file) => {
    if (file.childMarkdownRemark && file.childMarkdownRemark.frontmatter) {
      metadataMap[file.relativeDirectory] = file.childMarkdownRemark.frontmatter;
    }
  });

  // Process album data to group by directory and get recent albums
  const albumMap = {};
  
  recentAlbums.forEach((file) => {
    const dir = file.relativeDirectory;
    // Only process files that are in the work/20XX/ directory structure and have images
    if (dir && dir.startsWith('work/20') && file.childImageSharp) {
      if (!albumMap[dir]) {
        albumMap[dir] = {
          imageCount: 1,
          cover: file,
          images: [file],
          metadata: metadataMap[dir] || null
        };
      } else {
        albumMap[dir].imageCount += 1;
        albumMap[dir].images.push(file);
      }
    }
  });

  // Get the 3 most recent albums (sorted by directory name which includes year)
  const recentAlbumEntries = Object.entries(albumMap)
    .sort(([a], [b]) => b.localeCompare(a)) // Sort by directory name descending (most recent first)
    .slice(0, 3);

  // Helper function to create album title from directory path or metadata
  const createAlbumTitle = (dir, albumData) => {
    // Use metadata title if available
    if (albumData.metadata && albumData.metadata.title) {
      return albumData.metadata.title;
    }
    // Fallback to directory name
    const parts = dir.split('/');
    if (parts.length >= 3) {
      const albumName = parts[parts.length - 1];
      return albumName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Album';
  };

  // Helper function to create album URL
  const createAlbumUrl = (dir) => {
    const parts = dir.split('/');
    if (parts.length >= 3) {
      const year = parts[1];
      const albumName = parts[2];
      return `/work/${year}/${albumName}`;
    }
    return '/work';
  };

  return (
    <>
      {/* Helmet for SEO and styles */}
      <Helmet>
        <style>
          {`
              .site-head-container *,
              .site-head-container a {
                color: white;
              } 

              .hero-section {
                margin-top: -100px;
              }
              @media (max-width: 850px) {
                .site-wrapper {
                  padding: 0vw !important;
                }
              }
            `}
        </style>
      </Helmet>

      <Layout title={siteTitle} social={social}>
        <Seo keywords={[`Gatsby Theme`, `Free Gatsby Template`, `Clay Gatsby Theme`]} title={data.markdownRemark.frontmatter.title} description={data.markdownRemark.frontmatter.description || ""} image={data.markdownRemark.frontmatter.thumbnail.childImageSharp.fluid.src} />

        {/* HERO SECTION */}
        <section className='hero-section position-relative' style={{ height: "100vh", overflow: "hidden" }}>
          <div className='position-absolute w-100 h-100' style={{ zIndex: 1 }}>
            <GatsbyImage image={getImage(heroImage)} alt='Hero background' className='w-100 h-100' style={{ objectFit: "cover" }} />
          </div>
          <div className='position-absolute w-100 h-100 d-flex align-items-center justify-content-center' style={{ zIndex: 2, backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className='text-center text-white'>
              <h1 className='display-1 fw-light mb-3' style={{ fontSize: "4rem", fontFamily: "serif" }}>
                WE BELIEVE
                <br />
                THE ARTIST
              </h1>
              <p className='lead mb-4'>Photography is the art of frozen time... the ability to store emotion and feelings within a frame.</p>
              <div className='mt-5'>
                <button 
                  onClick={() => {
                    document.getElementById('home-main-content')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                  className='border rounded-circle d-inline-flex align-items-center justify-content-center bg-transparent text-white' 
                  style={{ width: "60px", height: "60px", borderColor: "white", cursor: "pointer", boxShadow: "none" }}
                  aria-label="Scroll to main content"
                >
                  <span style={{ fontSize: "24px" }}>↓</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* intro Content */}
        <section className='container' id="home-main-content">
          <div className='row my-100 px-4 px-md-0'>
            <div className='col-md-4 offset-md-2 col-6'>
              <div className='intro-image-container' style={{ aspectRatio: "4/5", overflow: "hidden" }}>
                <GatsbyImage image={getImage(recentWorkImages[0])} alt='Wedding photography' className='w-100 h-100' style={{ objectFit: "cover" }} />
              </div>
              <div className='mt-3'>
                <div className='text-end'>
                  THE HEART OF MY WORK
                  <br />
                  ISN'T IN POSED PERFECTION —<br />
                  <strong>IT'S IN REAL MOMENTS</strong><br />
                  YOU'LL WANT TO REMEMBER.
                  <br />
                </div>
              </div>
            </div>

            <div className='col-md-4 col-6 d-flex flex-column justify-content-end'>
              <div className='mb-3'>
                HONEST
                <br />
                <strong>CANDID</strong>
                <br />
                STORY-LED
                <br />
                <strong>MEANINGFUL</strong>
                <br />
              </div>
              <div className='intro-image-container' style={{ aspectRatio: "4/5", overflow: "hidden" }}>
                <GatsbyImage image={getImage(recentWorkImages[1])} alt='Wedding photography' className='w-100 h-100' style={{ objectFit: "cover" }} />
              </div>
            </div>
          </div>
        </section>

        {/* CHAT - THERE STYLE SLIDE */}
        <section className='py-5' style={{ backgroundColor: "#ffffff" }}>
          <div className='container'>
            <div className='row'>
              <div className='col-12 text-center mb-5'>
                <h2 className='display-5 fw-light'>Recent Albums</h2>
              </div>
            </div>
            <div className='row justify-content-center'>
              <div className='col-12'>
                <div className='d-flex justify-content-center align-items-center gap-4 flex-wrap'>
                  {recentAlbumEntries.map(([albumDir, albumData], index) => {
                      const albumTitle = createAlbumTitle(albumDir, albumData);
                      const albumUrl = createAlbumUrl(albumDir);
                      const images = albumData.images.slice(0, 2); // Get first 2 images for sliding
                      
                      return (
                        <Link key={albumDir} to={albumUrl} className='text-decoration-none'>
                          <div className={`album-card ${index === 1 ? 'album-card-center' : ''}`} style={{ width: index === 1 ? '320px' : '280px', height: index === 1 ? '400px' : '350px' }}>
                            <div className='album-card-container position-relative overflow-hidden' style={{ width: '100%', height: '100%' }}>
                              <div className={`album-slide album-slide-${index + 1} d-flex`} style={{ width: '200%', height: '100%', transform: 'translateX(0%)', transition: 'transform 0.5s ease' }}>
                                <div className='album-image-1' style={{ width: '50%', height: '100%' }}>
                                  <GatsbyImage 
                                    image={getImage(images[0])} 
                                    alt={`${albumTitle} - Image 1`} 
                                    className='w-100 h-100' 
                                    style={{ objectFit: 'cover' }} 
                                  />
                                </div>
                                <div className='album-image-2' style={{ width: '50%', height: '100%' }}>
                                  <GatsbyImage 
                                    image={getImage(images[1] || images[0])} 
                                    alt={`${albumTitle} - Image 2`} 
                                    className='w-100 h-100' 
                                    style={{ objectFit: 'cover' }} 
                                  />
                                </div>
                              </div>
                              <div className='album-overlay position-absolute bottom-0 start-0 w-100 p-3'>
                                <h5 className='mb-1'>{albumTitle}</h5>
                                <p className='mb-0 small'>{albumData.imageCount} Image{albumData.imageCount !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className='py-5' style={{ backgroundColor: "#f8f9fa" }}>
          <div className='container'>
            <div className='row'>
              <div className='col-12 text-center mb-5'>
                <h2 className='display-5 fw-light'>Latest Blog Posts</h2>
              </div>
            </div>
            <div className='row g-4'>
              {posts.slice(0, 6).map(({ node }, index) => {
                // Generate the correct blog post URL
                const slug = node.fields.slug;
                const slugParts = slug.replace(/\/$/, "").split("/");
                const filename = slugParts[slugParts.length - 1];
                const blogPostUrl = `/news/${filename}/`;

                return (
                  <div key={index} className='col-lg-6 col-md-6'>
                    <article className='blog-post-card'>
                      <div className='mb-3'>
                        <small className='text-muted'>
                          {node.frontmatter.date}
                          {node.frontmatter.tags && (
                            <span className='ms-2'>
                              {node.frontmatter.tags.map((tag) => (
                                <span key={tag} className='badge bg-light text-dark me-1'>
                                  {tag}
                                </span>
                              ))}
                            </span>
                          )}
                        </small>
                      </div>
                      <h5 className='mb-3'>
                        <Link to={blogPostUrl} className='text-decoration-none text-dark'>
                          {node.frontmatter.title}
                        </Link>
                      </h5>
                      {node.frontmatter.thumbnail && (
                        <div className='mb-3'>
                          <Link to={blogPostUrl}>
                            <GatsbyImage image={getImage(node.frontmatter.thumbnail)} alt={node.frontmatter.title} className='w-100' style={{ height: "250px", objectFit: "cover" }} />
                          </Link>
                        </div>
                      )}
                      <p className='text-muted mb-3'>{node.frontmatter.description}</p>
                      <Link to={blogPostUrl} className='btn btn-outline-dark btn-sm'>
                        Read More
                      </Link>
                    </article>
                  </div>
                );
              })}
            </div>
            <div className='text-center mt-4'>
              <div className='rotating-text d-inline-block'>
                <span>CHECKOUT THE BLOGS</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Work Section */}
        <section className='py-5'>
          <div className='container'>
            <div className='row'>
              <div className='col-12 text-center mb-5'>
                <h2 className='display-5 fw-light'>3 images from most recent album</h2>
              </div>
            </div>
            <div className='row g-4'>
              {recentWorkImages.slice(0, 3).map((image, index) => (
                <div key={index} className='col-lg-4 col-md-6'>
                  <GatsbyImage image={getImage(image)} alt={`Recent work ${index + 1}`} className='w-100' style={{ height: "400px", objectFit: "cover" }} />
                </div>
              ))}
            </div>
            <div className='text-center mt-4'>
              <Link to='/work' className='btn btn-outline-dark'>
                View All Work
              </Link>
            </div>
          </div>
        </section>

        {/* Old content - commented out */}
        {/* 
            <div className="post-feed">
                {posts.map(({ node }) => {
                    postCounter++
                    return (
                        <PostCard
                            key={node.fields.slug}
                            count={postCounter}
                            node={node}
                            postClass={`post`}
                        />
                    )
                })}
            </div>
            */}
      </Layout>
    </>
  );
};
export default IndexPage;
export const IndexPageQuery = graphql`
  query IndexPage {
    site {
      siteMetadata {
        title
        social {
          instagram
          facebook
        }
      }
    }
    markdownRemark(frontmatter: { templateKey: { eq: "index-page" } }) {
      frontmatter {
        title
        description
        thumbnail {
          childImageSharp {
            fluid(maxWidth: 1360) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
    heroImage: file(relativePath: { eq: "clay-images-7.jpg" }, sourceInstanceName: { eq: "uploads" }) {
      childImageSharp {
        gatsbyImageData(layout: FULL_WIDTH, placeholder: NONE)
      }
    }
    aboutImage: file(relativePath: { eq: "clay-images-15.jpg" }, sourceInstanceName: { eq: "uploads" }) {
      childImageSharp {
        gatsbyImageData(width: 400, height: 300, placeholder: NONE)
      }
    }
    recentWorkImages: allFile(filter: { sourceInstanceName: { eq: "uploads" }, extension: { regex: "/(jpg|jpeg|png)/" }, relativePath: { regex: "/clay-images-/" } }, limit: 10, sort: { relativePath: ASC }) {
      nodes {
        childImageSharp {
          gatsbyImageData(width: 600, height: 400, placeholder: NONE)
        }
      }
    }
    recentAlbums: allFile(
      filter: { 
        sourceInstanceName: { eq: "work" },
        extension: { in: ["jpg", "jpeg", "png"] },
        relativeDirectory: { regex: "/work\\/20/" }
      },
      limit: 50,
      sort: { relativePath: ASC }
    ) {
      nodes {
        relativePath
        relativeDirectory
        childImageSharp {
          gatsbyImageData(width: 600, height: 400, placeholder: NONE)
        }
      }
    }
    albumMetadata: allFile(
      filter: { 
        sourceInstanceName: { eq: "work" },
        name: { eq: "album" },
        extension: { eq: "md" }
      },
      sort: { relativePath: DESC }
    ) {
      nodes {
        relativeDirectory
        childMarkdownRemark {
          frontmatter {
            title
            description
            date
          }
        }
      }
    }
    allMarkdownRemark(filter: { frontmatter: { templateKey: { eq: "blog-post" } } }, limit: 6, sort: { frontmatter: { date: DESC } }) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
            tags
            thumbnail {
              childImageSharp {
                gatsbyImageData(width: 600, height: 400, placeholder: NONE)
              }
            }
          }
        }
      }
    }
  }
`;
