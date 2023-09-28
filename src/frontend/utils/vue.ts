export const getClass = <T extends object>(props: T, ...keys: (keyof T)[]) => {
  return (keys.length === 0? 
    Object.entries(props).filter(([ _, value ]) => !!value).map(([ key ]) => key): 
    keys.filter(key => props[key])
  ).join(" ")
}