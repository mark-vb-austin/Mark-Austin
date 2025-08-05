import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { graphql, Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import Seo from "../components/seo";
import GlasgowIcon from "../../static/icons//icon--glasgow-gold.svg";
import PaisleyIcon from "../../static/icons//icon--paisley-gold.svg";
import ScotlandIcon from "../../static/icons//icon--scotland-gold.svg";
import exifData from "../img/exif-data.json";

// Extract CSS to prevent re-creation on each render
const pageStyles = `
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
`;

// Hero Carousel with Optimized with comprehensive performance improvements
const RotatingHeroImages = React.memo(({ heroImages }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const intervalRef = useRef(null);
  const animationRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const resumeTimeoutRef = useRef(null);

  // Memoize image sources to prevent unnecessary re-processing
  const imageSources = useMemo(() => {
    if (!heroImages || heroImages.length === 0) return [];

    return heroImages
      .map((heroImage) => {
        const imageData = getImage(heroImage);
        return imageData?.images?.fallback?.src;
      })
      .filter(Boolean);
  }, [heroImages]);

  // Optimized image loading with proper cleanup and error handling
  useEffect(() => {
    if (imageSources.length === 0) return;

    let isMounted = true;
    const loadImages = async () => {
      const imagePromises = imageSources.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";

          img.onload = () => {
            if (isMounted) resolve(img);
          };
          img.onerror = () => {
            if (isMounted) reject(new Error(`Failed to load image: ${src}`));
          };
          img.src = src;
        });
      });

      try {
        const images = await Promise.all(imagePromises);
        if (isMounted) {
          setLoadedImages(images);
        }
      } catch (error) {
        if (isMounted) {
        }
      }
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [imageSources]);

  // Optimized canvas context management with caching
  const getCanvasContext = useCallback(() => {
    if (!contextRef.current && canvasRef.current) {
      contextRef.current = canvasRef.current.getContext("2d", { alpha: false });
    }
    return contextRef.current;
  }, []);

  // Optimized drawing function with reduced calculations
  const drawImage = useCallback(
    (img, opacity = 1) => {
      const canvas = canvasRef.current;
      const ctx = getCanvasContext();

      if (!canvas || !ctx || !img) return;

      // Use CSS dimensions for calculations, not canvas dimensions
      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const canvasAspect = width / height;
      const imgAspect = img.naturalWidth / img.naturalHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspect > canvasAspect) {
        drawHeight = height;
        drawWidth = height * imgAspect;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = width;
        drawHeight = width / imgAspect;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }

      ctx.globalAlpha = opacity;
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.globalAlpha = 1;
    },
    [getCanvasContext]
  );

  // Optimized animation with better performance
  const animateTransition = useCallback(
    (fromImg, toImg, duration = 1500) => {
      if (!fromImg || !toImg) return;

      const canvas = canvasRef.current;
      const ctx = getCanvasContext();

      if (!canvas || !ctx) return;

      const startTime = performance.now();
      setIsTransitioning(true);

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Optimized easing function
        const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Use CSS dimensions for clearRect
        const container = canvas.parentElement;
        if (container) {
          const rect = container.getBoundingClientRect();
          ctx.clearRect(0, 0, rect.width, rect.height);
        }

        // Draw images with calculated opacity
        drawImage(fromImg, 1 - easeProgress);
        drawImage(toImg, easeProgress);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsTransitioning(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [getCanvasContext, drawImage]
  );

  // Optimized resize handler with debouncing and pixel ratio support
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;

    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * pixelRatio;
    canvas.height = rect.height * pixelRatio;

    // Set display size (css pixels)
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    // Clear context reference to force re-creation with new scaling
    contextRef.current = null;

    // Scale the context to ensure correct drawing operations
    const ctx = getCanvasContext();
    if (ctx) {
      ctx.scale(pixelRatio, pixelRatio);
    }

    // Redraw current image
    if (loadedImages[currentImageIndex]) {
      ctx.clearRect(0, 0, rect.width, rect.height);
      drawImage(loadedImages[currentImageIndex]);
    }
  }, [loadedImages, currentImageIndex, drawImage, getCanvasContext]);

  // Debounced resize handler
  const debouncedResize = useCallback(() => {
    clearTimeout(resizeTimeoutRef.current);
    resizeTimeoutRef.current = setTimeout(resizeCanvas, 150);
  }, [resizeCanvas]);

  // Setup canvas with optimized event handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadedImages.length === 0) return;

    resizeCanvas();

    window.addEventListener("resize", debouncedResize, { passive: true });

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimeoutRef.current);
    };
  }, [loadedImages, resizeCanvas, debouncedResize]);

  // Manual navigation function
  const goToImage = useCallback(
    (targetIndex) => {
      if (isTransitioning || targetIndex === currentImageIndex || !loadedImages[targetIndex]) return;

      setIsPaused(true);

      // Clear any existing resume timeout
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }

      // Set resume timeout for 3 seconds after interaction
      resumeTimeoutRef.current = setTimeout(() => {
        setIsPaused(false);
      }, 3000);

      // Animate to target image
      if (loadedImages[currentImageIndex] && loadedImages[targetIndex]) {
        animateTransition(loadedImages[currentImageIndex], loadedImages[targetIndex]);
      }

      setCurrentImageIndex(targetIndex);
    },
    [currentImageIndex, loadedImages, isTransitioning, animateTransition]
  );

  // Optimized rotation logic with pause functionality
  useEffect(() => {
    if (!loadedImages || loadedImages.length <= 1) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only start interval if not paused
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        if (isTransitioning) return;

        setCurrentImageIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % loadedImages.length;

          if (loadedImages[prevIndex] && loadedImages[newIndex]) {
            animateTransition(loadedImages[prevIndex], loadedImages[newIndex]);
          }

          return newIndex;
        });
      }, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadedImages, isTransitioning, isPaused, animateTransition]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!loadedImages || loadedImages.length <= 1) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          const prevIndex = currentImageIndex === 0 ? loadedImages.length - 1 : currentImageIndex - 1;
          goToImage(prevIndex);
          break;
        case "ArrowRight":
          e.preventDefault();
          const nextIndex = (currentImageIndex + 1) % loadedImages.length;
          goToImage(nextIndex);
          break;
        case " ":
        case "Spacebar":
          e.preventDefault();
          setIsPaused(!isPaused);
          if (!isPaused) {
            // If pausing, clear the resume timeout
            if (resumeTimeoutRef.current) {
              clearTimeout(resumeTimeoutRef.current);
            }
          }
          break;
        default:
          break;
      }
    };

    // Only add keyboard listener when the hero section is in focus
    const heroSection = document.querySelector(".hero-section");
    if (heroSection) {
      heroSection.addEventListener("keydown", handleKeyDown);

      return () => {
        heroSection.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [currentImageIndex, loadedImages, isPaused, goToImage]);
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
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
      <canvas ref={canvasRef} className='w-100 h-100' style={{ display: "block", objectFit: "cover" }} />

      {/* Pause indicator */}
      {isPaused && (
        <div className='position-absolute top-0 start-0 m-3' style={{ zIndex: 20 }}>
          <div
            className='px-2 py-1 rounded'
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold",
            }}>
            PAUSED
          </div>
        </div>
      )}

      {/* Interactive pagination indicators */}
      {loadedImages.length > 1 && (
        <div
          className='position-absolute d-flex gap-2'
          style={{
            bottom: "5%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
          }}>
          {loadedImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: index === currentImageIndex ? "#fff" : "rgba(255, 255, 255, 0.4)",
                opacity: index === currentImageIndex ? 0.9 : 0.6,
                transition: "all 0.3s ease",
                cursor: "pointer",
                transform: index === currentImageIndex ? "scale(1.2)" : "scale(1)",
                border: "none",
                borderRadius: "50%",
                padding: "0",
                outline: "none",
                boxShadow: "none",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
              }}
              onMouseEnter={(e) => {
                if (index !== currentImageIndex) {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
                  e.target.style.transform = "scale(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentImageIndex) {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
                  e.target.style.transform = "scale(1)";
                }
              }}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// Memoized blog post card component
const BlogPostCard = React.memo(({ node, index }) => {
  const { fields, frontmatter } = node;
  const { title, description, date, tags, thumbnail } = frontmatter || {};
  const slug = fields?.slug;

  const blogPostUrl = useMemo(() => {
    if (!slug) return "/blog/";
    const slugParts = slug.replace(/\/$/, "").split("/");
    const filename = slugParts[slugParts.length - 1];
    return `/blog/${filename}/`;
  }, [slug]);

  // Early return if essential data is missing
  if (!title || !frontmatter) {
    return (
      <div className='blog-cards col-6 col-sm-5 p-0 m-0' style={{ aspectRatio: "1.2/1", overflow: "hidden" }}>
        <div className='w-100 h-100 d-flex align-items-center justify-content-center bg-light'>
          <span className='text-muted'>Blog post data unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className='blog-cards col-6 col-sm-5 p-0 m-0' style={{ aspectRatio: "1.2/1", overflow: "hidden" }}>
      <Link to={blogPostUrl} className='text-decoration-none'>
        <article className='blog-post-card position-relative overflow-hidden' style={{ height: "100%", cursor: "pointer" }}>
          <div className='position-absolute w-100 h-100' style={{ zIndex: 1 }}>
            {thumbnail ? (
              <GatsbyImage image={getImage(thumbnail)} alt={title} className='w-100 h-100' style={{ objectFit: "cover" }} />
            ) : (
              <div className='w-100 h-100 d-flex align-items-center justify-content-center bg-light'>
                <span className='text-muted'>BACKGROUND IMAGE</span>
              </div>
            )}
          </div>

          <div className='position-absolute top-0 start-0 p-3' style={{ zIndex: 3 }}>
            <div className='d-flex align-items-center flex-wrap mb-2'>
              <small className='text-white bg-dark px-2 py-1 rounded me-2'>{date}</small>
              {tags &&
                tags.map((tag) => (
                  <small key={tag} className='badge bg-light text-dark px-2 py-0 rounded me-2'>
                    {tag}
                  </small>
                ))}
            </div>
            <h5 className='text-white my-0' style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
              {title}
            </h5>
          </div>

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
              <p className='text-white mb-3'>{description}</p>
              <span className='btn btn-light btn-sm text-white text-decoration-underline'>Read More {">"}</span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
});

// Memoized album card component with optimized calculations
const AlbumCard = React.memo(({ albumDir, albumData, index }) => {
  const albumTitle = useMemo(() => {
    if (albumData.metadata?.title) {
      return albumData.metadata.title;
    }
    const parts = albumDir.split("/");
    if (parts.length >= 2) {
      const albumName = parts[parts.length - 1];
      return albumName.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
    return "Album";
  }, [albumDir, albumData.metadata]);

  const albumUrl = useMemo(() => {
    const parts = albumDir.split("/");
    if (parts.length >= 2) {
      const year = parts[0];
      const albumName = parts[1];
      return `/work/${year}/${albumName}`;
    }
    return "/work";
  }, [albumDir]);

  const images = useMemo(() => albumData.images.slice(0, 2), [albumData.images]);

  return (
    <Link to={albumUrl} className='text-decoration-none' style={{ width: index === 1 ? "35%" : "30%", aspectRatio: "4/5" }}>
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
});

// Optimized data processing hooks
const useProcessedAlbums = (recentAlbums, metadataMap) => {
  const parseExifDate = useCallback((exifDateString) => {
    const match = exifDateString.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})(.*)$/);
    if (!match) return null;

    const [, year, month, day, hour, minute, second, timezone] = match;
    const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}${timezone}`;
    return new Date(isoString);
  }, []);

  const getAlbumMetadataDate = useCallback(
    (albumDir) => {
      let mostRecentMetadataDate = null;

      for (const imagePath of Object.keys(exifData)) {
        if (imagePath.startsWith(`work/${albumDir}/`)) {
          const imageExif = exifData[imagePath];
          if (imageExif?.MetadataDate) {
            const metadataDate = parseExifDate(imageExif.MetadataDate.rawValue);

            if (metadataDate && (!mostRecentMetadataDate || metadataDate > mostRecentMetadataDate)) {
              mostRecentMetadataDate = metadataDate;
            }
          }
        }
      }

      return mostRecentMetadataDate;
    },
    [parseExifDate]
  );

  return useMemo(() => {
    return recentAlbums.map((albumGroup) => {
      const dir = albumGroup.fieldValue;
      const images = albumGroup.nodes;

      const metadataDate = getAlbumMetadataDate(dir);
      const mostRecentTime = metadataDate || new Date(Math.max(...images.map((file) => new Date(file.mtime).getTime())));

      return {
        directory: dir,
        imageCount: albumGroup.totalCount,
        cover: images[0],
        images: images.slice(0, 4),
        metadata: metadataMap[dir] || null,
        mostRecentTime: mostRecentTime,
      };
    });
  }, [recentAlbums, getAlbumMetadataDate, metadataMap]);
};

// Main IndexPage component with comprehensive optimizations
const IndexPage = ({ data }) => {
  const { site, markdownRemark, introImages, heroImages, recentAlbums, albumMetadata, allMarkdownRemark } = data;

  const siteTitle = site.siteMetadata.title;
  const social = site.siteMetadata.social;
  const posts = allMarkdownRemark.edges;

  // Memoize static image references
  const introLeftImage = useMemo(() => introImages.nodes[0], [introImages.nodes]);
  const introRightImage = useMemo(() => introImages.nodes[1], [introImages.nodes]);
  const heroImageNodes = useMemo(() => heroImages.nodes, [heroImages.nodes]);

  // Memoize metadata map creation
  const metadataMap = useMemo(() => {
    const map = {};
    albumMetadata.nodes.forEach((file) => {
      if (file.childMarkdownRemark?.frontmatter) {
        map[file.relativeDirectory] = file.childMarkdownRemark.frontmatter;
      }
    });

    return map;
  }, [albumMetadata.nodes]);

  // Use custom hook for processed albums

  const processedAlbums = useProcessedAlbums(recentAlbums.group, metadataMap);

  // Memoize pinnedAlbums to fix React hooks warning
  const pinnedAlbums = useMemo(() => {
    return markdownRemark?.frontmatter?.pinnedAlbums || [];
  }, [markdownRemark?.frontmatter?.pinnedAlbums]);

  // Memoize album entries - simple logic based on pinnedAlbums content
  const albumEntries = useMemo(() => {
    // Filter out empty strings to get valid pinned albums
    const validPinnedAlbums = pinnedAlbums.filter((albumPath) => albumPath && albumPath.trim() !== "");

    if (validPinnedAlbums.length > 0) {
      // We have some pinned albums, use them
      const pinnedAlbumEntries = [];

      // Find pinned albums in processedAlbums
      validPinnedAlbums.forEach((pinnedPath) => {
        const foundAlbum = processedAlbums.find((album) => {
          // Try exact match first
          if (album.directory === pinnedPath) return true;
          // Try partial match in case the path structure is different
          if (album.directory && album.directory.includes(pinnedPath)) return true;
          // Try reverse match in case pinnedPath contains the directory
          if (pinnedPath.includes(album.directory)) return true;
          return false;
        });

        if (foundAlbum) {
          pinnedAlbumEntries.push([foundAlbum.directory, foundAlbum]);
        }
      });

      // If we have fewer than 3 pinned albums, fill with most recent ones
      if (pinnedAlbumEntries.length < 3) {
        const pinnedDirs = new Set(pinnedAlbumEntries.map(([dir]) => dir));
        const recentAlbumsToAdd = processedAlbums
          .filter((album) => !pinnedDirs.has(album.directory))
          .slice(0, 3 - pinnedAlbumEntries.length)
          .map((album) => [album.directory, album]);

        pinnedAlbumEntries.push(...recentAlbumsToAdd);
      }

      return pinnedAlbumEntries.slice(0, 3); // Ensure we never return more than 3
    } else {
      // No pinned albums, use 3 most recent

      const result = processedAlbums.slice(0, 3).map((album) => [album.directory, album]);

      return result;
    }
  }, [processedAlbums, pinnedAlbums]);

  // Memoize most recent album data (for the "Most Recent Shoot" section)
  const mostRecentAlbumData = useMemo(() => {
    const recentAlbumEntries = processedAlbums
      .sort((a, b) => b.mostRecentTime - a.mostRecentTime)
      .slice(0, 1)
      .map((album) => [album.directory, album]);

    if (recentAlbumEntries.length === 0) return null;

    const [albumDir, albumData] = recentAlbumEntries[0];
    const albumTitle =
      albumData.metadata?.title ||
      (() => {
        const parts = albumDir.split("/");
        if (parts.length >= 2) {
          const albumName = parts[parts.length - 1];
          return albumName.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
        }
        return "Album";
      })();

    const albumUrl = (() => {
      const parts = albumDir.split("/");
      if (parts.length >= 2) {
        const year = parts[0];
        const albumName = parts[1];
        return `/work/${year}/${albumName}`;
      }
      return "/work";
    })();

    return {
      albumDir,
      albumData,
      albumTitle,
      albumUrl,
      imagesToShow: albumData.images.slice(0, 3),
    };
  }, [processedAlbums]);

  return (
      <Layout title={siteTitle} social={social}>
        <Seo keywords={[`Mark Austin Photography`, `Scottish Photographer`, `Professional Photography`, `Landscape Photography`]} title={markdownRemark.frontmatter.title} description={markdownRemark.frontmatter.description || ""} image={markdownRemark.frontmatter.thumbnail.childImageSharp.fluid.src} />

        {/* HERO SECTION */}
        <section className='hero-section position-relative' style={{ height: "100vh", overflow: "hidden", backgroundColor: "#000" }} aria-label='Hero image carousel'>
          <div className='position-absolute w-100 h-100' style={{ zIndex: 1 }}>
            <RotatingHeroImages heroImages={heroImageNodes} />
          </div>
          <div className='position-absolute w-100 h-100 d-flex align-items-center justify-content-center' style={{ zIndex: 2, backgroundColor: "rgba(0,0,0,0.3)", pointerEvents: "none" }}>
            <div className='text-center text-white p-4'>
              <h1 className=' mb-3' style={{ fontSize: "4rem", fontFamily: "serif" }}>
                A PLACE TO
                <br />
                KEEP MOMENTS
              </h1>
              <p className='mb-4 italic'>At first, I just wanted to capture my family growing up. Now it's part of how I see the world.</p>
              <div className='mt-5'>
                <button
                  onClick={() => {
                    document.getElementById("intro-content__two-column")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className='border rounded-circle d-inline-flex align-items-center justify-content-center bg-transparent text-white'
                  style={{ width: "60px", height: "60px", borderColor: "white", cursor: "pointer", boxShadow: "none", pointerEvents: "auto" }}
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
                  <p>
                    <span className='fw-heavy'>IT'S IN REAL MOMENTS</span>
                  </p>
                  <p className='m-0'>YOU'LL WANT TO REMEMBER</p>
                </div>
              </div>
            </div>

            <div className='col-md-4 col-6 d-flex flex-column justify-content-end'>
              <div className='mb-3'>
                <p>HONEST</p>
                <p>
                  <span className='fw-heavy'>CANDID</span>
                </p>
                <p>STORY-LED</p>
                <p className='m-0'>
                  <span className='fw-heavy'>MEANINGFUL</span>
                </p>
              </div>
              <div className='intro-image-container' style={{ aspectRatio: "4/5", overflow: "hidden" }}>
                <GatsbyImage image={getImage(introRightImage)} alt='Wedding photography' className='w-100 h-100' style={{ objectFit: "cover" }} />
              </div>
            </div>
          </div>
        </section>

        {/* Glasgow Icon Divider */}
        <div className='container hr-icon'>
          <div className='row vh-half justify-content-center'>
            <div className='col-sm-2 col-4'>
              <img src={GlasgowIcon} alt='' />
            </div>
          </div>
        </div>

        {/* Recent Albums Section */}
        <section className='container'>
          <div className='row '>
            <div className='col-md-8 offset-md-2 col-12'>
              <div className='d-flex justify-content-center align-items-center gap-2 gap-sm-3'>
                {albumEntries.map(([albumDir, albumData], index) => (
                  <AlbumCard key={albumDir} albumDir={albumDir} albumData={albumData} index={index} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Paisley Icon Divider */}
        <div className='container hr-icon'>
          <div className='row vh-half justify-content-center'>
            <div className='col-sm-1 col-2'>
              <img src={PaisleyIcon} alt='' />
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <section className='container'>
          <div className='row p-4 justify-content-center'>
            {posts.slice(0, 6).map(({ node }, index) => (
              <BlogPostCard key={node.fields.slug} node={node} index={index} />
            ))}
          </div>
        </section>

        {/* Scotland Icon Divider */}
        <div className='container hr-icon'>
          <div className='row vh-half justify-content-center'>
            <div className='col-sm-2 col-4'>
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
                {mostRecentAlbumData && (
                  <p className='text-muted'>
                    <Link to={mostRecentAlbumData.albumUrl} className='text-decoration-none'>
                      {mostRecentAlbumData.albumTitle}
                    </Link>
                  </p>
                )}
              </div>
            </div>
            <div className='row p-4 justify-content-center'>
              {mostRecentAlbumData ? (
                mostRecentAlbumData.imagesToShow.map((image, index) => (
                  <div key={index} className='col-4'>
                    <Link to={mostRecentAlbumData.albumUrl} className='text-decoration-none'>
                      <GatsbyImage image={getImage(image)} alt={`${mostRecentAlbumData.albumTitle} - Image ${index + 1}`} className='w-100' style={{ aspectRatio: "4/5", overflow: "hidden", cursor: "pointer" }} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className='col-12 text-center'>
                  <p>No recent albums available</p>
                </div>
              )}
            </div>
            <div className='text-center mt-4'>
              <Link to='/work' className='btn btn-highlight-gold'>
                View All Work
              </Link>
            </div>
          </div>
        </section>
      </Layout>
  );
};

export default IndexPage;

export function Head() {
  return (
    <style>{pageStyles}</style>
  )
}

// Same GraphQL query - no changes needed for optimization
export const IndexPageQuery = graphql`
  query IndexPage {
    site {
      siteMetadata {
        title
        social {
          instagram
        }
      }
    }
    markdownRemark(frontmatter: { templateKey: { eq: "index-page" } }) {
      frontmatter {
        title
        description
        pinnedAlbums
        thumbnail {
          childImageSharp {
            fluid(maxWidth: 1360) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
    introImages: allFile(filter: { sourceInstanceName: { eq: "home" }, relativeDirectory: { eq: "two-column" }, extension: { in: ["jpg", "jpeg", "png", "webp"] } }, limit: 2, sort: { name: ASC }) {
      nodes {
        childImageSharp {
          gatsbyImageData(width: 600, height: 750, placeholder: NONE)
        }
      }
    }
    heroImages: allFile(filter: { sourceInstanceName: { eq: "home" }, relativeDirectory: { eq: "hero" }, extension: { in: ["jpg", "jpeg", "png", "webp"] } }, limit: 10, sort: { name: ASC }) {
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
    recentAlbums: allFile(filter: { sourceInstanceName: { eq: "work" }, extension: { in: ["jpg", "jpeg", "png", "webp"] }, relativeDirectory: { regex: "/^20/" } }, limit: 200) {
      group(field: { relativeDirectory: SELECT }) {
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
    albumMetadata: allFile(filter: { sourceInstanceName: { eq: "work" }, name: { eq: "album" }, extension: { eq: "md" } }, sort: { relativePath: DESC }) {
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
