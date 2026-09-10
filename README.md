# misumi_kr_edm

MISUMI 코리아 마케팅용 **EDM(발송 메일) · LP(랜딩페이지) 생성 관리자 도구**입니다.
마케팅 담당자가 화면에서 템플릿을 고르고 문구·이미지를 채우면, 발송용 HTML을 내려받거나
LP를 S3에 바로 공개할 수 있습니다. 문구와 이미지는 AI(OpenAI)로 자동 생성할 수 있습니다.

## 로컬 실행

```powershell
node .\tools\serve.js
```

→ http://localhost:5500/admin/index.html

빌드 도구가 없습니다. 브라우저가 ES 모듈을 직접 불러오므로 파일을 저장하고 새로고침하면 끝입니다.
`tools/serve.js`는 정적 파일 서버 하나뿐입니다.

## 저장소 구조

```
admin/                 관리자 프론트엔드 (빌드 없는 순수 ES 모듈)
  index.html           단일 진입점
  css/
  js/
    app.js             부팅 — 캠페인 목록을 API에서 불러온 뒤 라우터 시작
    router.js          해시 라우터 (#/campaigns 형태)
    state.js           store — 캠페인/에셋/템플릿 접근 지점
    views/             화면 단위 (campaigns, assets, generator, generatorLP)
    lib/               기능 모듈 (AI 호출, S3 업로드, HTML 조립, 검사기)
    data/              템플릿 정의 (개발자가 배포하는 마스터 데이터)
lambda/                AWS Lambda 함수 소스 (함수명 = 디렉터리명)
tests/                 회귀 테스트
tools/serve.js         로컬 정적 서버
```

## 화면 구성

라우터는 해시 기반입니다([router.js](admin/js/router.js)). 서버 측 rewrite 설정이 필요 없습니다.

| 경로 | 화면 | 파일 |
|---|---|---|
| `#/campaigns` | 캠페인 목록 (기본 화면) | `views/campaigns.js` |
| `#/assets` | 에셋(이미지) 관리 | `views/assets.js` |
| `#/generator?id=…` | EDM 생성기 | `views/generator.js` |
| `#/generator-lp?id=…` | LP 생성기 | `views/generatorLP.js` |

## 데이터가 저장되는 곳 — 3군데로 나뉘어 있습니다

**신규 담당자가 가장 먼저 알아야 할 부분입니다.** 저장 위치가 종류별로 다릅니다.

| 데이터 | 저장 위치 | 비고 |
|---|---|---|
| **캠페인** | DynamoDB (`api.js` → API Gateway → Lambda) | 실제 영구 저장소 |
| **에셋(이미지 메타)** | 브라우저 `localStorage` | 아직 데모 상태 — 브라우저를 바꾸면 사라집니다 |
| **템플릿** | `admin/js/data/mockData.js` (코드) | 개발자가 배포하는 마스터 데이터. `state.js`가 의도적으로 캐시하지 않습니다 |

이미지 **파일 자체**는 S3에 올라가고, 캠페인에는 그 URL만 문자열로 저장됩니다.

## AWS 리소스

### 계정 · 리전 · 인증

| 항목 | 값 |
|---|---|
| 계정 | `misumi_korea-prd` (216989131187) |
| 리전 | **`ap-northeast-1` (도쿄)** — 버킷이 도쿄에 있어 전부 도쿄로 맞춰야 합니다 |
| 인증 | IAM Identity Center(SSO). CLI 프로필 `edm-deploy`, 역할 `Maintenance` |

```powershell
aws sso login --profile edm-deploy     # 토큰 만료 시 재인증 (브라우저 열림)
```

### Lambda 함수 (8개)

디렉터리명이 실제 함수명과 같습니다. 런타임은 `python3.12`(캠페인 API만 `python3.14`)입니다.

**현재 사용 중**

| 함수 | 역할 | 트리거 | 외부 의존 |
|---|---|---|---|
| `misumi-kr-edm-campaign` | 캠페인 CRUD + 복제 | API Gateway | DynamoDB |
| `fn-generate-copy` | AI 카피 생성 | API Gateway | OpenAI `gpt-4o-mini` |
| `process-image` | AI 이미지 생성·편집 | API Gateway | OpenAI `gpt-image-1` (images/edits) |
| `get-upload-url` | 이미지 업로드용 presigned PUT URL 발급 | API Gateway | S3 |
| `get-lp-deploy-url` | LP 배포용 presigned PUT URL 발급 | API Gateway | S3 |

