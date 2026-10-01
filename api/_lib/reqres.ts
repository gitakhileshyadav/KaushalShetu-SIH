export interface Req {
  method?: string;
  query: Record<string, string | string[]>;
  body?: any;
  headers: Record<string, string | string[] | undefined>;
}
export interface Res {
  status: (code: number) => Res;
  json: (data: any) => void;
  setHeader: (key: string, value: string) => void;
}

export function json(res: Res, code: number, data: any) {
  res.status(code).json(data);
}

export function bearerToken(req: Req): string | null {
  const h = req.headers['authorization'];
  const val = Array.isArray(h) ? h[0] : h;
  if (!val || !val.startsWith('Bearer ')) return null;
  return val.slice(7).trim() || null;
}
