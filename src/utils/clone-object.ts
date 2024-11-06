export const cloneObject = <T>(object: T): T=>{
  return JSON.parse( JSON.stringify(object))
}