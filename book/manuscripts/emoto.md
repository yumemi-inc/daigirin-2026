---
class: content
---

<div class="doc-header">
  <div class="doc-title">二値の Bool を Optional で三値するな高校</div>
  <div class="doc-author">江本光晴</div>
</div>

# 二値の Bool を Optional で三値するな高校

こんにちは、二値の Bool を Optional で三値するな高校から来ました。今回は、本校の校則を紹介します。

## 問題設定

プログラミング言語において、Bool 型は基本的なデータ型の１つです。true or false の二値を表現するシンプルな型です。また、モダンな言語は nil 安全を採用して、型レベルで nil を制御できるようになりました。この２つが混じると、コードの可読性が下り、バグの温床となります。

本記事では、主に Swift を例にして、Optional な Bool の問題点を解説します。この問題は nil 安全を採用した他言語に共通する普遍的なトピックです。

### 対象読者

- Optional Bool に違和感を感じてる、もしくはこれから感じる方

## Bool 型とは

Bool 型は、プログラミング言語において基本的な型の１つです。言語によって、true or false、0 or 1 など表現は異なりますが、本質は同じです。

```swift
let isEnabled: Bool = true
if isEnabled {
    print("機能は有効です")
}
```

Bool 型の利用用途は二状態の判定です、以上。

...と締めくくりたいところですが、現実にはこのシンプルな Bool 型が拡張されて使われるケースが散見されます。それが本書のテーマである Optional Bool です。

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

このようにプログラムを実行する前のビルド時に、コンパイラがチェックしてくれるのが nil 安全の本質です。

### Optional Bool の誕生

漏れなく Bool も nil 安全の恩恵を受け、Optional を設定できます。

```swift
var isEnabled: Bool   // 通常 の Bool
var isReady: Bool?    // Optional な Bool
```

`Bool?` 型で定義した時、その型の変数が扱える値は true, false, nil になります。

<center><strong>アイエエエエ！本来２状態の Bool が３つ？！Bool３つナンデ！！</strong></center>

この第３の状態 nil をどう扱いますか？

## nil の扱いと Truthiness

「Bool で nil は false として扱えばいい」と考える人もいるでしょう。しかし、なぜ nil を false と判定したのでしょうか。

この判断基準は、言語によって異なる場合があります。それが Truthiness という概念です。

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

[^js-falsy]: MDN - Falsy, https://developer.mozilla.org/ja/docs/Glossary/Falsy
[^python-falsy]: Python Documentation - Truth Value Testing, https://docs.python.org/ja/3/library/stdtypes.html

### 言語による違いがもたらす不安定性

言語によって Falsy の定義が異なるため、どの言語を利用しているかによって動作が変わります。また、コードを書くエンジニアがどの言語をバックボーンとするか、エンジニアの意識などで、Falsy に対する認識は異なります。これが nil の扱いを難しくしている要因の１つです。

## nil に意味を持たせる危険性

さらに厄介なのは nil 状態に意味を持たせた場合です。たとえば、新機能があり、ユーザーに利用許諾を取ってから実行する場合を考えてみましょう。

```swift
var canUseNewFeature: Bool?
if canUseNewFeature == nil {
    // まだ利用許可をリクエストしていない
    requestPermission()
} else if canUseNewFeature == false {
    // ユーザーが拒否したのでエラーを表示する
    showError()
} else if canUseNewFeature == true {
    // 許可をもらったので、実行する
    executeNewFeature()
}
```

このコードは、Bool に「まだリクエストしていない」という第３の状態を付けてしまいました。一見、言語仕様にしたがって Bool を Optional を利用して取り扱える状態数を拡張して効率的に見えますが、これは事故の元です。

### Optional Bool の問題性

この問題があるコード例は nil を利用許諾するという目的の初期値として利用しています。一般に Bool は二値という共通認識があるため、nil が初期状態（未リクエスト）という考えは、紐付きません。Bool は二値のための型です。nil に nil 以上の意味を持たせて、Bool を三値として扱うのは絶対にやめましょう。

### 三状態以上の適切なアプローチ

この場合は、Enum で三状態を明示的に定義しましょう。

```swift
enum PermissionState {
    /// すでに利用可能
    case authorized
    
    /// まだ許可をリクエストしていない
    case notDetermined
    
    /// ユーザーに拒否されている
    case denied
}

var permissionState: PermissionState = .notDetermined
switch permissionState {
case .notDetermined:
    requestPermission()
case .denied:
    showError()
case .authorized:
    executeNewFeature()
}
```

この enum で定義した PermissionState はコードを読めば、3つの状態が何を意味するか明確で、nil のような曖昧な状態がありません。さらに、switch はエディターの補完により、全ケースを補完してくれるので、コードミスを防ぐことができます。また、将来的に新しい状態（例: `.restricted`）を追加しやすいです。

## やむを得ず Optional Bool を使う場合

しかしながら、開発において、仕様により Optional Bool が避けられない場合もあります。

- 外部 API のレスポンスに `Bool?` が含まれている
- レガシーコードとの互換性維持
- サードパーティライブラリの型定義
- データベースのNULL許容カラム

