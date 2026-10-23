import { validateCode, prepareFrame, rpc, workLink, friendlyError } from './publishing-core.mjs';

const DRAFT_KEY = 'hackathon-code-draft-v1';
let draft = { code: '', title: '', id: '', token: '', url: '' };
try { draft = { ...draft, ...JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') }; } catch {}
let busy = false, context = null;
const $ = id => document.getElementById(id);
function persist() { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); return true; } catch { return false; } }
function status(message, error = false) { if ($('publish-status')) { $('publish-status').textContent = message; $('publish-status').dataset.error = String(error); } }
function showResult() {
  if (!$('publish-result')) return;
  $('publish-result').hidden = !draft.url;
  $('publish-url').value = draft.url;
  $('publish-open').href = draft.url;
  $('publish-send').textContent = draft.id ? '같은 링크로 다시 게시' : '작품 게시하고 링크 받기';
}
function bind(host, nextContext) {
  context = nextContext;
  if (!host) return;
  host.innerHTML = `<div class="publish-panel">
    <p><strong>Canva 게시가 막히면 여기에서 작품 링크를 만들어요.</strong></p>
    <ol class="instruction"><li>Canva Code에서 <strong>코드 보기·복사</strong> 기능으로 HTML 코드 전체를 복사해요. 메뉴가 없다면 선생님께 요청해요.</li><li>아래 칸에 붙여 넣고 <strong>미리보기</strong>에서 버튼과 글씨를 확인해요.</li><li>선생님이 알려 준 참여 코드를 적고 게시해요. 받은 링크를 새 탭에서 시험한 뒤 Padlet에 넣어요.</li></ol>
    <p class="small">실명·출석번호·사진·연락처·비밀번호는 코드에 넣지 않아요. 링크를 아는 사람은 작품과 코드를 볼 수 있어요. Canva 전용 저장·편집 기능은 여기에서 작동하지 않을 수 있어요.</p>
    <label class="field"><span class="field-title">작품 제목</span><input id="publish-title" maxlength="80" placeholder="예: 준비물 알리미"></label>
    <label class="field"><span class="field-title">Canva에서 복사한 HTML 코드 전체</span><textarea id="publish-code" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="<!doctype html>부터 끝까지 붙여 넣어요."></textarea></label>
    <label class="field"><span class="field-title">수업 참여 코드<span class="field-hint">선생님이 알려 줘요. 작품 링크에는 포함되지 않아요.</span></span><input id="publish-session" type="password" maxlength="80" autocomplete="off" placeholder="선생님이 알려 준 코드"></label>
    <label class="publish-check"><input id="publish-confirm" type="checkbox"><span>개인정보가 없고, 미리보기에서 글씨와 핵심 기능을 확인했어요.</span></label>
    <div class="actions"><button type="button" id="publish-preview" class="button secondary">미리보기</button><button type="button" id="publish-send" class="button primary">작품 게시하고 링크 받기</button></div>
    <p id="publish-status" class="publish-status" role="status" aria-live="polite"></p>
    <div id="publish-preview-wrap" hidden><h3>우리 작품 미리보기</h3><iframe id="publish-frame" title="게시 전 작품 미리보기" sandbox="allow-scripts" referrerpolicy="no-referrer" allow="camera 'none'; microphone 'none'; geolocation 'none'"></iframe></div>
    <div id="publish-result" class="publish-result" hidden><h3>작품 링크가 준비됐어요</h3><label class="field"><span class="field-title">우리 작품 실행 주소</span><input id="publish-url" type="url" readonly></label><div class="actions"><button id="publish-copy" type="button" class="button secondary">작품 링크 복사</button><a id="publish-open" class="button secondary" target="_blank" rel="noopener noreferrer">작품 열어 시험하기 ↗</a><button id="publish-use" type="button" class="button primary">위의 웹앱 주소 칸에 넣기</button></div><p class="small">이 아이패드의 같은 브라우저에서는 코드를 고쳐 같은 링크로 다시 게시할 수 있어요. 브라우저 기록을 지우면 수정 권한을 잃을 수 있어요. Padlet 제출은 직접 해요.</p></div>
  </div>`;
  $('publish-code').value = draft.code;
  $('publish-title').value = draft.title || context.get('appName');
  showResult();
  $('publish-send').disabled = busy;
  $('publish-code').oninput = () => { draft.code = $('publish-code').value; $('publish-confirm').checked = false; if (!persist()) status('이 기기에 임시 저장할 공간이 부족해요. 코드를 다른 곳에도 보관해 주세요.', true); };
  $('publish-title').oninput = () => { draft.title = $('publish-title').value; persist(); };
  $('publish-preview').onclick = () => {
    try {
      const prepared = prepareFrame($('publish-code').value);
      $('publish-frame').srcdoc = prepared.html; $('publish-preview-wrap').hidden = false;
      status(prepared.emptyLabels ? '제목이나 버튼 문구가 비어 있을 수 있어요. 화면을 확인하고 필요하면 Canva에 “외부에서 실행할 수 있도록 모든 문구를 HTML 안에 넣어 줘”라고 요청해요.' : '미리보기에서 직접 눌러 보세요. 잘 작동하면 확인란을 체크하고 게시해요.');
    } catch (error) { status(error.message, true); }
  };
  $('publish-send').onclick = async () => {
    if (busy) return;
    let code;
    try {
      code = validateCode($('publish-code').value);
      if (!$('publish-confirm').checked) throw Error('개인정보와 미리보기 확인란을 먼저 체크해 주세요.');
      if (!context.get('className').trim() || !context.get('team').trim()) throw Error('위쪽의 우리 반과 팀 이름을 먼저 적어 주세요.');
      if (!$('publish-title').value.trim()) throw Error('작품 제목을 적어 주세요.');
      if (!$('publish-session').value.trim()) throw Error('선생님이 알려 준 수업 참여 코드를 적어 주세요.');
      draft.code = code; draft.title = $('publish-title').value.trim();
      if (!draft.token) draft.token = [...crypto.getRandomValues(new Uint8Array(32))].map(n => n.toString(16).padStart(2,'0')).join('');
      persist();
    } catch(error) { status(error.message, true); return; }
    busy = true; $('publish-send').disabled = true; status('작품을 저장하고 링크를 만들고 있어요…');
    try {
      const result = await rpc('publish_work', { p_session_code: $('publish-session').value.trim(), p_class_name: context.get('className').trim(), p_team: context.get('team').trim(), p_title: draft.title, p_html: code, p_edit_token: draft.token, p_id: draft.id || null });
      draft.id = result.id; draft.url = workLink(result.id); const saved = persist();
      showResult(); status(saved ? '게시했어요! 작품을 새 탭에서 시험하고 링크를 복사해요.' : '게시했어요! 기기에 수정 권한을 저장하지 못했으니 지금 작품 링크와 원본 코드를 따로 보관해 주세요.');
    } catch (error) { status(friendlyError(error), true); }
    finally { busy = false; if ($('publish-send')) $('publish-send').disabled = false; }
  };
  $('publish-copy').onclick = async () => {
    try { await navigator.clipboard.writeText(draft.url); status('작품 링크를 복사했어요. 공유 문서나 Padlet에 붙여 넣어요.'); }
    catch { $('publish-url').focus(); $('publish-url').select(); status('주소를 길게 눌러 복사해 주세요.'); }
  };
  $('publish-use').onclick = () => { context.setUrl(draft.url); status('위의 웹앱 주소 칸에 넣었어요. 작품을 시험한 뒤 Padlet에 제출해요.'); };
}
window.WorkPublisher = { mount: bind };
document.dispatchEvent(new Event('publisher-ready'));
