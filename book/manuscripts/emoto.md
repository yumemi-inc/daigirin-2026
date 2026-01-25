---
class: content
---

<div class="doc-header">
  <div class="doc-title">おお我らが二値の Bool を Optional で三値するな高校</div>
  <div class="doc-author">江本光晴</div>
</div>

# おお我らが二値の Bool を Optional で三値するな高校

こんにちは、二値の Bool を Optional で三値するな高校から来ました。今回は、本校を紹介します。

## 問題設定

プログラミング言語において、Bool 型は基本的なデータ型の１つです。二値を表現するシンプルな型です。また、モダンな言語は nil 安全を採用して、型レベルで nil を制御できるようになりました。この２つが混じると、コードの可読性が下り、バグの温床になりえます。

本記事では、主に Swift を例にして、Optional Bool の問題点を解説します。この問題は nil 安全を採用した他言語に共通する普遍的なトピックです。

### 対象読者

- Optional Bool に違和感を感じてる、もしくはこれから感じる方

## Bool 型とは

Bool 型は、プログラミング言語において基本的な型の１つです。言語によって、true or false、YES or NO または 0 or 1 など表現は異なりますが、本質は同じです。

```swift
let isEnabled: Bool = true
if isEnabled {
    print("機能は有効です")
}
```

Bool 型の利用用途は二状態の判定です、以上。

...と締めくくりたいところですが、現実にはこのシンプルな Bool 型が拡張されて使われるケースが散見されます。それが本記事のテーマである Optional Bool です。

## nil 安全がもたらす新たな課題

Swift を始めとして、最近のモダンな言語の多くは nil 安全をサポートしています。これは nil に起因するエラー（クラッシュ）を、コーディングやビルド時に確認して、プログラムを実行する前に防ぐ仕組みです。

Swift では普通に変数を定義すると、その変数に nil を代入できません。

```swift
var name: String = "Taro"
name = nil // ビルドエラーが起こる
```

もし nil になる可能性があるなら、Optional 型で定義します。

```swift
var name: String? = "Taro"
name = nil // 前述とは異なり nil を代入できる
print(name.count) // name が　nil の場合があるので、ビルドエラーになる
```

このようにプログラムを実行する前に、ビルド時にコンパイラがチェックしてくれるのが nil 安全の本質です。

### Optional Bool の誕生

漏れなく Bool も nil 安全の恩恵を受けるので Optional を設定できます。

```swift
var isEnabled: Bool   // 通常 の Bool
var isReady: Bool?    // Optional Bool
```

`Bool?` 型で定義した時、その型の変数が扱える値は true、false そして nil になります。

<div style="text-align: center"><strong>アイエエエエ！Bool が３つ？！３つナンデ！！</strong></div>

この第三の状態 nil をどう扱いますか？

## nil の扱いと Truthiness

「Optional Bool の nil は false として扱えばいい」と考える人もいるでしょう。しかし、なぜ nil を false と判定したのでしょうか。

開発案件の仕様だからという理由もありますが、この判断基準は利用する言語によって異なる場合があります。それが Truthiness という概念です。

### Truthiness（真偽値性）とは

プログラミングにおいて true or false ではない値（数値、文字列、オブジェクトなど）が、条件式（if 文など）で「真」または「偽」として扱われる性質を Truthiness と呼びます。

ここで「何が真か」を覚えるより、「何が偽（Falsy）とされるか」を覚える方が簡単です。それ以外はすべて「真（Truthy）」になるからです。このルールを知っておくと、コードを短く書ける一方で、意図しないバグの原因にもなります。

### JavaScript / TypeScript の Falsy

もっとも Truthiness が複雑で、注意が必要な言語です。次の値は false として扱われます [^js-falsy]。

- `false`
- `0`, `-0`, `0n`（BigInt）
- `""`（空文字）
- `null`
- `undefined`
- `NaN`

注意点とし、 `[]`（空の配列）や `{}`（空のオブジェクト）は「真（Truthy）」です。ここが他の言語と異なり、よく誤るポイントです。

```javascript
if ([]) {
    console.log("これは実行される！"); // 空配列でもtrue
}
```

### Python の Falsy

非常に直感的で、中身が空っぽのものはすべて偽になります [^python-falsy]。

- `False`
- `None`
- `0`, `0.0`
- `""`（空文字）
- `[]`（空リスト）
- `{}`（空辞書）
- `()`（空タプル）
- `set()`（空集合）

JavaScript と違い、空のリスト`[]`は「偽」です。

