# 筋トレ管理アプリ 要件定義書

**Version**: 1.0
**作成日**: 2026-06-07
**Owner**: 松井優人
**プロジェクト名**: workout-tracker (仮称)

---

## 1. プロジェクト概要

### 1.1 目的
個人の筋肥大増量フェーズを「トレーニング・食事・体重」の3軸で記録・可視化し、目標体重達成までの行動を最適化する。

### 1.2 ゴール
- **主目標**: 体重 62.5kg → 70.0kg を 4ヶ月で達成 (+7.5kg / 4ヶ月)
- **副目標**:
  - 主要種目(ベンチ/スクワット/デッドリフト)の漸進性過負荷を可視化
  - 摂取カロリー・PFCの日次達成率を80%以上維持
  - 体重の週次トレンドを把握し、停滞時にカロリーを自動調整

### 1.3 利用者
- **想定ユーザー数**: 1名 (個人専用)
- **利用デバイス**: スマートフォン (iOS/Android) メイン、PCサブ
- **利用シーン**:
  - 朝: 起床直後に体重入力
  - 食事の都度: 食品検索→分量入力
  - ジム: ワークアウト中にリアルタイム入力
  - 夜: 1日のサマリー確認

### 1.4 非ゴール
- 他ユーザーとのシェア機能、SNS連携
- パーソナルトレーナーや栄養士のレコメンド機能
- 有料化・課金導線

---

## 2. 機能要件

### 2.1 機能一覧 (優先度別)

#### MVP (Phase 1: 1〜2週目)
| ID | 機能名 | 説明 |
|---|---|---|
| F-01 | ユーザー認証 | Auth.js v5 + Google OAuth |
| F-02 | プロフィール設定 | 身長・生年月日・性別・活動レベル・目標体重・目標日 |
| F-03 | 体重ログ | 日次の体重・体脂肪率・メモを記録 |
| F-04 | 食事ログ | 食品を検索し量を入力、kcal/PFC自動計算 |
| F-05 | ワークアウトログ | 種目/セット/レップ/重量/RPEを記録 |
| F-06 | ダッシュボード | 今日のkcal進捗、PFC、体重推移、本日のトレ |
| F-07 | 食品マスター | 日本食品標準成分表からの初期データ |
| F-08 | 種目マスター | 主要40種目を初期データ |

#### Phase 2 (3〜4週目)
| ID | 機能名 | 説明 |
|---|---|---|
| F-09 | カレンダービュー | 月表示、日別にトレ部位/kcal/体重を表示 |
| F-10 | 適応TDEE | 2週間ごとに実測体重と摂取kcalから維持カロリーを再算出 |
| F-11 | プッシュ通知 | 体重リマインド・食事リマインド・トレ予定日通知 |
| F-12 | グラフ表示 | 体重推移、種目別1RM推定値推移、週ボリューム |
| F-13 | お気に入り食品 | 頻出食品をワンタップ追加 |
| F-14 | テンプレートトレ | ワークアウトテンプレート (Push/Pull/Legs等) |
| F-15 | 休憩タイマー | セット間のインターバル計測、通知 |
| F-16 | PWA化 | ホーム画面追加、オフライン表示 |

#### Phase 3 (将来)
| ID | 機能名 | 説明 |
|---|---|---|
| F-17 | バーコードスキャン | Open Food Facts API連携 |
| F-18 | HealthKit連携 | iPhone体重計データ自動取込 |
| F-19 | 食事写真AI推定 | Claude Vision APIで料理→食品推定 |
| F-20 | データエクスポート | CSV/JSON出力 |

### 2.2 詳細機能仕様

#### F-03 体重ログ
- **入力項目**: 日付(デフォルト本日)・体重kg(小数1位)・体脂肪率%(任意)・メモ
- **バリデーション**: 30 <= 体重 <= 200, 5 <= 体脂肪率 <= 50
- **表示**:
  - 直近30日の折れ線グラフ + 7日移動平均線
  - 目標達成までの予測線 (現在のペースから線形外挿)
  - 目標日までの残り日数と必要ペース
- **重複処理**: 同日に複数記録した場合は上書き(確認ダイアログあり)

#### F-04 食事ログ
- **入力フロー**:
  1. 食事区分を選択 (朝/昼/夜/間食)
  2. 「最近」「よく食べる」「検索」タブから食品選択
  3. 分量(g)を入力 → kcal/PFC自動表示
  4. 確定で日次合計に加算
- **食品検索**: 名前の部分一致(かな・カナ・漢字対応)、商品名(任意)
- **ワンタップ機能**: お気に入り食品はデフォルト分量で1タップ追加
- **写真添付**: 食事ログに任意で写真添付(Supabase Storage)

