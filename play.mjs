import { rpc, prepareFrame, workLink, friendlyError } from './publishing-core.mjs';
const $ = id => document.getElementById(id);
async function load() {
  $('work-reload').disabled = true; $('work-frame').hidden = true; $('work-frame').removeAttribute('srcdoc'); $('work-fullscreen').hidden = true;
  $('work-status').textContent = '작품을 불러오는 중이에요…';
  try {
    const id = new URL(location.href).searchParams.get('id'); workLink(id);
    const work = await rpc('get_work', { p_id: id });
    if (!work) throw Error('작품을 찾을 수 없어요. 주소를 확인하거나 선생님께 문의해 주세요.');
    $('work-title').textContent = work.title;
    document.title = work.title + ' · 우리의 작은 발명실';
    $('work-status').textContent = `${work.class_name} · ${work.team} | 학생이 만든 작품이에요. 실명·연락처·비밀번호를 입력하지 않아요.`;
    $('work-frame').hidden = false;
    $('work-frame').srcdoc = prepareFrame(work.html).html;
    $('work-fullscreen').hidden = !document.fullscreenEnabled;
  } catch(error) { $('work-title').textContent = '작품을 열지 못했어요'; $('work-status').textContent = friendlyError(error); }
  finally { $('work-reload').disabled = false; }
}
$('work-reload').onclick = load;
$('work-fullscreen').onclick = async () => { try { await $('work-frame').requestFullscreen(); } catch { $('work-status').textContent = '이 기기에서는 전체 화면을 사용할 수 없어요. 가로로 돌려 보세요.'; } };
load();