[^js-falsy]: "MDN - Falsy", https://developer.mozilla.org/ja/docs/Glossary/Falsy
[^python-falsy]: "Python Documentation - Truth Value Testing", https://docs.python.org/ja/3/library/stdtypes.html

### 言語による違いがもたらす不安定さ

言語によって Falsy の定義が異なるため、どの言語を利用しているかによって動作が変わります。また、コードを書くエンジニアがどの言語をバックボーンとするか、エンジニアの特性により Falsy に対する扱いは無意識で異なります。これが nil の扱いを難しくしている要因の１つです。

## nil に意味を持たせる危険性

さらに厄介なのは nil 状態に意味を持たせた場合です。たとえば、ユーザーに新機能の利用許諾を取ってから実行する場合を考えてみましょう。

```swift
// 利用許諾の状態を判定する
var canUseNewFeature: Bool?

if canUseNewFeature == nil {
    // まだ利用許可をリクエストしていないので、リクエストする
} else if canUseNewFeature == false {
    // ユーザーが拒否したのでエラーを表示する
} else if canUseNewFeature == true {
    // 許可をもらったので、実行する
}
```

このコードは、言語仕様にしたがって Bool に Optional を利用して取り扱える状態数を拡張しました。Bool に「まだ許諾リクエストしていない」という第三の状態を付与しました。一見は天才的に見えますが、これはバグの卵です。

### Optional Bool の問題性

この問題があるコード例は true or false さらに nil を加えた Bool で利用許諾のリクエスト状態を表現しています。一般に Bool は二値という共通認識があるため、nil が未リクエスト状態という考えは、紐付きません。Bool は二値のための型です。nil に nil 以上の意味を持たせて、Bool を三値として扱うのは絶対に止めましょう。

### 三状態以上の適切なアプローチ

この場合は、Enum で三状態を明示的に定義しましょう。

```swift
enum PermissionState {
    /// すでに利用可能
    case authorized
        /// ユーザーに拒否されている
    case denied
    /// まだ許可をリクエストしていない
    case notDetermined
}

var permissionState: PermissionState = .notDetermined
switch permissionState {
case .notDetermined:
    // まだ利用許可をリクエストしていないので、リクエストする
case .denied:
    // ユーザーが拒否したのでエラーを表示する
case .authorized:
    // 許可をもらったので、実行する
}
```

この enum で定義した PermissionState はコードを読めば、３つの状態が何を意味するか明確で、nil のような曖昧な状態はありません。さらに、switch はエディターの補完により、全ケースを補完してくれるので、コードミスを防ぐことができます。また、将来的に機能追加あれば、新しい状態を容易に追加できます。

## やむを得ず Optional Bool を使う場合

しかしながら、開発において、仕様により Optional Bool が避けられない場合もあります。

- 外部 API のレスポンスに Optional Bool が含まれている
- サードパーティライブラリの型定義
- 出来の悪い仕様、など

このような場合、nil が何を意味するかを適切に定義しましょう。nil をどう解釈するかで Optional Bool の分岐方法が変わります。次のような Optional Bool が定義されたときの分岐を考えていきましょう。

```swift
var isEnabled: Bool?
```

### nil の意味が不明確な場合

nil が true or false のどちらにも属さず、独立した状態として扱う必要がある場合です。この場合の Optional Bool は三状態になります。

安心安全の guard を利用します。nil の場合は早期 return して、optional を取り除きます。変数を操作するときは Bool になっているので、私はこの分岐が好みです。

```swift
guard let isEnabled else {
    print("nil")
    return
}

// Optional ではなく Bool として操作できる
if isEnabled {
    print("true")
} else {
    print("false")
}
```

次点として switch を利用してパターンマッチングする方法も好みです。

```swift
switch isEnabled {
    case true:  print("true")
    case false: print("false")
    case nil:   print("nil")
}
```

もちろん if-else でも分岐できます。これらは guard と比べるとシンプルですが、変数を操作する時は optional のままなのが気になってしまいます。

```swift
if isEnabled == true {
    print("true")
} else if isEnabled == false {
    print("false")
} else {
    print("nil")
}
```

### nil を false として扱う場合

nil を false とみなす場合です。値は３つですが、意味としては２つです。Optional Bool を扱うときによくある分類パターンではないでしょうか。憎いが、許容できるレベルです。

`??` で表記される Nil 結合演算子（Nil-Coalescing Operator）で分岐してみました。かっこいい書き方ですね、これは好きな if 分岐の書き方の１つです。