**휴면 상태 (2026-07 프로토타입, 현재 프론트엔드가 호출하지 않음)**

| 함수 | 역할 | 비고 |
|---|---|---|
| `fn-generate` | Gemini로 카피 생성 → SQS | 지금은 `fn-generate-copy`(OpenAI)가 대체 |
| `fn-render` | EDM HTML 조립 → S3 → SQS | |
| `fn-qa` | HTML 검사 → Slack 알림 | |

> 휴면 3개는 SQS로 이어지는 파이프라인 구조이고 리전 설정 등에 결함이 남아 있습니다.
> 되살릴 계획이 있다면 아래 "알려진 결함"을 먼저 확인하세요.

### API Gateway (HTTP API, 6개)

모두 `ap-northeast-1`이고 **인증이 없는 공개 엔드포인트**입니다. CORS는 `AllowOrigins: *`입니다.

| API 이름 | ID | 연결 Lambda | 프론트엔드 호출 지점 |
|---|---|---|---|
| `misumi-kr-edm-campaign-api` | `8sokw2hakd` | misumi-kr-edm-campaign | [api.js](admin/js/lib/api.js) |
| `fn-generate-copy-API` | `bdtaymh2tc` | fn-generate-copy | [copyGenerator.js](admin/js/lib/copyGenerator.js) |
| `process-image-API` | `2ylb31kte6` | process-image | [imageProcessApi.js](admin/js/lib/imageProcessApi.js) |
| `get-upload-url-API` | `f72jhi4vw6` | get-upload-url | [s3Upload.js](admin/js/lib/s3Upload.js) |
| `lp-deploy-api` | `ukor76mhyj` | get-lp-deploy-url | [lpDeploy.js](admin/js/lib/lpDeploy.js) |
| `fn-generate-API` | `m9zg60bz33` | fn-generate | (휴면) |

각 lib 파일 상단의 `CONFIG.xxxApiUrl`이 **빈 문자열이면 데모(목업) 모드**로 동작하는 패턴을
일관되게 씁니다. 값이 비어 있으면 AI를 호출하지 않고 그럴듯한 가짜 결과를 돌려줍니다.

### DynamoDB

| 항목 | 값 |
|---|---|
| 테이블 | `misumi-kr-edm-campaigns` (ap-northeast-1) |
| 파티션 키 | `campaignId` (문자열) |
| 접근 경로 | 프론트엔드는 항상 `/campaigns` REST API 경유. 직접 접근하지 않습니다 |

캠페인 1건이 곧 DynamoDB 항목 1개이고, 작성 중인 모든 입력값이 `draftData`에 통째로 들어갑니다.

라우트: `GET/POST /campaigns`, `GET/PATCH/DELETE /campaigns/{id}`, `POST /campaigns/{id}/clone`

### S3 — 버킷 `kor-smartlp` (ap-northeast-1)

버전 관리와 정적 웹사이트 호스팅이 켜져 있고, CORS는 `AllowedOrigins: *`입니다.

| 프리픽스 | 내용 |
|---|---|
| `admin/` | **이 관리자 앱 자체** (아래 "배포 방법" 참고) |
| `edm/uploads/{channel}/` | EDM 이미지 |
| `lp/campaigns/{campaignKey}/` | 공개된 LP 페이지 |
| `lp/uploads/` | LP 이미지 |
| `lp/shared/{namespace}/` | LP 공용 자산 — **코드상 경로이나 실제로는 비어 있습니다** (결함 ① 참고) |

브라우저에서 접속하는 주소:
`https://kor-smartlp.s3.ap-northeast-1.amazonaws.com/admin/index.html`

### 사용하지 않는 AWS 서비스

CloudFront, Route 53, ACM, SES, Bedrock, Rekognition, Secrets Manager, SSM Parameter Store는
쓰지 않습니다. CloudWatch는 Lambda 기본 로그만 있고 명시적 로깅 설정은 없습니다.
API 키는 **Lambda 환경변수**로만 관리하며 저장소에 두지 않습니다(`OPENAI_API_KEY` 등).

## 외부 API (AWS 아님)

| 대상 | 용도 | 파일 |
|---|---|---|
| `api.kr.misumi-ec.com/api/v1/series/search` | 시리즈(상품) 정보 조회 | [seriesApi.js](admin/js/lib/seriesApi.js) |
| `api.kr.misumi-ec.com/api/v1/category/search` | 카테고리 조회 | [categoryApi.js](admin/js/lib/categoryApi.js) |

