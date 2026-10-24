import { useCallback, useEffect, useRef, useState } from 'react'
import api, { errMsg } from '../api/client.js'

export default function useFetch(url, params, { skip } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState('')
  const key = JSON.stringify(params || {})
  const alive = useRef(true)

  const load = useCallback(async () => {
    if (skip || !url) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(url, { params: JSON.parse(key) })
      if (alive.current) setData(data)
    } catch (e) {
      if (alive.current) setError(errMsg(e))
    } finally {
      if (alive.current) setLoading(false)
    }
  }, [url, key, skip])

  useEffect(() => {
    alive.current = true
    load()
    return () => {
      alive.current = false
    }
  }, [load])

  return { data, loading, error, reload: load, setData }
}

export const listOf = (d, ...keys) => {
  if (!d) return []
  if (Array.isArray(d)) return d
  for (const k of keys) if (Array.isArray(d[k])) return d[k]
  if (Array.isArray(d.data)) return d.data
  if (Array.isArray(d.items)) return d.items
  if (Array.isArray(d.results)) return d.results
  return []
}
