CircleCIのWebhookを使って自前Slack通知するGoogle Cloud Funcsion
----

## Summary

- CircleCIのSlack連携は1つのチャンネルにしか通知できない
- ブランチやビルドステータスによってSlackへの通知をフィルタしたい
- 自前でやろう
- CircleCIのWebhook機能を使用する
    - https://circleci.com/docs/1.0/configuration/#notify
    - この機能はCircleCI 2.0でも使用可能

```.circleci/config.yml
notify:
  webhooks:
    - url: https://<region>-<project_id>.cloudfunctions.net/circleci2slack
```

## Configure

現在のGoogle Cloud Functionsで、いい感じに複雑な設定を外出しするのを知らないので、index.jsに直接書いちゃってる。

```index.js
const CONFIGURES = [
  {
    branches: ["develop"], // 通知したいブランチ
    statuses: ["failed", "fixed", "timedout", "infrastructure_fail"], // 通知したいステータス
    slackWebhookUrl: "https://hooks.slack.com/services/foo/bar/baz", // 通知先SlackのIncoming Webhook
    channel: "random" // 通知したいSlackチャンネル(オプション)
  },
  // ...他の設定
];
```

## Deploy

デプロイ先GCPプロジェクトIDを指定してdeploy.shコマンドを実行。
事前にgcloudコマンドで権限があるユーザーでログイン済みである必要あり。

```sh
$ ./deploy.sh <project_id>
```
