// src/lib/sanity/navbarQuery.ts
export const navbarQuery = `
*[_type == "navbar"]{
  title,
  items[]{
    label,
    openInNewTab,
    // wir holen hier entweder URL oder Slug des internen Ziels
    link[]{
      ...,
      internalReference->{
        _type,
        "slug": slug.current
      }
    }
  }
}
`;
