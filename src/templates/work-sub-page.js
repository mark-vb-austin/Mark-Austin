import React, { useState} from "react";
import { graphql, Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import { Helmet } from "react-helmet";
// import Seo from "../components/seo";
import Masonry from "react-masonry-css";

// Importing Lightbox and its plugins
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

import Camera from "../../static/icons/icon--camera.svg";
import CameraLens from "../../static/icons/icon--camera-lens.svg";
import LeftIcon from '../img/left-icon.svg';
import RightIcon from '../img/right-icon.svg';

import exifData from "../img/exif-data.json";

const WorkSubPage = ({ data, pageContext }) => {
  const { album, previousAlbum, nextAlbum } = pageContext;
  const images = data.allFile.nodes;

  // const { pageContextProps } = data;
  const siteTitle = data.site.siteMetadata.title;
  const social = data.site.siteMetadata.social;
  const meta = data.markdownRemark?.frontmatter;

  // const getLastDir = (path) => {
  //   const parts = path.split("/");
  //   return parts[parts.length - 1];
  // };

  const [index, setIndex] = useState(-1);

  const slides = images.map((file) => {
    const lookupKey = `work/${file.relativePath.replace(/^work\//, "")}`;
    const meta = exifData[lookupKey] || {};
 
    return {
      src: file.childImageSharp.gatsbyImageData.images.fallback.src,
      alt: file.name,
      meta,
    };
  });

  function LightboxSlide({ slide }) {
    return (
      <figure className="lightbox-figure__wrap">
        <img src={slide.src} alt="" />
        <figcaption className="exif-image-data__wrap">
          {slide.meta && (
            <section>
                <ul>
                <li><span aria-hidden="true"><img src={Camera} alt='' width={20} height={20} /></span> {slide.meta.Model || "n/a"}</li>
                <li><span aria-hidden="true"><img src={CameraLens} alt='' width={18} height={18} /></span> {slide.meta.Lens || "n/a"}</li>
                </ul>

                <dl>
                {slide.meta.FocalLength && (
                  <div>
                    <dt>Focal Length:</dt>
                    <dd>{slide.meta.FocalLength  || "n/a"}<small> ({slide.meta.FocalLengthIn35mmFormat || "n/a"} equiv)</small></dd>
                  </div>
                )}
                <div>
                  <dt>Aperture:</dt>
                  <dd>{slide.meta.FNumber ? `ƒ/${slide.meta.FNumber}` : "n/a"}</dd>
                </div>
                <div>
                  <dt>Shutter Speed:</dt>
                  <dd>{slide.meta.ExposureTime || "n/a"}</dd>
                </div>
                <div>
                  <dt>ISO:</dt>
                  <dd>{slide.meta.ISO || "n/a"}</dd>
                </div>
                {slide.meta.DateTimeOriginal && (
                  <div>
                    <dt>Date:</dt>
                    <dd>{new Date(0, (slide.meta.DateTimeOriginal.month || 0) - 1).toLocaleString('default', { month: 'short' }) || "n/a"} {slide.meta.DateTimeOriginal.year || "n/a"}</dd>
                  </div>
                )}
                </dl>
            </section>
          )}
            
        </figcaption>
      </figure>
    )
}

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    // 500: 1,
  };
  
  return (
    <>
      <Helmet> {/* Helmet for SEO and styles */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap"
          rel="stylesheet"
        />
        {/* <Seo title={meta?.title || album} description={meta?.description} /> */}

      </Helmet>
      
      <Layout location={data.location} title={siteTitle} social={social}>

        {/* Back to Albums Button */}
        <div style={{ marginBottom: "2rem", padding: "0 3vw"}}>
          <Link to="/work/" style={{display: "inline-flex", alignItems: "center", color: "inherit", fontSize: "1.2rem", textDecoration: "none", fontWeight: "300"}}>
            <img src={LeftIcon} alt='' width={20} height={20} style={{ marginRight: "0.5rem" }} />
            <span>Back to Albums</span>
          </Link>
        </div>
        
        <div className="container mt-50">
          <div className="row">

            <div className="col-lg-8 offset-lg-2 col-md-10 offset-md-1">
              
              <h1 className="post-content-title">{meta?.title || album}</h1>
              
              {meta?.description && 
                <p className="post-content-excerpt">
                  {meta.description} <br />
                  {meta?.date && <small>- {meta.date}</small>}
                </p>
              }

              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="masonry-grid"
                columnClassName="masonry-grid_column"
              >
                {images.map((file, i) => (
                  <div
                    key={file.id}
                    onClick={() => setIndex(i)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') setIndex(i);
                    }}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                  >
                    <GatsbyImage
                      key={file.id}
                      image={getImage(file.childImageSharp.gatsbyImageData)}
                      alt={file.name}
                      // style={{ width: 300, height: 200 }}
                    />
                  </div>
                ))}
              </Masonry>
            </div>

            <Lightbox
              slides={slides}
              open={index >= 0}
              index={index}
              close={() => setIndex(-1)}
              animation={{ swipe: 0, fade: 300 }} // ✅ kills only the broken animation
              plugins={slides.length > 1 ? [Thumbnails] : []}
              thumbnails={{ vignette: false }}
              carousel={{ finite: true }}
              render={{
                slide: ({ slide }) => <LightboxSlide slide={slide} />, 
                iconPrev: slides.length > 1 ? undefined : () => null,
                iconNext: slides.length > 1 ? undefined : () => null,
              }}
              styles={{
                slide: {
                  backdropFilter: "blur(5px)",
                },
                image: {
                  objectFit: "contain",
                  maxHeight: "10vh",
                },
              }}
              // Enable drag for slides and thumbnails
              draggable={true}
              thumbnailsProps={{ draggable: true }}
            />

            {/* Album Navigation */}
            {(previousAlbum || nextAlbum) && (
              <div className="post-link">
                <div>
                  {previousAlbum && (
                    <Link 
                      to={previousAlbum.path}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        color: "inherit", 
                        fontSize: "2rem",
                        textDecoration: "none"
                      }}
                    >
                      <img src={LeftIcon} alt='' width={30} height={30} />
                      <span>{previousAlbum.album}</span>
                    </Link>
                  )}
                </div>
                <div>
                  {nextAlbum && (
                    <Link 
                      to={nextAlbum.path}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        color: "inherit", 
                        fontSize: "2rem",
                        textDecoration: "none"
                      }}
                    >
                      <span>{nextAlbum.album}</span>
                      <img src={RightIcon} alt='' width={30} height={30} />
                    </Link>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </Layout>
    </>
  );
};

