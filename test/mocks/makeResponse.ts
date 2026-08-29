export function makeResponse(init: { ok?: boolean; status?: number; statusText?: string, json?: () => any; text?: () => any }): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.ok ? 'OK' : 'Internal Server Error',
    json: async () => (init.json ? init.json() : undefined),
    text: async () => (init.text ? init.text() : ''),
  } as unknown as Response;
}