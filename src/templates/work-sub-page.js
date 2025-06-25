import React, { useState } from "react";
import { graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Layout from "../components/layout";
import Seo from "../components/seo";
import Masonry from "react-masonry-css";

// Importing Lightbox and its plugins
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const WorkSubPage = ({ data, pageContext }) => {
  const { year, album } = pageContext;
    const images = data.allFile.nodes;

  const siteTitle = data.site.siteMetadata.title;
  const social = data.site.siteMetadata.social;
  const meta = data.markdownRemark?.frontmatter;

  const getLastDir = (path) => {
    const parts = path.split("/");
    return parts[parts.length - 1];
  };

    const [index, setIndex] = useState(-1);

  const slides = images.map(file => ({
  src: file.childImageSharp?.gatsbyImageData.images.fallback.src,
    alt: file.name,
  }));

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <Layout location={data.location} title={siteTitle} social={social}>
      <Seo title={meta?.title || album} description={meta?.description} />
      <h1>{meta?.title || album}</h1>
      {meta?.description && <p>{meta.description}</p>}
      {meta?.date && <small>{meta.date}</small>}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {images.map((file, i) => (
          <div
            key={file.id}
            onClick={() => setIndex(i)}
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

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Thumbnails]}
      />
    </Layout>
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
        childImageSharp {
          gatsbyImageData(placeholder: BLURRED)
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
// // import Masonry from "react-masonry-css"
// // import { GatsbyImage, getImage } from "gatsby-plugin-image";
// // import LeftIcon from '../img/left-icon.svg'
// // import RightIcon from '../img/right-icon.svg'
// import Layout from "../components/layout"
// import Seo from "../components/seo"
// import { GatsbyImage, getImage } from "gatsby-plugin-image"

// const BlogPostTemplate = (props, pageContext) => {
//   const { album } = pageContext

//   const { pageContextProps } = props
//   const post = props.data.markdownRemark
//   const siteTitle = props.data.site.siteMetadata.title
//   const social = props.data.site.siteMetadata.social
//   // const nextSlug = pageContextProps?.next ? pageContextProps?.next?.fields?.slug.split('/').slice(2, -1).join('/') === '' ? '/' :`/${pageContextProps.next.fields.slug.split('/').slice(2, -1).join('/')}` : '/';
//   // const previousSlug = pageContextProps.previous ? pageContextProps?.previous?.fields?.slug?.split('/').slice(2, -1).join('/') === '' ? '/' :`/${pageContextProps.previous.fields.slug.split('/').slice(2, -1).join('/')}` : "/"
//   // const nextLinkStatus = pageContextProps?.next ? pageContextProps?.next?.frontmatter?.templateKey === 'work-sub-page' ? true : false : false
//   // const previousLinkStatus = pageContextProps?.previous ? pageContextProps?.previous?.frontmatter?.templateKey === 'work-sub-page' ? true : false : false

//   // const albumName = pageContextProps.albumName

//   // const images = props.data.allFile.nodes

//   // const breakpointColumnsObj = {
//   //   default: 4,
//   //   1100: 3,
//   //   700: 2,
//   //   500: 1,
//   // }

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

//         {/* <div className="post-link">
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
