import React from "react"
import { graphql, StaticQuery } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { navigate } from 'gatsby-link'

import Layout from "../components/layout"
import Seo from "../components/seo"

import "../utils/normalize.scss"
import "../utils/css/screen.scss"
function encode(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&')
}
const ContactPage = ({ data }, location) => {

  const [state, setState] = React.useState({})
  const handleChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const form = e.target
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({
        'form-name': form.getAttribute('name'),
        ...state,
      }),
    })
      .then(() => navigate(form.getAttribute('action')))
      .catch((error) => alert(error))
  }

  const siteTitle = data.site.siteMetadata.title
  const social = data.site.siteMetadata.social
  return (
    <Layout title={siteTitle} social={social}>
      <Seo title={data.markdownRemark.frontmatter.title}
        description={data.markdownRemark.frontmatter.description} 
        image={data.markdownRemark.frontmatter.thumbnail.childImageSharp.gatsbyImageData.images.fallback.src}
        />

      <div className="container">
        <div className="row">

          <article className="col-lg-8 offset-lg-2 col-md-10 offset-md-1">
            {data.markdownRemark.frontmatter.thumbnail && (
            <div className="post-content-image">
              <GatsbyImage
                image={getImage(data.markdownRemark.frontmatter.thumbnail)}
                className="kg-image-card "
                alt={data.markdownRemark.frontmatter.title} />
            </div>
            )}
            <div className="post-content-body">
              <p>
                Whether you're planning a session, have a few questions, or just want to say hello—drop me a message below. I'm always up for hearing about your ideas, your story, or the moments you want to remember.<br/>
                No pressure, no awkward sales stuff—just real conversation and honest photography.
              </p>

              <h3 id="forms">What's Your Story?</h3>
              <form name="contact" method="POST" data-netlify="true" netlify action="thanks" onSubmit={handleSubmit}
              >
                <input type="hidden" name="form-name" value="contact" />
                <p hidden>
                  <label>
                    Don't fill this out: <input name="bot-field" onChange={handleChange} />
                  </label>
                </p>
                <div className="row gtr-uniform">
                  <div className="col-6 col-12-xsmall">
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      onChange={handleChange}
                      placeholder="First Name"
                      required={true}
                    />
                  </div>
                  <div className="col-6 col-12-xsmall">
                    <input
                      type="text"
                      name="last-name"
                      id="last-name"
                      onChange={handleChange}
                      placeholder="Last Name"
                      required={true}
                    />
                  </div>

                  <div className="col-6 col-12-xsmall">
                    <input
                      type="email"
                      name="email"
                      id="demo-email"
                      onChange={handleChange}
                      placeholder="Email"
                      required={true}
                    />
                  </div>
                  <div className="col-6 col-12-xsmall">
                    <input
                      type="text"
                      name="location"
                      id="location"
                      onChange={handleChange}
                      placeholder="Location"
                      required={true}
                    />
                  </div>
                  {/* Break */}
                  {/* General, Purchase, Commissions, Exhibitions, Gallery Feature, Other */}
                  <div className="col-12">
                    <select name="category" id="category" onChange={handleChange} required={true}>
                      <option value>-Nature of Enquiry-</option>
                      <option value={"General"}>General</option>
                      <option value={"Purchase"}>Purchase</option>
                      <option value={"Commissions"}>Commissions</option>
                      <option value={"Exhibitions"}>Exhibitions</option>
                      <option value={"Gallery Feature"}>Gallery Feature</option>
                      <option value={"Other"}>Other</option>
                    </select>
                  </div>

                  {/* Break */}
                  {/* <div className="col-6 col-12-small">
                    <input type="checkbox"
                      id="send-a-copy"
                      name="send-a-copy"
                      defaultValue='false'
                      onChange={handleChange} />
                    <label htmlFor="demo-copy">Email me a copy</label>
                  </div>
                  <div className="col-6 col-12-small">
                    <input
                      type="checkbox"
                      id="iam-human"
                      name="iam-human"
                      defaultValue='false'
                      onChange={handleChange}
                    />
                    <label htmlFor="demo-human">I am a human</label>
                  </div> */}
                  {/* Break */}
                  <div className="col-12">
                    <textarea
                      name="message"
                      id="message"
                      placeholder="Enter your message"
                      rows={6}
                      defaultValue={""}
                      onChange={handleChange}
                      required={true}
                    />
                  </div>
                  
                  <div data-netlify-recaptcha="true"></div>
      
                  {/* Break */}
                  <div className="col-12">
                    <ul className="actions">
                      <li>
                        <button type="submit" className="btn btn-send">
                          <div className="svg-wrapper-1">
                            <div className="svg-wrapper">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
                              </svg>
                            </div>
                          </div>
                          <span>Send</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </form>
            </div>


          </article>

        </div>
      </div>

    </Layout>
  )
}

const indexQuery = graphql`
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
    markdownRemark(frontmatter: {templateKey: {eq: "contact-page"}}) {
      frontmatter {
        title
        description
        thumbnail {
          childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH)
                    }
        }
      }
      
    }
  }
`

const ContactPageExport = props => (
  <StaticQuery
    query={indexQuery}
    render={data => (
      <ContactPage location={props.location} data={data} {...props} />
    )}
  />
)

export default ContactPageExport
