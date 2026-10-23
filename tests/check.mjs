import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

// DOM을 대체해 상태·문장 생성·이벤트 흐름만 검사합니다. 브라우저 렌더링 검사는 아닙니다.
const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
function boot(saved = null, failStorage = false, config = {}) {
  const elements = new Map(), events = {}, store = new Map(saved ? [['little-invention-lab-v1', JSON.stringify(saved)]] : []);
  let copied = '';
  function element(id) {
    if (!elements.has(id)) elements.set(id, { innerHTML: '', textContent: '', value: '', style: {}, disabled: false, classList: { add(){}, remove(){} }, focus(){}, showModal(){ this.open=true; }, close(){this.open=false;} });
    return elements.get(id);
  }
  const document = { getElementById: element, addEventListener(type, handler) { events[type]=handler; } };
  const context = vm.createContext({ document, window:{HACKATHON_CONFIG:config,scrollTo(){}}, navigator:{clipboard:{async writeText(text){copied=text;}}}, localStorage:{getItem(key){if(failStorage)throw Error('storage disabled');return store.get(key)||null;},setItem(key,value){if(failStorage)throw Error('storage disabled');store.set(key,value);}},URL,Blob,setTimeout(){return 1;},clearTimeout(){} });
  vm.runInContext(source, context);
  return {element,store,events,get copied(){return copied;},input(key,value){events.input({target:{dataset:{field:key},value}});},changeSize(value){events.change({target:{name:'group-size',value,dataset:{}}});},async click(data={},id=''){await events.click({target:{closest(){return {dataset:data,id};}}});}};
}

const app = boot();
assert.equal((app.element('steps').innerHTML.match(/class="step-link"/g)||[]).length, 9);
assert.match(app.element('screen').innerHTML,/선생님과 함께 읽어요/);
assert.equal(app.element('previous').disabled,true);
app.input('team','새싹 발명가');
app.input('className','5학년 1반');
app.changeSize('3');
assert.match(app.element('screen').innerHTML,/질문·시험/);
await app.click({step:'1'});
assert.match(app.element('screen').innerHTML,/3번이 떠올린 장면/);
assert.match(app.element('screen').innerHTML,/3번도 자기 생각을 말하고/);
app.input('scene3','정리 순서가 헷갈림');
app.changeSize('2');
assert.doesNotMatch(app.element('screen').innerHTML,/3번이 떠올린 장면/);
assert.equal(JSON.parse(app.store.get('little-invention-lab-v1')).values.scene3,'정리 순서가 헷갈림');

const values={user:'모둠 활동 학생',problem:'시작할 일을 모름',reason:'함께 겪은 문제',goal:'다음 일을 바로 알기',idea1:'할 일 목록',idea2:'남은 시간 표시',solution:'순서대로 할 일 안내',solutionReason:'목록이 더 직접적인 도움',appName:'차근차근',description:'할 일을 하나씩 보여 주는 도구',input:'할 일 3개',action:'완료 버튼',output:'다음 할 일',test:'완료를 3번 누르면 준비 끝',workUrl:'https://example.canva.site/demo'};
for(const [key,value] of Object.entries(values))app.input(key,value);
await app.click({step:'4'});
for(const key of ['user','problem','goal','solution','input','action','output','test'])assert.ok(app.element('prompt-text').value.includes(values[key]), key);
assert.match(app.element('missing-fields').textContent,/모든 항목/);
await app.click({copy:'prompt'});
assert.equal(app.copied,app.element('prompt-text').value);
assert.doesNotMatch(app.element('screen').innerHTML,/share-prompt|Teams/);
assert.match(app.element('screen').innerHTML,/Canva 공유 문서/);
assert.match(app.element('screen').innerHTML,/편집 가능/);
await app.click({step:'7'});
for(const key of ['problem','reason','idea1','idea2','solution','solutionReason','description'])assert.ok(app.element('padlet-text').value.includes(values[key]),key);
assert.equal(app.element('padlet-title').value,'5학년 1반 · 새싹 발명가');
assert.ok(!app.element('padlet-text').value.includes(values.workUrl));
await app.click({copy:'padlet-title'});
assert.equal(app.copied,'5학년 1반 · 새싹 발명가');
await app.click({copy:'work-link'});
assert.equal(app.copied,values.workUrl);
// A published URL can exceed the short text fields' 100-character limit.
const longWorkUrl = 'https://example.canva.site/' + 'published-demo-'.repeat(18);
assert.ok(longWorkUrl.length > 100);
assert.match(app.element('screen').innerHTML, /type="url" maxlength="2048" data-field="workUrl"/);
app.input('workUrl',longWorkUrl);
await app.click({copy:'work-link'});
assert.equal(app.copied,longWorkUrl);
const urlRestored=boot(JSON.parse(app.store.get('little-invention-lab-v1')));
await urlRestored.click({copy:'work-link'});
assert.equal(urlRestored.copied,longWorkUrl);
app.input('workUrl',values.workUrl);
app.input('className','5학년 2반');
assert.equal(app.element('padlet-title').value,'5학년 2반 · 새싹 발명가');
assert.match(app.element('screen').innerHTML,/Padlet 주소는 선생님/);
app.input('description','수정한 최종 설명');
assert.match(app.element('padlet-text').value,/수정한 최종 설명/);
await app.click({copy:'padlet'});
assert.equal(app.copied,app.element('padlet-text').value);