#### F-05 ワークアウトログ
- **構造**:
  - ワークアウト(セッション) → 複数の種目 → 複数のセット
- **入力項目** (セット単位): 種目・レップ数・重量kg・RPE(1-10)・アップセットフラグ
- **賢い入力**:
  - 「前回値」ボタンで前回同種目の最終セットを引用
  - 種目選択時に最近のセット履歴を表示
  - PR (Personal Record) 達成時はバッジ表示
- **1RM推定**: Epley式 `weight × (1 + reps/30)` (warmupは除外)
- **休憩タイマー**: セット記録後に自動カウントダウン(デフォルト90秒、種目ごとカスタム可)

#### F-06 ダッシュボード
- **カード構成** (上から):
  1. 今日の体重カード (前日比、7日移動平均)
  2. 今日のカロリーリング (摂取/目標、残りkcal)
  3. PFC内訳バー (P/F/C それぞれ目標との比率)
  4. 今日のワークアウト (実施済み or 予定)
  5. 体重推移ミニグラフ (直近14日)
  6. 週間ボリュームサマリー (部位別)

#### F-09 カレンダービュー
- **月表示**: 各日に最大3要素
  - 上段: トレ部位アイコン (胸/背/脚/休)
  - 中段: 摂取kcal達成度バッジ (色: 緑=±10%以内, 黄=10-20%乖離, 赤=20%以上)
  - 下段: 体重(kg)
- **日付タップ**: 日次詳細モーダル (食事/トレ/体重の一覧)
- **長押し**: クイックアクション (体重入力/食事追加)
- **切替**: 月/週/リスト切替タブ

#### F-10 適応TDEE
- **再計算トリガー**: 14日経過ごと、または手動再計算ボタン
- **計算式**:
```
過去14日の体重変化(kg) × 7700 / 14 = 日々のサープラス推定
新TDEE = 過去14日の平均摂取kcal - 上記サープラス推定
新目標kcal = 新TDEE + 480 (バルク用固定サープラス)
```
- **PFC再計算**:
  - P: 体重(kg) × 2.0g (固定)
  - F: 新目標kcalの25% ÷ 9
  - C: 残りkcal ÷ 4

