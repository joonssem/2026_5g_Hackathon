export const MAX_CODE_BYTES = 500 * 1024;
export const FRAME_CSP = "default-src https: data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src https:; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";

export function validateCode(source) {
  const code = String(source || '').trim().replace(/^```(?:html)?\s*\n?/i, '').replace(/\n?```\s*$/, '').trim();
  if (!code || !/<(?:!doctype|html|head|body|div|main|section|h1|button|script)\b/i.test(code)) throw Error('Canva에서 HTML 코드 전체를 복사해 붙여 넣어요.');
  if (new TextEncoder().encode(code).length > MAX_CODE_BYTES) throw Error('코드는 500KB까지 올릴 수 있어요. 큰 이미지나 불필요한 코드를 줄여 주세요.');
  return code;
}

export function workLink(id, base = location.href) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)) throw Error('작품 주소가 올바르지 않아요.');
  const url = new URL('play.html', base);
  url.searchParams.set('id', id);
  return url.href;
}

export function friendlyError(error) {
  const message = String(error?.message || error || '');
  if (/Failed to fetch|NetworkError|timeout|aborted|network/i.test(message)) return '저장 서버에 연결하지 못했어요. 인터넷을 확인하고, 계속 안 되면 선생님께 서버가 일시 중지됐는지 확인해 달라고 해요. 코드는 그대로 남아 있어요.';
  const known = ['참여 코드', '수업 시간', '게시 수', '수정 권한', '잠시 뒤', '500KB', '작품을 찾을', '반과 팀', '작품 제목', 'HTML', '저장 설정'];
  return known.some(word => message.includes(word)) ? message : '게시하지 못했어요. 코드는 그대로 남아 있어요. 잠시 뒤 다시 시도하고 계속되면 선생님께 알려 주세요.';
}

export async function rpc(name, args, config = window.HACKATHON_CONFIG?.publishing) {
  if (!config?.url || !config?.publishableKey) throw Error('저장 설정을 준비 중이에요. 선생님께 알려 주세요.');
  const endpoint = new URL(config.url);
  if (endpoint.protocol !== 'https:' || !endpoint.hostname.endsWith('.supabase.co')) throw Error('저장 설정을 확인해 주세요.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(`${endpoint.origin}/rest/v1/rpc/${name}`, {
      method: 'POST', headers: { apikey: config.publishableKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(args), signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) throw Error(data.message || '게시 오류');
    return data;
  } finally { clearTimeout(timer); }
}

// Student scripts get their own opaque origin. Never add allow-same-origin to the iframe.
export function prepareFrame(code, DOMParserImpl = DOMParser) {
  const doc = new DOMParserImpl().parseFromString(validateCode(code), 'text/html');
  doc.querySelectorAll('base, meta[http-equiv], object, embed, iframe').forEach(node => node.remove());
  let removedSdk = false;
  doc.querySelectorAll('script[src]').forEach(node => {
    const src = node.getAttribute('src') || '';
    if (/canva.*(?:sdk|telemetry)|(?:sdk|telemetry).*canva|\/_sdk\//i.test(src)) { node.remove(); removedSdk = true; }
  });
  const policy = doc.createElement('meta');
  policy.httpEquiv = 'Content-Security-Policy'; policy.content = FRAME_CSP;
  doc.head.prepend(policy);
  const emptyLabels = [...doc.querySelectorAll('h1, button, label')].some(node => !node.textContent.trim() && !node.querySelector('svg,img,input') && !node.getAttribute('aria-label'));
  return { html: '<!doctype html>\n' + doc.documentElement.outerHTML, emptyLabels, removedSdk };
}
