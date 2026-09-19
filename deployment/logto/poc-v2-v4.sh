#!/usr/bin/env bash
# ============================================================================
# POC V2-V4 — 组织 Token 强制 + OIDC 授权码流程 + SSO 会话共享（Authlode 批次 0）
#
# V2: 成员可获组织 Token（aud=urn:logto:organization:{id}）；移出组织后
#     403 "user is not a member of the organization" —— "没资格用不了"由 IAM 强制
# V3: OIDC 授权码流程（PKCE + consent + code→token）
# V4: 已有会话发起新授权请求 → 直接 303 回调拿 code（免重新登录 = SSO 会话共享）
#
# 关键机制（实测发现，写进批次 1 设计）:
#   - offline_access 需要 prompt=consent 才会被授予（否则 scope 被静默丢弃）
#   - refresh token 每次使用后轮换，必须保存响应中的新 RT
#   - 组织 Token 获取路径: 正常登录拿 RT → refresh 授权 + organization_id 参数
#     （不是在初始授权请求里带 organization_id）
#   - 本版本 interaction API: PUT /api/interaction，event 枚举 PascalCase（"SignIn"）
#
# 用法: ./poc-v2-v4.sh   （前置: ./poc-v1-v5.sh 已运行，或自行确保数据存在）
# ============================================================================
set -uo pipefail

DB_CONTAINER="logto-logto-db-1"
ADMIN_OIDC="http://localhost:3002/oidc/token"
API="http://localhost:3003/api"
CORE="http://localhost:3003"
RESOURCE="https://default.logto.app/api"
BODY_FILE=/tmp/opencode/poc-body
JAR=/tmp/opencode/poc-v24-jar

ORG_A="Acme"; USER_EMAIL="alice@authlode.dev"; USER_PASSWORD="P0c-Authlode-2026!"

PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); echo "  ✅ $1"; }
bad() { FAIL=$((FAIL+1)); echo "  ❌ $1"; }
info() { echo "  ℹ️  $1" >&2; }
code_is_2xx() { [[ "$1" =~ ^2 ]]; }

# ── 0. M2M token（注意: m-default 在 admin 租户，走 :3002）────────────────
SECRET=$(docker exec "$DB_CONTAINER" psql -U logto -d logto -t -A -c \
  "SELECT secret FROM applications WHERE id='m-default';")