export const query = graphql`
  query ($relativeDirectory: String!, $regex: String!) {
    allFile(
      filter: {
        sourceInstanceName: { eq: "work" }
        relativeDirectory: { eq: $relativeDirectory }
        extension: { regex: "/(jpg|jpeg|png)/" }
      }
    ) {
      nodes {
        id
        name
        relativePath
        childImageSharp {
          gatsbyImageData(
            # layout: CONSTRAINED
            # quality: 100
            width: 1600
            # webpOptions: { quality: 100 }
            # jpgOptions: { progressive: true, quality: 100 }
            placeholder: BLURRED
          )
        }
      }
    }
    site {
      siteMetadata {
        title
        social {
          facebook
          instagram
        }
      }
    }
    markdownRemark(fileAbsolutePath: { regex: $regex }) {
      frontmatter {
        title
        description
        date(formatString: "MMMM D, YYYY")
      }
    }
  }
`;

export default WorkSubPage;

// import React from "react"
// import { graphql } from "gatsby"
// import Masonry from "react-masonry-css"
// import { GatsbyImage, getImage } from "gatsby-plugin-image";
// import LeftIcon from '../img/left-icon.svg'
// import RightIcon from '../img/right-icon.svg'
// import Layout from "../components/layout"
// import Seo from "../components/seo"
// import { GatsbyImage, getImage } from "gatsby-plugin-image"

// const BlogPostTemplate = (props, pageContext) => {
// const { album } = pageContext

// const { pageContextProps } = props
// const post = props.data.markdownRemark
// const siteTitle = props.data.site.siteMetadata.title
// const social = props.data.site.siteMetadata.social

// const nextSlug = pageContextProps?.next ? pageContextProps?.next?.fields?.slug.split('/').slice(2, -1).join('/') === '' ? '/' :`/${pageContextProps.next.fields.slug.split('/').slice(2, -1).join('/')}` : '/';
// const previousSlug = pageContextProps.previous ? pageContextProps?.previous?.fields?.slug?.split('/').slice(2, -1).join('/') === '' ? '/' :`/${pageContextProps.previous.fields.slug.split('/').slice(2, -1).join('/')}` : "/"
// const nextLinkStatus = pageContextProps?.next ? pageContextProps?.next?.frontmatter?.templateKey === 'work-sub-page' ? true : false : false
// const previousLinkStatus = pageContextProps?.previous ? pageContextProps?.previous?.frontmatter?.templateKey === 'work-sub-page' ? true : false : false

// const albumName = pageContextProps.albumName

