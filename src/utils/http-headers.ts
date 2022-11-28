export function getLinkHrefWithRel(linkHeader: string, rel: string) {
  const linkHeaders = linkHeader.split(/\s*,\s*/);

  let linkHref: string | undefined;

  linkHeaders.some((linkString) => {
    const matches = linkString.match(/^<([^>]+)>;.*rel="([^"]+)".*/);
    if (matches?.[1] && matches?.[2]?.split(/\s+/).includes(rel)) {
      linkHref = matches?.[1];
      return true;
    }

    return false;
  });

  return linkHref;
}
