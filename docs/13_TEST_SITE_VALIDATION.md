# 13_TEST_SITE_VALIDATION

## 検証目的

テストサイトで以下を確認する。
- 表示崩れ
- 導線
- 更新反映
- パフォーマンス

## 検証環境

- URL: `http://localhost:4324/`
- 実施日時: 2026-07-30
- 実施ブラウザ: 共有ブラウザ（Playwright 実行環境）
- 検証ビューポート:
  - Desktop: 1440 x 900
  - Mobile: 390 x 844

## 検証結果サマリ

- Desktop: 合格
- Mobile: 合格
- 実機ブラウザ横断（Safari / Chrome / Firefox）: 未実施

## 1) 表示崩れ確認

### Desktop（1440 x 900）

- メインビジュアルの下にモニターが配置されている
- HAIR モニターと PHOTO モニターは横並び
- モニターは 2x2 グリッド表示
- 画像破損: 0件

### Mobile（390 x 844）

- メインビジュアルの下にモニターが配置されている
- HAIR モニターの下に PHOTO モニターが縦並び
- モニターは 2x2 グリッド表示
- 画像破損: 0件

## 2) 導線確認

- HAIR モニターリンク:
  - `https://www.instagram.com/lab.hair.design`
- PHOTO モニターリンク:
  - `https://www.instagram.com/vietnam_lab_fashion`

判定:
- 2導線ともリンク設定どおり

## 3) 更新反映確認（取得層連携）

確認方法:
- HOME 表示は `api/home.json` を返す取得層を通じたデータで描画される構成であることを確認
- モニター画像とリンクが取得データに基づき表示されることを確認

判定:
- 合格（表示と取得データ構造の整合を確認）

## 4) パフォーマンス確認

取得値（Navigation Timing）:
- Desktop:
  - DOMContentLoaded: 475ms
  - Load: 475ms
- Mobile:
  - DOMContentLoaded: 304ms
  - Load: 352ms

判定:
- ローカル検証として問題なし

## 未実施項目

- Safari（macOS / iOS）実機検証
- Chrome（Android）実機検証
- Firefox（Desktop）実機検証
- ネットワーク速度制限下での体感検証

## 最終判定

- 現時点のローカル検証範囲では合格
- 本番前に未実施項目の実機検証を追加実施すること
