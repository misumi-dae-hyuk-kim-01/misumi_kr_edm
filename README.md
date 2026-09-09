# misumi_kr_edm
# 로컬 기동 node .\tools\serve.js
# http://localhost:5500/admin/index.html

## AWS 연동 현황

### Lambda 함수 (`lambda/`)

| 함수 | 역할 | AWS 리소스 사용 |
|---|---|---|
| `fn-generate-copy` | OpenAI(gpt-4o-mini)로 EDM 카피 생성 | 없음 (기본 실행 role만) |
| `process-image` | OpenAI `gpt-image-1`로 이미지 가공 | 없음 |
| `get-upload-url` | S3 presigned PUT URL 발급 | S3 (`kor-smartlp`, ap-northeast-1) |
| `fn-generate` (Gemini) | Gemini API로 카피 생성 → 다음 단계로 전달 | SQS (`SQS_RENDER_URL`) |
| `fn-render` (mock) | EDM HTML 조립 후 저장 | S3 (`kor-smartlp`/`kor-ecmkt-storage`) + SQS (`SQS_QA_URL`) |
| `fn-qa` | HTML QA 검사 후 Slack 알림 | S3 읽기 + API Gateway(승인 링크) |

### API Gateway (HTTP API, ap-northeast-1)

실사용 중:
- `copyGenerator.js` → fn-generate-copy 호출
- `imageProcessApi.js` → process-image 호출
- `s3Upload.js` → get-upload-url 호출
- `api.js` → 캠페인 CRUD API(`/campaigns` GET/POST/PATCH/DELETE, `/campaigns/{id}/clone`). 백엔드 Lambda 코드는 이 저장소에 없음(별도 관리) — DynamoDB를 데이터 저장소로 사용(아래 참고)

엔드포인트 미설정(미연결 상태):
- `categoryApi.js`, `seriesApi.js`, `copyGeneratorLP.js`, `seoMetaGenerator.js`, `lpDeploy.js`

### S3

- `kor-smartlp` (ap-northeast-1) — 업로드 이미지, 렌더링된 HTML 저장
- `kor-ecmkt-storage` — fn-render 기본값 예시 (실제 사용 여부 확인 필요)

### SQS (옵션 연결)

- fn-generate → fn-render
- fn-render → fn-qa

### DynamoDB

- 캠페인 데이터(제목, 상태, draftData 등)의 저장소로 사용 중 (`admin/js/state.js`, `admin/js/lib/api.js` 주석 기준).
- 프런트엔드는 `api.js`의 `/campaigns` API Gateway 엔드포인트를 통해서만 접근하며, 실제 DynamoDB 테이블/조회 로직을 담은 백엔드 Lambda 코드는 이 저장소에 포함되어 있지 않음(별도 저장소 또는 콘솔에서 직접 관리되는 것으로 추정).
- 에셋(이미지 등)과 템플릿은 DynamoDB를 쓰지 않음 — 에셋은 브라우저 localStorage(데모용), 템플릿은 `mockData.js`(실서비스 전환 시 S3 예정).

### 사용 중인 AWS 서비스 설명

| 서비스 | 역할 | 이 프로젝트에서의 용도 |
|---|---|---|
| **Lambda** | 서버 없이 코드를 실행하는 컴퓨팅 서비스 | 카피 생성, 이미지 가공, 업로드 URL 발급, HTML 렌더링/QA 등 모든 백엔드 로직 실행 |
| **API Gateway** | HTTP 요청을 받아 Lambda 등으로 전달하는 관문 역할 | 관리자 페이지(`admin/js`)가 Lambda 함수를 호출할 수 있게 하는 REST/HTTP 엔드포인트 제공 |
| **S3** | 파일(객체) 저장소 | 업로드된 이미지, 렌더링된 EDM HTML 결과물 저장 |
| **SQS** | 서비스 간 메시지를 전달하는 대기열(큐) | fn-generate → fn-render → fn-qa로 이어지는 파이프라인 단계 간 비동기 전달(옵션) |
| **DynamoDB** | NoSQL 데이터베이스 (키-값/문서 저장) | 캠페인 데이터 저장소. `api.js`의 `/campaigns` API를 통해서만 접근(백엔드 Lambda 코드는 이 저장소에 없음) |
| **IAM** | AWS 리소스 접근 권한을 관리하는 서비스 | Lambda 실행 role 부여용으로만 사용(기본 `AWSLambdaBasicExecutionRole`), 별도 커스텀 정책은 확인되지 않음 |

### 코드/설정에서 확인되지 않은 AWS 서비스

아래 서비스들은 언급되거나 연동된 흔적이 없음(즉, 미사용):

| 서비스 | 일반적인 역할 |
|---|---|
| **CloudFront** | CDN — 정적 파일을 전 세계에 빠르게 배포 |
| **SES** | 이메일 발송 서비스 |
| **Bedrock** | AWS의 관리형 생성형 AI(LLM) 서비스 |
| **Rekognition** | 이미지/영상 분석(객체 인식, 얼굴 인식 등) |
| **Textract** | 문서/이미지에서 텍스트 추출(OCR) |
| **Secrets Manager** | API 키 등 민감 정보를 암호화해 관리 |
| **SSM Parameter Store** | 설정값/환경변수를 중앙에서 관리 |
| **CloudWatch** | 로그 수집 및 모니터링/알람 |

### 참고사항

- **IaC 없음**: serverless.yml, SAM, CDK, Terraform 등 배포 자동화 코드가 저장소에 없음. `function.zip`으로 미루어 수동 배포(콘솔 또는 `aws lambda update-function-code`) 중인 것으로 추정.
- **리전 불일치 가능성**: fn-render/fn-qa의 boto3 클라이언트가 `ap-northeast-2`(서울)로 생성되는데 버킷은 `ap-northeast-1`(도쿄)로 보여 확인 필요.
- 외부 API 키(`OPENAI_API_KEY`, `GEMINI_API_KEY`)는 Lambda 콘솔 환경변수로 관리, 저장소에는 없음.
