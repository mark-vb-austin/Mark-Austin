import React, { useState} from "react";
import { graphql, Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
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
    default: 3,
    1100: 3,
    700: 2,
    // 500: 1,
  };
  
  return (
      <Layout location={data.location} title={siteTitle} social={social}>

        {/* Back to Albums Button */}
        <div className="breadcrumb-back">
          <Link to="/work/">
            <img src={LeftIcon} alt='' width={20} height={20}/>
            <span>Back to Albums</span>
          </Link>
        </div>
        
        <div className="container">
          <div className="row">

            <div className="col-md-10 offset-md-1 mt-5">
              
              <h1 className="post-content-title">{meta?.title || album}</h1>
              
              {meta?.description && 
              <>
                <div className='post-content-excerpt italic' style={{ fontSize: "1.85rem" }} dangerouslySetInnerHTML={{ __html: data.markdownRemark.html }} />

                {/* <p className="post-content-excerpt italic">
                  {meta?.date && <small>- {meta.date}</small>}
                </p> */}
              </>
              }

              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="masonry-grid justify-content-center"
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

           

          </div>
        </div>

        {/* Album Navigation */}
        <div className="post-link d-flex justify-content-between">
          <div>
            {previousAlbum && (
            <Link to={previousAlbum.path} className="prev-link">
              <div className="link-wrapper">
                <span className="text">{previousAlbum.album}</span>
                <img src={LeftIcon} alt="" className="icon" width={30} height={30} />
              </div>
            </Link>
            )}
          </div>

          <div>
            {nextAlbum && (
            <Link to={nextAlbum.path} className="next-link">
              <div className="link-wrapper">
                <span className="text">{nextAlbum.album}</span>
                <img src={RightIcon} alt="" className="icon" width={30} height={30} />
              </div>
            </Link>
            )}
          </div>
        </div>

      </Layout>
  );
};

export function Head() {
  return (
    <>
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin />
      <link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap' />
      {/* <Seo title={meta?.title || album} description={meta?.description} /> */}
    </>
  );
}

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
      html
    }
  }
`;

export default WorkSubPage;
