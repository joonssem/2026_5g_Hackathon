import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

// DOM을 대체해 상태·문장 생성·이벤트 흐름만 검사합니다. 브라우저 렌더링 검사는 아닙니다.
const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
function boot(saved = null, failStorage = false, padletUrl = '') {
  const elements = new Map(), events = {}, store = new Map(saved ? [['little-invention-lab-v1', JSON.stringify(saved)]] : []);
  let copied = '';
  function element(id) {
    if (!elements.has(id)) elements.set(id, { innerHTML: '', textContent: '', value: '', style: {}, disabled: false, classList: { add(){}, remove(){} }, focus(){}, showModal(){ this.open=true; }, close(){this.open=false;} });
    return elements.get(id);
  }
  const document = { getElementById: element, addEventListener(type, handler) { events[type]=handler; } };
  const context = vm.createContext({ document, window:{HACKATHON_CONFIG:{padletUrl},scrollTo(){}}, navigator:{clipboard:{async writeText(text){copied=text;}}}, localStorage:{getItem(key){if(failStorage)throw Error('storage disabled');return store.get(key)||null;},setItem(key,value){if(failStorage)throw Error('storage disabled');store.set(key,value);}},URL,Blob,setTimeout(){return 1;},clearTimeout(){} });
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
await app.click({},'share-prompt');
assert.equal(app.copied,app.element('prompt-text').value);
await app.click({step:'7'});
for(const key of ['problem','reason','idea1','idea2','solution','solutionReason','description'])assert.ok(app.element('padlet-text').value.includes(values[key]),key);
assert.equal(app.element('padlet-title').value,'5학년 1반 · 새싹 발명가');
assert.ok(!app.element('padlet-text').value.includes(values.workUrl));
await app.click({copy:'padlet-title'});
assert.equal(app.copied,'5학년 1반 · 새싹 발명가');
await app.click({copy:'work-link'});
assert.equal(app.copied,values.workUrl);
app.input('className','5학년 2반');
assert.equal(app.element('padlet-title').value,'5학년 2반 · 새싹 발명가');
assert.match(app.element('screen').innerHTML,/Padlet 주소는 선생님/);
app.input('description','수정한 최종 설명');
assert.match(app.element('padlet-text').value,/수정한 최종 설명/);
await app.click({copy:'padlet'});
assert.equal(app.copied,app.element('padlet-text').value);

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
const goodLink=boot(null,false,'https://padlet.com/class/board');
await goodLink.click({step:'7'});
assert.match(goodLink.element('screen').innerHTML,/href="https:\/\/padlet.com\/class\/board"/);
const badLink=boot(null,false,'javascript:alert(1)');
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
console.log('PASS: 9단계, 2/3인 전환, 기록 유지·복원, 요청문·Padlet 연결, 복사·공유 대안, 저장 실패, 문자열 안전 처리, 초기화, 링크 설정, 40+40분');
