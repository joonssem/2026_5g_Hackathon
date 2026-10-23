# Canva 게시 오류 시 작품 게시

학생 화면의 **08 Padlet 나눔 → 게시가 안 되면요?**를 펼칩니다. Canva Code에서 복사한 HTML 전체를 붙여 넣고 제목과 교사가 안내한 수업 참여 코드를 입력합니다. 미리보기에서 핵심 기능과 개인정보를 확인한 뒤 게시하면 `play.html?id=…` 주소를 받습니다. **위의 웹앱 주소 칸에 넣기**를 누르고, 새 탭과 다른 아이패드에서 시험한 후 Padlet에 직접 제출합니다.

HTML 파일을 저장소에 커밋하는 구조가 아닙니다. GitHub Pages가 화면을 제공하고 Supabase PostgreSQL이 HTML과 작품 정보를 저장합니다. 이미지 업로드·여러 파일 묶음·Canva 데이터 SDK에 의존하는 저장 기능은 지원하지 않습니다. 단일 HTML 500KB까지 지원합니다. 외부 이미지·글꼴·라이브러리는 해당 서비스와 학교 네트워크 상태에 따라 로딩이 제한될 수 있습니다. Canva 편집 문구가 코드에 빠져 있으면 Canva에 외부 실행용 HTML로 내보내고 모든 문구를 포함해 달라고 요청합니다.

## 서버 연결

1. 무료 Supabase 프로젝트를 생성합니다. 데이터베이스 비밀번호는 소유자가 설정·보관합니다.
2. SQL Editor에서 `supabase/migrations/202610230001_student_works.sql`을 실행합니다.
3. `config.js`의 `publishing`에 프로젝트 URL과 **publishable key**만 넣습니다. 관리자용 secret/service_role 키와 DB 비밀번호는 공개 파일에 넣지 않습니다.
4. SQL Editor에서 아래 예시의 참여 코드를 교사용 임의 코드(8~80자)로 바꿔 실행합니다. 코드를 GitHub에 올리지 않습니다.

```sql
insert into hackathon_private.sessions(label, code_hash, closes_at)
values (
  '5학년 해커톤',
  encode(sha256(convert_to('여기를-임의의-참여코드로-변경', 'UTF8')), 'hex'),
  now() + interval '14 days'
);
```

초기 설정은 14일 동안 최대 200개 작품을 받습니다. 참여 코드는 교사가 학생에게 별도로 안내합니다. 코드를 아는 사람은 제출할 수 있으므로 개인 인증 수단은 아닙니다. 브라우저에는 무작위 수정 토큰을 보관하고 DB에는 해시만 저장합니다. 같은 브라우저에서 재게시하면 링크를 유지합니다. 브라우저 기록을 지우거나 다른 기기에서 제출하면 기존 작품의 수정 권한을 복구할 수 없습니다. 원본 코드를 별도로 보관하세요. 교사는 SQL Editor에서 작품을 관리할 수 있습니다.

## 교사 관리

작품 목록(HTML과 수정 토큰은 조회하지 않음):

```sql
select id, class_name, team, title, visible, revisions, updated_at
from hackathon_private.works order by updated_at desc;
```

작품 숨김(지정한 UUID만 변경):

```sql
update hackathon_private.works set visible = false where id = '작품-UUID';
```

수업 종료 후 신규·수정 게시를 닫기(기존 작품 링크의 열람은 유지):

```sql
update hackathon_private.sessions set enabled = false where label = '5학년 해커톤';
```

`enabled = true`로 다시 열고 `closes_at`을 연장하면 다음 수업에 사용할 수 있습니다. 여러 수업이 생기면 UUID로 수업을 지정해 변경합니다.

## 일시 중지와 한계

Supabase 무료 프로젝트는 활동이 적으면 자동 일시 중지될 수 있습니다. 중지 중에는 저장뿐 아니라 기존 작품 열람도 안 됩니다. **수업 전 Supabase 대시보드에서 프로젝트를 복원하고**, 학생 화면에서 새 게시와 기존 링크 열람을 시험합니다. 자동 복원을 위해 인위적 활동을 만들지 않습니다. Supabase의 복원·보관 정책은 변경될 수 있으므로 대시보드의 안내를 확인합니다.

작품은 UUID 주소를 아는 사람이 HTML 원문을 조회할 수 있습니다. 공개 목록 API는 제공하지 않지만 링크는 비밀 보관 수단이 아닙니다. 개인정보와 API 비밀키를 넣지 않습니다. 작품은 `sandbox="allow-scripts"`의 독립된 origin에서 실행해 수업 페이지와 저장소 접근을 차단합니다. 외부 HTTPS 리소스는 허용하므로 작품에 개인정보를 입력하지 않도록 안내합니다. 카메라·마이크·위치, 팝업, 외부 폼 제출과 내부 iframe은 제한합니다.