TOKEN=$(curl -s -X POST "$ADMIN_OIDC" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=m-default&client_secret=${SECRET}&resource=${RESOURCE}&scope=all" \
  | jq -r '.access_token // empty')
[ -n "$TOKEN" ] && ok "M2M token 获取（m-default @ admin 租户 :3002）" || { bad "token 获取失败"; exit 1; }

api() { # → stdout: HTTP 状态码；响应体写入 $BODY_FILE
  local method=$1 path=$2 body=${3:-}
  if [ -n "$body" ]; then
    curl -s -o "$BODY_FILE" -w "%{http_code}" -X "$method" "$API$path" \
      -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$body"
  else
    curl -s -o "$BODY_FILE" -w "%{http_code}" -X "$method" "$API$path" \
      -H "Authorization: Bearer $TOKEN"
  fi
}

# ── 0.1 测试数据（先查后建，幂等）──────────────────────────────
api GET "/organizations" >/dev/null
ORG_ID=$(jq -r ".[] | select(.name==\"$ORG_A\") | .id" < "$BODY_FILE" | head -1)
[ -n "$ORG_ID" ] && [ "$ORG_ID" != "null" ] || { bad "组织 $ORG_A 不存在（先跑 poc-v1-v5.sh）"; exit 1; }
api GET "/users?search=$USER_EMAIL" >/dev/null
USER_ID=$(jq -r ".[] | select(.primaryEmail==\"$USER_EMAIL\") | .id" < "$BODY_FILE" | head -1)
[ -n "$USER_ID" ] && [ "$USER_ID" != "null" ] || { bad "用户 $USER_EMAIL 不存在（先跑 poc-v1-v5.sh）"; exit 1; }
CODE=$(api POST "/organizations/$ORG_ID/users" "{\"userIds\":[\"$USER_ID\"]}")
code_is_2xx "$CODE" && info "用户已在 $ORG_A（HTTP $CODE）" || bad "入组失败"

# ── 0.2 测试应用（SPA public client，先查后建）────────────────
APP_NAME="poc-spa-app"
api GET "/applications" >/dev/null
APP_ID=$(jq -r ".[] | select(.name==\"$APP_NAME\") | .id" < "$BODY_FILE" | head -1)
if [ -z "$APP_ID" ] || [ "$APP_ID" = "null" ]; then
  CODE=$(api POST "/applications" "{\"name\":\"$APP_NAME\",\"description\":\"POC org-token test\",\"type\":\"SPA\",\"oidcClientMetadata\":{\"redirectUris\":[\"http://localhost:9999/callback\"],\"postLogoutRedirectUris\":[]}}")
  APP_ID=$(jq -r '.id' < "$BODY_FILE")
  info "创建测试应用 $APP_NAME: $APP_ID"
fi
ok "测试应用就绪: $APP_ID"

# ── 1. 完整 OIDC 授权码流程（V3）───────────────────────────────
rm -f "$JAR"
VERIFIER=$(head -c 48 /dev/urandom | base64 | tr '+/' '-_' | tr -d '=/')
CHALLENGE=$(printf '%s' "$VERIFIER" | openssl dgst -sha256 -binary | base64 | tr '+/' '-_' | tr -d '=')
AUTHZ_URL="$CORE/oidc/auth?client_id=$APP_ID&redirect_uri=http%3A%2F%2Flocalhost%3A9999%2Fcallback&response_type=code&scope=openid%20offline_access%20urn%3Alogto%3Ascope%3Aorganizations&resource=urn%3Alogto%3Aresource%3Aorganizations&state=v24&code_challenge=$CHALLENGE&code_challenge_method=S256&prompt=consent"

curl -s -L -c "$JAR" -b "$JAR" -o /dev/null "$AUTHZ_URL"
curl -s -c "$JAR" -b "$JAR" -o /dev/null -X PUT "$CORE/api/interaction" \
  -H "Content-Type: application/json" \
  -d "{\"event\":\"SignIn\",\"identifier\":{\"username\":\"alice\",\"password\":\"$USER_PASSWORD\"}}"
R1=$(curl -s -c "$JAR" -b "$JAR" -X POST "$CORE/api/interaction/submit" | jq -r '.redirectTo // empty')
[ -n "$R1" ] || { bad "interaction submit 失败"; exit 1; }
LOC=$(curl -s -D - -o /dev/null -c "$JAR" -b "$JAR" "$R1" | grep -i '^location' | sed 's/^[Ll]ocation: //' | tr -d '\r')
if [[ "$LOC" == /consent* ]]; then
  R2=$(curl -s -c "$JAR" -b "$JAR" -X POST "$CORE/api/interaction/consent" -H "Content-Type: application/json" -d '{}' | jq -r '.redirectTo // empty')
  LOC=$(curl -s -D - -o /dev/null -c "$JAR" -b "$JAR" "$R2" | grep -i '^location' | sed 's/^[Ll]ocation: //' | tr -d '\r')
fi
CODE=$(echo "$LOC" | grep -oP 'code=\K[^&]*')
[ -n "$CODE" ] && ok "V3: 授权码流程完成（登录→consent→code）" || { bad "V3: 未获得授权码"; exit 1; }

RESP=$(curl -s -X POST "$CORE/oidc/token" -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=$CODE&redirect_uri=http%3A%2F%2Flocalhost%3A9999%2Fcallback&client_id=$APP_ID&code_verifier=$VERIFIER")
RT=$(echo "$RESP" | jq -r '.refresh_token // empty')
ID_SUB=$(echo "$RESP" | jq -r '.id_token // empty' | cut -d. -f2 | tr '_-' '/+' | base64 -d 2>/dev/null | jq -r '.sub // empty')
[ -n "$RT" ] && ok "V3: code→token 交换（含 refresh_token，prompt=consent 生效）" || bad "V3: 无 refresh_token（offline_access 未授予）"
[ "$ID_SUB" = "$USER_ID" ] && ok "V3: id_token sub = $USER_ID（身份正确）" || bad "V3: id_token sub 异常: $ID_SUB"

# ── 2. V2-A: 成员获取组织 Token ────────────────────────────────
RESP=$(curl -s -w "\n%{http_code}" -X POST "$CORE/oidc/token" -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=$RT&client_id=$APP_ID&organization_id=$ORG_ID&scope=urn:logto:scope:organizations")
HTTP=$(echo "$RESP" | tail -1); BODY=$(echo "$RESP" | head -n -1)
RT=$(echo "$BODY" | jq -r '.refresh_token // empty'); [ -z "$RT" ] && RT="DEAD"
ORG_TOKEN=$(echo "$BODY" | jq -r '.access_token // empty')
ORG_AUD=$(echo "$ORG_TOKEN" | cut -d. -f2 | tr '_-' '/+' | base64 -d 2>/dev/null | jq -r '.aud // empty')
[ "$HTTP" = "200" ] && ok "V2-A: 成员获取组织 Token（HTTP 200）" || bad "V2-A: HTTP $HTTP"
[ "$ORG_AUD" = "urn:logto:organization:$ORG_ID" ] && ok "V2-A: aud = $ORG_AUD（组织作用域正确）" || bad "V2-A: aud 异常: $ORG_AUD"

# ── 3. V2-B: 移出组织后再试（载荷假设测试）────────────────────
CODE=$(api DELETE "/organizations/$ORG_ID/users/$USER_ID")
code_is_2xx "$CODE" && info "用户已移出 $ORG_A" || bad "移出失败 HTTP $CODE"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$CORE/oidc/token" -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=$RT&client_id=$APP_ID&organization_id=$ORG_ID&scope=urn:logto:scope:organizations")
HTTP=$(echo "$RESP" | tail -1); BODY=$(echo "$RESP" | head -n -1)
ERR_DESC=$(echo "$BODY" | jq -r '.error_description // .message // empty' | head -c 80)
[ "$HTTP" = "403" ] && ok "V2-B ★: 非成员被拒（HTTP 403: $ERR_DESC）" || bad "V2-B: 期望 403 实得 HTTP $HTTP: $ERR_DESC"
RT2=$(echo "$BODY" | jq -r '.refresh_token // empty'); [ -n "$RT2" ] && RT="$RT2"

# ── 3.1 诊断: 纯 refresh（无 org）应仍成功（证明 403 源于组织检查）────
RESP=$(curl -s -w "\n%{http_code}" -X POST "$CORE/oidc/token" -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=$RT&client_id=$APP_ID")
HTTP=$(echo "$RESP" | tail -1); BODY=$(echo "$RESP" | head -n -1)
RT=$(echo "$BODY" | jq -r '.refresh_token // empty'); [ -z "$RT" ] && RT="DEAD"
[ "$HTTP" = "200" ] && ok "V2-诊断: 同 RT 纯 refresh 成功（RT 有效，403 确系组织成员检查）" || bad "V2-诊断: 纯 refresh 也失败 HTTP $HTTP"

# ── 4. V2-C: 恢复成员后复测 ───────────────────────────────────
CODE=$(api POST "/organizations/$ORG_ID/users" "{\"userIds\":[\"$USER_ID\"]}")
code_is_2xx "$CODE" && info "用户已重新入组" || bad "恢复入组失败"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$CORE/oidc/token" -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=$RT&client_id=$APP_ID&organization_id=$ORG_ID&scope=urn:logto:scope:organizations")
HTTP=$(echo "$RESP" | tail -1)
[ "$HTTP" = "200" ] && ok "V2-C: 恢复成员后组织 Token 恢复签发" || bad "V2-C: HTTP $HTTP"

# ── 5. V4: SSO 会话共享（同 jar 新授权请求，免登录）────────────
VERIFIER2=$(head -c 48 /dev/urandom | base64 | tr '+/' '-_' | tr -d '=/')
CHALLENGE2=$(printf '%s' "$VERIFIER2" | openssl dgst -sha256 -binary | base64 | tr '+/' '-_' | tr -d '=')
FINAL=$(curl -s -L -c "$JAR" -b "$JAR" -o /dev/null -w "%{url_effective}" \
  "$CORE/oidc/auth?client_id=$APP_ID&redirect_uri=http%3A%2F%2Flocalhost%3A9999%2Fcallback&response_type=code&scope=openid%20offline_access%20urn%3Alogto%3Ascope%3Aorganizations&resource=urn%3Alogto%3Aresource%3Aorganizations&state=v24-sso&code_challenge=$CHALLENGE2&code_challenge_method=S256&prompt=consent")
if echo "$FINAL" | grep -q "code="; then
  ok "V4 ★: 已有会话 → 新授权直接回调拿 code（零重新登录 = SSO 会话共享）"
else
  bad "V4: 落点非回调: $FINAL"
fi

# ── 汇总 ────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════"
echo " 结果: PASS=$PASS  FAIL=$FAIL"
echo " 应用: $APP_ID | 组织: $ORG_ID | 用户: $USER_ID"
echo "════════════════════════════════════════════"
[ "$FAIL" = "0" ]
