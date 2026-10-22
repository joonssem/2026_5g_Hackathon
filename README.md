# 우리의 작은 발명실

초등학교 5학년, 40분씩 2차시 AI 해커톤을 위한 학생 안내 웹입니다. 2인 또는 3인 팀이 문제를 발견하고 해결 방법을 비교하며 Canva Code 요청문을 발전시킵니다.

## 실행

설치·빌드 없이 HTML/CSS/JavaScript로 실행합니다.

```powershell
python -m http.server 8025 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:8025/`를 엽니다. 아이패드 수업에는 HTTPS 배포 주소를 사용합니다. 교사 PC의 localhost 주소는 아이패드에서 열리지 않습니다.

## 수업 전 설정

`config.js`의 `padletUrl`에 실제 학급 게시판 주소를 넣습니다. 미설정 시 학생 화면은 교사에게 주소를 안내받도록 표시하며 임의 게시판으로 연결하지 않습니다.

학생 교육용 계정으로 Code 생성·게시, Teams 메시지, Padlet 게시·댓글을 실제 iPad 10세대에서 먼저 확인합니다. 자세한 운영은 [교사 안내](docs/TEACHER_GUIDE.md)를 참고합니다.

## 파일

- `index.html`: 공통 화면, 교사 안내 창
- `app.js`: 9단계 활동, 기록, 요청문·Padlet 글 생성, 복사·공유·기록 내보내기
- `style.css`: iPad 가로·세로 대응 뉴모피즘 디자인
- `typography.css`: 학생 iPad용 읽기·입력 글자 크기
- `teacher.html`, `teacher.css`, `teacher.js`: 65인치 전자칠판용 6장 안내, 전체 화면·키보드 이동
- `fonts.css`: 사용자 지정 Ria 제목 글꼴, Paperozi 본문 글꼴
- `config.js`: 학급 Padlet 주소
- `docs/DESIGN_LOG.md`: 요구사항·설계 판단·제작 기록
- `docs/TEACHER_GUIDE.md`: 80분 수업 운영
- `docs/VALIDATION.md`: 검증 결과와 남은 확인

기록은 같은 기기·브라우저의 localStorage에만 저장됩니다. 서버로 전송하거나 기기끼리 동기화하지 않습니다. 브라우저 데이터 삭제·시크릿 모드·저장 제한에 대비해 마지막 단계에서 기록을 내려받거나 복사합니다. 공유 버튼은 사용자가 선택한 앱으로 요청문을 전달하며 Padlet에 자동 게시하지 않습니다.

폰트는 사용자가 제공한 jsDelivr CDN에서 불러옵니다. CDN이 차단되면 시스템 글꼴로 표시됩니다. 그 외 실행 라이브러리·분석 도구·외부 AI API를 사용하지 않습니다.

## GitHub Pages 배포

GitHub 저장소에 이 폴더의 파일을 푸시하고 **Settings → Pages → Deploy from a branch → main / (root)**를 선택합니다. 최초 설정 후 main에 푸시하면 갱신됩니다. 모든 내부 경로는 상대 경로여서 저장소 하위 주소에서 동작합니다. `.nojekyll`을 포함합니다.

참고 원본: `참고 프로젝트`의 `index.html`, `docs/SPEC.md`, `assets/app.js`. 원본의 문제 찾기·요청문·시험 문장 흐름을 80분 과정 중심 수업으로 재설계했습니다. 원본 프로젝트가 밝힌 참고: TCA Creator Camp의 PRD·발표 방식, 참고 수업 자료의 안내 구조. 외부 프로젝트 코드·작품 파일은 복제하지 않았습니다.
