import { useState, useEffect } from 'react';

type UbigeoData = { [dep: string]: { [prov: string]: string[] } };

// Module-level cache: fetched once, reused across mounts.
let _cache: UbigeoData | null = null;
let _promise: Promise<UbigeoData> | null = null;

function loadUbigeo(): Promise<UbigeoData> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = fetch('/data/ubigeo.json')
    .then((r) => r.json() as Promise<UbigeoData>)
    .then((d) => { _cache = d; return d; });
  return _promise;
}

export function useUbigeo() {
  const [data, setData] = useState<UbigeoData>(_cache ?? {});
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    loadUbigeo().then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const departamentos: string[] = Object.keys(data).sort();

  function getProvincias(dep: string): string[] {
    return Object.keys(data[dep] ?? {}).sort();
  }

  function getDistritos(dep: string, prov: string): string[] {
    return (data[dep]?.[prov] ?? []).slice().sort();
  }

  function findExact(list: string[], value: string): string {
    return list.find((s) => s.toLowerCase() === value.toLowerCase()) ?? '';
  }

  return { departamentos, getProvincias, getDistritos, findExact, loading };
}
