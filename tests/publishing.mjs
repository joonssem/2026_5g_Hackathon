import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateCode, workLink, rpc, friendlyError, MAX_CODE_BYTES } from '../publishing-core.mjs';

assert.equal(validateCode('```html\n<button>누르기</button>\n```'), '<button>누르기</button>');
assert.throws(() => validateCode('Canva 편집 링크'), /HTML/);
assert.throws(() => validateCode('<main>' + '가'.repeat(MAX_CODE_BYTES / 3) + '</main>'), /500KB/);
const id = 'd0aa419a-d198-4e3b-9283-cb5454daa6bf';
assert.equal(workLink(id, 'https://joonssem.github.io/2026_5g_Hackathon/'), `https://joonssem.github.io/2026_5g_Hackathon/play.html?id=${id}`);
assert.throws(() => workLink('javascript:alert(1)', 'https://example.com/'), /올바르지/);
await assert.rejects(() => rpc('get_work', {}, {}), /저장 설정/);
await assert.rejects(() => rpc('get_work', {}, { url: 'https://evil.test/', publishableKey: 'public' }), /저장 설정/);
const originalFetch = globalThis.fetch;
let request;
globalThis.fetch = async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ id }) }; };
const cfg = { url: 'https://example.supabase.co/', publishableKey: 'sb_publishable_example' };
assert.deepEqual(await rpc('publish_work', { p_html: '<button>시험</button>' }, cfg), { id });
assert.equal(request.url, 'https://example.supabase.co/rest/v1/rpc/publish_work');
assert.equal(request.options.headers.apikey, cfg.publishableKey);
assert.equal(request.options.headers.Authorization, undefined);
assert.equal(JSON.parse(request.options.body).p_html, '<button>시험</button>');
globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: '수업 참여 코드를 확인해 주세요.' }) });
await assert.rejects(() => rpc('publish_work', {}, cfg), /수업 참여 코드/);
globalThis.fetch = originalFetch;
assert.match(friendlyError(Error('Failed to fetch')), /일시 중지/);
assert.doesNotMatch(friendlyError(Error('sensitive database detail')), /sensitive/);
for (const path of ['../play.html', '../publishing.mjs']) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  assert.match(source, /sandbox="allow-scripts"/);
  assert.doesNotMatch(source, /allow-same-origin/);
}
console.log('PASS: 코드·크기 검증, 프로젝트 하위 작품 URL, RPC 요청·오류 처리, 실행 영역 격리');
