# stackgamesempire-gift-list-fetch
積みゲー帝国のプレゼント応募ページ(Googleスプレッドシート)より、ゲーム情報一覧を抽出するコマンドライン  
Puppeteerを使ってスクレイピングで抽出してるのでちょっとしたことで動かなくなる可能性がある

## インストール
```bash
npm install @ba0918/stackgamesempire-gift-list-fetch
```

## 使い方
```bash
stackgamesempire-gift-list-fetch "プレゼント応募ページのURL" --outout result.json
```

## 開発方法
### セットアップ
```bash
yarn install
```

### ビルド
```bash
yarn run build
```