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
                <div className='border rounded-circle d-inline-flex align-items-center justify-content-center' style={{ width: "60px", height: "60px", borderColor: "white" }}>
                  <span style={{ fontSize: "24px" }}>↓</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* intro Content */}
        <section className='container'>
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
                  IT'S IN REAL MOMENTS
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
                CANDID
                <br />
                STORY-LED
                <br />
                MEANINGFUL
                <br />
              </div>
              <div className='intro-image-container' style={{ aspectRatio: "4/5", overflow: "hidden" }}>
                <GatsbyImage image={getImage(recentWorkImages[1])} alt='Wedding photography' className='w-100 h-100' style={{ objectFit: "cover" }} />
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className='py-5'>
          <div className='container'>
            <div className='row align-items-center'>
              <div className='col-lg-6 mb-4 mb-lg-0'>
                <div className='row g-3'>
                  <div className='col-6'>
                    <GatsbyImage image={getImage(aboutImage)} alt='About' className='w-100' style={{ height: "300px", objectFit: "cover" }} />
                  </div>
                  <div className='col-6'>
                    <GatsbyImage image={getImage(recentWorkImages[2])} alt='Portfolio' className='w-100' style={{ height: "300px", objectFit: "cover" }} />
                  </div>
                  <div className='col-12'>
                    <GatsbyImage image={getImage(recentWorkImages[3])} alt='Portfolio' className='w-100' style={{ height: "200px", objectFit: "cover" }} />
                  </div>
                </div>
              </div>
              <div className='col-lg-6'>
                <div className='ps-lg-5 position-relative'>
                  <div className='rotating-text position-absolute' style={{ right: "-2rem", top: "50%", transform: "translateY(-50%)" }}>
                    <span>ABOUT THE ARTIST</span>
                  </div>
                  <h2 className='display-5 fw-light mb-4'>Karen Martinez is a Lifestyle Photographer & Visual Storyteller based in Berlin.</h2>
                  <p className='text-muted mb-4'>With over 10 years of experience capturing life's most precious moments, Karen brings a unique perspective to every shoot. Her work focuses on authentic emotions and natural beauty.</p>
                  <Link to='/bio' className='btn btn-outline-dark'>
                    Learn More
                  </Link>
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
