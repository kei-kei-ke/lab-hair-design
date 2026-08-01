Cloud Run デプロイ & Cloud Scheduler 設定

前提: gcloud CLI がセットアップ済みで、必要な API を有効化していること
- APIs: Cloud Build, Cloud Run, Cloud Scheduler, Secret Manager, IAM

1) シークレットを Secret Manager に登録

```bash
PROJECT=your-gcp-project
# Create secrets (use secure input in CI / Cloud Console)
echo -n "YOUR_IG_USER_ID" | gcloud secrets create IG_USER_ID --replication-policy="automatic" --data-file=-
echo -n "YOUR_IG_TOKEN" | gcloud secrets create IG_TOKEN --replication-policy="automatic" --data-file=-
echo -n "https://your-wp.example.com" | gcloud secrets create WP_BASE --replication-policy="automatic" --data-file=-
echo -n "wp_user" | gcloud secrets create WP_USER --replication-policy="automatic" --data-file=-
echo -n "app_password" | gcloud secrets create WP_APP_PASSWORD --replication-policy="automatic" --data-file=-
```

2) サービスアカウント作成（Cloud Run サービス用）

```bash
gcloud iam service-accounts create instagram-sync-sa --display-name="Instagram Sync Service"
# 必要であれば追加の IAM ロールを付与（例: Secret Manager シークレットをアクセスするための roles/secretmanager.secretAccessor）
gcloud projects add-iam-policy-binding $PROJECT --member="serviceAccount:instagram-sync-sa@${PROJECT}.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```

3) デプロイ

```bash
# ローカルでビルド＆デプロイ（deploy-cloudrun.sh を参照）
PROJECT=your-gcp-project REGION=us-central1 ./deploy-cloudrun.sh
```

- オプション: `--no-allow-unauthenticated` を指定しているため、Cloud Run は認証付きになります。

4) Cloud Scheduler 用の呼び出し用サービスアカウントを作成し、Cloud Run の Invoker 権限を付与

```bash
# Scheduler が利用する SA
gcloud iam service-accounts create scheduler-invoker --display-name="Scheduler Invoker"
# Grant Run Invoker on the deployed service
gcloud run services add-iam-policy-binding instagram-sync \
  --region=us-central1 \
  --member="serviceAccount:scheduler-invoker@${PROJECT}.iam.gserviceaccount.com" \
  --role="roles/run.invoker"
```

5) Cloud Scheduler ジョブを作成（例: 15分ごと）

```bash
# get service URL
SERVICE_URL=$(gcloud run services describe instagram-sync --region=us-central1 --format 'value(status.url)')

# create scheduler job using OIDC token from scheduler-invoker service account
gcloud scheduler jobs create http instagram-sync-job \
  --schedule="*/15 * * * *" \
  --http-method=POST \
  --uri="$SERVICE_URL" \
  --oidc-service-account-email=scheduler-invoker@${PROJECT}.iam.gserviceaccount.com \
  --oidc-token-audience="$SERVICE_URL"
```

注意点
- `--set-secrets` の利用には gcloud のバージョン依存があります。必要なら Cloud Run にデプロイ後に `gcloud run services update --update-secrets` を使って関連づけてもよいです。
- Scheduler が OIDC トークンを生成するためには、サービスアカウントに対して適切な権限が必要です（`roles/iam.serviceAccountTokenCreator` を検討）。
- 最初は手動で `curl` による POST テストをお勧めします（サービスが認証付きの場合は `gcloud auth print-identity-token` を使ってヘッダを付与）。

トラブルシュート
- デプロイ後に `gcloud run services describe instagram-sync` で `status.conditions` を確認してください。
- Cloud Scheduler ジョブの実行履歴は Cloud Console の Scheduler セクションで確認できます。

