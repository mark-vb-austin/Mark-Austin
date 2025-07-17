import React, { useState, useEffect, useRef, useCallback } from "react";
// import PropTypes from "prop-types";
import { graphql, Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import Seo from "../components/seo";
import GlasgowIcon from "../../static/icons//icon--glasgow-gold.svg";
import PaisleyIcon from "../../static/icons//icon--paisley-gold.svg";
import ScotlandIcon from "../../static/icons//icon--scotland-gold.svg";
import exifData from "../img/exif-data.json";

import { Helmet } from "react-helmet";

// Hero Images Rotation Component with Canvas
const RotatingHeroImages = ({ heroImages }) => {
  const canvasRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const animationRef = useRef(null);

  // Load all images
  useEffect(() => {
    if (!heroImages || heroImages.length === 0) return;

    const loadImages = async () => {
      const imagePromises = heroImages.map((heroImage) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          // Get the Gatsby processed image URL
          const imageData = getImage(heroImage);
          const imageSrc = imageData?.images?.fallback?.src;
          
          if (!imageSrc) {
            reject(new Error('No image source found'));
            return;
          }

          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = imageSrc;
        });
      });

      try {
        const images = await Promise.all(imagePromises);
        setLoadedImages(images);
      } catch (error) {
        console.error('Error loading hero images:', error);
      }
    };

    loadImages();
  }, [heroImages]);

  // Canvas drawing function
  const drawImage = useCallback((canvas, img, opacity = 1) => {
    if (!canvas || !img) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Calculate aspect ratio and positioning for cover effect
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = width / height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgAspect > canvasAspect) {
      // Image is wider than canvas
      drawHeight = height;
      drawWidth = height * imgAspect;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Image is taller than canvas
      drawWidth = width;
      drawHeight = width / imgAspect;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    }
    
    ctx.globalAlpha = opacity;
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.globalAlpha = 1;
  }, []);

  // Animation function for smooth transitions
  const animateTransition = useCallback((canvas, fromImg, toImg, duration = 1500) => {
    if (!canvas || !fromImg || !toImg) return;
    
    const startTime = performance.now();
    setIsTransitioning(true);
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-in-out)
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw outgoing image with decreasing opacity
      drawImage(canvas, fromImg, 1 - easeProgress);
      
      // Draw incoming image with increasing opacity
      drawImage(canvas, toImg, easeProgress);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsTransitioning(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [drawImage]);

  // Handle canvas resize
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Redraw current image
    if (loadedImages[currentImageIndex]) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawImage(canvas, loadedImages[currentImageIndex]);
    }
  }, [loadedImages, currentImageIndex, drawImage]);

  // Setup canvas and initial image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadedImages.length === 0) return;
    
    resizeCanvas();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [loadedImages, resizeCanvas]);

  // Image rotation logic
  useEffect(() => {
    if (!loadedImages || loadedImages.length <= 1) return;

    const interval = setInterval(() => {
      if (isTransitioning) return; // Skip if already transitioning
      
      setCurrentImageIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % loadedImages.length;
        
        // Animate transition
        const canvas = canvasRef.current;
        if (canvas && loadedImages[prevIndex] && loadedImages[newIndex]) {
          animateTransition(canvas, loadedImages[prevIndex], loadedImages[newIndex]);
        }
        
        return newIndex;
      });
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [loadedImages, isTransitioning, animateTransition]);

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!heroImages || heroImages.length === 0) {
    return (
      <div className='w-100 h-100 bg-dark d-flex align-items-center justify-content-center'>
        <span className='text-white'>No hero images available</span>
      </div>
    );
  }

  return (
    <div className='position-relative w-100 h-100'>
      <canvas
        ref={canvasRef}
        className='w-100 h-100'
        style={{ display: 'block', objectFit: 'cover' }}
      />
      
      {/* Optional: Add subtle indicators */}
      {loadedImages.length > 1 && (
        <div className='position-absolute d-flex gap-2' 
          style={{ 
            bottom: '5%', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 10 
          }}
        >
          {loadedImages.map((_, index) => (
            <div key={index} className='rounded-circle'
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#fff',
                opacity: index === currentImageIndex ? 0.9 : 0.4,
                transition: 'opacity 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// eslint-disable-next-line
const IndexPage = ({ data }) => {
  const siteTitle = data.site.siteMetadata.title;
  const social = data.site.siteMetadata.social;
  const posts = data.allMarkdownRemark.edges;
  
  // Extract intro images from src/img/home/two-column directory
  const introImages = data.introImages.nodes;
  const introLeftImage = introImages[0]; // First image for left
  const introRightImage = introImages[1]; // Second image for right
  
  // Extract hero images from src/img/home/hero directory
  const heroImages = data.heroImages.nodes;
  
  const recentAlbums = data.recentAlbums.group;
  const albumMetadata = data.albumMetadata.nodes;

  // Create a map of album metadata by directory
  const metadataMap = {};
  albumMetadata.forEach((file) => {
    if (file.childMarkdownRemark && file.childMarkdownRemark.frontmatter) {
      metadataMap[file.relativeDirectory] = file.childMarkdownRemark.frontmatter;
    }
  });

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

  // Process grouped album data - albums are already grouped by directory
  const processedAlbums = recentAlbums.map((albumGroup) => {
    const dir = albumGroup.fieldValue;
    const images = albumGroup.nodes;
    
    // Get the most recent MetadataDate or fallback to file mtime
    const metadataDate = getAlbumMetadataDate(dir);
    const mostRecentTime = metadataDate || new Date(Math.max(...images.map(file => new Date(file.mtime).getTime())));
    
    return {
      directory: dir,
      imageCount: albumGroup.totalCount,
      cover: images[0], // First image as cover
      images: images.slice(0, 4), // Keep up to 4 images: 2 for sliding + 2 for "Most Recent Shoot"
      metadata: metadataMap[dir] || null,
      mostRecentTime: mostRecentTime
    };
  });

  // Sort by most recent time and get top 3
  const recentAlbumEntries = processedAlbums
    .sort((a, b) => b.mostRecentTime - a.mostRecentTime)
    .slice(0, 3)
    .map(album => [album.directory, album]); // Convert to [dir, albumData] format for compatibility

  // Helper function to create album title from directory path or metadata
  const createAlbumTitle = (dir, albumData) => {
    // Use metadata title if available
    if (albumData.metadata && albumData.metadata.title) {
      return albumData.metadata.title;
    }
    // Fallback to directory name
    const parts = dir.split('/');
    if (parts.length >= 2) {
      const albumName = parts[parts.length - 1];
      return albumName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Album';
  };

  // Helper function to create album URL
  const createAlbumUrl = (dir) => {
    const parts = dir.split('/');
    if (parts.length >= 2) {
      const year = parts[0];
      const albumName = parts[1];
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

            @media (max-width: 850px) {
            .site-wrapper.site-head-open .site-main {
              margin-top: 0px;
            }

            main#site-main h1 {
              color: #ffffff !important;
            }

            .hero-section .gatsby-image-wrapper {
              transition: transform 0.3s ease;
            }

            #swup > .col {
              padding: 0;
            }
          `}
        </style>
      </Helmet>
      <Layout title={siteTitle} social={social}>
        <Seo keywords={[`Mark Austin Photography`, `Scottish Photographer`, `Professional Photography`, `Landscape Photography`]} title={data.markdownRemark.frontmatter.title} description={data.markdownRemark.frontmatter.description || ""} image={data.markdownRemark.frontmatter.thumbnail.childImageSharp.fluid.src} />

        {/* HERO SECTION */}
        <section className='hero-section position-relative' style={{ height: "100vh", overflow: "hidden", backgroundColor: "#000" }}>
          <div className='position-absolute w-100 h-100' style={{ zIndex: 1 }}>
            <RotatingHeroImages heroImages={heroImages} />
          </div>
          <div className='position-absolute w-100 h-100 d-flex align-items-center justify-content-center' style={{ zIndex: 2, backgroundColor: "rgba(0,0,0,0.3)" }}>
            <div className='text-center text-white p-4'>
              <h1 className=' mb-3' style={{ fontSize: "4rem", fontFamily: "serif" }}>
                A PLACE TO
                <br />
                KEEP MOMENTS
              </h1>
              <p className='mb-4 italic'>At first, I just wanted to capture my family growing up. Now it’s part of how I see the world.</p>
              <div className='mt-5'>
                <button
                  onClick={() => {
                    document.getElementById("intro-content__two-column")?.scrollIntoView({
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
        <section className='container' id='intro-content__two-column' style={{ scrollMarginTop: "75px" }}>
          <div className='row px-4 px-md-0 mt-100'>
            <div className='col-md-4 offset-md-2 col-6'>
              <div className='intro-image-container' style={{ aspectRatio: "4/5", overflow: "hidden" }}>
                <GatsbyImage image={getImage(introLeftImage)} alt='Wedding photography' className='w-100 h-100' style={{ objectFit: "cover" }} />
              </div>
              <div className='mt-3'>
                <div className='text-end'>
                  <p>THE HEART OF MY WORK</p>
                  <p>ISN'T IN POSED PERFECTION</p>
                  <p><span className="fw-heavy">IT'S IN REAL MOMENTS</span></p>
                  <p className="m-0">YOU'LL WANT TO REMEMBER</p>
                </div>
              </div>
            </div>

            <div className='col-md-4 col-6 d-flex flex-column justify-content-end'>
              <div className='mb-3'>
                <p>HONEST</p>
                <p><span className="fw-heavy">CANDID</span></p>
                <p>STORY-LED</p>
                <p className="m-0"><span className="fw-heavy">MEANINGFUL</span></p>
              </div>
              <div className='intro-image-container' style={{ aspectRatio: "4/5", overflow: "hidden" }}>
                <GatsbyImage image={getImage(introRightImage)} alt='Wedding photography' className='w-100 h-100' style={{ objectFit: "cover" }} />
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
                <h2 className=' '>Recent Albums</h2>
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
              <h2 className=' '>Latest Blog Posts</h2>
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
                {(() => {
                  // Show the album title for the most recent album
                  if (recentAlbumEntries.length > 0) {
                    const [albumDir, albumData] = recentAlbumEntries[0];
                    const albumTitle = createAlbumTitle(albumDir, albumData);
                    const albumUrl = createAlbumUrl(albumDir);
                    return (
                      <p className='text-muted'>
                        <Link to={albumUrl} className='text-decoration-none'>
                          {albumTitle}
                        </Link>
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
            <div className='row p-4 justify-content-center'>
              {(() => {
                // Get the most recent album (first entry after sorting by MetadataDate)
                if (recentAlbumEntries.length === 0) {
                  return <div className='col-12 text-center'><p>No recent albums available</p></div>;
                }
                
                const mostRecentAlbum = recentAlbumEntries[0];
                const [albumDir, albumData] = mostRecentAlbum;
                const albumTitle = createAlbumTitle(albumDir, albumData);
                
                // Ensure we have enough images for the section
                const imagesToShow = albumData.images.slice(0, 3);
                if (imagesToShow.length === 0) {
                  return <div className='col-12 text-center'><p>No images available for the most recent album</p></div>;
                }
                
                return imagesToShow.map((image, index) => (
                  <div key={index} className={`col-lg-4 col-md-4`}>
                    <Link to={createAlbumUrl(albumDir)} className='text-decoration-none'>
                      <GatsbyImage image={getImage(image)} alt={`${albumTitle} - Image ${index + 1}`} className='w-100' style={{ aspectRatio: "4/5", overflow: "hidden", cursor: "pointer" }} />
                    </Link>
                  </div>
                ));
              })()}
            </div>
            <div className='text-center mt-4'>
              <Link to='/work' className='btn btn-highlight-gold'>
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
      }
    }
    introImages: allFile(
      filter: { 
        sourceInstanceName: { eq: "home" },
        relativeDirectory: { eq: "two-column" },
        extension: { in: ["jpg", "jpeg", "png", "webp"] }
      },
      limit: 2,
      sort: { name: ASC }
    ) {
      nodes {
        childImageSharp {
          gatsbyImageData(width: 600, height: 750, placeholder: NONE)
        }
      }
    }
    heroImages: allFile(
      filter: { 
        sourceInstanceName: { eq: "home" },
        relativeDirectory: { eq: "hero" },
        extension: { in: ["jpg", "jpeg", "png", "webp"] }
      },
      limit: 10,
      sort: { name: ASC }
    ) {
      nodes {
        childImageSharp {
          gatsbyImageData(layout: FULL_WIDTH, placeholder: NONE)
        }
      }
    }
    heroImage: file(relativePath: { eq: "mark-austin-photos-7.jpg" }, sourceInstanceName: { eq: "uploads" }) {
      childImageSharp {
        gatsbyImageData(layout: FULL_WIDTH, placeholder: NONE)
      }
    }
    recentAlbums: allFile(
      filter: { 
        sourceInstanceName: { eq: "work" },
        extension: { in: ["jpg", "jpeg", "png"] },
        relativeDirectory: { regex: "/^20/" }
      }
    ) {
      group(field: relativeDirectory) {
        fieldValue
        totalCount
        nodes {
          relativePath
          relativeDirectory
          mtime
          childImageSharp {
            gatsbyImageData(width: 600, height: 400, placeholder: NONE)
          }
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
