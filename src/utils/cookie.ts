import { MyCookie } from "../types"


export const formatCookie = (cookies: MyCookie) => {
  return Object.values(cookies).map(domainCookie => Object.values(domainCookie).join(';')).join(';')
}

export const updateCookie = (cookies: MyCookie, setCookie: string[]) => {
  setCookie.forEach(newCookie => {
    const { domain, path, name } = parseCookie(newCookie)
    const domainPathKey = `${domain}-${path}`

    if (!cookies[domainPathKey]) {
      cookies[domainPathKey] = {
      }
    }

    cookies[domainPathKey][name] = newCookie
  })
}

function parseCookie(cookieString: string): {
  name: string;
  value: string;
  domain?: string;
  path?: string;
} {
  const cookieParts = cookieString.split(';').map(part => part.trim());
  const [nameValue, ...attributes] = cookieParts;


  const [name, value] = nameValue.split('=');


  const cookieData: {
    name: string;
    value: string;
    domain?: string;
    path?: string;
  } = { name, value };


  for (const attribute of attributes) {
    const [key, attrValue] = attribute.split('=');

    if (key.toLowerCase() === 'domain') {
      cookieData.domain = attrValue;
    } else if (key.toLowerCase() === 'path') {
      cookieData.path = attrValue;
    }
  }

  return cookieData;
}