⚠️ 두 파일의 `APPLICATION_ID`는 **예시 값**이라 주석에 명시돼 있습니다. 실서비스 발급 키로 교체가 필요합니다.

Slack Webhook은 휴면 함수 `fn-qa`의 알림용으로만 쓰입니다.

## 주요 요청 흐름

**AI 카피 생성**
```
생성기 "✨ AI로 카피 자동 채우기"
  → copyGenerator.js → bdtaymh2tc → fn-generate-copy → OpenAI
  → { 필드키: 문구 } 를 받아 입력폼에 채움
```

**AI 이미지 생성 → 확정 저장** (2단계로 나뉘는 것이 핵심)
```
1) imageProcessApi.js → 2ylb31kte6 → process-image → OpenAI
   → 결과 이미지 바이너리를 그대로 응답 (S3에 저장하지 않음, 미리보기 전용)
2) 사용자가 확정하면
   s3Upload.js → f72jhi4vw6 → get-upload-url → presigned URL 발급
   → 브라우저가 S3로 직접 PUT
```
> AI 호출 단계에서 S3에 저장하지 않는 것은 의도된 설계입니다. 재생성을 반복해도
> 쓰이지 않는 중간 결과물이 버킷에 쌓이지 않게 하려는 것입니다.

**LP 배포**
```
lpDeploy.js → ukor76mhyj → get-lp-deploy-url → presigned URL
  → 브라우저가 lp/campaigns/{campaignKey}/ 로 직접 PUT → 공개 URL 완성
```

## 배포 방법 — 전부 수동입니다

**IaC가 없습니다.** serverless.yml, SAM, CDK, Terraform 모두 없고 CI/CD도 없습니다.

**프론트엔드** — `admin/`을 S3에 업로드합니다. Content-Type을 반드시 지정해야 합니다
(틀리면 브라우저가 ES 모듈 로딩을 거부합니다).

```powershell
aws s3 cp admin s3://kor-smartlp/admin/ --recursive --profile edm-deploy --region ap-northeast-1 `
  --exclude "*" --include "*.js" --content-type "application/javascript" --cache-control "no-cache"
# .html → "text/html; charset=utf-8", .css → "text/css; charset=utf-8" 로 각각 반복
```

**Lambda** — 해당 디렉터리를 zip으로 압축해 코드만 교체합니다.

```powershell
aws lambda update-function-code --profile edm-deploy --region ap-northeast-1 `
  --function-name <함수명> --zip-file fileb://<zip경로>
```

> 배포 후에는 배포본을 다시 내려받아 로컬과 대조하는 것을 권합니다. 수동 배포라
> **로컬과 AWS가 어긋나는 일이 실제로 자주 발생합니다.**

## 환경 제약 (겪고 나서 알게 된 것들)

- **API Gateway 통합 타임아웃 30초는 AWS 하드 리밋**이라 늘릴 수 없습니다. `process-image`가
  이미지 품질을 `medium`(실측 15~17초), 자체 타임아웃을 27초로 둔 이유입니다.
- **공개 Lambda Function URL이 조직 정책(SCP)으로 차단**됩니다. 올바른 리소스 정책을 붙여도
  403이 반환됩니다. 그래서 전부 API Gateway를 씁니다.
- **리전을 섞으면 안 됩니다.** 버킷이 도쿄인데 서울(`ap-northeast-2`)로 서명하면 S3가
  `AuthorizationQueryParametersError` 또는 `PermanentRedirect`를 반환합니다.
- 사내 네트워크의 SSL 검사 때문에 AWS CLI의 S3 호출이 인증서 오류로 실패할 수 있습니다.
  이때는 Windows 인증서 저장소에서 CA 번들을 추출해 `--ca-bundle` 또는 `AWS_CA_BUNDLE`로 지정합니다.

## 알려진 결함 (2026-09-09 기준)

리뷰에서 확인된 미해결 항목입니다. **인수받는 분은 이 목록부터 확인하세요.**