#### F-11 プッシュ通知
詳細は [§5 通知設計](#5-通知設計) を参照。

### 2.3 画面一覧

| 画面ID | 画面名 | 主な機能 |
|---|---|---|
| S-01 | ログイン | メール/Google認証 |
| S-02 | 初回オンボーディング | プロフィール入力 → 目標kcal/PFC算出表示 |
| S-03 | ダッシュボード | F-06 |
| S-04 | 体重画面 | 入力フォーム + グラフ + 履歴 |
| S-05 | 食事画面 | 食事区分タブ + 食品検索 + 当日リスト |
| S-06 | ワークアウト一覧 | 過去ワークアウト + 新規開始 + テンプレ |
| S-07 | ワークアウト記録中 | セット入力 + タイマー |
| S-08 | カレンダー | F-09 |
| S-09 | 統計・グラフ | 体重・1RM・週ボリューム |
| S-10 | 設定 | プロフィール、通知設定、テーマ |

### 2.4 画面遷移
```
[S-01 Login] → [S-02 Onboarding] → [S-03 Dashboard]
                                       │
                                       ├── BottomNav ─→ [S-04 Weight]
                                       ├── BottomNav ─→ [S-05 Food]
                                       ├── BottomNav ─→ [S-06 Workout] → [S-07 Recording]
                                       ├── BottomNav ─→ [S-08 Calendar]
                                       └── Header ─→ [S-10 Settings]
```

---

## 3. 非機能要件

### 3.1 パフォーマンス
- 初回ロード: LCP <= 2.5s (3G想定)
- ページ遷移: <= 300ms
- 食品検索: <= 200ms (1万件想定)
- グラフ描画: <= 500ms

### 3.2 可用性
- 個人利用のため99%でOK
- メンテナンス時間制約なし
- Vercel + Supabase の無料枠で運用

### 3.3 セキュリティ
- 全API routeで `requireUser()` ヘルパーが Auth.js セッションを検証
- データアクセスは `where(user_id = session.user.id)` で本人に絞る (アプリ層エンフォース)
- Cron route は `Bearer CRON_SECRET` で保護
- VAPID Push 秘密鍵は環境変数で管理
- HTTPS必須 (Vercel が自動付与)

### 3.4 互換性
- iOS Safari 16+
- Android Chrome 110+
- macOS/Windows のモダンブラウザ
- PWAインストール可能

### 3.5 オフライン対応
- Service Workerで静的アセットキャッシュ
- 最新7日分のデータをローカルキャッシュ
- オフライン中の入力はIndexedDBにキュー → オンライン復帰時に同期

### 3.6 国際化
- 日本語のみ (i18n基盤は持たない)
- 数値: メートル法 (kg, cm, kcal, g)

---

## 4. データモデル

### 4.1 ER概要
```
users ─┬─ weight_logs
       ├─ workouts ── workout_sets ── exercises
       ├─ meal_logs ── foods
       ├─ food_favorites ── foods
       ├─ workout_templates ── template_exercises ── exercises
       ├─ notification_subscriptions
       └─ tdee_history
```

### 4.2 テーブル定義 (主要)

#### users
| カラム | 型 | NOT NULL | 説明 |
|---|---|---|---|
| id | uuid (PK, auth.users参照) | ✓ | |
| display_name | text | ✓ | |
| height_cm | numeric(5,2) | ✓ | |
| birthdate | date | ✓ | |
| sex | text | ✓ | 'male' / 'female' |
| activity_level | numeric(3,2) | ✓ | 1.2〜1.9 |
| goal_weight_kg | numeric(5,2) | ✓ | |
| goal_date | date | ✓ | |
| current_tdee | int | | 最新の維持カロリー(適応TDEE) |
| daily_calorie_target | int | | 目標摂取kcal |
| protein_target_g | int | | |
| fat_target_g | int | | |
| carb_target_g | int | | |
| timezone | text | | デフォルト 'Asia/Tokyo' |
| created_at | timestamptz | ✓ | |

#### weight_logs
| カラム | 型 | NOT NULL |
|---|---|---|
| id | uuid (PK) | ✓ |
| user_id | uuid (FK) | ✓ |
| date | date | ✓ |
| weight_kg | numeric(5,2) | ✓ |
| body_fat_pct | numeric(4,2) | |
| note | text | |
| created_at | timestamptz | ✓ |

UNIQUE (user_id, date)

#### exercises
| カラム | 型 |
|---|---|
| id | uuid (PK) |
| name_jp | text |
| name_en | text |
| muscle_group | text ('chest','back','legs','shoulders','arms','core','full') |
| equipment | text ('barbell','dumbbell','machine','cable','bodyweight') |
| is_compound | boolean |
| default_rest_sec | int |
| is_global | boolean (デフォルト種目 / カスタム種目) |
| user_id | uuid nullable |

#### workouts
| カラム | 型 |
|---|---|
| id | uuid (PK) |
| user_id | uuid (FK) |
| date | date |
| name | text (例: 'Push Day') |
| started_at | timestamptz |
| ended_at | timestamptz |
| note | text |

#### workout_sets
| カラム | 型 |
|---|---|
| id | uuid (PK) |
| workout_id | uuid (FK) |
| exercise_id | uuid (FK) |
| set_no | int |
| reps | int |
| weight_kg | numeric(6,2) |
| rpe | numeric(3,1) |
| is_warmup | boolean |
| rest_sec | int |
| note | text |

#### foods
| カラム | 型 |
|---|---|
| id | uuid (PK) |
| name | text |
| name_kana | text |
| brand | text |
| unit_g | numeric(7,2) (1食あたり) |
| kcal_per_100g | numeric(6,2) |
| protein_g_per_100g | numeric(5,2) |
| fat_g_per_100g | numeric(5,2) |
| carb_g_per_100g | numeric(5,2) |
| source | text ('mext','user','manual') |
| user_id | uuid nullable |

#### meal_logs
| カラム | 型 |
|---|---|
| id | uuid (PK) |
| user_id | uuid (FK) |
| date | date |
| meal_type | text ('breakfast','lunch','dinner','snack') |
| food_id | uuid (FK) |
| quantity_g | numeric(7,2) |
| kcal | numeric(7,2) (キャッシュ) |
| protein_g | numeric(6,2) (キャッシュ) |
| fat_g | numeric(6,2) |
| carb_g | numeric(6,2) |
| photo_url | text |
| logged_at | timestamptz |

#### notification_subscriptions
| カラム | 型 |
|---|---|
| id | uuid (PK) |
| user_id | uuid (FK) |
| endpoint | text |
| p256dh | text |
| auth | text |
| user_agent | text |
| created_at | timestamptz |

#### tdee_history
| カラム | 型 |
|---|---|
| id | uuid (PK) |
| user_id | uuid (FK) |
| calculated_at | date |
| period_days | int |
| avg_intake_kcal | numeric(7,2) |
| weight_change_kg | numeric(5,2) |
| estimated_tdee | int |
| new_target_kcal | int |

### 4.3 派生クエリ

```sql
-- 7日移動平均体重
SELECT date,
  AVG(weight_kg) OVER (
    ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS ma7
FROM weight_logs
WHERE user_id = $1;

-- 種目別 e1RM
SELECT exercise_id,
  MAX(weight_kg * (1 + reps::numeric/30)) AS e1rm
FROM workout_sets ws
JOIN workouts w ON ws.workout_id = w.id
WHERE w.user_id = $1 AND NOT is_warmup
GROUP BY exercise_id;

-- 部位別週間ボリューム
SELECT date_trunc('week', w.date) AS week,
  e.muscle_group,
  SUM(ws.reps * ws.weight_kg) AS volume_kg
FROM workout_sets ws
JOIN workouts w ON ws.workout_id = w.id
JOIN exercises e ON ws.exercise_id = e.id
WHERE w.user_id = $1 AND NOT ws.is_warmup
GROUP BY 1, 2;
```

---

## 5. 通知設計

### 5.1 通知方式
- **Web Push API** (VAPID鍵による署名)
- Service WorkerでPushイベント受信
- iOS Safari 16.4+, Android Chrome対応
- PWAインストール必須(iOS)

### 5.2 通知トリガー

| 通知ID | タイミング | 内容 | 設定可否 |
|---|---|---|---|
| N-01 | 毎朝7:00 | 「おはよう。体重を記録しましょう」 | ON/OFF + 時刻 |
| N-02 | 毎日12:00, 19:00 | 「お昼/夕食を記録しましたか?」 | ON/OFF + 時刻 |
| N-03 | 摂取kcal不足 (22:00時点で目標の70%未満) | 「残り{X}kcal。間食でカバーしませんか?」 | ON/OFF |
| N-04 | ワークアウト予定日の30分前 | 「今日は{部位}の日です」 | ON/OFF |
| N-05 | 体重未記録3日連続 | 「3日間記録なし。続けましょう」 | ON/OFF |
| N-06 | PR達成 | 「{種目}でPR! 前回 {old}kg → {new}kg」 | ON/OFF (即時) |
| N-07 | 適応TDEE更新 | 「TDEEを再計算しました。新目標: {kcal}kcal」 | ON/OFF |
| N-08 | 休憩タイマー終了 | 「次のセットへ」 | ON/OFF (即時) |

### 5.3 実装方針
- 定期通知 (N-01, N-02, N-03, N-04, N-05, N-07): Vercel Cron Job (1時間ごとにジョブ実行→該当ユーザーに送信)
- 即時通知 (N-06, N-08): クライアント or サーバーから即時Push

### 5.4 ユーザー設定項目
- 各通知のON/OFF
- 時刻のカスタマイズ(N-01〜N-04)
- 通知許可ステータス表示・再許可導線

---

## 6. システム構成

### 6.1 技術スタック
| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 15 (App Router), TypeScript |
| UI | Tailwind CSS, shadcn/ui (Radix UI) |
| グラフ | Recharts |
| カレンダー | date-fns + 自作グリッド |
| 状態管理 | React Query (TanStack Query) |
| バックエンド | Next.js Route Handlers (App Router) |
| DB | PostgreSQL (Railway) |
| ORM | Drizzle ORM |
| 認証 | Auth.js v5 (NextAuth) + Google OAuth |
| Web Push | web-push (VAPID) |
| Cronジョブ | Vercel Cron (毎時) |
| フロントホスト | Vercel (無料枠) |
| DBホスト | Railway ($5/月クレジット) |

### 6.2 アーキテクチャ図
```
┌────────────────────────────────────────────┐
│  PWA (Next.js + Service Worker)            │
│  - UI / 入力 / グラフ                       │
│  - Service Workerでオフラインキャッシュ      │
└──────────┬────────────────────┬────────────┘
           │ fetch /api/*       │ Push
           ▼                    ▼
┌──────────────────────┐  ┌──────────────────┐
│  Next.js API Routes  │  │  Push Service     │
│  (Vercel)            │  │  (FCM/APNs)       │
│  - Auth.js セッション │  └──────────────────┘
│    (DBアダプタ)       │
│  - Drizzle ORM       │
│  - 適応TDEE計算       │
│  - 通知送信           │
└──────┬───────────────┘
       │ postgres-js
       ▼
┌──────────────────────┐
│  Railway PostgreSQL  │
│  - usersテーブル      │
│  - workout/meal等    │
│  - Auth.jsテーブル    │
│    (accounts/sessions)│
└──────────────────────┘
       ▲
       │ Bearer CRON_SECRET
┌──────┴───────────────┐
│  Vercel Cron         │
│  /api/cron/reminders │
│  毎時実行             │
└──────────────────────┘
```

**Google OAuth フロー**
```
ブラウザ → /api/auth/signin/google → Google OAuth同意 →
/api/auth/callback/google → Auth.js が DB(accounts/sessions) に書込 →
SessionCookie発行 → 各API routeで auth() がCookie検証
```

### 6.3 ディレクトリ構成
```
workout-tracker/
├── docs/REQUIREMENTS.md
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (app)/
│   │   │   ├── layout.tsx (BottomNav)
│   │   │   ├── page.tsx (Dashboard)
│   │   │   ├── weight/
│   │   │   ├── food/
│   │   │   ├── workout/
│   │   │   ├── calendar/
│   │   │   ├── stats/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── notifications/
│   │   │   └── cron/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── tdee.ts
│   │   ├── push.ts
│   │   └── types.ts
│   └── hooks/
├── supabase/
│   ├── schema.sql
│   └── seed.sql
├── package.json
└── README.md
```

---

## 7. UI / UX 設計

### 7.1 デザイン原則
1. **片手親指で完結** — 主要操作はすべて画面下半分に配置
2. **入力 3タップ以内** — クイック追加で記録摩擦を最小化
3. **数字大きく** — トレ中・運転中でも視認可能
4. **無彩色 + 1色アクセント** — 集中を妨げない (Tailwind slate + emerald)
5. **ダークモード優先** — ジムでの眩しさ低減

### 7.2 ボトムナビ
```
[🏠 Home] [⚖️ 体重] [+]  [🍙 食事] [🏋️ トレ]
                   │
                  クイック追加モーダル
```
- 中央の「+」ボタンで体重/食事/ワークアウトを最短経路で開始

### 7.3 レイアウト原則
- 親指リーチゾーン: 画面下 60% に主要CTA
- 上部ヘッダー: 戻る + 画面タイトルのみ、薄い
- スクロール: 縦のみ、横スワイプは画面切替に予約

### 7.4 カラーパレット
| 用途 | 色 |
|---|---|
| 背景 (ダーク) | slate-950 |
| カード | slate-900 |
| 主要テキスト | slate-50 |
| サブテキスト | slate-400 |
| アクセント | emerald-500 |
| 警告 | amber-500 |
| エラー | red-500 |

---

## 8. 開発スケジュール

| 週 | スプリント目標 | 成果物 |
|---|---|---|
| W1 | 環境構築 + 認証 + DB | Supabaseプロジェクト, スキーマ適用, ログイン |
| W2 | コア入力機能 | 体重・食事・ワークアウトの入力と一覧 |
| W3 | 可視化 | ダッシュボード, グラフ, カレンダー |
| W4 | PWA + 通知 + 仕上げ | ホーム追加, 全通知, 適応TDEE, デプロイ |

---

## 9. 受け入れ基準 (Acceptance Criteria)

- [ ] iOS Safari でホーム画面追加し、起動できる
- [ ] オンボーディングで目標kcal/PFCが自動算出され表示される
- [ ] 体重入力 → ダッシュボードに即時反映 (3秒以内)
- [ ] 食品検索でラーメン・米・鶏むね肉などがヒット
- [ ] ワークアウト中に「前回値」ボタンで前回データが引用される
- [ ] PRを達成するとバッジが出る
- [ ] カレンダー月表示で日別のトレ・kcal・体重が見える
- [ ] 朝7時に体重リマインド通知が届く
- [ ] 2週間後に適応TDEEが自動で再計算される
- [ ] オフライン中に入力した体重がオンライン復帰時に同期される

---

## 10. リスク・前提

### 10.1 既知の制約
- iOSのWeb Pushは PWA インストール後のみ動作
- Vercel Cron は無料枠で 1日2回 制限 → 必要なら有料プラン or Railway側で cron実行
- Railway: $5/月クレジット消費 (個人DBなら$3-5/月)
- Auth.js v5 はベータ。API変更の可能性あり

### 10.2 増量ペースの現実性
- 月+1.88kg は積極ペース、純粋筋肉は月1kgが上限
- 体重増加分のうち脂肪が増えることを許容する前提
- 3ヶ月目以降の停滞時はサープラスを+300〜400kcal/dayに調整

### 10.3 データの所有
- Railway の PostgreSQL は手動 `pg_dump` で月1回バックアップ推奨
- Drizzle Studio (`npm run db:studio`) で DB の中身を直接確認可
