export function id() {
  return Math.random().toString(36).substring(2, 9);
}

/** Deep clone an object using JSON.parse and stringify */
export function deepClone(data: any) {
  return JSON.parse(JSON.stringify(data));
}

/** Deep compare two objects */
export function deepCompare(a: any, b: any) {
  // recursive stringify and sort keys
  const sortObj = (data: any): any => {
    if (data === null || data === undefined) {
      return data;
    }
    if (Array.isArray(data)) {
      return data.map(sortObj);
    }
    if (typeof data === "object") {
      return Object.keys(data).sort().reduce((acc, key) => {
        acc[key] = sortObj(data[key]);
        return acc;
      }, {} as any);
    }
    return data;
  }
  const aStr = JSON.stringify(sortObj(a));
  const bStr = JSON.stringify(sortObj(b));
  return aStr === bStr;
}

export function fullStateDiff<T>(initState: Record<string, T>, newState: Record<string, T>) {
  // merge keys with init state
  const keys = Object.keys(initState).concat(Object.keys(newState));
  const diff = keys.reduce((acc, id) => {
    const a = initState[id];
    const b = newState[id];
    if (a === undefined && b !== undefined) {
      // new campaign
      acc.push({
        type: "set",
        id,
        init: null,
        current: b,
      });
    }
    else if (a !== undefined && b === undefined) {
      // deleted
      acc.push({
        type: "delete",
        id,
        init: a,
        current: null,
      });
    }
    else if (!deepCompare(a, b)) {
      acc.push({
        type: "update",
        id,
        init: initState[id],
        current: newState[id],
      });
    }
    return acc;
  }, [] as { id: string; init: T|null; current: T|null, type: "set"|"update"|"delete" }[]);
  return diff;
}