| 우선순위 | 문제 | 위치 |
|---|---|---|
| 높음 | **LP 배포 시 CSS·JS가 전부 400으로 거부됨.** 프론트는 `css/style.css` 같은 하위 폴더 키를 보내는데 서버 정규식이 경로 구분자를 허용하지 않습니다. 그 결과 배포된 LP에 스타일이 적용되지 않습니다 (`lp/shared/`가 비어 있는 것이 그 증거) | [get-lp-deploy-url:46](lambda/get-lp-deploy-url/lambda_function.py#L46) |
| 높음 | **위 실패가 성공으로 보고됩니다.** 파일별 실패를 throw하지 않고 호출부도 검사하지 않아 항상 "배포 완료" 로그가 남습니다. 이 때문에 ①이 오래 발견되지 않았습니다 | [lpDeploy.js](admin/js/lib/lpDeploy.js), [generatorLP.js](admin/js/views/generatorLP.js) |
| 높음 | **LP 임시저장이 응답을 기다리지 않습니다.** 저장이 실패해도 "임시저장했습니다"가 먼저 표시됩니다 | [generatorLP.js](admin/js/views/generatorLP.js) |
| 높음 | **대량 카탈로그는 저장 자체가 불가능합니다.** 조립된 HTML과 원본 상품 목록을 `draftData`에 함께 넣는데, 상품 1,000개면 HTML만 약 696KB로 DynamoDB 항목 한도 400KB를 넘습니다. 위 항목과 겹쳐 **조용히 유실**됩니다 | [generatorLP.js](admin/js/views/generatorLP.js) |
| 높음 | **속성 컨텍스트 XSS.** `esc()`가 따옴표를 이스케이프하지 않고, LP 일부 블록은 `esc()` 호출 자체가 없습니다. 발송용 EDM과 공개 LP에 그대로 반영됩니다 | [dom.js](admin/js/lib/dom.js), [blocksLP.js](admin/js/lib/blocksLP.js) |
| 높음 | **참고 이미지가 1장만 전달됩니다.** 멀티파트 파서가 필드명을 무시하고 파일 파트를 같은 키에 덮어써서, 사용자의 원본이 마지막 참고 파일로 교체됩니다. `referenceUrls`는 서버가 읽지 않습니다 | [process-image:50](lambda/process-image/lambda_function.py#L50) |
| 중간 | **저장 후 이미지 재보정 실패.** `imageMeta.fileBlob`이 JSON 직렬화에서 `{}`가 되는데 truthy라 가드를 통과합니다 | [generator.js](admin/js/views/generator.js) |
| 중간 | **캠페인 목록 누락 가능.** `scan()`을 한 번만 호출해 1MB를 넘으면 다음 페이지가 조용히 빠집니다 | [misumi-kr-edm-campaign:68](lambda/misumi-kr-edm-campaign/lambda_function.py#L68) |
| 중간 | **미저장 이탈 경고가 없습니다.** `beforeunload`가 전혀 없어 AI 생성 후 새로고침 한 번에 작업이 사라집니다 | 전역 |
| 중간 | **인증 없는 엔드포인트가 임의 Content-Type을 허용합니다.** 공개 버킷에 임의 HTML/JS를 올릴 수 있습니다 | [get-upload-url](lambda/get-upload-url/lambda_function.py) |
| 낮음 | AI 카피 생성이 모델이 반환하지 않은 필드를 빈 문자열로 덮어씁니다 | [fn-generate-copy](lambda/fn-generate-copy/lambda_function.py) |
| 낮음 | 휴면 3개 함수의 리전 불일치, `S3_BUCKET` 기본값 끝공백, 예외 시 더미 응답 | `fn-generate`, `fn-render`, `fn-qa` |

구조적으로는 **IaC·자동 테스트·로깅이 없다는 점**이 위 결함들이 오래 남은 원인에 가깝습니다.
특히 AI 호출 함수 두 개에 `print`도 logger도 없어서 실패 원인을 사후에 추적할 수 없습니다.

## LP 복제와 배포 경로

캠페인 복제 API는 원본 콘텐츠를 복사하고, 복제본의 배포 키와 배포 URL 기록은 초기화합니다.
복제본의 첫 배포/다운로드에서는 `{slug}-copy-{복제본ID}_{yymmddhhmmss}` 키를 사용합니다.
저장된 본인 소유 배포 키는 재편집과 재배포 시 유지합니다.

기존 복제본도 편집 화면에서 원본 키를 물려받았는지 검사합니다. 원본을 조회할 수 없고
키 소유 기록도 없는 기존 복제본은 안전하게 새 경로를 사용합니다. 복원된 정보는 다음
임시저장에서 저장됩니다. 적용 시 캠페인 Lambda와 관리자 프론트엔드를 함께 배포하세요.

회귀 테스트는 실제 AWS 요청 없이 실행합니다(Node.js 24 및 Python 3 사용).

```powershell
node --test --test-isolation=none tests/lp-clone.test.mjs
python -B -m unittest discover -s tests -p "test_*.py"
```
