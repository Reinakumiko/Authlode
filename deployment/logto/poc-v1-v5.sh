#!/usr/bin/env bash
# ============================================================================
# POC V1+V5 — Management API 全链路验证（Authlode 批次 0）
#
# V1: 建组织 → 建用户(带密码) → 入组 → 建 org 角色 → 授予 → 多归属查询
# V5: 幂等性 — 重跑不重复建号/重复授权（先查后建模式，即未来 LogtoAdapter 的实现模式）
#
# 用法: ./poc-v1-v5.sh   （可重复执行；第二次运行为 V5 幂等性证据）
# 前置: docker compose up -d（Logto 已运行）
# ============================================================================
set -uo pipefail

DB_CONTAINER="logto-logto-db-1"
ADMIN_OIDC="http://localhost:3002/oidc/token"
API="http://localhost:3003/api"
RESOURCE="https://default.logto.app/api"
BODY_FILE=/tmp/opencode/poc-body

ORG_A="Acme"; ORG_B="Beta"
USER_EMAIL="alice@authlode.dev"
USER_NAME="Alice"
USER_PASSWORD="P0c-Authlode-2026!"
ROLE_NAME="tenant-admin"

PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  ✅ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  ❌ $1"; }
info() { echo "  ℹ️  $1" >&2; }
code_is_2xx() { [[ "$1" =~ ^2 ]]; }

# ── 0. M2M token（admin 租户端点 + m-default 内置应用）────────────────────
SECRET=$(docker exec "$DB_CONTAINER" psql -U logto -d logto -t -A -c \
  "SELECT secret FROM applications WHERE id='m-default';")
