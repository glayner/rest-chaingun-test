export const cloneObject = <T>(objectToClone: T): T=>{
  let newObject,
    index;

  if (typeof objectToClone !== 'object') {
    return objectToClone;
  }
  if (!objectToClone) {
    return objectToClone;
  }

  if ('[object Array]' === Object.prototype.toString.apply(objectToClone)) {
    newObject = [];
    for (index = 0; index < (objectToClone as T[]).length; index += 1) {
      newObject[index] = cloneObject(objectToClone[index]);
    }
    return newObject;
  }

  newObject = {};
  for (index in objectToClone) {
    if (objectToClone.hasOwnProperty(index)) {
      newObject[index] = cloneObject(objectToClone[index]);
    }
  }
  return newObject;
}