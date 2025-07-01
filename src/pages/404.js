import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

import { GatsbyImage, getImage } from "gatsby-plugin-image"


class NotFoundPage extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title
    const social = data.site.siteMetadata.social

    return (
			<Layout location={this.props.location} title={siteTitle} social={social}>
				<SEO title='404: Not Found' />

        <section className="py-0">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-6 px-0 order-lg-2">
                <div className="sticky-top vh-lg-100 py-9">
                    <GatsbyImage
                      image={getImage(data.gorbalsImage)}
                      alt="404 background"
                      className="bg-holder"
                      style={{ filter: 'blur(0px)', opacity: 1, transform: 'translate(0px, 0px)', height: '100%' }}
                      imgStyle={{ objectFit: "cover" }}
                    />
                </div>
              </div>
              <div className="col-lg-6 py-6">
                <div className="row h-100 flex-center">
                  <div className="col-lg-8">
                    <h1 className="display-4 fs-7 fs-lg-6 fs-xl-5">
                      <span className="d-block overflow-hidden pb-1">
                        <span className="d-inline-block" data-zanim-xs="{&quot;delay&quot;:0.4}" style={{ transform: 'translate(0px, 0px)', opacity: 1 }}>
                          Trying to get
                        </span>
                      </span>
                      <span className="d-block overflow-hidden pb-1">
                        <span className="d-inline-block" data-zanim-xs="{&quot;delay&quot;:0.4}" style={{ transform: 'translate(0px, 0px)', opacity: 1 }}>
                          where you want
                        </span>
                      </span>
                      <span className="d-block overflow-hidden pb-1">
                        <span className="d-inline-block" data-zanim-xs="{&quot;delay&quot;:0.4}" style={{ transform: 'translate(0px, 0px)', opacity: 1 }}>
                          to go?
                        </span>
                      </span>
                    </h1>
                    <div className="overflow-hidden">
                      <p className="fs-8 mt-4" data-zanim-xs="{&quot;delay&quot;:0.5}" style={{ transform: 'translate(0px, 0px)', opacity: 1 }}>
                        This page isn't it.
                      </p>
                    </div>
                    <div className="overflow-hidden">
                      <div data-zanim-xs="{&quot;delay&quot;:0.6}" style={{ transform: 'translate(0px, 0px)', opacity: 1 }}>
                        <a className="btn btn-outline-dark mt-6 mb-1" href="../index.html">
                          take me home
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div></div></section>

	
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
          twitter
          facebook
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