TOKEN=$(curl -s -X POST "$ADMIN_OIDC" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=m-default&client_secret=${SECRET}&resource=${RESOURCE}&scope=all" \
  | jq -r '.access_token // empty')
if [ -n "$TOKEN" ]; then ok "M2M token 获取（m-default @ admin 租户 OIDC）"; else bad "token 获取失败"; exit 1; fi

# api METHOD PATH [JSON_BODY] → stdout 输出 HTTP 状态码；响应体写入 $BODY_FILE
api() {
  local method=$1 path=$2 body=${3:-}
  if [ -n "$body" ]; then
    curl -s -o "$BODY_FILE" -w "%{http_code}" -X "$method" "$API$path" \
      -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$body"
  else
    curl -s -o "$BODY_FILE" -w "%{http_code}" -X "$method" "$API$path" \
      -H "Authorization: Bearer $TOKEN"
  fi
}

echo ""
echo "── V1: Management API 全链路 ─────────────────────────────────"

# ── V1.1 组织（先查后建）────────────────────────────────────────
ensure_org() { # → stdout: org id
  local name=$1 desc=$2 id
  api GET "/organizations" >/dev/null
  id=$(jq -r ".[] | select(.name==\"$name\") | .id" < "$BODY_FILE" | head -1)
  if [ -n "$id" ] && [ "$id" != "null" ]; then
    info "组织 $name 已存在（复用: $id）"
    echo "$id"; return
  fi
  local code
  code=$(api POST "/organizations" "{\"name\":\"$name\",\"description\":\"$desc\"}")
  if code_is_2xx "$code"; then
    ok "创建组织 $name"
    jq -r '.id' < "$BODY_FILE"
  else
    bad "创建组织 $name 失败 HTTP $code: $(head -c 150 "$BODY_FILE")"
  fi
}
ORG_A_ID=$(ensure_org "$ORG_A" "POC tenant A")
ORG_B_ID=$(ensure_org "$ORG_B" "POC tenant B")
if [ -n "$ORG_A_ID" ] && [ -n "$ORG_B_ID" ]; then ok "两个组织就绪"; else bad "组织未就绪"; fi

# ── V1.2 用户（先查后建，带初始密码）────────────────────────────
api GET "/users?search=$USER_EMAIL" >/dev/null
USER_ID=$(jq -r ".[] | select(.primaryEmail==\"$USER_EMAIL\") | .id" < "$BODY_FILE" | head -1)
if [ -n "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
  info "用户 $USER_EMAIL 已存在（复用: $USER_ID）— 先查后建生效"
else
  CODE=$(api POST "/users" "{\"primaryEmail\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\",\"name\":\"$USER_NAME\"}")
  if code_is_2xx "$CODE"; then
    ok "创建用户（含初始密码）$USER_EMAIL"
    USER_ID=$(jq -r '.id' < "$BODY_FILE")
  else
    bad "创建用户失败 HTTP $CODE: $(head -c 200 "$BODY_FILE")"
  fi
fi
[ -n "$USER_ID" ] || { echo "无法继续：用户缺失" >&2; exit 1; }

# ── V1.3 入组（Logto 原生幂等）──────────────────────────────────
CODE=$(api POST "/organizations/$ORG_A_ID/users" "{\"userIds\":[\"$USER_ID\"]}")
code_is_2xx "$CODE" && ok "用户加入 $ORG_A（HTTP $CODE）" || bad "入组失败 HTTP $CODE: $(head -c 150 "$BODY_FILE")"

# ── V1.4 org 角色（模板级，先查后建）────────────────────────────
api GET "/organization-roles" >/dev/null
ROLE_ID=$(jq -r ".[] | select(.name==\"$ROLE_NAME\") | .id" < "$BODY_FILE" | head -1)
if [ -n "$ROLE_ID" ] && [ "$ROLE_ID" != "null" ]; then
  info "org 角色 $ROLE_NAME 已存在（复用: $ROLE_ID）"
else
  CODE=$(api POST "/organization-roles" "{\"name\":\"$ROLE_NAME\",\"description\":\"Authlode 租户管理员\"}")
  if code_is_2xx "$CODE"; then
    ok "创建 org 角色 $ROLE_NAME"
    ROLE_ID=$(jq -r '.id' < "$BODY_FILE")
  else
    bad "创建 org 角色失败 HTTP $CODE: $(head -c 150 "$BODY_FILE")"
  fi
fi

# ── V1.5 授予角色（先查后授）────────────────────────────────────
api GET "/organizations/$ORG_A_ID/users/$USER_ID/roles" >/dev/null
ASSIGNED=$(jq -r ".[] | select(.id==\"$ROLE_ID\") | .id" < "$BODY_FILE")
if [ -n "$ASSIGNED" ] && [ "$ASSIGNED" != "null" ]; then
  info "角色已授予（复用）"
else
  CODE=$(api POST "/organizations/$ORG_A_ID/users/$USER_ID/roles" "{\"organizationRoleIds\":[\"$ROLE_ID\"]}")
  code_is_2xx "$CODE" && ok "授予 org 角色（$ORG_A 内）" || bad "授角色失败 HTTP $CODE: $(head -c 150 "$BODY_FILE")"
fi

# ── V1.6 多归属（加入第二个组织 + 查询用户组织列表）──────────────
CODE=$(api POST "/organizations/$ORG_B_ID/users" "{\"userIds\":[\"$USER_ID\"]}")
code_is_2xx "$CODE" && ok "用户加入 $ORG_B（多归属）" || bad "二次入组失败 HTTP $CODE"

api GET "/users/$USER_ID/organizations" >/dev/null
ORG_COUNT=$(jq 'length' < "$BODY_FILE")
ROLE_IN_A=$(jq -r ".[] | select(.id==\"$ORG_A_ID\") | .organizationRoles | map(.name) | join(\",\")" < "$BODY_FILE")
[ "${ORG_COUNT:-0}" -ge 2 ] 2>/dev/null && ok "多归属查询：用户属于 $ORG_COUNT 个组织" || bad "多归属查询异常：$ORG_COUNT"
[ -n "$ROLE_IN_A" ] && [ "$ROLE_IN_A" != "null" ] && ok "组织内角色可见：$ORG_A → [$ROLE_IN_A]" || bad "组织内角色不可见"

echo ""
echo "── V5: 幂等性验证（重跑证据）─────────────────────────────────"

# ── V5.1 重复建号应被拒绝 ───────────────────────────────────────
CODE=$(api POST "/users" "{\"primaryEmail\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}")
[ "$CODE" = "422" ] && ok "重复 email 建号被拒绝（HTTP 422）→ 先查后建是必需模式" \
  || info "重复建号返回 HTTP $CODE（记录行为）: $(head -c 120 "$BODY_FILE")"

# ── V5.2 重复入组幂等 ──────────────────────────────────────────
CODE=$(api POST "/organizations/$ORG_A_ID/users" "{\"userIds\":[\"$USER_ID\"]}")
code_is_2xx "$CODE" && ok "重复入组幂等（HTTP $CODE，无重复成员）" || bad "重复入组异常 HTTP $CODE"

# ── V5.3 重复授权幂等（原生行为记录）───────────────────────────
CODE=$(api POST "/organizations/$ORG_A_ID/users/$USER_ID/roles" "{\"organizationRoleIds\":[\"$ROLE_ID\"]}")
code_is_2xx "$CODE" && ok "重复授权幂等（HTTP $CODE）" \
  || info "重复授权返回 HTTP $CODE（Adapter 需先查后授）: $(head -c 120 "$BODY_FILE")"

# ── V5.4 全局一致性：同 email 用户数 = 1 ────────────────────────
api GET "/users?search=$USER_EMAIL" >/dev/null
DUP_COUNT=$(jq "[.[] | select(.primaryEmail==\"$USER_EMAIL\")] | length" < "$BODY_FILE")
[ "$DUP_COUNT" = "1" ] && ok "同 email 用户数 = 1（无重复账号）" || bad "同 email 用户数 = $DUP_COUNT"

# ── 汇总 ────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════"
echo " 结果: PASS=$PASS  FAIL=$FAIL"
echo " 用户: $USER_ID ($USER_EMAIL)"
echo " 组织: $ORG_A_ID ($ORG_A) / $ORG_B_ID ($ORG_B)"
echo " 角色: $ROLE_ID ($ROLE_NAME)"
echo "════════════════════════════════════════════"
[ "$FAIL" = "0" ]
