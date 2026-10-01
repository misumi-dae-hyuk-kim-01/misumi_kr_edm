# 관리자 화면 사용자 지정 도메인 — `studio.misumikorea.co.kr`

| 항목 | 내용 |
|---|---|
| 대상 | 관리자 화면 (`s3://kor-smartlp/admin/`) |
| 구성 | CloudFront + OAC + ACM(us-east-1) |
| 최종 접속 주소 | `https://studio.misumikorea.co.kr/` |
| 임시 접속 주소 | `https://d383ndv41zo83x.cloudfront.net/` (도메인 연결 전에도 동작) |
| 접근 제어 | CloudFront Function — 사무실 공인 IP 3개만 허용 |
| 상태 | **동작 중** — 2026-09-17 사무실에서 접속 확인 |

> 기존 주소 `https://kor-smartlp.s3.ap-northeast-1.amazonaws.com/admin/index.html` 도 **그대로 동작합니다.** 이번 작업은 앞에 진입로를 하나 더 낸 것이고, 기존 경로를 막지 않았습니다.

---

## 1. 왜 CloudFront가 필요한가

신한은행 조회 화면(`bank.misumikorea.co.kr`)은 **API Gateway**가 실체였기 때문에, API Gateway의 "사용자 지정 도메인 이름" 기능만으로 도메인을 붙일 수 있었습니다.

이 화면의 실체는 **S3에 올라간 정적 파일**입니다. S3 버킷 자체에는 HTTPS 사용자 지정 도메인 기능이 없으므로, 앞에 CloudFront를 세우고 거기에 도메인과 인증서를 붙입니다.

그래서 신한 때와 두 가지가 다릅니다.

| 항목 | 신한 (API Gateway) | 이번 (S3) |
|---|---|---|
| 앞단 | 없음 | **CloudFront 배포 1개** |
| 인증서 리전 | `ap-northeast-1` | **`us-east-1` (CloudFront 요구사항, 예외 없음)** |

---

## 2. 생성된 리소스

AWS 계정 `216989131187`.

| 리소스 | 식별자 |
|---|---|
| CloudFront 배포 | `ECRXHTK6LVLSS` → `d383ndv41zo83x.cloudfront.net` |
| 오리진 | `kor-smartlp.s3.ap-northeast-1.amazonaws.com`, 오리진 경로 `/admin` |
| OAC (오리진 액세스 제어) | `kor-smartlp-admin-oac` (`EA0KDQXKULBO8`) |
| CloudFront Function | `kor-smartlp-admin-ip-allowlist` (뷰어 요청, LIVE) |
| ACM 인증서 | `arn:aws:acm:us-east-1:216989131187:certificate/72a39c47-1035-46f9-8ed1-ae8de637858a` |
| 버킷 정책 추가 문장 | `AllowCloudFrontStudioDomainRead` |

### 오리진 경로가 `/admin` 인 이유

`https://studio.misumikorea.co.kr/` 가 곧바로 관리자 화면이 되도록 하기 위해서입니다. 이 설정 덕분에 주소에 `/admin` 이 붙지 않고, `index.html` 이 참조하는 `css/app.css` · `js/app.js` 같은 상대 경로도 자동으로 `admin/` 아래를 가리킵니다.

부작용으로, 이 도메인으로는 버킷의 **`admin/` 밖(LP 페이지·업로드 이미지)에 접근할 수 없습니다.** 의도한 동작입니다. LP 공개 페이지는 지금처럼 S3 주소를 그대로 씁니다.

### 캐시

캐시 정책은 **CachingDisabled**입니다. 배포가 전부 수동(`aws s3 cp`)이라, 캐시를 켜면 "파일을 올렸는데 예전 화면이 나온다" 문제가 생기고 그때마다 무효화(invalidation)를 걸어야 합니다. 사무실 IP 3개만 쓰는 내부 도구이므로 캐시 이득보다 이 혼란이 더 큽니다.

> 나중에 캐시를 켤 경우, 배포 절차에 아래 명령을 반드시 추가해야 합니다.
> ```bash
> aws cloudfront create-invalidation --distribution-id ECRXHTK6LVLSS --paths "/*" --profile sales-resume
> ```

---