```swift
if isEnabled ?? false {
    print("true")
} else {
    print("false or nil")
}
```

もちろん guard でも書き直せます。

```swift
guard isEnabled ?? false else {
    print("false or nil")
    return
}
print("true")
```

次は、オプショナルバインディング（Optional-Binding）を利用して、nil を弾きました。

```swift
if let isEnabled, isEnabled {
    print("true")
} else {
    print("false or nil")
}
```

switch でパターンマッチングもあります。

```swift
switch isEnabled {
    case true: print("true")
    default:   print("false or nil")
}
```

if-case でも書けます。

```swift
if case true = isEnabled {
    print("true")
} else {
    print("false or nil")
}
```

もちろん愚直な比較もできます。

```swift
if isEnabled == true {
    print("true")
} else  {
    print("false or nil")
}
```

### nil を true として扱う場合

nil を true とみなす場合です。レアケースかもですが、オプトインとして設計する場合に起こりえます。状態が増えると、意味の分類も自由に増えていきます。

前述と同様に Nil 結合演算子で分岐できますが、右辺の値が逆になります。

```swift
if isEnabled ?? true {
    print("true or nil")
} else {
    print("false")
}
```

guard でも書き直せます。

```swift
guard isEnabled ?? true else {
    print("false")
    return
}
print("true or nil")
```

switch や if-case でパターンマッチングもあります。

```swift
switch isEnabled {
case .false: print("false")
default:     print("true or nil")
}
```

```swift
if case false = isEnabled {
    print("false")
} else {
    print("true または nil")
}
```

愚直に比較する場合です。

```swift
if isEnabled != false {
    print("true または nil")
} else {
    print("false")
}
```

## Optional Bool の設計指針

前節からも分かるように処理が複雑になるため、Optional Bool は可能な限り排除しましょう。

```swift
// 避けるべき
var isEnabled: Bool?

// 推奨
var isEnabled: Bool
```

### 三値以上の利用

三値以上が必要なら、素直に Enum を利用しましょう。

```swift
// 避けるべき
var userConsent: Bool?  // nil = 未確認, true = 同意, false = 拒否

// 推奨
enum UserConsent {
    case notAsked
    case granted
    case denied
}
```

### API レスポンスでの対処

外部 API から`Bool?`を受け取る場合は、モデルで変換しましょう。

```swift
struct APIResponse: Codable {
    let isEnabled: Bool?
}

// アプリ内部では非Optional型に変換
struct AppModel {
    let isEnabled: Bool
    init(from response: APIResponse) {
        // デフォルト値を明示的に定義
        self.isEnabled = response.isEnabled ?? false
    }
}
```

### ドキュメント＆テスト

やむを得ず Optional Bool を利用する場合は、必ずドキュメント化しましょう。また、テストを実装して、出来の悪い仕様の安全性を死守しましょう。

```swift
/// ユーザーの通知設定
/// - nil: まだ設定されていない（初回起動時）
/// - true: 通知を許可
/// - false: 通知を拒否
var notificationEnabled: Bool?
```

## まとめ

Bool 型は true または false を表現する二値の型として設計されています。しかし、nil 安全な言語仕様から Optional Bool という true、false そして nil の意図しない三値の Bool が誕生しました。

Optional Bool を安易に使うと可読性と保守性を損ないます。nil は「値がない」という意味であり、それ以上の意味を持たせるべきではありません。なぜこの変数は Optional なのか、nil は何を意味するのか、という問いに明確に答えられない場合は、設計を見直すべきです。

また、第三の状態が必要な場合は Optional Bool に頼るのではなく、Enum を使って明示的に状態を定義しましょう。これにより、コードの意図が明確になり、将来的な拡張も容易になります。

外部 API などから Optional Bool を受け取る場合は、早々に非 Optional 型に変換し、内部では通常の Bool 型として扱うことで、複雑性を避けましょう。この際、デフォルト値の意味を明確にドキュメント化することが重要です。

以上、二値の Bool を Optional で三値するな高校の紹介でした。

<hr class="page-break"/>

## おまけ「Objective-C の BOOL 型」

Swift 以前の Objective-C では、Bool の扱いが Swift と大きく異なっています。Objective-C の BOOL は独立した型ではなく、C 言語の型に対するエイリアスとマクロ定義でした。

```c
typedef bool BOOL;
#define YES true
#define NO  false
```