このような場合は、nil が何を意味するかチームで適切に定義しましょう。Optional Bool を扱う際、nil をどう解釈するかで分岐方法が変わります。

### パターン1: nilの意味が不明確な場合（3分岐）

nilを独立した状態として扱う必要がある場合です。

- guard let + if-else

```swift
var isEnabled: Bool?

guard let isEnabled else {
    print("nil: 状態が未定義")
    return
}

if isEnabled {
    print("true: 有効")
} else {
    print("false: 無効")
}
```

- switch

```swift
switch isEnabled {
case true:
    print("true: 有効")
case false:
    print("false: 無効")
case nil:
    print("nil: 状態が未定義")
}
```

- switch with Optional pattern

```swift
switch isEnabled {
case .some(true):
    print("true: 有効")
case .some(false):
    print("false: 無効")
case .none:
    print("nil: 未設定")
}
```

- if-else チェーン

```swift
if isEnabled == true {
    print("true: 有効")
} else if isEnabled == false {
    print("false: 無効")
} else {
    print("nil: 未設定")
}
```

- if case パターンマッチング

```swift
if case true = isEnabled {
    print("true: 有効")
} else if case false = isEnabled {
    print("false: 無効")
} else {
    print("nil: 未設定")
}
```

### パターン2: nilをfalseとして扱う場合

nilを「無効」と同義とみなす場合です。

- Nil-coalescing operator

```swift
if isEnabled ?? false {
    print("trueのときだけ実行")
}
```

- guard with Nil-coalescing

```swift
guard isEnabled ?? false else {
    print("false または nil")
    return
}
print("trueのときだけ実行")
```

- Optional binding + 条件

```swift
if let isEnabled, isEnabled {
    print("trueのときだけ実行")
}
```

- 直接比較（明示的）

```swift
if isEnabled == true {
    print("trueのときだけ実行")
}
// 注意: 以下はNG（nilもtrueとして扱われる）
if isEnabled != false {
    // これは true または nil のときに入る
}
```

- Optional pattern matching

```swift
if case true? = isEnabled {
    print("trueのときだけ実行")
} else {
    print("false または nil")
}
```

### パターン3: nilをtrueとして扱う場合

nilを「有効」と同義とみなす場合です（レアケース）。オプトインです

- 否定形での比較

```swift
if isEnabled != false {
    print("true または nil のときに実行")
}
```

- Nil-coalescing operator

```swift
if isEnabled ?? true {
    print("true または nil のときに実行")
}
```

- guard with Nil-coalescing

```swift
guard isEnabled ?? true else {
    print("falseのときだけここに来る")
    return
}
print("true または nil のときに実行")
```

- switch with grouping

```swift
switch isEnabled {
case .some(false):
    print("falseのときだけ")
case .some(true), .none:
    print("true または nil")
}
```

- Optional pattern matching（否定形）

```swift
if case false? = isEnabled {
    print("falseのときだけ")
} else {
    print("true または nil")
}
```

⚠️ **可読性の注意**

```swift
// 読みにくい & ミスりやすい
if isEnabled == true || isEnabled == nil {
    // ...
}
```

## Optional Bool 設計指針

前節、やはり分岐が複雑になるため、Optional Bool は可能な限り排除しましょう。

### Optional Boolを避ける

可能な限り、通常のBool型を使用する。

```swift
// ❌ 避けるべき
var isEnabled: Bool?

// ✅ 推奨
var isEnabled: Bool = false
```

### 三値以上が必要ならEnumを使う

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

外部APIから`Bool?`を受け取る場合は、境界で変換する。

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

### ドキュメント化

やむを得ずOptional Boolを使う場合は、必ずドキュメント化する。

```swift
/// ユーザーの通知設定
/// - nil: まだ設定されていない（初回起動時）
/// - true: 通知を許可
/// - false: 通知を拒否
var notificationEnabled: Bool?
```

### コードレビューのチェックリスト

- [ ] Optional Boolが本当に必要か？
- [ ] nilの意味が明確に定義されているか？
- [ ] Enumで代替できないか？
- [ ] nilのハンドリングが全て網羅されているか？
- [ ] 将来的に状態が増える可能性はないか？

## まとめ

Bool 型は true or false を表現する二値の型として設計されています。しかし、nil 安全な言語の登場により、Optional Boolという副作用で true, false or nil と意図しない三値の型が発生しました。

Optional Bool を安易に使うと可読性とメンテナンス性を損ないます。nil は「値がない」という意味であり、それ以上の意味を持たせるべきではありません。「なぜこの変数はOptionalなのか？」「nilは何を意味するのか？」という問いに明確に答えられない場合は、設計を見直すべきです。

また、第三の状態が必要な場合は Optional Bool に頼るのではなく、Enum を使って明示的に状態を定義することを推奨します。これにより、コードの意図が明確になり、将来的な拡張も容易になります。

外部 API などから Optional Bool を受け取る場合は、アプリケーションの境界で非 Optional 型に変換し、内部では通常の Bool 型として扱うことで、複雑な分岐を避けましょう。この際、デフォルト値の意味を明確にドキュメント化することが重要です。
