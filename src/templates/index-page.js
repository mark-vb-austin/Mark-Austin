import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
import { graphql, Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import Seo from "../components/seo";
import GlasgowIcon from "../../static/icons//icon--glasgow-gold.svg";
import PaisleyIcon from "../../static/icons//icon--paisley-gold.svg";
import ScotlandIcon from "../../static/icons//icon--scotland-gold.svg";

import { Helmet } from "react-helmet";

// Hero Images Rotation Component
const RotatingHeroImages = ({ heroImages }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!heroImages || heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroImages.length
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [heroImages]);

  if (!heroImages || heroImages.length === 0) {
    return (
      <div className='w-100 h-100 bg-dark d-flex align-items-center justify-content-center'>
        <span className='text-white'>No hero images available</span>
      </div>
    );
  }

  // If only one image, no need for rotation
  if (heroImages.length === 1) {
    return (
      <GatsbyImage 
        image={getImage(heroImages[0])} 
        alt="Hero background" 
        className='w-100 h-100' 
        style={{ objectFit: "cover" }} 
      />
    );
  }

  return (
    <div className='position-relative w-100 h-100'>
      {heroImages.map((image, index) => (
        <div
          key={index}
          className='position-absolute w-100 h-100'
          style={{
            opacity: index === currentImageIndex ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
            zIndex: index === currentImageIndex ? 1 : 0
          }}
        >
          <GatsbyImage 
            image={getImage(image)} 
            alt={`Hero background ${index + 1}`} 
            className='w-100 h-100' 
            style={{ objectFit: "cover" }} 
          />
        </div>
      ))}
      
      {/* Optional: Add subtle indicators */}
      <div 
        className='position-absolute d-flex gap-2' 
        style={{ 
          bottom: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 10 
        }}
      >
        {heroImages.map((_, index) => (
          <div
            key={index}
            className='rounded-circle bg-white'
            style={{
              width: '8px',
              height: '8px',
              opacity: index === currentImageIndex ? 0.9 : 0.4,
              transition: 'opacity 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
};

// eslint-disable-next-line
const IndexPage = ({ data }) => {
  const siteTitle = data.site.siteMetadata.title;
  const social = data.site.siteMetadata.social;
  const posts = data.allMarkdownRemark.edges;
  
  // Extract hero images from frontmatter, filter out null/undefined values
  const heroImages = [
    data.markdownRemark.frontmatter.heroImage1,
    data.markdownRemark.frontmatter.heroImage2,
    data.markdownRemark.frontmatter.heroImage3,
    data.markdownRemark.frontmatter.heroImage4,
    data.markdownRemark.frontmatter.heroImage5,
  ].filter(Boolean);
  
  // Fallback to the old heroImage if no frontmatter hero images are available
  if (heroImages.length === 0 && data.heroImage) {
    heroImages.push(data.heroImage);
  }
  
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
          metadata: metadataMap[dir] || null,
          mostRecentTime: new Date(file.mtime)
        };
      } else {
        albumMap[dir].imageCount += 1;
        albumMap[dir].images.push(file);
        // Update most recent time if this file is newer
        const fileTime = new Date(file.mtime);
        if (fileTime > albumMap[dir].mostRecentTime) {
          albumMap[dir].mostRecentTime = fileTime;
        }
      }
    }
  });

  // Get the 3 most recent albums (sorted by most recent file time in each album)
  const recentAlbumEntries = Object.entries(albumMap)
    .sort(([,a], [,b]) => b.mostRecentTime - a.mostRecentTime) // Sort by most recent file time descending
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
            @media (min-width: 850px) {
              .site-wrapper:not(.site-head-open) .site-head {
                background: linear-gradient(to bottom,  rgba(0,0,0,6) 0%,rgba(0,0,0,0.6) 1%,rgba(0,0,0,0) 100%);
              }
            }
            
            .site-wrapper:not(.site-head-open) .site-head-container *, 
            .site-wrapper:not(.site-head-open) .site-head-container a{
              color: #fff;
            }

            .site-wrapper:not(.site-head-open) .hamburger-inner, .site-wrapper:not(.site-head-open) .hamburger-inner::before, .site-wrapper:not(.site-head-open) .hamburger-inner::after,
            .site-wrapper:not(.site-head-open) .site-head-open .hamburger-inner, .site-wrapper:not(.site-head-open) .site-head-open .hamburger-inner::before, .site-wrapper:not(.site-head-open) .site-head-open .hamburger-inner::after {
              background-color: #fff;
            }

            .site-main {
              margin-top: -75px;
              padding-left: 0;
              padding-right: 0;
            }

            .hero-section {
              // margin-top: -110px;
            }

            main#site-main h1 {
              color: #fff;
            }

            /* Hero Image Rotation Styles */
            .hero-section .position-absolute {
              will-change: opacity;
            }
            
            .hero-section .gatsby-image-wrapper {
              transition: transform 0.3s ease;
            }
            
            .hero-section:hover .gatsby-image-wrapper {
              transform: scale(1.02);
            }
          `}
        </style>
      </Helmet>
      <Layout title={siteTitle} social={social}>
        <Seo keywords={[`Mark Austin Photography`, `Scottish Photographer`, `Professional Photography`, `Landscape Photography`]} title={data.markdownRemark.frontmatter.title} description={data.markdownRemark.frontmatter.description || ""} image={data.markdownRemark.frontmatter.thumbnail.childImageSharp.fluid.src} />

        {/* HERO SECTION */}
        <section className='hero-section position-relative' style={{ height: "100vh", overflow: "hidden" }}>
          <div className='position-absolute w-100 h-100' style={{ zIndex: 1 }}>
            <RotatingHeroImages heroImages={heroImages} />
          </div>
          <div className='position-absolute w-100 h-100 d-flex align-items-center justify-content-center' style={{ zIndex: 2, backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className='text-center text-white p-4'>
              <h1 className='display-1 fw-light mb-3' style={{ fontSize: "4rem", fontFamily: "serif" }}>
                A PLACE TO
                <br />
                KEEP MOMENTS
              </h1>
              <p className='lead mb-4'>At first, I just wanted to capture my family growing up. Now it’s part of how I see the world.</p>
              <div className='mt-5'>
                <button
                  onClick={() => {
                    document.getElementById("home-main-content")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className='border rounded-circle d-inline-flex align-items-center justify-content-center bg-transparent text-white'
                  style={{ width: "60px", height: "60px", borderColor: "white", cursor: "pointer", boxShadow: "none" }}
                  aria-label='Scroll to main content'>
                  <span style={{ fontSize: "24px" }}>↓</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* intro Content */}
        <section className='container' id='home-main-content' style={{ scrollMarginTop: "75px" }}>
          <div className='row px-4 px-md-0 mt-100'>
            <div className='col-md-4 offset-md-2 col-6'>
              <div className='intro-image-container' style={{ aspectRatio: "4/5", overflow: "hidden" }}>
                {/* <GatsbyImage image={getImage(recentWorkImages[0])} alt='Wedding photography' className='w-100 h-100' style={{ objectFit: "cover" }} /> */}

                <GatsbyImage image={getImage(data.markdownRemark.frontmatter.introLeftImage)} alt='Wedding photography' className='w-100 h-100' style={{ objectFit: "cover" }} />

              </div>
              <div className='mt-3'>
                <div className='text-end'>
                  THE HEART OF MY WORK
                  <br />
                  ISN'T IN POSED PERFECTION —<br />
                  <strong>IT'S IN REAL MOMENTS</strong>
                  <br />
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
                <GatsbyImage image={getImage(data.markdownRemark.frontmatter.introRightImage)} alt='Wedding photography' className='w-100 h-100' style={{ objectFit: "cover" }} />
              </div>
            </div>
          </div>
        </section>

        {/* Glasgow Icon Devider */}
        <div className='container hr-icon'>
          <div className='row vh-half justify-content-center'>
            <div className='col-sm-2 col-4'>
              <img src={GlasgowIcon} alt='' />
            </div>
          </div>
        </div>

        {/* // Recent Albums Section */}
        <section className='container'>
          {/* <div className='row'>
              <div className='col-12 text-center mb-5'>
                <h2 className=' fw-light'>Recent Albums</h2>
              </div>
            </div> */}
          <div className='row '>
            <div className='col-md-8 offset-md-2 col-12'>
              <div className='d-flex justify-content-center align-items-center gap-2 gap-sm-3'>
                {recentAlbumEntries.map(([albumDir, albumData], index) => {
                  const albumTitle = createAlbumTitle(albumDir, albumData);
                  const albumUrl = createAlbumUrl(albumDir);
                  const images = albumData.images.slice(0, 2); // Get first 2 images for sliding

                  return (
                    <Link key={albumDir} to={albumUrl} className='text-decoration-none' style={{ width: index === 1 ? "35%" : "30%", aspectRatio: "4/5" }}>
                      <div className={`album-card ${index === 1 ? "album-card-center" : ""}`}>
                        <div className='album-card-container position-relative overflow-hidden' style={{ width: "100%", height: "100%" }}>
                          <div className={`album-slide album-slide-${index + 1} d-flex`} style={{ width: "200%", height: "100%", transform: "translateX(0%)", transition: "transform 0.5s ease" }}>
                            <div className='album-image-1' style={{ width: "50%", height: "100%" }}>
                              <GatsbyImage image={getImage(images[0])} alt={`${albumTitle} - Image 1`} className='w-100 h-100' style={{ objectFit: "cover" }} />
                            </div>
                            <div className='album-image-2' style={{ width: "50%", height: "100%" }}>
                              <GatsbyImage image={getImage(images[1] || images[0])} alt={`${albumTitle} - Image 2`} className='w-100 h-100' style={{ objectFit: "cover" }} />
                            </div>
                          </div>
                          <div className='album-overlay position-absolute bottom-0 start-0 w-100 p-3'>
                            <h5 className='mb-1'>{albumTitle}</h5>
                            <p className='mb-0 small'>
                              {albumData.imageCount} Image{albumData.imageCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Paisley Icon Devider */}
        <div className='container hr-icon'>
          <div className='row vh-half justify-content-center'>
            <div className='col-sm-1 col-2'>
              <img src={PaisleyIcon} alt='' />
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <section className='container'>
          {/* <div className='row'>
            <div className='col-12 text-center mb-5'>
              <h2 className=' fw-light'>Latest Blog Posts</h2>
            </div>
          </div> */}
          <div className='row p-4 justify-content-center'>
            {posts.slice(0, 6).map(({ node }, index) => {
              // Generate the correct blog post URL
              const slug = node.fields.slug;
              const slugParts = slug.replace(/\/$/, "").split("/");
              const filename = slugParts[slugParts.length - 1];
              const blogPostUrl = `/blog/${filename}/`;

              return (
                <div key={index} className='blog-cards col-6 col-sm-5 p-0 m-0' style={{ aspectRatio: "1.2/1", overflow: "hidden" }}>
                  <Link to={blogPostUrl} className='text-decoration-none'>
                    <article className='blog-post-card position-relative overflow-hidden' style={{ height: "100%", cursor: "pointer" }}>
                      {/* Background Image */}
                      <div className='position-absolute w-100 h-100' style={{ zIndex: 1 }}>
                        {node.frontmatter.thumbnail ? (
                          <GatsbyImage image={getImage(node.frontmatter.thumbnail)} alt={node.frontmatter.title} className='w-100 h-100' style={{ objectFit: "cover" }} />
                        ) : (
                          <div className='w-100 h-100 d-flex align-items-center justify-content-center bg-light'>
                            <span className='text-muted'>BACKGROUND IMAGE</span>
                          </div>
                        )}
                      </div>

                      {/* Date, Tags, and Title Overlay */}
                      <div className='position-absolute top-0 start-0 p-3' style={{ zIndex: 3 }}>
                        <div className='d-flex align-items-center flex-wrap mb-2'>
                          <small className='text-white bg-dark px-2 py-1 rounded me-2'>{node.frontmatter.date}</small>
                          {node.frontmatter.tags && (
                            <>
                              {node.frontmatter.tags.map((tag) => (
                                <small key={tag} className='badge bg-light text-dark px-2 py-0 rounded me-2'>
                                  {tag}
                                </small>
                              ))}
                            </>
                          )}
                        </div>
                        <h5 className='text-white my-0' style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                          {node.frontmatter.title}
                        </h5>
                      </div>

                      {/* Hover Description Overlay */}
                      <div
                        className='blog-post-hover-overlay position-absolute bottom-0 start-0 w-100 p-4'
                        style={{
                          zIndex: 4,
                          backgroundColor: "rgba(0,0,0,0.75)",
                          backdropFilter: "blur(10px)",
                          transform: "translateY(100%)",
                          transition: "transform 0.4s ease",
                        }}>
                        <div className='text-start'>
                          <p className='text-white mb-3'>{node.frontmatter.description}</p>
                          <span className='btn btn-light btn-sm text-white text-decoration-underline'>Read More {">"}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Scotland Icon Devider */}
        <div className='container hr-icon'>
          <div className='row vh-half justify-content-center'>
            <div className='col-sm-2 col-4  '>
              <img src={ScotlandIcon} alt='' />
            </div>
          </div>
        </div>

        {/* Recent Work Section */}
        <section className=''>
          <div className='container'>
            <div className='row'>
              <div className='col-12 text-center'>
                <h2 className='d-flex justify-content-center align-items-center'>Most Recent Shoot</h2>
              </div>
            </div>
            <div className='row p-4 justify-content-center'>
              {(() => {
                // Get the most recent album (first entry after sorting)
                const mostRecentAlbum = recentAlbumEntries[0];
                if (mostRecentAlbum) {
                  const [albumDir, albumData] = mostRecentAlbum;
                  const albumTitle = createAlbumTitle(albumDir, albumData);
                  return albumData.images.slice(0, 3).map((image, index) => (
                    <div key={index} className={`col-lg-4 col-md-6 ${index === 1 ? "col-6" : "col-12"}`}>
                      <GatsbyImage image={getImage(image)} alt={`${albumTitle} - Image ${index + 1}`} className='w-100' style={{ height: "400px", objectFit: "cover" }} />
                    </div>
                  ));
                } else {
                  // Fallback to general recent work images if no albums found
                  return recentWorkImages.slice(0, 3).map((image, index) => (
                    <div key={index} className='col-lg-4 col-md-6'>
                      <GatsbyImage image={getImage(image)} alt={`Recent work ${index + 1}`} className='w-100' style={{ height: "400px", objectFit: "cover" }} />
                    </div>
                  ));
                }
              })()}
            </div>
            <div className='text-center mt-4'>
              <Link to='/work' className='btn btn-outline-dark'>
                View All Work
              </Link>
            </div>
          </div>
        </section>
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
        introLeftImage {
          name
          childImageSharp {
            gatsbyImageData
          }
        }
        introRightImage {
          name
          childImageSharp {
            gatsbyImageData
          }
        }
        heroImage1 {
          childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH, placeholder: NONE)
          }
        }
        heroImage2 {
          childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH, placeholder: NONE)
          }
        }
        heroImage3 {
          childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH, placeholder: NONE)
          }
        }
        heroImage4 {
          childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH, placeholder: NONE)
          }
        }
        heroImage5 {
          childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH, placeholder: NONE)
          }
        }
      }
    }
    heroImage: file(relativePath: { eq: "mark-austin-photos-7.jpg" }, sourceInstanceName: { eq: "uploads" }) {
      childImageSharp {
        gatsbyImageData(layout: FULL_WIDTH, placeholder: NONE)
      }
    }
    recentWorkImages: allFile(filter: { sourceInstanceName: { eq: "uploads" }, extension: { regex: "/(jpg|jpeg|png)/" }, relativePath: { regex: "/mark-austin-photos-/" } }, limit: 10, sort: { relativePath: ASC }) {
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
      sort: { mtime: DESC }
    ) {
      nodes {
        relativePath
        relativeDirectory
        mtime
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
            date(formatString: "DD MMMM YYYY")
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
