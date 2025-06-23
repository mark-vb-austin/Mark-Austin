import React from "react";
import { graphql, Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Layout from "../components/layout"
import Seo from "../components/seo"

const WorkPage = ({ data }) => {
  const siteTitle = data.site.siteMetadata.title;
  const social = data.site.siteMetadata.social;
  const albums = {};

  data.allFile.nodes.forEach((file) => {
    const { relativeDirectory } = file;
    if (!albums[relativeDirectory]) {
      albums[relativeDirectory] = file;
    }
  });

  return (
    <Layout title={siteTitle} social={social}>
      <Seo keywords={[`Gatsby Theme`, `Free Gatsby Template`, `Clay Gatsby Theme`]}
        title={data.markdownRemark.frontmatter.title}
        description={data.markdownRemark.frontmatter.description || ''}
        image={data.markdownRemark.frontmatter.thumbnail.childImageSharp.fluid.src}

      />

      <div>
        <h1>My Work</h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
          {Object.entries(albums).map(([album, file]) => (
            <Link key={album} to={`/work/${album}`}>
              <GatsbyImage
                image={getImage(file.childImageSharp.gatsbyImageData)}
                alt={album}
                style={{ width: 300, height: 200 }}
              />
              <h2>{album}</h2>
            </Link>
          ))}
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
      sort: { relativePath: ASC }
    ) {
      nodes {
        relativeDirectory
        childImageSharp {
          gatsbyImageData(width: 300, height: 200, placeholder: BLURRED)
        }
      }
    }
    site {
      siteMetadata {
        title
        author
        social{
          twitter
          facebook
        }
      }
    }
    markdownRemark(frontmatter: {templateKey: {eq: "work-page"}}) {
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