// Carry the actual test result and the proposed fix through the final submission.
await app.click({step:'6'});
app.input('actual','완료를 눌러도 다음 할 일이 표시되지 않았어요.');
app.input('fix','완료 버튼을 누르면 다음 할 일을 표시해 줘.');
await app.click({copy:'fix'});
assert.equal(app.copied,'완료 버튼을 누르면 다음 할 일을 표시해 줘.');
await app.click({step:'7'});
assert.ok(app.element('padlet-text').value.includes('완료를 눌러도 다음 할 일이 표시되지 않았어요.'));
assert.ok(app.element('padlet-text').value.includes('완료 버튼을 누르면 다음 할 일을 표시해 줘.'));
await app.click({copy:'record'});
assert.ok(app.copied.includes(values.goal));
assert.ok(app.copied.includes('완료를 눌러도 다음 할 일이 표시되지 않았어요.'));
assert.ok(app.copied.includes('완료 버튼을 누르면 다음 할 일을 표시해 줘.'));

app.input('problem','<img src=x onerror=alert(1)>');
await app.click({step:'7'});
assert.doesNotMatch(app.element('screen').innerHTML,/<img src=x/);
assert.match(app.element('screen').innerHTML,/&lt;img/);
const restored=boot(JSON.parse(app.store.get('little-invention-lab-v1')));
assert.match(restored.element('step-count').textContent,/8 \/ 9/);
assert.match(restored.element('padlet-text').value,/수정한 최종 설명/);
const badStorage=boot(null,true);
assert.match(badStorage.element('save-status').textContent,/저장 불가/);
const malformed=boot({step:2.5,values:{},checks:{}});
assert.equal(malformed.element('step-count').textContent,'3 / 9');
const links={'5학년 1반':'https://padlet.com/class/one?section=one','5학년 2반':'https://padlet.com/class/two?section=two'};
const goodLink=boot(null,false,{padletClassLinks:links});
assert.match(goodLink.element('screen').innerHTML,/<select data-field="className">/);
goodLink.input('className','5학년 1반');
await goodLink.click({step:'7'});
assert.match(goodLink.element('padlet-class-link').innerHTML,/https:\/\/padlet.com\/class\/one\?section=one/);
goodLink.events.change({target:{dataset:{field:'className'},value:'5학년 2반'}});
assert.match(goodLink.element('padlet-class-link').innerHTML,/https:\/\/padlet.com\/class\/two\?section=two/);
assert.doesNotMatch(goodLink.element('padlet-class-link').innerHTML,/class\/one/);
goodLink.input('className','5학년 3반');
assert.doesNotMatch(goodLink.element('padlet-class-link').innerHTML,/href=/);
assert.doesNotMatch(goodLink.element('screen').innerHTML,/5학년 전체 결과 보기/);
const publicView=boot(null,false,{padletViewUrl:'https://padlet.com/school/view'});
await publicView.click({step:'7'});
assert.match(publicView.element('screen').innerHTML,/5학년 전체 결과 보기/);
assert.match(publicView.element('screen').innerHTML,/href="https:\/\/padlet.com\/school\/view"/);
const legacy=boot(null,false,{padletUrl:'https://padlet.com/school/all'});
await legacy.click({step:'7'});
assert.doesNotMatch(legacy.element('screen').innerHTML,/href="https:\/\/padlet.com\/school\/all"/);
const configured = {window:{}};
vm.runInNewContext(readFileSync(new URL('../config.js',import.meta.url),'utf8'),configured);
const classroom=boot(null,false,configured.window.HACKATHON_CONFIG);
await classroom.click({step:'7'});
assert.equal(Object.keys(configured.window.HACKATHON_CONFIG.padletClassLinks).length, 4);
assert.match(classroom.element('screen').innerHTML, /Padlet 주소는 선생님/);
for (const [name, link] of Object.entries(configured.window.HACKATHON_CONFIG.padletClassLinks)) {
  classroom.events.change({target:{dataset:{field:'className'},value:name}});
  assert.ok(classroom.element('padlet-class-link').innerHTML.includes(`href="${link}"`));
}
assert.doesNotMatch(classroom.element('screen').innerHTML,/breakout-room\//);
assert.equal(configured.window.HACKATHON_CONFIG.padletClassViewLinks,undefined);
assert.doesNotMatch(classroom.element('screen').innerHTML,/5학년 전체 결과 보기/);
const badLink=boot(null,false,{padletClassLinks:{'5학년 1반':'javascript:alert(1)'},padletViewUrl:'https://padlet.com.evil.example/view'});
badLink.input('className','5학년 1반');
await badLink.click({step:'7'});
assert.doesNotMatch(badLink.element('screen').innerHTML,/href="javascript/);
await app.click({step:'8'});
assert.equal(app.element('next').disabled,true);
app.element('reset-confirm').onclick();
assert.equal(app.element('step-count').textContent,'1 / 9');
assert.deepEqual(JSON.parse(app.store.get('little-invention-lab-v1')).values,{});

const html=readFileSync(new URL('../index.html', import.meta.url),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+\.(?:css|js))"/g))assert.ok(existsSync(new URL('../'+match[1],import.meta.url)),match[1]);
const times=[...source.matchAll(/^\s+\['[^']+', (\d+),/gm)].map(match=>Number(match[1]));
assert.equal(times.length,9);
assert.equal(times.slice(0,5).reduce((a,b)=>a+b),40);
assert.equal(times.slice(5).reduce((a,b)=>a+b),40);
console.log('PASS: 9단계, 2/3인 전환, 기록 유지·복원, 복사, 저장 실패, 문자열 안전 처리, 초기화, 반별 제출 링크 변경·미설정·안전 검증, 전체 보기 조건부 표시, 40+40분');