この true や false はマクロ、C23 からはキーワードとして定義されています [^c-bool-C99]。また、Objective-C の古いバージョンの実装では次のように数値で直接定義されていました。

```c
typedef signed char BOOL;
#define YES (BOOL)1
#define NO  (BOOL)0
```

これらの定義から分かるように、BOOL は実質的に signed char（-128 から 127 の整数値）であり、YES と NO はそれぞれ 1 と 0 を表すマクロに過ぎません [^objc-bool]。これは、true と false という明確な論理値をもつ Swift の Bool 型とは根本的に異なります。

[^c-bool-C99]: "Standard library header <stdbool.h> (C99)(deprecated in C23)", https://en.cppreference.com/w/c/header/stdbool.html
[^objc-bool]: "Objective-C Runtime / Boolean Values", https://developer.apple.com/documentation/objectivec/boolean-values

### signed char であることの問題

Objective-C の母体である C 言語は「0 のとき false、0 でないとき true」として判定します。そのため、BOOL が signed char として定義されていることで、いくつかの問題が発生します。

```objc
// 問題例1: 0 ではない値が YES として扱われる
BOOL result = 2;  // YES として扱われるが、YES (1) とは異なる
if (result == YES) {  // false！
    NSLog(@"This won't be executed");
}

// 問題例2: オーバーフロー
BOOL overflow = 256;  // signed char の範囲外
// 256 は 8 ビットでオーバーフローして 0 (NO) になる
```

BOOL の値が 1 でも 2 でも 0 でなければ、すべて真として扱われます。このため、BOOL 型の比較では `==` を使わず、条件式で直接評価することも推奨されていました。

```objc
// 良い例
if (result) {
    NSLog(@"This is correct");
    // result が 0 以外のあらゆる値で実行される
}

// 悪い例
if (result == YES) {  // result が 2 の場合、期待通りに動作しない
    NSLog(@"This might not work");
    // result が 1 の場合のみ true になる
}
```

### Optional BOOL の扱い

Objective-C には Swift のような Optional 型の概念がありません。nullable / nonnull という annotations はありますが、 静的解析を補助するもので、完全な nil 安全ではありません。

Optional BOOL を表現するには別の方法が必要でした。API のレスポンスなどで nil を考慮する場合は、NSNumber を経由して BOOL を扱いました。

```objc
// JSON: { "is_ready": true } または { } (キー自体がない)
NSDictionary *json = ...; 

// 1. まずは NSNumber オブジェクトとして取り出す
NSNumber *isReadyNum = json[@"is_ready"];

// 2. nil チェック（キーが存在するか）
if (isReadyNum != nil && isReadyNum != (id)[NSNull null]) {
    // 値が存在する場合のみ BOOL に変換
    BOOL isReady = [isReadyNum boolValue];
    NSLog(@"値は: %@", isReady ? @"YES" : @"NO");
} else {
    // 値がない（Optionalなケース）
    NSLog(@"値が含まれていません");
    // デフォルト値を使用するなどの処理
}
```

この方法では、値の存在を NSNumber オブジェクトの nil チェックで判定し、値が存在する場合にのみ BOOL 値を取り出します。Swift の `Bool?` と同様に三値論理（nil、true、false）を扱いますが、Objective-C では NSNumber という別の型を経由しました。nil チェックと BOOL への変換を明示的に書く必要があるため、三値を扱っていることを開発者が意識せざるを得ない設計になっています。

### Objective-C から学ぶこと

Objective-C の BOOL 型の歴史は、型システムの重要性を教えてくれます。単なるエイリアスやマクロではなく、Swift のように言語レベルで適切に設計された型を利用することで、多くのバグを未然に防げます。

型システムが進化したからといって、設計の問題が自動的に解決されるわけではありません。Objective-C では NSNumber を経由することで三値論理の複雑さが可視化されていました。一方、Swift では `Bool?` と書くだけで簡単に三値論理を作れてしまいます。この「手軽さ」が逆に危険なのです。

Objective-C 時代、開発者は NSNumber 経由の煩雑なコードを書くことで「これは普通の BOOL ではない」と意識せざるを得ませんでした。しかし Swift では、`Bool` に `?` を付けるだけで三値になります。型宣言の簡潔さゆえに、設計上の問いが軽視されがちです。

言語の表現力が向上しても、Bool は二値であるという本質は変わりません。Optional Bool を使う前に、本当に適切かと検討しましょう。この一手間が、将来のバグや混乱を防ぎ、保守性の高いコードにつながるでしょう。
