# Workout Tracker

筋トレ・食事・体重を1つで管理する個人用PWA。
要件定義は [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) を参照。

## 技術スタック
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **DB**: PostgreSQL (Railway)
- **ORM**: Drizzle ORM
- **認証**: Auth.js v5 (NextAuth) + Google OAuth
- **状態管理**: React Query
- **グラフ**: Recharts
- **Push通知**: web-push (VAPID)
- **ホスティング**: Vercel (フロント + Cron)

## アーキテクチャ
```
[PWA (Next.js / Vercel)] 
        │ fetch (/api/*)
        ▼
[Next.js API Routes]
        │ Drizzle ORM
        ▼
[Railway PostgreSQL]
```

---

## セットアップ手順

### 1. 依存関係のインストール
```bash
cd C:\Users\YutoM\workout-tracker
npm install
```

### 2. Railway PostgreSQLを準備
1. https://railway.com にアクセス (GitHub認証で1分)
2. New Project → **Provision PostgreSQL** を選択
3. 作成後、PostgreSQLサービス → **Variables** タブを開く
4. `DATABASE_URL` をコピー (postgres://...形式)

> 料金: Railwayは$5/月のクレジット制(従量課金)。個人利用なら$3-5/月程度。

### 3. Google OAuth クライアントを作成
1. https://console.cloud.google.com/apis/credentials を開く
2. プロジェクト作成 → 「OAuth 同意画面」設定 (External、自分のメールだけ追加でOK)
3. 「認証情報を作成」 → 「OAuth クライアント ID」
4. アプリ種別: ウェブアプリケーション
5. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-vercel-url>/api/auth/callback/google` (本番URLが決まったら追加)
6. クライアントID / シークレットをコピー

### 4. VAPID鍵 + AUTH_SECRET + CRON_SECRETを生成
```bash
# VAPID
npm run generate:vapid

# AUTH_SECRET と CRON_SECRET (各々)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. .env.localを作成
`.env.example` をコピーして値を埋める:
```bash
cp .env.example .env.local
```

埋める項目:
- `DATABASE_URL` ← Railway PostgreSQL
- `AUTH_SECRET` ← 上で生成
- `AUTH_URL` ← `http://localhost:3000` (本番は `https://<your-app>.vercel.app`)
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` ← Google Cloud
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` ← `generate:vapid`
- `CRON_SECRET` ← 上で生成

### 6. DB スキーマを適用 + シード投入
```bash
# Drizzleでスキーマをpush (テーブル作成)
npm run db:push

# 種目40件+食品60件を投入
npm run db:seed
```

### 7. アイコンを配置
`public/icons/` に以下の2ファイル:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

簡単に済ませるなら https://realfavicongenerator.net/

### 8. 開発サーバー起動
```bash
npm run dev
```
http://localhost:3000 を開く → Googleでログイン → オンボーディング → ダッシュボード

---

## デプロイ手順 (Vercel + Railway)

### 構成図
```
GitHub Repo
    │ push
    ▼
Vercel (Next.js + Cron) ──┐
                          │ DATABASE_URL
                          ▼
                      Railway (PostgreSQL)
```

### 1. GitHubにプッシュ
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create workout-tracker --private --source=. --push
```

### 2. Vercelにインポート
1. https://vercel.com → Add New → Project → GitHubリポジトリ選択
2. **Environment Variables** に `.env.local` の中身を全て登録
3. **重要**: `AUTH_URL` は本番URL (`https://<your-app>.vercel.app`) に変更
4. Deploy

### 3. Google OAuthのリダイレクトURI追加
本番URLが確定したら、Google Cloud Console の OAuth設定に追加:
- `https://<your-app>.vercel.app/api/auth/callback/google`

### 4. Vercel Cron確認
`vercel.json` により毎時実行される Cron が自動登録される。
通知が届かない場合は Vercelダッシュボード → Settings → Cron Jobs を確認。

---

## スマホへのインストール (PWA)

### iPhone (Safari)
1. 本番URLを Safari で開く
2. Googleでログイン → オンボーディング完了
3. 共有ボタン → 「ホーム画面に追加」
4. 設定画面で「通知を有効にする」(iOS 16.4+のPWAでのみPush動作)

### Android (Chrome)
1. 本番URLを開くと「インストール」バナー表示
2. タップしてホーム画面に追加
3. 通知は同様に設定画面から有効化

---

## 主要コマンド

| コマンド | 動作 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run db:push` | スキーマをDBに反映 (開発用) |
| `npm run db:generate` | マイグレーション生成 |
| `npm run db:migrate` | マイグレーション適用 (本番用) |
| `npm run db:studio` | Drizzle Studio (DB GUI) |
| `npm run db:seed` | 種目40件 + 食品60件 投入 |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run generate:vapid` | VAPID鍵生成 |

---

## 主要画面

| パス | 説明 |
|---|---|
| `/login` | Googleログイン |
| `/onboarding` | 初回プロフィール入力 + 目標kcal自動計算 |
| `/` | ダッシュボード (体重・kcalリング・PFC・本日トレ) |
| `/weight` | 体重入力 + 90日推移グラフ |
| `/food` | 食事入力 (朝/昼/夜/間食タブ + 検索/お気に入り) |
| `/workout` | ワークアウト一覧 + 新規開始 |
| `/workout/[id]` | セット記録 + 休憩タイマー + e1RM表示 |
| `/calendar` | 月間カレンダー (部位/kcal/体重) |
| `/stats` | 体重・1RM・週ボリュームグラフ |
| `/settings` | プロフィール・目標・通知設定 |

## API一覧

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/me` | GET / PATCH | プロフィール |
| `/api/dashboard?date=YYYY-MM-DD` | GET | ダッシュボード集計 |
| `/api/weight` | GET / POST / DELETE | 体重 |
| `/api/foods?q=keyword` | GET | 食品検索 |
| `/api/meals?date=YYYY-MM-DD` | GET / POST / DELETE | 食事ログ |
| `/api/favorites` | GET / POST | お気に入り食品 |
| `/api/exercises` | GET | 種目一覧 |
| `/api/workouts` | GET / POST | ワークアウト |
| `/api/workouts/[id]` | GET / PATCH / DELETE | 個別ワークアウト |
| `/api/workouts/[id]/sets` | POST | セット追加 |
| `/api/workout-sets/[id]` | DELETE | セット削除 |
| `/api/calendar?start&end` | GET | カレンダー集計 |
| `/api/stats` | GET | 統計 |
| `/api/notifications/subscribe` | POST / DELETE | Push購読登録 |
| `/api/notifications/test` | POST | テスト通知 |
| `/api/tdee/recalc` | POST | 適応TDEE再計算 |
| `/api/cron/reminders` | GET (Cron専用) | 定期通知配信 |

## 通知ロジック (Cron: 毎時実行)

| 時刻 | トリガー | 通知 |
|---|---|---|
| ユーザー設定時刻 (デフォルト 07:00) | 今日の体重未記録 | 体重リマインド |
| ユーザー設定時刻 (デフォルト 12:00, 19:00) | 常時 | 食事リマインド |
| 20:00 | 体重3日未記録 | 連続記録アラート |
| 22:00 | kcal達成率 < 70% | 不足アラート |
| 08:00 | 前回TDEE計算から14日経過 | 再計算案内 |

---

## トラブルシュート

### `npm run db:push` でエラー
- `DATABASE_URL` がローカルから到達可能か確認
- Railwayの場合、PostgreSQLサービスの「Settings → Networking → Public Networking」をON

### Googleログインでリダイレクトエラー
- Google Cloud Console の Authorized redirect URI に `{AUTH_URL}/api/auth/callback/google` が登録されているか確認

### Push通知が届かない
- iOSは Safari でホーム画面追加後のみ動作 (16.4+)
- VAPID鍵が `.env.local` と Vercelの環境変数の両方に登録されているか確認

### Vercel Cronが動かない
- Vercelの無料プランは1日2回まで。`vercel.json` の schedule を1日2回程度に絞るか、Proプランへ
- 代替: Railwayで Node.jsプロセスを動かして cron-job を実行

---

## ライセンス
個人利用専用
