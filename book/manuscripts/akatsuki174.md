---
class: content
---

<div class="doc-header">
  <div class="doc-title">Packet Logger を使って BLE 通信の中身を覗いてみる</div>
  <div class="doc-author">akatsuki174</div>
</div>

# Packet Logger を使って BLE 通信の中身を覗いてみる

BLE（Bluetooth Low Energy）を使ったアプリやデバイス開発をしていると、接続はできているはずなのに想定したデータが返ってこないなどのハプニングに遭遇することがあると思います。そんな時に役立つツールの1つが Packet Logger です。

私は iOS アプリ実装をする中で Apple Notification Center Service （ANCS）を使ったんですが、通知に対してアクションを起こす命令を送っても期待した動作にならないことに悩まされていました。Xcode 上で見る限りは送っているパケットは合っているように見えるし、エラーが返ってきているわけでもない。これ以上 Xcode 上で悩んでも仕方ないなと思い、Packet Logger を使うに至りました。

わりと便利なツールだと思ったので、この記事では Packet Logger の概要から使い方までを紹介してみたいと思います。

※ ここから先は iPhone における BLE 通信デバッグを前提として記述します。この他に Mac, Apple Watch などでも活用できるはずです。

## Packet Logger とは

Apple が提供している Bluetooth 通信ログ取得ツールです。macOS / iOS デバイスの Bluetooth 通信ログの閲覧、HCI レベルのパケット解析ができます。アプリ側の delegate メソッド（ `didWriteValueFor` や `didUpdateValueFor` など）が呼ばれる前段階で実際にどのようなパケットが飛んでいるかを確認できるのが特徴です。

たとえば以下のような場面で役立ちます。

* BLE 接続が失敗してしまったり、ペアリングがうまくいかなかったりした時に、誰が切断を要求したのかを解明したい
* アプリからは正しい値を送ったはずなのにデバイス側で違う値になっている時に、実際に送信されたパケットの中身を確認する

## 導入方法

まずは Apple Developer サイトにログインしてください。次に Xcode > More Downloads から、自分が使っている Xcode のバージョンに合った Additional Tools for Xcode をダウンロードしてください。この中に PacketLogger.app が含まれています。詳しい場所は次のスクショを参考にしてください。

![PacketLogger.app の場所](./images_akatsuki174/packet_logger_in_folder.jpg)

これだけだと PacketLogger 自体は起動できてもログが取得できないので、検証したい iPhone 端末にプロファイルを入れましょう。iPhone から Apple Developer サイトにアクセスして Profiles and Logs というページまで来てください。たくさん出てくるので検索窓に「 bluetooth 」などの文字列を入れて「 Bluetooth for iOS/iPadOS 」 という Profile を見つけてダウンロードしてください。

![Bluetooth for iOS/iPadOS の場所](./images_akatsuki174/bluetooth_for_ios_profile.jpg)

設定アプリの VPN とデバイス管理からプロファイルをインストールしたら準備完了です。

![VPN とデバイス管理](./images_akatsuki174/profile_insatall_1.jpg)

![プロファイルのインストール](./images_akatsuki174/profile_insatall_2.jpg)

ちなみにこのプロファイル、一定期間が経過すると削除されてしまうようです。「あれ、この前までちゃんとログ取れてたのに今日突然ログが全然流れてこなくなった」という事態に遭遇したら、このプロファイルが消えてないか確認してみてください。消えていたら再インストールしましょう。

## 使用方法

iPhone と Mac を有線で繋ぎましょう。無線デバッグに慣れて接続していないとこの工程を忘れてしまうことがあるので注意です。私は「あれ、なんでログ出てこないんだろう？」と思ってよくよく考えてみたら有線で繋いでなかったということが1回ありました。

![ログが流れてこない時の画面](./images_akatsuki174/no_logs.jpg)

PacketLogger を起動し、メニューから New iOS Trace を選択してください。これで繋いだ iPhone の BLE 通信ログがどんどん流れてくるウィンドウが表示されると思います。

![ログがどんどん流れてきている](./images_akatsuki174/all_logs.jpg)

これだといろんなログが次々と出てきて見づらいと思うので適宜右上の検索窓を使って絞り込みます。私の場合は ATT Write Request の様子を見たかったので、Write で絞り込みをしています。

![ログの絞り込み](./images_akatsuki174/att_logs.jpg)

このスクショの例だと以下のことがわかります。

* ATT Write Request が発生している
* リクエストコマンドは以下の通りであり、UID = 22 の通知に対して Negative Action を実行しようとしている
  * Value = [02 16 00 00 00 01]
  * CommandID = 0x02 ( PerformNotificationAction )
  * NotificationUID = 0x00000016 ( UID = 22 )
  * ActionID = 0x01 ( Negative Action )
* ATT Write Response　が正常に返ってきており、エラーにはなってない

## まとめ

この記事では Packet Logger を使って BLE 通信の中身を見る方法について初歩から紹介しました。Bluetooth が絡む実装をする時に使えると便利なツールだと思うので、ぜひ慣れ親しんでみてください。