## 3. 🔐 접근 제어 — 두 겹으로 되어 있습니다

버킷 정책의 `AllowAdminCompanyIPOnly` 는 **CloudFront를 통해 들어온 요청에는 적용되지 않습니다.** S3 입장에서 접속자는 사무실 PC가 아니라 CloudFront 엣지 서버이기 때문입니다. 그대로 두면 도메인으로는 아무나 접속할 수 있게 됩니다.

그래서 IP 검사를 **CloudFront 앞단으로 옮겼습니다.**

| 경로 | 검사 주체 | 허용 IP |
|---|---|---|
| `https://studio.misumikorea.co.kr/` | CloudFront Function | 140.82.205.146 · 140.82.205.27 · 150.195.210.53 |
| `https://kor-smartlp.s3.../admin/...` (기존 주소) | 버킷 정책 `AllowAdminCompanyIPOnly` | 동일 |

허용 외 IP는 `403 Forbidden` 을 받습니다. 신한 화면과 동일한 IP 목록입니다.

### 허용 IP를 바꿀 때 — **두 곳 모두** 고쳐야 합니다

한쪽만 고치면 한쪽 주소로는 열리고 다른 쪽으로는 막히는 상태가 됩니다.

**① CloudFront Function**

```bash
# 코드 내려받기 → ALLOWED 배열 수정 → 업데이트 → 게시(publish)
aws cloudfront get-function --name kor-smartlp-admin-ip-allowlist --stage LIVE ip-allowlist.js --profile sales-resume
aws cloudfront update-function --name kor-smartlp-admin-ip-allowlist \
  --function-config "Comment=Office IP allowlist for studio.misumikorea.co.kr,Runtime=cloudfront-js-2.0" \
  --function-code fileb://ip-allowlist.js --if-match <ETag> --profile sales-resume
aws cloudfront publish-function --name kor-smartlp-admin-ip-allowlist --if-match <ETag> --profile sales-resume
```

> ⚠️ **`publish-function` 을 빠뜨리면 반영되지 않습니다.** 수정본은 DEVELOPMENT 단계에만 남고 실제 트래픽은 LIVE 단계를 씁니다. 신한의 "리소스 정책 수정 후 `prod` 재배포"와 같은 함정입니다.

**② 버킷 정책** — `AllowAdminCompanyIPOnly` · `AllowEDMAssetsCompanyIPOnly` · `AllowLPAssetsCompanyIPOnly` 세 문장의 `aws:SourceIp` 배열.

### 검증 방법

| 테스트 | 기대 결과 |
|---|---|
| 사무실 PC에서 접속 | 화면 정상 표시 |
| **휴대폰 Wi-Fi 끄고 LTE로** 접속 | `Forbidden` |

사무실 네트워크에서만 확인하면 차단 동작을 검증할 수 없습니다.

---

## 4. DNS 등록 내용 (완료)

`misumikorea.co.kr` 존은 **gabia**에서 관리합니다(`ns1.gabia.co.kr`, `ns.gabia.co.kr`, `ns.gabia.net`). 등록된 레코드는 두 건입니다.

| 용도 | 이름 | 종류 | 값 |
|---|---|---|---|
| 인증서 검증 | `_befd062ccb40576e76f91eccf5b55df2.studio.misumikorea.co.kr` | CNAME | `_a0ac837211118c9a7c1adb86249b47b9.wzccmgtwzk.acm-validations.aws` |
| 서비스 | `studio.misumikorea.co.kr` | CNAME | `d383ndv41zo83x.cloudfront.net` |

> ⚠️ **검증용 레코드는 발급 후에도 지우면 안 됩니다.** ACM은 이 레코드로 인증서를 자동 갱신합니다. 지우면 갱신에 실패하고, 만료되는 순간 화면이 열리지 않습니다.

### 등록할 때 실제로 겪은 함정 두 가지

**① 값 끝에 `.com` 이 붙어 등록됨** — 검증용 레코드가 `...acm-validations.aws.com` 으로 등록되어 인증서가 계속 `PENDING_VALIDATION` 에 머물렀습니다. `.aws` 는 오타가 아니라 아마존이 운영하는 실제 최상위 도메인입니다. DNS 담당자에게 요청할 때 이 점을 함께 알려야 합니다. 입력창이 도메인을 자동으로 덧붙이는 경우에는 끝에 점을 찍어 `...acm-validations.aws.` 로 넣습니다.

