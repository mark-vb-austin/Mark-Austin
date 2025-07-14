import React from "react";
import { Helmet } from "react-helmet";

const StructuredData = ({ 
  type = "WebSite", 
  name, 
  description, 
  url, 
  image, 
  author,
  datePublished,
  dateModified,
  publisher,
  sameAs = []
}) => {
  let structuredData = {};

  switch (type) {
    case "WebSite":
      structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": name,
        "description": description,
        "url": url,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${url}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      };
      break;

    case "Person":
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": name,
        "description": description,
        "url": url,
        "image": image,
        "jobTitle": "Professional Photographer",
        "worksFor": {
          "@type": "Organization",
          "name": "Mark Austin Photography"
        },
        "sameAs": sameAs,
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "Scotland"
        }
      };
      break;

    case "Article":
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": name,
        "description": description,
        "image": image,
        "author": {
          "@type": "Person",
          "name": author
        },
        "publisher": {
          "@type": "Organization",
          "name": publisher,
          "logo": {
            "@type": "ImageObject",
            "url": `${url}/icons/icon-512x512.png`
          }
        },
        "datePublished": datePublished,
        "dateModified": dateModified,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url
        }
      };
      break;

    case "ImageGallery":
      structuredData = {
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        "name": name,
        "description": description,
        "url": url,
        "author": {
          "@type": "Person",
          "name": author
        }
      };
      break;

    case "Service":
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "Photography Services",
        "name": name,
        "description": description,
        "provider": {
          "@type": "Person",
          "name": author
        },
        "areaServed": "Scotland",
        "url": url
      };
      break;

    default:
      return null;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
