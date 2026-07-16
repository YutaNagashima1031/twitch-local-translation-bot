# 🌐 Twitch Local AI Translator Bot

![Node.js](https://img.shields.io/badge/Node.js-18.x-green) ![TypeScript](https://img.shields.io/badge/TypeScript-blue) ![Transformers.js](https://img.shields.io/badge/AI-Transformers.js-orange) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## 📝 概要
Twitchの配信チャットをリアルタイムに監視し、海外視聴者からの外国語コメントを自動検知して日本語に翻訳・返信するTwitchボットです。

本プロジェクトの最大の特徴は、DeepLやOpenAIといった**外部の翻訳APIを一切使用せず、オープンソースのAIモデルを用いて自身のローカル環境（オフライン）で言語判定と翻訳を完結させている点**です。

![ボットの動作デモ]<img width="2060" height="763" alt="Apply_a_strong_clearly_visible_pixelated_mosaic_-1784197450785" src="https://github.com/user-attachments/assets/80cbf10a-7bb8-4803-9f4b-9d1b129a0da2" />


## 🎯 開発の背景とアプローチ
一般的な翻訳ボットは外部APIを利用しますが、Twitchのような大量のリアルタイムデータストリームを処理する場合、「APIレートリミットによる機能停止」と「チャット量に比例するランニングコスト」が大きな課題となります。

本プロジェクトでは**「ローカルAI（オンデバイス機械学習）によるオフライン処理アーキテクチャ」**を採用することで、どれだけチャットが流れても**運用コストは完全無料**であり、API制限を気にすることなく稼働するスケーラブルなシステムを実現しました。

---

## ✨ コア機能
* **🧠 オフラインAI翻訳エンジン**
  `Transformers.js` を用いてローカル環境でAIモデルを実行。外部と通信しないためセキュアで高速です。
* **⚡ ショートカット辞書機能（パフォーマンス最適化）**
  「hello」「gg」「lol」といったTwitch頻出の短文チャットに対しては、重いAIの推論処理を通さず、辞書（Map）を使って即座に「こんにちは」「グッドゲーム！」「笑」と返すバイパス処理を実装。これによりPCのCPU負荷を劇的に下げ、レスポンス速度を向上させています。
* **🎨 視認性を高めるUX（国旗の自動付与）**
  言語判定エンジンの結果を利用し、ボットの返信テキストに元の言語の国旗絵文字（例: 🇺🇸）を動的に付与します。

---

## 🛠 トラブルシューティングと技術的決定（開発の軌跡）

ローカルAI開発において直面した課題と、その解決策です。

### 1. 巨大モデルによるタイムアウトと量子化の採用
* **課題:** 当初、高精度な多言語モデル（`NLLB-200 600M`）を採用しましたが、モデルサイズが1GBを超えており、初回起動時のダウンロードで `Gateway timeout error` が発生。
* **解決策:** `pipeline` 実行時に `{ quantized: true }` を明示的に指定し、**4-bit量子化モデル**を採用。ファイルサイズを大幅に圧縮し、メモリ消費量とロード時間を実用レベルまで削減しました。

### 2. トークナイザー非対応によるハルシネーション（幻覚）の解決
* **課題:** 軽量化のために `opus-mt-en-jap` モデルを検証した際、「hello」という単語が「陰府の端には...」という全く無関係な文章に翻訳される重大なハルシネーションが発生しました。
* **原因と解決策:** コンソールのログから `MarianTokenizer is not yet supported` の警告を発見。JS環境でのトークナイザー非互換によるエンコードの乱れと特定しました。これにより採用モデルを安定した NLLB 系に戻し、NLLB 特有の BCP-47 言語コード（`eng_Latn` -> `jpn_Jpan`）へのマッピング処理を自前で実装することで、正確な翻訳を取り戻しました。

### 3. 短文特有の言語誤判定の防止
* **課題:** Twitch特有の短いコメント（例："hello, how are you?"）を、判定ライブラリが `fuf`（フラニ語）等のマイナー言語と誤判定し、翻訳がスキップされる問題が発生。
* **解決策:** 言語判定ライブラリ（`franc`）のオプションを調整し、判定候補をTwitchで主要な言語（eng, spa, fra, jpn 等）のみに絞り込むことで、短文における判定精度を大幅に向上させました。

---

## 💻 技術スタック
* **言語:** TypeScript, Node.js
* **Twitch連携:** `tmi.js`
* **AI・機械学習:** `Transformers.js` (モデル: `Xenova/nllb-200-distilled-600M` 4-bit quantized)
* **言語判定:** `franc`
* **コード品質管理:** ESLint, Prettier

---

<h2>🚀 セットアップと起動方法</h2>

<h3>1. インストール</h3>
<pre><code>git clone https://github.com/YutaNagashima1031/twitch-local-translation-bot.git
cd twitch-local-translation-bot
npm install</code></pre>

<h3>2. 環境変数の設定</h3>
<p>ルートディレクトリに <code>.env</code> ファイルを作成し、Twitchの認証情報を設定します。</p>
<pre><code>TWITCH_BOT_USERNAME=あなたのボット用アカウント名
TWITCH_OAUTH_TOKEN=oauth:あなたのトークン
TWITCH_CHANNEL=連携したいチャンネル名</code></pre>

<h3>3. 起動</h3>
<p>以下のコマンドでボットが起動します。※初回のみAIモデルのダウンロードが行われます。</p>
<pre><code>npm run dev</code></pre>
