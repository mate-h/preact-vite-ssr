import type admin from 'firebase-admin'
import { merge } from 'lodash'
import { db } from './firebase-client'
import { collection, doc } from 'firebase/firestore'

export function id() {
  return doc(collection(db, 'ids')).id
}

/** Reduce an array into a record based on prop */
export function reduceRecord<T extends { id: string }>(
  a: Record<string, T>,
  c: T
) {
  return merge(a, {
    [c.id]: c,
  })
}

export function reduceSnapshot<T>(
  a: admin.firestore.QuerySnapshot<admin.firestore.DocumentData>
): Record<string, T> {
  return a.docs.map((d) => d.data()).reduce(reduceRecord, {})
}

/** Deep clone an object using JSON.parse and stringify */
export function deepClone(data: any) {
  return JSON.parse(JSON.stringify(data))
}

export function flatten(data: any): Record<string, any> {
  // flatten nested objects and arrays with dot notation
  function flat(d: any, k: string): {key: string; value: any}[] {
    if (d === null || d === undefined) {
      return []
    }
    if (Array.isArray(d)) {
      return d.map((v, i) => ({ key: k + '.' + i, value: v }))
    }
    if (typeof d === 'object') {
      return Object.keys(d).reduce((acc, key) => {
        const newKey = k ? `${k}.${key}` : key
        return flat(d[key], newKey).concat(acc)
      }, [] as {key: string; value: any}[])
    }
    return [{ key: k, value: d }]
  }
  return flat(data, '').sort((a, b) => a.key.localeCompare(b.key, 'en'))
  .reduce((acc, { key, value }) => {
    acc[key] = value
    return acc
  }, {} as Record<string, any>)
}

/** Deep compare two objects */
export function deepCompare(initRecord: any, newRecord: any) {
  const sortedA = flatten(initRecord)
  const sortedB = flatten(newRecord)
  const m = merge(
    {},
    sortedA,
    sortedB
  );
  const aKeys = Object.keys(sortedA);
  const bKeys = Object.keys(sortedB);
  const diff = Object.keys(m).reduce((acc, key) => {
    // new key
    if (!aKeys.includes(key) && bKeys.includes(key)) {
      acc[key] = sortedB[key]
    }
    // changed key
    else if (aKeys.includes(key) && bKeys.includes(key)) {
      if (sortedA[key] !== sortedB[key]) {
        acc[key] = sortedB[key];
      }
    }
    // deleted key
    else if (aKeys.includes(key) && !bKeys.includes(key)) {
      acc[key] = null;
    }
    
    return acc;
  }, {} as any);
  return diff;
}

export function recordsDiff<T>(
  initState: Record<string, T>,
  newState: Record<string, T>
) {
  // merge keys with init state
  const keys = Object.keys(initState).concat(Object.keys(newState)).filter(
    (v, i, a) => a.indexOf(v) === i
  )
  const diff = keys.reduce((acc, id) => {
    const a = initState[id]
    const b = newState[id]
    if (a === undefined && b !== undefined) {
      // new campaign
      acc.push({
        type: 'set',
        id,
        init: null,
        current: b,
      })
    } else if (a !== undefined && b === undefined) {
      // deleted
      acc.push({
        type: 'delete',
        id,
        init: a,
        current: null,
      })
    } else {
      const diff = deepCompare(a, b)
      if (Object.keys(diff).length > 0) {
        acc.push({
          type: 'update',
          id,
          init: initState[id],
          current: newState[id],
          diff,
        })
      }
    }
    return acc
  }, [] as { id: string; init: T | null; current: T | null; type: 'set' | 'update' | 'delete'; diff?: any[] }[])
  return diff
}
