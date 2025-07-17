import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

import { GatsbyImage, getImage } from "gatsby-plugin-image"


class NotFoundPage extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title
    const social = data.site.siteMetadata.social

    return (
      <Layout location={this.props.location} title={siteTitle} social={social}>
        <Seo title='404: Not Found' />

        <section className='py-0'>
          <div className='container-fluid'>
            <div className='row'>
              <div className='col-lg-5 px-0 order-lg-2'>
                <div className=' py-9'>
                  <GatsbyImage image={getImage(data.gorbalsImage)} alt='404 background' className='bg-holder' style={{ filter: "blur(0px)", opacity: 1, transform: "translate(0px, 0px)", height: "100%" }} imgStyle={{ objectFit: "cover" }} />
                </div>
              </div>

              <div className='col-lg-5 offset-lg-1 py-6'>
                <div className='row' style={{ height: "100%", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <div className='col-lg-8'>
                    <h1 className='vertical-title mb-5 mt-5'>
                      Trying to get
                      <br />
                      where you want
                      <br />
                      to go?
                    </h1>

                    <p className='mb-5 mt-5'>This page isn't it.</p>
                    
                    <a className='btn btn-primary mb-5 mt-5' href='/'>take me home</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }
}

export default NotFoundPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        social{
          instagram
        }
      }
    }
    gorbalsImage: file(relativePath: { eq: "new-gorbals_404.jpg" }) {
      childImageSharp {
        gatsbyImageData(layout: FULL_WIDTH, placeholder: BLURRED)
      }
    }
  }
`
