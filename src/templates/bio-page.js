import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import Seo from "../components/seo";

const BioPage = (props) => {
  const post = props.data.markdownRemark;
  const { site } = props.data;

  return (
    <Layout location={props.location} title={site.siteMetadata.title} social={site.siteMetadata.social}>
      <Seo keywords={[`Mark Austin Photography`, `Scottish Photographer`, `Landscape Photography`, `Portrait Photography`]} title={post.frontmatter.title} description={post.frontmatter.description || ""} image={post.frontmatter.thumbnail.childImageSharp.gatsbyImageData.images.fallback.src} />
      
      <div className="container mt-50">
        <div className="row">

          <article className={`col-lg-6 offset-lg-3 col-sm-8 offset-sm-2 col-10 offset-1 ${post.frontmatter.thumbnail.name || `no-image`}`}>
            <header className='post-content-header'>
              <h1 className='post-content-title'>{post.frontmatter.title}</h1>
            </header>

            {post.frontmatter.description && <p className='post-content-excerpt italic'>{post.frontmatter.description}</p>}

            {post.frontmatter.hero && (
              <div className='post-content-image wave-bounce'>
                <GatsbyImage image={getImage(post.frontmatter.hero)} className='bio-page-hero' alt={post.frontmatter.title} />
              </div>
            )}

            <div className='post-content-body font-primary' dangerouslySetInnerHTML={{ __html: post.html }} />

            <footer className='post-content-footer'></footer>
          </article>

        </div>
      </div>
      
    </Layout>
  );
};

BioPage.propTypes = {
  data: PropTypes.object.isRequired,
};

export default BioPage;

export const BioPageQuery = graphql`
  query BioPage {
    site {
      siteMetadata {
        title
        social {
          instagram
        }
      }
    }
    markdownRemark(frontmatter: { templateKey: { eq: "bio-page" } }) {
      frontmatter {
        title
        description
        thumbnail {
          name
          childImageSharp {
            gatsbyImageData
          }
        }
        hero {
          name
          childImageSharp {
            gatsbyImageData
          }
        }
        templateKey
      }
      html
    }
  }
`;