// const images = props.data.allFile.nodes

// const breakpointColumnsObj = {
// default: 4,
// 1100: 3,
// 700: 2,
// 500: 1,
// }

//   return (
//     <Layout location={props.location} title={siteTitle} social={social}>
//       <Seo
//         title={post.frontmatter.title}
//         description={post.frontmatter.description || post.excerpt}
//         image={post.frontmatter.thumbnail.childImageSharp.gatsbyImageData.images.fallback.src}

//       />
//       <article
//         className={`post-content ${post.frontmatter.thumbnail || `no-image`}`}
//       >

//       <div>
//         <h1>{album}</h1>
//         <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
//           {props.allFile.nodes.map(file => (
//             <GatsbyImage
//               key={file.id}
//               image={getImage(file.childImageSharp.gatsbyImageData)}
//               alt={file.name}
//               style={{ width: 300, height: 200 }}
//             />
//           ))}
//         </div>
//       </div>

//         {/* <header className="post-content-header">
//           <h1 className="post-content-title">{post.frontmatter.title}</h1>
//         </header> */}

//         {/* <div>
//           <h1>{albumName}</h1>
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
//             {images.map(image => (
//               <GatsbyImage
//                 key={image.name}
//                 image={getImage(image)}
//                 alt={image.name}
//               />
//             ))}
//           </div>
//         </div> */}

//         {
//           /* MASONARY */
//           /* MASONARY */
//           /* MASONARY */
//           /* MASONARY */
//         }

//         {/* <Masonry
//           breakpointCols={breakpointColumnsObj}
//           className="masonry-grid"
//           columnClassName="masonry-grid_column"
//         >
//           {images.map((image, index) => {
//             const img = getImage(image)
//             return <GatsbyImage key={index} image={img} alt={image.name} />
//           })}
//         </Masonry>

//          <div>
//           <h1>{pageContextProps.album}</h1>
//           {images.map(image => (
//             <GatsbyImage key={image.name} image={getImage(image)} alt={image.name} />
//           ))}
//         </div> */}

//         {
//           /* MASONARY */
//           /* MASONARY */
//           /* MASONARY */
//           /* MASONARY */
//         }

//         {/* {post.frontmatter.description && (
//           <p className="post-content-excerpt">{post.frontmatter.description}</p>
//         )} */}

//         {/* {post.frontmatter.thumbnail && (
//           <div className="post-content-image">
//             <GatsbyImage
//               image={getImage(post.frontmatter.thumbnail)}
//               className="kg-image"
//               alt={post.frontmatter.title} />
//           </div>
//         )} */}

//         {/* <div
//           className="post-content-body"
//           dangerouslySetInnerHTML={{ __html: post.html }}
//         /> */}

//         <div className="post-link">
//           <div>
//           <a style={{ display: nextLinkStatus ? "flex" : 'none', alignItems: "center", color: "vars.$color-base", fontSize: "2rem" }} href={nextSlug} >
//               <img src={LeftIcon} alt='' width={30} height={30} />
//               <span>{pageContextProps.next ? pageContextProps.next.frontmatter.title : ""}
//               </span>
//             </a>

//           </div>
//           <div>
//           <a style={{ display: previousLinkStatus ? "flex" : 'none', alignItems: "center", color: "vars.$color-base", fontSize: "2rem" }} href={previousSlug}>
//               <span>{pageContextProps.previous ? pageContextProps.previous.frontmatter.title : ""}
//               </span>
//               <img src={RightIcon} alt='' width={30} height={30} />

//             </a>

//           </div>
//         </div> */}
//       </article>
//     </Layout>
//   );

// }

// export const query = graphql`
//   query($album: String!, $slug: String) {
//     allFile(
//       filter: {
//         sourceInstanceName: { eq: "work" }
//         relativeDirectory: { eq: $album }
//         extension: { regex: "/(jpg|jpeg|png)/" }
//       }
//     ){
//       nodes {
//         id
//         name
//         childImageSharp {
//           gatsbyImageData(width: 300, height: 200, placeholder: BLURRED)
//         }
//       }
//     }
//     site {
//       siteMetadata {
//         title
//         social{
//           twitter
//           facebook
//         }
//       }
//     }
//     markdownRemark(fields: { slug: { eq: $slug } }) {
//       id
//       html
//       frontmatter {
//         title
//         date(formatString: "MMMM DD, YYYY")
//         description
//         thumbnail {
//           childImageSharp {
//             gatsbyImageData(layout: FULL_WIDTH)

//           }
//         }

//       }
//     }
//   }
// `

// export default BlogPostTemplate
