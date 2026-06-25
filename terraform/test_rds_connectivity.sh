#!/usr/bin/env bash
# RDS接続セキュリティ確認スクリプト
# 目的: EC2からのみ接続可能で、外部（ローカル）から接続できないことを確認する
#
# 使い方:
#   ./test_rds_connectivity.sh <EC2_IP> <RDS_HOST> <DB_PASSWORD> <KEY_FILE>
#
# 例:
#   ./test_rds_connectivity.sh 54.123.4.5 inquiry-db.xxxx.ap-northeast-1.rds.amazonaws.com MyP@ssw0rd ~/.ssh/inquiry-key.pem

set -euo pipefail

# ─── 引数チェック ────────────────────────────────────────────────
EC2_IP="${1:-}"
RDS_HOST="${2:-}"
DB_PASSWORD="${3:-}"
KEY_FILE="${4:-~/.ssh/inquiry-key.pem}"

DB_PORT=3306
DB_USER="admin"
DB_NAME="inquiry_db"
TIMEOUT=5  # 接続タイムアウト秒数

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

ok()   { echo -e "${GREEN}  [PASS]${NC} $*"; }
fail() { echo -e "${RED}  [FAIL]${NC} $*"; }
info() { echo -e "${CYAN}  [INFO]${NC} $*"; }
warn() { echo -e "${YELLOW}  [WARN]${NC} $*"; }

if [[ -z "$EC2_IP" || -z "$RDS_HOST" || -z "$DB_PASSWORD" ]]; then
  echo "使い方: $0 <EC2_IP> <RDS_HOST> <DB_PASSWORD> [KEY_FILE]"
  echo "  terraform output で EC2_IP と RDS_HOST を確認できます"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  RDS 接続セキュリティ確認テスト"
echo "  EC2 IP  : $EC2_IP"
echo "  RDS Host: $RDS_HOST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PASS=0
FAIL=0

# ─────────────────────────────────────────────────────────────────
# テスト1: ローカル → RDS への直接 TCP 接続（拒否されるべき）
# ─────────────────────────────────────────────────────────────────
echo ""
echo "【テスト1】ローカルマシン → RDS への直接接続（拒否されること）"
info "nc -zv $RDS_HOST $DB_PORT -w $TIMEOUT"

if nc -zv "$RDS_HOST" "$DB_PORT" -w "$TIMEOUT" 2>/dev/null; then
  fail "接続が成功してしまいました → RDSが外部に公開されています！設定を見直してください"
  FAIL=$((FAIL + 1))
else
  ok "接続拒否 / タイムアウト → ローカルからの直接接続は不可 (期待通り)"
  PASS=$((PASS + 1))
fi

# ─────────────────────────────────────────────────────────────────
# テスト2: ローカル → RDS への MySQL クライアント接続（拒否されるべき）
# ─────────────────────────────────────────────────────────────────
echo ""
echo "【テスト2】ローカルマシン → RDS への MySQL 接続（拒否されること）"

if command -v mysql &>/dev/null; then
  info "mysql -h $RDS_HOST -P $DB_PORT -u $DB_USER --connect-timeout=$TIMEOUT"
  if mysql -h "$RDS_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
       --connect-timeout="$TIMEOUT" -e "SELECT 1;" "$DB_NAME" &>/dev/null; then
    fail "MySQL接続が成功してしまいました → 外部アクセスが許可されています！"
    FAIL=$((FAIL + 1))
  else
    ok "MySQL接続拒否 → ローカルからの直接接続は不可 (期待通り)"
    PASS=$((PASS + 1))
  fi
else
  warn "mysqlコマンドが見つかりません。テスト2をスキップします（テスト1で確認済み）"
fi

# ─────────────────────────────────────────────────────────────────
# テスト3: EC2 → RDS への TCP 接続（成功するべき）
# SSHトンネル経由でEC2上で nc を実行して確認
# ─────────────────────────────────────────────────────────────────
echo ""
echo "【テスト3】EC2 → RDS への TCP 接続（成功すること）"

if [[ ! -f "$KEY_FILE" ]]; then
  warn "秘密鍵ファイルが見つかりません: $KEY_FILE"
  warn "テスト3をスキップします"
else
  info "EC2 (ec2-user@$EC2_IP) 上で nc -zv $RDS_HOST $DB_PORT を実行"
  SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes -i $KEY_FILE"

  if ssh $SSH_OPTS "ec2-user@$EC2_IP" \
       "nc -zv $RDS_HOST $DB_PORT -w $TIMEOUT" 2>/dev/null; then
    ok "EC2 → RDS TCP接続 成功 (期待通り)"
    PASS=$((PASS + 1))
  else
    fail "EC2 → RDS TCP接続 失敗 → EC2のSGまたはRDSのSGを確認してください"
    FAIL=$((FAIL + 1))
  fi
