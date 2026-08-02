# WordPress Headless CMS 連携手順

この Astro 連携は、WordPress をデータ管理元として扱うための開発・プレビュー用構成です。

本番公開は WordPress（SWELL）側で行い、Astro の静的デプロイは使用しません。

## 1. Astro 側の設定

1. このリポジトリ直下で `.env` を作成
2. `.env.example` を参考に WordPress URL を設定

例:

```env
WORDPRESS_BASE_URL=https://your-wordpress-site.com
```

Astro は次のエンドポイントを読みます。

- `https://your-wordpress-site.com/wp-json/lab/v1/site-content`

このエンドポイントが取得できない場合は、ローカルの `src/data/siteData.ts` に自動フォールバックします。

## 2. WordPress 側のプラグイン設置

このリポジトリ内の `wordpress-plugin/lab-headless-bridge.php` を、WordPress の次の場所へ配置してください。

- `wp-content/plugins/lab-headless-bridge/lab-headless-bridge.php`

その後、WordPress 管理画面でプラグインを有効化します。

## 3. WordPress 管理画面で更新できる項目

プラグイン有効化後、以下が追加されます。

- `設定 > Lab Headless Settings`
  - サロン名
  - 住所
  - 営業時間
  - 定休日
  - アクセス案内
  - 予約URL
  - 料金の基礎情報
  - 特徴
  - 採用やトップ導入で使う本文の元になる情報

- カスタム投稿タイプ
  - `Lab Staff`
  - `Lab Styles`
  - `Lab Menus`
  - `Lab Home Cards`
  - `Lab Info`

## 4. 各投稿タイプの使い方

### Lab Staff

- タイトル: スタッフ名
- 本文: 紹介文
- 抜粋: 未使用でも可
- アイキャッチ画像: スタッフ写真
- メタ項目:
  - かな
  - 役職
  - 経歴

### Lab Styles

- タイトル: スタイル名
- アイキャッチ画像: スタイル写真
- メタ項目:
  - 担当スタイリスト
  - カテゴリ

### Lab Menus

- タイトル: メニュー名
- 本文: 補足説明
- メタ項目:
  - 表示カテゴリ `Cut / Color / Perm / Straight / Care`
  - 価格
  - TOP掲載ラベル
  - TOP掲載するかどうか

`TOP掲載する` にチェックを入れたメニューが、PRICE ページ上部や HOME のハイライトとして使われます。

### Lab Home Cards

- タイトル: HOME 上の小さな情報見出し
- 本文: 説明文
- メタ項目:
  - ラベル

### Lab Info

- タイトル: INFO 見出し
- 本文: 本文
- メタ項目:
  - ラベル

## 5. 画像更新の運用

今後は WordPress 管理画面で以下を行うだけで更新できます。

- HAIR: `Lab Styles` のアイキャッチ画像を差し替え
- STAFF: `Lab Staff` のアイキャッチ画像を差し替え
- 文章: 各投稿のタイトル・本文・メタ項目を更新

つまり、最終的には Astro 側のファイルを直接触らずに、WordPress ダッシュボードから運用可能です。

## 6. ビルド反映

WordPress の内容を更新したあと、Astro 側では次を実行します。

```bash
npm run build
```

開発中は次でも確認できます。

```bash
npm run dev
```

## 7. 補足

- 今回の実装は `WP REST API` ベースです
- `WPGraphQL` は必須ではありません
- 将来 GraphQL に寄せたい場合も、Astro 側は `src/lib/siteContent.ts` を差し替えるだけで移行できます
