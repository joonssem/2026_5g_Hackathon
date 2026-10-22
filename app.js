(() => {
  'use strict';
  const KEY = 'little-invention-lab-v1';
  const stages = [
    ['함께 출발', 4, '두 아이패드, 하나의 생각', '먼저 선생님의 안내를 함께 들어요.'],
    ['불편 발견', 8, '언제, 무엇이 불편했나요?', '각자 실제로 겪은 장면을 말해요. 아직 해결 방법을 정하지 않아요.'],
    ['문제 선택', 6, '우리 짝은 이 문제에 집중해요', '팀원의 생각을 비교하고, 해결할 문제 하나를 골라요.'],
    ['해결 탐색', 9, '다른 방법도 있을까요?', '서로 다른 해결 방법을 떠올리고, 더 알맞은 방법을 골라요.'],
    ['프롬프트 완성', 13, '생각을 AI가 알아듣는 말로', '입력 → 행동 → 결과가 분명한 요청문을 함께 완성해요.'],
    ['Canva로 구현', 18, '우리의 생각을 작동시켜요', '2번 아이패드에서 요청문을 보내고, 팀원이 함께 살펴봐요.'],
    ['시험과 개선', 8, '예상한 대로 움직이나요?', 'AI의 결과를 그대로 믿기보다, 우리 기준으로 직접 시험해요.'],
    ['Padlet 나눔', 10, '친구에게 도구를 건네요', '작품과 함께, 어떤 생각을 거쳐 만들었는지도 나눠요.'],
    ['생각 돌아보기', 4, '우리의 생각은 어떻게 자랐나요?', '완성한 화면만큼, 함께 생각한 과정도 소중해요.'],
  ];
  let state = { step: 0, values: {}, checks: {} }, storageOK = true;
  try { const saved = JSON.parse(localStorage.getItem(KEY)); if (saved && typeof saved.values === 'object' && saved.values && !Array.isArray(saved.values)) state = { step: Math.max(0, Math.min(8, Math.floor(Number(saved.step)) || 0)), values: saved.values, checks: saved.checks || {} }; } catch { storageOK = false; }
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const v = key => String(state.values[key] || '');
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageOK = true; } catch { storageOK = false; }
    $('save-status').textContent = storageOK ? '이 아이패드에 자동 저장했어요' : '저장 불가 · 기록을 따로 복사해요';
    $('storage-extra').textContent = storageOK ? '' : '현재 자동 저장이 안 돼요. 이동하기 전에 기록을 복사해 주세요.';
  }
  function field(key, title, placeholder = '', hint = '', short = false) {
    const classes = Object.keys(window.HACKATHON_CONFIG?.padletClassLinks || {});
    if (key === 'className' && classes.length) {
      const options = [...new Set([...classes, ...(v(key) && !classes.includes(v(key)) ? [v(key)] : [])])];
      return `<label class="field"><span class="field-title">${title}<span class="field-hint">우리 반을 선택해요. 제출 링크도 함께 바뀌어요.</span></span><select data-field="className"><option value="">반을 선택해요</option>${options.map(name => `<option value="${esc(name)}" ${v(key) === name ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></label>`;
    }
    return `<label class="field"><span class="field-title">${title}${hint ? `<span class="field-hint">${hint}</span>` : ''}</span>${short ? `<input type="text" maxlength="100" data-field="${key}" value="${esc(v(key))}" placeholder="${esc(placeholder)}">` : `<textarea data-field="${key}" maxlength="700" placeholder="${esc(placeholder)}">${esc(v(key))}</textarea>`}</label>`;
  }
  function check(key, text) { return `<label class="check"><input type="checkbox" data-check="${key}" ${state.checks[key] ? 'checked' : ''}><span>${text}</span></label>`; }
  const talk = text => `<p class="talk">${text}</p>`;
  const isThree = () => v('groupSize') === '3';
  const discussion = (a, b, c) => `<div class="discussion"><div><b>1 · 먼저</b><span>${a}</span></div><div><b>2 · 바꾸어</b><span>${b}</span></div>${isThree() ? '<div><b>3 · 한 번 더</b><span>3번도 자기 생각을 말하고, 아직 나온 적 없는 질문을 하나 해요.</span></div>' : ''}<div><b>함께 결정</b><span>${c}</span></div></div>`;
  function prompt() {
    const value = (key, fallback) => v(key).trim() || `[${fallback}]`;
    return `초등학교 5학년이 iPad에서 사용할 한국어 웹 도구를 만들어 줘.\n\n도구 이름: ${value('appName', '도구 이름')}\n사용할 사람: ${value('user', '누가 쓰는지')}\n불편한 상황: ${value('problem', '언제 무엇이 불편한지')}\n우리가 해결하려는 것: ${value('goal', '어떤 변화가 필요한지')}\n선택한 해결 방법: ${value('solution', '해결 방법')}\n\n핵심 기능은 우선 1개만 만들어 줘.\n- 사용자가 입력하거나 선택하는 것: ${value('input', '입력 또는 선택')}\n- 누르는 버튼과 하는 일: ${value('action', '버튼 이름과 행동')}\n- 화면에 보여 줄 결과: ${value('output', '결과')}\n\n성공 기준: ${value('test', '무엇을 하고 어떤 결과가 나오면 성공인지')}\n\niPad 10세대 Safari에서 가로·세로로 사용할 수 있게 해 줘. 글씨와 터치 버튼은 크고, 안내는 짧게 해 줘. 실제 이름·사진·연락처를 요구하지 않고, 로그인·외부 서비스 연결·서버 저장 없이 한 화면에서 작동하게 해 줘. 새로고침하면 입력은 초기화돼도 괜찮아. 예시 자료가 필요하면 가상의 자료를 써 줘. 실제로 누르고 시험할 수 있는 도구로 만들어 줘.`;
  }
  const required = ['appName','user','problem','goal','solution','input','action','output','test'];
  function record() {
    const names = { team:'팀 이름', groupSize:'팀 인원', scene1:'1번이 발견한 장면', scene2:'2번이 발견한 장면', scene3:'3번이 발견한 장면', user:'사용할 사람', problem:'선택한 문제', reason:'문제 선택 이유', goal:'원하는 변화', idea1:'해결 방법 A', idea2:'해결 방법 B', solution:'선택한 해결 방법', solutionReason:'해결 방법 선택 이유', appName:'도구 이름', description:'웹앱 설명', input:'입력', action:'행동', output:'결과', test:'성공 기준', actual:'실제 시험 결과', fix:'고친 내용', workUrl:'작품 링크', feedback:'친구에게 받은 의견', reflection:'생각이 달라진 순간', nextIdea:'다음에 바꾸고 싶은 점' };
    return `우리 반: ${v('className') || '(아직 기록하지 않음)'}\n\n` + Object.entries(names).map(([key, label]) => `${label}: ${key === 'groupSize' ? (isThree() ? '3명' : '2명') : v(key) || '(아직 기록하지 않음)'}`).join('\n\n') + '\n\n--- Canva 요청문 ---\n' + prompt();
  }
  function content() {
    switch(state.step) {
      case 0: return `<div class="hero"><div class="hero-copy"><span class="tag">함께 듣는 첫 4분</span><h3>발명은 “왜 불편하지?”<br>라는 질문에서 시작해요.</h3><p>정답을 빨리 찾는 대회가 아니에요.<br>짝의 생각을 듣고, 우리 생각을 발전시켜요.</p></div><div class="invention" aria-hidden="true"><div class="tile">?</div><div class="tile">✳</div></div></div>
        <div class="teacher-intro"><span class="tag">선생님과 함께 읽어요</span><div class="feature"><span>오늘의 목표</span><strong>불편 발견 → 해결 방법 비교 → 요청문 → 만들어 시험하기</strong></div><div class="feature"><span>1차시 40분</span><span>짝과 충분히 이야기하며 프롬프트를 완성해요.</span></div><div class="feature"><span>2차시 40분</span><span>Canva로 만들고 시험한 뒤 Padlet에서 나눠요.</span></div></div>
        <fieldset class="group-picker"><legend>선생님과 정한 우리 팀 인원</legend><label><input type="radio" name="group-size" value="2" ${!isThree()?'checked':''}> 2명이 함께해요</label><label><input type="radio" name="group-size" value="3" ${isThree()?'checked':''}> 3명이 함께해요</label></fieldset>
        <div class="cards ${isThree()?'three-cards':''}"><article class="card"><span class="role-number">01</span><h3>안내·기록</h3><p>이 웹의 질문을 읽고, 팀이 함께 정한 생각을 적어요.</p></article><article class="card"><span class="role-number">02</span><h3>Canva 조작</h3><p>자기 생각도 말해요. 2차시에는 받은 요청문으로 만들어요.</p></article>${isThree()?'<article class="card"><span class="role-number">03</span><h3>질문·시험</h3><p>다른 방법을 제안하고, 사용자 역할로 직접 시험해요. 자기 아이패드는 필요할 때 써요.</p></article>':''}</div>
        <p class="note">기기 역할과 관계없이 <strong>모든 팀원이 생각을 말해요.</strong> 말하기 어려우면 선택지를 가리키거나 그림으로 표현해도 좋아요. 실명·사진·연락처는 넣지 않아요.</p>
        ${field('className','우리 반','예: 5학년 1반','반만 적어요. 이름과 출석번호는 넣지 않아요.',true)}
        ${field('team','우리 팀 이름','예: 초록 톱니','실명·출석번호·개인 별명 대신 팀 이름을 정해요.',true)}
        ${check('ready','선생님 안내를 듣고, 두 기기의 역할을 확인했어요.')}${talk('오늘 우리가 해 보고 싶은 것을 한 문장씩 말해요.')}`;
      case 1: return `${discussion('1번이 불편했던 장면을 말해요.','2번이 다른 장면을 말해요.','“언제? 누구에게? 왜?”를 서로 물어요.')}
        ${field('scene1','1번이 떠올린 장면','예: 모둠 활동을 시작할 때, 무엇부터 할지 몰라 시간이 걸렸어요.')}
        ${field('scene2','2번이 떠올린 장면','예: 준비물을 챙길 때, 빠뜨린 것이 있는지 자꾸 헷갈렸어요.')}
        ${isThree()?field('scene3','3번이 떠올린 장면','다른 순간을 말해도, 비슷한 순간의 다른 불편을 말해도 좋아요.'):''}
        <details><summary>잘 떠오르지 않으면, 이런 순간을 떠올려요</summary><p>아침 준비 · 쉬는 시간 · 모둠 활동 · 정리 시간 · 집에서 공부할 때</p><p>“앱을 만들고 싶어요”보다 “언제 무엇 때문에 불편했어요”를 먼저 이야기해요. 실제 친구 이름은 쓰지 않아요.</p></details>
        ${talk('“그때 가장 불편했던 건 뭐야?”를 서로 한 번씩 물어봐요.')}`;
      case 2: return `<div class="card"><span class="tag">우리가 발견한 장면</span><p><strong>1번</strong> · ${esc(v('scene1') || '앞 단계에서 떠올린 장면을 적어요.')}</p><p><strong>2번</strong> · ${esc(v('scene2') || '앞 단계에서 떠올린 장면을 적어요.')}</p>${isThree()?`<p><strong>3번</strong> · ${esc(v('scene3')||'앞 단계에서 떠올린 장면을 적어요.')}</p>`:''}</div>
        ${discussion('누구의 불편이 더 분명한가요?','작은 도구로 조금이라도 도울 수 있나요?','오늘 해 볼 문제 하나와 고른 이유를 정해요.')}
        ${field('user','누가 사용할까요?','예: 모둠 활동을 시작하는 5학년 학생', '', true)}
        ${field('problem','언제, 무엇이 불편한가요?','예: 모둠 활동을 시작할 때 할 일이 정리되지 않아 시작이 늦어져요.')}
        ${field('reason','왜 이 문제를 골랐나요?','예: 우리 팀이 겪었고, 순서를 보여 주는 도구로 도울 수 있을 것 같아요.')}
        ${field('goal','사용한 뒤에는 어떻게 달라지면 좋을까요?','예: 다음 할 일을 바로 알 수 있으면 좋겠어요.')}
        <p class="note">큰 문제라면 오늘 도울 수 있는 작은 부분을 골라요. “학교생활 전체”보다 “모둠 활동의 시작 1분”처럼요.</p>`;
      case 3: return `${discussion('AI 없이 해결한다면 어떤 방법이 있을까요?','도구로 돕는 다른 방법도 떠올려요.','사용할 사람에게 더 쉬운 방법을 골라요.')}
        <div class="cards"><article class="card">${field('idea1','해결 방법 A','예: 해야 할 일을 순서대로 보여 줘요.')}</article><article class="card">${field('idea2','해결 방법 B','예: 활동 시간을 정하면 남은 시간을 보여 줘요.')}</article></div>
        ${field('solution','우리가 선택한 해결 방법','예: 해야 할 일을 순서대로 보여 주고, 끝내면 다음 일을 알려 줘요.')}
        ${field('solutionReason','다른 방법보다 이 방법이 나은 이유','사용하기 쉬운가요? 불편을 직접 줄이나요? 한 화면으로 만들 수 있나요?')}
        <details><summary>너무 커졌다면 이렇게 줄여요</summary><p>기능을 많이 넣기보다 꼭 필요한 기능 하나를 정해요. 로그인, 친구와 실시간 연결, 실제 학교 자료 자동 불러오기는 오늘 범위에서 빼요.</p><p>두 방법을 섞어도 괜찮아요. 어떤 부분을 왜 가져왔는지 짝에게 설명해요.</p></details>${talk('“이 방법을 쓰면 아까 그 불편이 정말 줄어들까?”')}`;
      case 4: return `${discussion('사용자가 처음에 무엇을 넣거나 고르나요?','어떤 버튼을 누르면 어떤 결과가 나와야 하나요?','완성된 요청문을 읽고 모호한 말을 고쳐요.')}
        ${field('appName','도구에 이름을 붙여요','예: 모둠 시작 도우미','꾸미기보다 쓰임이 드러나는 이름이면 좋아요.',true)}
        ${field('description','웹앱을 한 문장으로 설명해요','예: 모둠 활동을 시작할 때 할 일을 하나씩 보여 주는 도구예요.','이 설명은 마지막 Padlet 소개글에도 들어가요.')}
        ${field('input','① 입력 · 사용자가 무엇을 넣거나 고르나요?','예: 할 일 3개를 입력해요. 입력이 필요 없다면 “입력 없이 시작”이라고 적어요.')}
        ${field('action','② 행동 · 무슨 버튼을 누르나요?','예: [시작]을 누르면 첫 할 일, [완료]를 누르면 다음 할 일을 보여 줘요.')}
        ${field('output','③ 결과 · 화면에 무엇이 보이나요?','예: 지금 할 일 1개가 크게 나오고, 전부 마치면 “준비 끝!”이 나와요.')}
        ${field('test','④ 성공 기준 · 어떻게 시험하면 되나요?','예: 할 일 3개를 넣고 시작한 뒤 완료를 3번 누르면 “준비 끝!”이 나오면 성공이에요.')}
        <details><summary>요청문에 빈칸이 남았나요?</summary><p id="missing-fields"></p><p>앞 단계의 사용자·문제·변화·해결 방법도 요청문에 들어가요. 빈 내용은 이전 단계에서 채워요. 예시를 그대로 따를 필요는 없어요.</p></details>
        <h3>우리의 Canva 요청문</h3><p class="small">위 내용을 바꾸면 아래 문장도 함께 바뀌어요. 괄호가 남아 있으면 짝과 더 정해요.</p>
        <textarea id="prompt-text" class="prompt" readonly aria-label="완성된 Canva 요청문">${esc(prompt())}</textarea>
        <div class="actions"><button class="button primary" data-copy="prompt">요청문 복사</button></div>
        <div class="note"><strong>2번 아이패드로 보내는 방법은 두 가지예요.</strong><ol><li><strong>아이패드 메시지:</strong> 복사한 요청문을 메시지 앱에 붙여 넣고 조원에게 보내요.</li><li><strong>아이패드 메모 + AirDrop:</strong> 메모 앱에 요청문을 붙여 넣고, 공유에서 <strong>사본 보내기 → AirDrop</strong>으로 조원에게 보내요. 받은 메모에서 글을 복사해요.</li></ol></div>
        ${check('prompt-reviewed','모든 팀원이 요청문을 읽고, 버튼과 결과가 분명한지 확인했어요.')}
        ${check('prompt-sent','2번 아이패드에서 요청문을 받았어요.')}
        <p class="talk">짝이 사용자가 되어 순서를 말해 보고, 기록한 학생이 예상 결과를 설명해요. 이제 1차시가 끝나요!</p>`;
      case 5: return `<div class="note"><strong>2차시 시작!</strong> 2번 아이패드에서 만들고, <strong>1번 아이패드에서 시험해요.</strong> 결과는 팀원 모두 함께 판단해요.</div>
        <div class="card canva-location"><h3>Canva AI는 어디에 있나요?</h3><p><strong>Safari로 Canva를 열었다면</strong><br>Canva 홈의 <strong>왼쪽 메뉴 → Canva AI</strong>를 찾아요. 보이지 않으면 <strong>더 보기(More)</strong> 안을 확인해요.</p><p><strong>Canva 앱을 열었다면</strong><br>홈 화면의 <strong>아래쪽 메뉴 → Canva AI</strong>를 찾아요. 없으면 <strong>더 보기(… / More)</strong>를 눌러요.</p><p>Canva AI의 요청문 입력창에서 <strong>코드(&lt;/&gt; Code)</strong>를 선택해요. 홈에 <strong>Code(코드)</strong>가 바로 보이면 그 버튼으로 시작해도 좋아요.</p><p class="small">편집 화면에 있다면 먼저 홈으로 돌아와요. 화면 모양은 계정·버전에 따라 다를 수 있어요. 메뉴가 계속 없으면 선생님께 보여 드려요.</p></div>
        <ol class="instruction"><li>2번 아이패드의 메시지 또는 AirDrop으로 받은 메모에서 요청문을 복사해요.</li><li>학교에서 준비한 계정으로 Canva를 열고, 위 안내대로 <strong>Canva AI → 코드</strong>로 들어가요.</li><li>요청문을 붙여 넣고 보내요. 기다리는 동안 성공 기준을 함께 읽어요.</li><li>미리보기가 나오면 디자인 이름을 <strong>팀 이름_도구 이름</strong>으로 정해요.</li><li>실명·사진·연락처가 없는지 확인하고, 선생님 안내에 따라 <strong>웹사이트로 게시</strong>해요.</li><li><strong>게시된 실행 링크</strong>를 복사해 메시지 또는 메모 사본 AirDrop로 1번에게 보내요. 편집용 링크는 보내지 않아요.</li></ol>
        <a class="button primary" href="https://www.canva.com/" target="_blank" rel="noopener noreferrer">Canva 열기 ↗</a>
        <details><summary>Canva가 질문하면 어떻게 답하나요?</summary><p>짝과 먼저 이야기하고, 앞에서 정한 기준으로 답해요. 기능이 너무 많아지면 “오늘은 핵심 기능 하나만 만들어 줘”라고 말해요.</p></details>
        <details><summary>코드 메뉴가 없거나 생성이 안 돼요</summary><p>선생님께 화면을 보여 드려요. 계정의 권한·사용량을 확인해야 할 수 있어요. 기다리면서 입력·버튼·결과 화면을 종이에 그려도 좋아요. 요청을 여러 번 연속으로 보내지 않아요.</p></details>
        ${check('generated','2번 아이패드에서 도구를 만들고 게시했어요.')}${check('test-link-sent','게시된 실행 링크를 1번 아이패드로 보냈어요.')}${talk('처음 생각과 다르게 나온 부분은 어디인가요?')}`;
      case 6: return `<div class="note"><strong>시험은 1번 아이패드에서 해요.</strong> 2번 아이패드는 Canva에서 고칠 때 사용해요. 안내 웹은 닫지 않고, 받은 실행 링크를 새 탭에서 열어요.</div>
        <ol class="instruction"><li><strong>1번 아이패드</strong>에서 메시지 또는 메모 사본 AirDrop로 받은 실행 링크를 열어요.</li><li>아래 성공 기준대로 직접 눌러 보고, 실제 결과를 살펴봐요.</li><li>이 안내 웹의 탭으로 돌아와 결과와 고칠 점을 적어요.</li><li>고칠 요청을 2번에게 보내요. 2번이 Canva에서 수정하고 <strong>게시 내용을 갱신</strong>한 뒤 실행 링크를 다시 보내요.</li><li>1번 아이패드에서 받은 링크를 다시 열거나 새로고침하고, 같은 순서로 재시험해요.</li></ol>
        <div class="card"><span class="tag">우리의 성공 기준</span><p>${esc(v('test') || '5단계에서 시험할 순서를 적어 주세요.')}</p></div>
        ${discussion(`${isThree() ? '3번이 1번과 함께 1번 아이패드에서' : '1번이 자기 아이패드에서'} 성공 기준대로 직접 눌러 봐요.`,'2번은 사용자가 실제로 어떻게 쓰는지 보고 예상과 비교해요.','고칠 점 하나를 정하고 1번 아이패드에서 다시 시험해요.')}
        ${field('actual','직접 시험하니 어떤 일이 일어났나요?','예: 완료를 눌러도 첫 할 일만 계속 보여요. 예상과 같았다면 무엇이 같았는지 적어요.')}
        ${field('fix','무엇 하나를 어떻게 고칠까요?','예: [완료]를 누르면 다음 할 일로 넘어가게 고쳐 줘. 다른 기능은 그대로 둬.')}
        <div class="actions"><button class="button secondary" data-copy="fix">고치기 요청 복사</button></div>
        <p class="small">복사한 문장은 메시지 또는 메모 사본 AirDrop로 2번에게 전달해요. 2번은 Canva의 같은 대화에서 고치고, 수정 사항을 다시 게시해요. 잘 작동하면 기능을 더 넣지 않아도 괜찮아요.</p>
        ${check('tested','1번 아이패드에서 실행 링크를 열고 성공 기준대로 시험했어요.')}${check('retested','고쳤다면 2번이 다시 게시하고 1번 아이패드에서 재시험했어요. 또는 고칠 필요가 없었어요.')}${check('readable','1번 아이패드에서 글씨와 버튼이 잘 보이고 눌려요.')}`;
      case 7: return `<div class="note"><strong>Padlet 게시도 1번 아이패드에서 해요.</strong> 제목에는 <strong>반과 팀 이름</strong>만 적어요. <strong>이름과 출석번호는 넣지 않아요.</strong></div><ol class="instruction"><li>1번 아이패드에서 시험한 최종 링크를 준비해요. 2번이 더 고쳤다면 다시 게시한 뒤 1번에서 재시험해요.</li><li>아래에서 우리 반을 확인하고 <strong>우리 반 제출 양식 링크</strong>로 들어가요. 제출 양식에서 아래 <strong>제목 복사</strong>로 반·팀 이름을 제목 칸에 붙여 넣어요.</li><li><strong>웹앱 링크 복사</strong>로 Canva에서 만든 게시 주소를 Padlet의 링크 첨부에 넣어요. 편집용 주소는 넣지 않아요.</li><li>아래 <strong>내용 복사</strong>를 눌러 1번 아이패드에 모인 활동 내용을 Padlet의 내용 칸에 붙여 넣어요.</li><li>우리 반 섹션인지, 제목·링크·내용이 맞는지 팀원과 확인한 뒤 게시해요.</li></ol>
        <h3>① 제목 · 반과 팀 이름</h3>
        ${field('className','우리 반','예: 5학년 1반','이름과 출석번호는 넣지 않아요.',true)}
        ${field('team','우리 팀 이름','예: 초록 톱니','모두 함께 정한 팀 이름만 적어요.',true)}
        <input id="padlet-title" type="text" readonly aria-label="Padlet 제목" value="${esc(padletTitle())}">
        <div class="actions"><button class="button secondary" data-copy="padlet-title">제목 복사</button></div>
        <h3>② 링크 · Canva로 만든 웹앱</h3>
        ${field('workUrl','시험을 마친 최종 웹앱 주소','https://…','Canva에서 게시한 실행 링크를 적어요. Padlet에서 링크 첨부로 넣어요.',true)}
        <div class="actions"><button class="button secondary" data-copy="work-link">웹앱 링크 복사</button></div>
        <h3>③ 내용 · 1번 아이패드의 활동 기록</h3>
        <h3>우리 대화에서 가져온 생각</h3><div class="review-grid"><article class="card"><span class="tag">우리가 생각한 문제</span><p>${esc(v('problem')||'아직 문제를 적지 않았어요.')}</p><p class="small">고른 이유: ${esc(v('reason')||'아직 기록하지 않았어요.')}</p><button class="text-button" data-step="2">문제와 이유 보완하기 ↗</button></article><article class="card"><span class="tag">해결하기 위해 생각한 것</span><p>A · ${esc(v('idea1')||'아직 기록하지 않았어요.')}</p><p>B · ${esc(v('idea2')||'아직 기록하지 않았어요.')}</p><p>선택: ${esc(v('solution')||'아직 기록하지 않았어요.')}</p><p class="small">이유: ${esc(v('solutionReason')||'아직 기록하지 않았어요.')}</p><button class="text-button" data-step="3">해결 과정 보완하기 ↗</button></article></div>
        ${field('description','Padlet에 넣을 웹앱 설명','누구를 위한 도구이며, 어떻게 쓰면 무엇을 도와주나요?','5단계에서 쓴 설명이에요. 실제 완성된 모습에 맞게 고쳐도 좋아요.')}
        ${check('safe','제목과 내용에 이름·출석번호·사진·연락처가 없는지 확인했어요.')}${check('link-tested','1번 아이패드에서 최종 게시 주소를 열고 직접 눌러 봤어요.')}
        <p>앞에서 이야기하고 기록한 내용이 아래에 모였어요. 복사해 Padlet의 <strong>내용 칸</strong>에 붙여 넣어요.</p><textarea id="padlet-text" class="prompt" readonly aria-label="Padlet 내용">${esc(padletText())}</textarea>
        <div class="actions"><button class="button primary" data-copy="padlet">내용 복사</button><span id="padlet-class-link">${padletLink()}</span></div>
        <h3>④ 선생님이 공개하면 · 우리 반 작품 감상</h3>
        <p class="note">제출 중에는 다른 팀의 글이 보이지 않아요. 선생님이 공개를 안내하면 우리 반 소회의실에서 친구의 작품을 살펴봐요. 직접 써 보고 댓글로 좋은 점과 궁금한 점을 남기거나 좋아요를 눌러요.</p>
        <p class="small">작품 감상 링크는 선생님이 따로 안내해요.</p>
        ${padletViewLink()}
        <p class="small">Padlet에 글을 올리는 것은 직접 해요. 이 웹에서 자동으로 게시하지 않아요.</p>
        <details><summary>게시가 안 되면요?</summary><p>선생님께 요청해요. 개인정보 없는 화면과 “이렇게 움직이게 만들고 싶었어요”라는 설명으로 나눠도 괜찮아요. 편집 권한이 있는 링크를 대신 공개하지 않아요.</p></details>
        ${talk('선생님이 결과를 공개하면 다른 팀 작품을 써 보고 “써 보니 ___이 좋았어. ___은 어떨까?”라고 말해요. 아직 공개 전이면 조원끼리 이야기해요.')}
        ${field('feedback','친구에게 받은 말 또는 친구에게 전한 말','공개 전에는 조원의 의견을, 공개 후에는 다른 팀의 의견도 적어요.')}`;
      default: return `<div class="finish-banner"><span class="finish-stamp">생각하고<br>함께 만들었어요</span><div><h3>오늘의 발명은 여기까지!</h3><p>완벽한 도구보다, 이유 있는 선택을 해 본 것이 중요해요.</p></div></div>
        ${field('reflection','짝과 이야기하며 생각이 달라진 순간은?','처음에는 ___라고 생각했는데, 짝의 ___라는 말을 듣고 ___로 바꿨어요.')}
        ${field('nextIdea','시간이 더 있다면 무엇을 바꾸고 싶나요?','친구가 써 본 반응을 떠올려요.')}
        ${talk('서로에게 “네가 ___을 해 줘서 도움이 됐어”라고 말해요.')}
        <div class="actions"><button class="button primary" id="download">우리 기록 내려받기</button><button class="button secondary" data-copy="record">기록 전체 복사</button></div><p class="small">기록을 저장하거나 메시지 또는 메모 사본 AirDrop으로 보내 두면 다음 시간에도 이어 볼 수 있어요. 이 웹의 기록은 두 아이패드 사이에 자동으로 동기화되지 않아요.</p>`;
    }
  }
  function padletTitle() { return `${v('className').trim() || '[반]'} · ${v('team').trim() || '[팀 이름]'}`; }
  function padletText() { return `1. 우리가 생각하는 문제\n${v('problem') || '[문제]'}\n이 문제를 고른 이유: ${v('reason') || '[이유]'}\n\n2. 문제를 해결하기 위해 생각한 것\n방법 A: ${v('idea1') || '[방법 A]'}\n방법 B: ${v('idea2') || '[방법 B]'}\n우리가 선택한 방법: ${v('solution') || '[해결 방법]'}\n그렇게 정한 이유: ${v('solutionReason') || '[선택 이유]'}\n\n3. 웹앱 설명\n도구 이름: ${v('appName') || '[도구 이름]'}\n${v('description') || '[누구를 위한 도구인지, 어떻게 사용하는지]'}\n이렇게 써 보세요: ${v('test') || '[시험 순서]'}${v('actual').trim() ? '\n\n4. 1번 아이패드에서 시험한 결과\n' + v('actual') : ''}${v('fix').trim() ? '\n고치기 위해 생각한 것: ' + v('fix') : ''}`; }
  function safePadletUrl(url) {
    try { const u = new URL(String(url || '')); if(u.protocol === 'https:' && !u.username && !u.password && (u.hostname === 'padlet.com' || u.hostname.endsWith('.padlet.com') || u.hostname === 'padlet.org' || u.hostname.endsWith('.padlet.org'))) return u.href; } catch {}
    return '';
  }
  function padletLink() {
    const name = v('className').trim();
    const links = window.HACKATHON_CONFIG?.padletClassLinks || {};
    const url = safePadletUrl(Object.hasOwn(links, name) ? links[name] : '');
    if (url) return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="button primary">${esc(name)} 제출 양식 열기 ↗</a>`;
    return '<span class="padlet-pending">Padlet 주소는 선생님이 안내해 주세요. 우리 반을 확인하고 우리 반 제출 양식 링크로 들어가요.</span>';
  }
  function padletViewLink() {
    const url = safePadletUrl(window.HACKATHON_CONFIG?.padletViewUrl);
    return url ? `<p><a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="button secondary">5학년 전체 결과 보기 ↗</a></p>` : '';
  }
  function updateGenerated() {
    if ($('prompt-text')) $('prompt-text').value = prompt();
    if ($('padlet-text')) $('padlet-text').value = padletText();
    if ($('padlet-title')) $('padlet-title').value = padletTitle();
    if ($('padlet-class-link')) $('padlet-class-link').innerHTML = padletLink();
    if ($('missing-fields')) { const missing = required.filter(key => !v(key).trim()).length; $('missing-fields').textContent = missing ? `아직 정하지 않은 항목이 ${missing}개 있어요. 요청문의 [괄호]를 확인해요.` : '모든 항목을 채웠어요! 짝이 읽고 같은 화면을 상상하는지 확인해요.'; }
  }
  function render(focus = false) {
    const [label, minutes, title, lead] = stages[state.step];
    $('steps').innerHTML = stages.map(([name,min], i) => `${i === 0 || i === 5 ? `<div class="nav-divider">${i === 0 ? '1차시 · 생각을 발전시키기' : '2차시 · 만들고 나누기'}</div>` : ''}<button class="step-link" data-step="${i}" ${i === state.step ? 'aria-current="step"' : ''}><span class="step-number">${String(i+1).padStart(2,'0')}</span><span>${name}</span><span class="step-minutes">${min}분</span></button>`).join('');
    $('lesson-label').textContent = state.step < 5 ? '1차시 · 생각을 발전시키기' : '2차시 · 만들고 나누기';
    const elapsed = stages.slice(state.step < 5 ? 0 : 5, state.step).reduce((sum, item) => sum + item[1],0);
    $('time-label').textContent = `권장 ${minutes}분 · 차시 ${elapsed}–${elapsed + minutes}분`;
    $('progress').style.width = `${((state.step + 1) / stages.length)*100}%`;
    $('screen').innerHTML = `<div class="screen-kicker">STEP ${String(state.step+1).padStart(2,'0')} / ${label}</div><h2 id="screen-title">${title}</h2><p class="lead">${lead}</p>${content()}`;
    $('previous').disabled = state.step === 0;
    $('next').textContent = state.step === 8 ? '활동 마침 ✓' : state.step === 4 ? '2차시로 이동 →' : '다음 활동 →';
    $('next').disabled = state.step === 8;
    $('step-count').textContent = `${state.step+1} / ${stages.length}`;
    updateGenerated();
    if(focus) { $('workspace').focus({ preventScroll: true }); window.scrollTo({top:0,behavior:'instant'}); }
  }
  let toastTimer;
  function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4200); }
  async function copy(text, target, successMessage = '복사했어요. 메시지로 보내거나 메모에 붙여 넣어 AirDrop으로 보내요.') {
    if (!text.trim()) { toast('먼저 함께 내용을 적어 주세요.'); return; }
    try { await navigator.clipboard.writeText(text); toast(successMessage); }
    catch {
      let area = target, temporary = false;
      if(!area) { area = document.createElement('textarea'); area.value = text; area.style.position='fixed'; area.style.top='10px'; document.body.append(area); temporary=true; }
      area.focus(); area.select(); area.setSelectionRange(0, area.value.length);
      let copied=false; try { copied=document.execCommand('copy'); } catch {}
      if(temporary && copied) area.remove();
      if(temporary && !copied) { area.setAttribute('aria-label','길게 눌러 복사할 내용'); area.className='manual-copy'; area.addEventListener('blur',()=>area.remove(),{once:true}); }
      toast(copied ? successMessage : '선택된 글을 길게 눌러 [복사]를 눌러 주세요.');
    }
  }
  document.addEventListener('input', event => {
    const key=event.target.dataset.field;
    if(key) { state.values[key] = event.target.value; save(); updateGenerated(); }
  });
  document.addEventListener('change', event => {
    const fieldKey=event.target.dataset.field;
    if(fieldKey) {state.values[fieldKey]=event.target.value;save();updateGenerated();}
    if(event.target.name==='group-size'){state.values.groupSize=event.target.value;save();render();}
    const key=event.target.dataset.check; if(key) {state.checks[key]=event.target.checked;save();}
  });
  document.addEventListener('click', async event => {
    const button=event.target.closest('button'); if(!button)return;
    if(button.dataset.step !== undefined){state.step=Number(button.dataset.step);save();render(true);}
    if(button.dataset.copy){
      const kind=button.dataset.copy;
      const texts={'prompt':prompt(),'padlet':padletText(),'padlet-title':padletTitle(),'work-link':v('workUrl'),'fix':v('fix'),'record':record()};
      const targets={'prompt':$('prompt-text'),'padlet':$('padlet-text'),'padlet-title':$('padlet-title')};
      await copy(texts[kind] || '',targets[kind] || null, kind==='padlet'?'내용을 복사했어요. Padlet 내용 칸에 붙여 넣어요.':kind==='padlet-title'?'제목을 복사했어요. Padlet 제목 칸에 붙여 넣어요.':kind==='work-link'?'웹앱 주소를 복사했어요. Padlet에 링크로 첨부해요.':undefined);
    }
    if(button.id==='download') {
      const blob = new Blob(['\ufeff'+record()],{type:'text/plain;charset=utf-8'}), url=URL.createObjectURL(blob), a=document.createElement('a');a.href=url;a.download='우리팀-생각기록.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);toast('기록 파일을 저장해요. Safari 다운로드 목록을 확인해요.');
    }
  });
  $('previous').onclick=()=>{if(state.step>0){state.step--;save();render(true);}};
  $('next').onclick=()=>{if(state.step<8){state.step++;save();render(true);}};
  $('teacher-open').onclick=()=>$('teacher-dialog').showModal();
  $('teacher-close').onclick=()=>$('teacher-dialog').close();
  $('reset').onclick=()=>$('reset-dialog').showModal();
  $('reset-cancel').onclick=()=>$('reset-dialog').close();
  $('reset-confirm').onclick=()=>{state={step:0,values:{},checks:{}};save();$('reset-dialog').close();render(true);toast('새로운 생각을 시작해요.');};
  $('teacher-schedule').innerHTML=stages.map(([label,min],i)=>`<div class="schedule-row"><span>${i<5?'1':'2'}차시 · ${i+1}. ${label}</span><strong>${min}분</strong></div>`).join('');
  $('padlet-config-note').textContent='config.js의 padletClassLinks에 반별 제출 양식 링크를 넣으세요. 제출 중에는 수동 승인을 켜고 승인을 보류합니다. 교사는 전체 게시판에서 확인하고, 마감 후 승인하여 공개합니다. padletViewUrl은 추후 받은 전체 보기 링크만 넣으세요.';
  render();save();
})();