```powershell
# 등록값 대조 — 권한 서버에 직접 물어야 캐시에 속지 않습니다
Resolve-DnsName "_befd062ccb40576e76f91eccf5b55df2.studio.misumikorea.co.kr" -Type CNAME -Server ns1.gabia.co.kr
```

**② 잘못 등록된 값이 공개 DNS에 캐시됨** — 값을 고쳐도 Google(8.8.8.8)·Quad9 등이 옛 값을 TTL(600초) 동안 들고 있어 ACM이 계속 실패합니다. 권한 서버가 올바른 값을 내주고 있다면 기다리면 됩니다. 이번에는 캐시 만료 약 2분 뒤 `ISSUED` 로 바뀌었습니다.

### 순서 주의 — 서비스용 CNAME은 별칭 등록 후에

별칭이 등록되지 않은 CloudFront 배포는 모르는 `Host` 헤더를 거부하여 `403` 을 반환합니다. 이번에도 서비스용 CNAME이 먼저 걸려 있던 동안 사내 보안 장비(Cato)가 **"Invalid SSL/TLS certificate - Hostname mismatch"** 로 차단했습니다. CloudFront가 기본 인증서(`*.cloudfront.net`)를 내주던 상태라 정상적인 반응이며, 별칭·인증서를 붙이자 해소되었습니다.

신한 때 `bank.misumikorea.co.kr` 을 API Gateway 기본 엔드포인트에 CNAME으로 걸었다가 `403` 이 났던 것과 같은 원인입니다.

### 인증서 상태 확인

```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:216989131187:certificate/72a39c47-1035-46f9-8ed1-ae8de637858a \
  --region us-east-1 --profile sales-resume --query "Certificate.Status" --output text
```

---

## 5. 도메인이 바뀌면서 생기는 실사용 차이

브라우저는 `kor-smartlp.s3...` 와 `studio.misumikorea.co.kr` 을 **서로 다른 사이트로 취급**합니다. 저장 공간이 분리되므로 새 주소에서는 아래 두 가지가 초기 상태로 시작합니다.

| 대상 | 영향 |
|---|---|
| 에셋 목록 (`state.js`, localStorage) | 새 주소에서는 기본 시드 상태로 시작 |
| LP 공용 자산 재배포 스킵 캐시 (`lpDeploy.js`) | 리셋 — 다음 LP 배포 때 공용 파일을 한 번 더 올림 (무해) |

**캠페인 데이터는 DynamoDB에 있으므로 영향받지 않습니다.**

혼란을 줄이려면 전환 후 기존 S3 주소를 쓰지 않도록 안내하고, 한 주소만 쓰게 하는 편이 좋습니다.

---

## 6. 손대지 않은 것

- **API Gateway 6개** — 관리자 화면이 호출하는 API들입니다. CORS가 전부 `AllowOrigins: *` 라서 화면 주소가 바뀌어도 수정이 필요 없었습니다.
- **S3 CORS** — 마찬가지로 `*`.
- **LP 공개 페이지 주소** — `https://kor-smartlp.s3.ap-northeast-1.amazonaws.com/lp/campaigns/...` 그대로입니다. 고객에게 나가는 링크에도 도메인을 붙이려면 별도 배포를 하나 더 만들어야 합니다.
- **저장소 코드** — 화면이 상대 경로만 쓰고 API 주소는 절대 URL이라, 도메인 전환으로 고칠 코드가 없었습니다.

---

## 7. 설정 검증 체크리스트

- [x] 인증서 상태가 `ISSUED` 인가 (us-east-1) — 2026-09-17
- [x] 배포에 별칭 `studio.misumikorea.co.kr` 이 등록되어 있는가
- [x] 사무실에서 `https://studio.misumikorea.co.kr/` 이 열리는가
- [ ] **LTE에서 `Forbidden` 이 반환되는가** ← 가장 중요
- [ ] 허용 IP 변경 시 CloudFront Function을 **게시(publish)** 했는가 (변경 시마다)