fi

# ─────────────────────────────────────────────────────────────────
# テスト4: EC2 → RDS への MySQL 接続（成功するべき）
# ─────────────────────────────────────────────────────────────────
echo ""
echo "【テスト4】EC2 → RDS への MySQL 接続（成功すること）"

if [[ ! -f "$KEY_FILE" ]]; then
  warn "秘密鍵ファイルが見つかりません: $KEY_FILE"
  warn "テスト4をスキップします"
else
  info "EC2上で mysql クライアントを使って接続確認"
  SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes -i $KEY_FILE"

  # EC2にmysqlクライアントがなければインストール確認
  HAS_MYSQL=$(ssh $SSH_OPTS "ec2-user@$EC2_IP" "command -v mysql &>/dev/null && echo yes || echo no" 2>/dev/null || echo "no")

  if [[ "$HAS_MYSQL" == "yes" ]]; then
    MYSQL_CMD="mysql -h $RDS_HOST -P $DB_PORT -u $DB_USER -p'$DB_PASSWORD' --connect-timeout=$TIMEOUT -e 'SELECT 1 AS connection_test;' $DB_NAME"
    if ssh $SSH_OPTS "ec2-user@$EC2_IP" "$MYSQL_CMD" 2>/dev/null | grep -q "1"; then
      ok "EC2 → RDS MySQL接続 成功 (期待通り)"
      PASS=$((PASS + 1))
    else
      fail "EC2 → RDS MySQL接続 失敗 → 認証情報またはDB名を確認してください"
      FAIL=$((FAIL + 1))
    fi
  else
    # mysqlクライアントなしの場合はbashで/dev/tcpを使ったポート疎通確認
    info "EC2にmysqlクライアントが未インストール。/dev/tcp でポート確認します"
    PORT_CHECK="(echo > /dev/tcp/$RDS_HOST/$DB_PORT) &>/dev/null && echo open || echo closed"
    RESULT=$(ssh $SSH_OPTS "ec2-user@$EC2_IP" "bash -c '$PORT_CHECK'" 2>/dev/null || echo "error")
    if [[ "$RESULT" == "open" ]]; then
      ok "EC2 → RDS ポート3306 到達可能 (期待通り)"
      PASS=$((PASS + 1))
    else
      fail "EC2 → RDS ポート3306 到達不能 (結果: $RESULT)"
      FAIL=$((FAIL + 1))
    fi
  fi
fi

# ─────────────────────────────────────────────────────────────────
# テスト5: RDS の publicly_accessible 設定の確認
# ─────────────────────────────────────────────────────────────────
echo ""
echo "【テスト5】Terraform state で publicly_accessible = false を確認"

if command -v terraform &>/dev/null; then
  cd "$(dirname "$0")"
  PUBLICLY=$(terraform show -json 2>/dev/null \
    | python3 -c "import sys,json; vals=json.load(sys.stdin).get('values',{}).get('root_module',{}).get('resources',[]); rds=[r for r in vals if r.get('type')=='aws_db_instance']; print(rds[0]['values']['publicly_accessible'] if rds else 'not_found')" 2>/dev/null || echo "parse_error")

  if [[ "$PUBLICLY" == "False" || "$PUBLICLY" == "false" ]]; then
    ok "publicly_accessible = false 確認 → パブリックアクセス無効 (期待通り)"
    PASS=$((PASS + 1))
  elif [[ "$PUBLICLY" == "not_found" || "$PUBLICLY" == "parse_error" ]]; then
    warn "terraform show から値を取得できませんでした（未applyの可能性）"
  else
    fail "publicly_accessible = $PUBLICLY → パブリックアクセスが有効になっています！"
    FAIL=$((FAIL + 1))
  fi
else
  warn "terraform コマンドが見つかりません。テスト5をスキップします"
fi

# ─────────────────────────────────────────────────────────────────
# 結果サマリ
# ─────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  テスト結果サマリ"
echo "  PASS: $PASS  /  FAIL: $FAIL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ $FAIL -eq 0 ]]; then
  echo -e "${GREEN}  全テスト合格 → RDSはEC2からのみ接続可能な状態です${NC}"
  exit 0
else
  echo -e "${RED}  $FAIL 件のテストが失敗 → セキュリティ設定を確認してください${NC}"
  exit 1
fi
