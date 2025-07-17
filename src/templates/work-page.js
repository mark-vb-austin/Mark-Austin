import React from "react";
import { graphql, Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import Seo from "../components/seo";
import Masonry from "react-masonry-css";
import exifData from "../img/exif-data.json";

const WorkPage = ({ data }) => {
  const siteTitle = data.site.siteMetadata.title;
  const social = data.site.siteMetadata.social;
  const albumMap = {};

  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    700: 2,
  };

  // Get last Durectory from path
  // e.g. /work/portraits -> portraits
  const getLastDir = (path) => {
    const parts = path.split("/");
    return parts[parts.length - 1];
  };

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

  // Get all files from the work directory
  // and create a map of albums with their cover image and image count
  data.allFile.nodes.forEach((file) => {
    const dir = file.relativeDirectory;
    
    // Skip if the directory is empty
    if (!albumMap[dir]) {
      const metadataDate = getAlbumMetadataDate(dir);
      albumMap[dir] = {
        imageCount: 1,
        cover: file,
        mostRecentTime: metadataDate || new Date(file.mtime) // Fallback to mtime if no MetadataDate
      };
    } else {
      albumMap[dir].imageCount += 1;
      // Update cover to the most recent image based on MetadataDate
      const metadataDate = getAlbumMetadataDate(dir);
      const fileTime = metadataDate || new Date(file.mtime);
      if (fileTime > albumMap[dir].mostRecentTime) {
        albumMap[dir].mostRecentTime = fileTime;
        albumMap[dir].cover = file;
      }
    }
  });

  return (
    <Layout title={siteTitle} social={social}>
      <Seo
        keywords={[
          `professional photographer scotland`,
          `family photoshoot scotland`,
          `portrait photography near me`,
          `event photographer scotland`,
          `natural family photography`,
          `lifestyle photographer uk`,
          `couples photographer scotland`,
          `product photography scotland`,
          `scotland wedding photographer`,
          `storytelling photographer`,
          `documentary style family photos`,
          `creative photographer for hire`,
          `freelance photographer scotland`,
          `small business photographer`,
          `emotional photography`,
        ]}
        title={data.markdownRemark.frontmatter.title}
        description={data.markdownRemark.frontmatter.description || ""}
        image={
          data.markdownRemark.frontmatter.thumbnail.childImageSharp.fluid.src
        }
      />

      <div className="container">
        <div className="row">


          <div className=" col-md-10 offset-md-1">
          
            {console.log(albumMap)}
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
            >          
              {Object.entries(albumMap)
                .sort(([,a], [,b]) => b.mostRecentTime - a.mostRecentTime) // Sort by most recent file time descending
                .map(
                ([albumName, { imageCount, cover }]) => {
                  // albumName should be '2024/album-one' format since we're now pointing directly to work directory
                  const parts = albumName.split("/");
                  if (parts.length !== 2) {
                    // Skip if not in expected year/album format
                    return null;
                  }
                  const [year, album] = parts;
                  return (
                    <Link
                      key={albumName}
                      to={`/work/${year}/${album}`}
                      className="column-item"
                    >
                      <GatsbyImage
                        key={cover}
                        image={getImage(cover.childImageSharp.gatsbyImageData)}
                        alt={albumName}
                        className="column-wrap"
                      />
                      <div className="masonry__titles">
                        <h3>{getLastDir(albumName)}</h3>
                        <div className="hl"></div>
                        <h4 style={{fontSize: "1.4rem"}}>
                          {imageCount} image{imageCount > 1 ? "s" : ""}
                        </h4>
                      </div>
                    </Link>
                  );
                }
              )}
            </Masonry>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export const query = graphql`
  query WorkPageQuery {
    allFile(
      filter: {
        sourceInstanceName: { eq: "work" }
        extension: { regex: "/(jpg|jpeg|png)/" }
      }
      sort: { mtime: DESC }
    ) {
      nodes {
        relativeDirectory
        mtime
        childImageSharp {
          gatsbyImageData(placeholder: BLURRED)
        }
      }
    }
    site {
      siteMetadata {
        title
        author
        social {
          facebook
          instagram
        }
      }
    }
    markdownRemark(frontmatter: { templateKey: { eq: "work-page" } }) {
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
  }
`;

export default WorkPage;
