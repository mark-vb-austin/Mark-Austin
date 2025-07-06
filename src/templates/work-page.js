import React from "react";
import { graphql, Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import Seo from "../components/seo";
import Masonry from "react-masonry-css";

const WorkPage = ({ data }) => {
  const siteTitle = data.site.siteMetadata.title;
  const social = data.site.siteMetadata.social;
  const albumMap = {};

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
  };

  // Get last Durectory from path
  // e.g. /work/portraits -> portraits
  const getLastDir = (path) => {
    const parts = path.split("/");
    return parts[parts.length - 1];
  };

  // Get all files from the work directory
  // and create a map of albums with their cover image and image count
  data.allFile.nodes.forEach((file) => {
    const dir = file.relativeDirectory;
    
    // Skip if the directory is empty
    if (!albumMap[dir]) {
      albumMap[dir] = {
        imageCount: 1,
        cover: file,
        mostRecentTime: new Date(file.mtime)
      };
    } else {
      albumMap[dir].imageCount += 1;
      // Update cover to the most recent image
      const fileTime = new Date(file.mtime);
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

      <div className="container mt-50">
        <div className="row">


          <div className="col-lg-8 offset-lg-2 col-md-10 offset-md-1">
          
            
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
            >          
              {Object.entries(albumMap)
                .sort(([,a], [,b]) => b.mostRecentTime - a.mostRecentTime) // Sort by most recent file time descending
                .map(
                ([albumName, { imageCount, cover }]) => {
                  // albumName could be 'work/2024/album-one' or '2024/album-one'
                  const parts = albumName.split("/");
                  let year, album;
                  if (parts.length === 3 && parts[0] === 'work') {
                    [ , year, album] = parts;
                  } else if (parts.length === 2) {
                    [year, album] = parts;
                  } else {
                    return null;
                  }
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
                        <h2>{getLastDir(albumName)}</h2>
                        <div className="hl"></div>
                        <h3>
                          {imageCount} image{imageCount > 1 ? "s" : ""}
                        </h3>
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
