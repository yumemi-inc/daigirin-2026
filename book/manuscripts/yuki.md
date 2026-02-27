---
class: content
---

<div class="doc-header">
  <div class="doc-title">FlutterアニメーションにおけるAnimationControllerの考え方</div>
  <div class="doc-author">ゆき</div>
</div>

# FlutterアニメーションにおけるAnimationControllerの考え方

## はじめに

Flutterでは、`AnimatedContainer` のような `ImplicitlyAnimatedWidget` 系のWidgetを使うと、
値の変化を宣言するだけでアニメーションを実現することが出来ます。

```dart
AnimatedContainer(
  duration: const Duration(seconds: 3),
  width: isExpanded.value ? 200 : 100,
  height: isExpanded.value ? 200 : 100,
  color: Colors.red,
)
```

値が変わると、内部で補間が行われ、滑らかに変化します。

このアプローチは分かりやすく、状態中心のUI設計とも相性が良いものです。
時間軸は内部に隠蔽されているため、開発者が時間の進行を直接扱う必要はありません。

一方でFlutterには、もう一つのアプローチがあります。

それが `AnimationController` を中心とした、
時間を明示的に扱うアニメーションのアプローチです。

`ImplicitlyAnimatedWidget` が値の変化を宣言するスタイルであるのに対し、
`AnimationController` を利用すると、時間の進行を基準に設計することができます。

つまりアニメーションを、
正規化された時間から値への変換として記述する構造を取ることができます。

本書では `AnimationController` を使ったアニメーションのアプローチを中心に、
Flutterのアニメーションを構造として整理していきます。

## AnimationController とは

`AnimationController` は、
アニメーションの進行を制御するクラスです。

デフォルトでは 0.0 から 1.0 の範囲で値を扱い、
その進行を `forward` / `reverse` / `repeat` などで制御できます。

この値 は時間そのものではなく、
時間の経過に応じて変化する「正規化された時間」として解釈すると理解しやすくなります。

この正規化された時間に対して `Tween` を適用することで、
具体的な値へと変換できます。

例えば：

* 100px → 200px に変化する
* 赤 → 青 に変化する
* 0 → 360 度に回転する

UI側で途中値を明示的に状態として保持しなくても、
現在の値は `AnimationController` と `Tween` の組み合わせによって算出されます。

## アニメーションを作ってみる

`Tween` を使わずに、単純なサイズアニメーションを作ってみます。

```dart
class TestWidget extends HookWidget {
  const TestWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = useAnimationController(
      duration: const Duration(seconds: 3),
    );

    useEffect(() {
      controller.forward();
      return null;
    }, const []);

    return AnimatedBuilder(
      animation: controller,
      builder: (BuildContext context, Widget? child) {
        return Container(
          width: controller.value * 100 + 100,
          height: controller.value * 100 + 100,
          color: Colors.red,
          child: child,
        );
      },
    );
  }
}
```

### この書き方の注意点

簡単なアニメーションでは問題ありませんが、
複雑なアニメーションでは式が複雑になりがちです。

`controller.value` を直接計算に使うと、

* 正規化された時間に直接依存した式がUI側に広がる
* 値の意味が読み取りづらくなる
* 再利用しづらくなる

といった状態になりやすくなります。

時間の生成と値の意味付けが混ざってしまいます。
簡単なアニメーションであっても、あまり好ましい分離とは言えません。

### Tweenで意味付けを分離する

時間（0〜1）と値の意味付けを分離します。

```dart
final sizeAnimation = controller.drive(
  Tween<double>(
    begin: 100,
    end: 200,
  ),
);
```

```dart
return AnimatedBuilder(
  animation: sizeAnimation,
  builder: (BuildContext context, Widget? child) {
    return Container(
      width: sizeAnimation.value,
      height: sizeAnimation.value,
      color: Colors.red,
      child: child,
    );
  },
);
```

このようにすると、

* `AnimationController` は正規化された時間を生成する
* `Tween` は正規化された時間を別の値へ変換する

という役割分担が明確になります。

時間を生成する階層と、
値へ変換する階層を分離して記述することができます。

### 色を変化させる

`Tween` は、補間可能な型であれば様々な値に適用できます。

```dart
final colorAnimation = controller.drive(
  ColorTween(
    begin: Colors.red,
    end: Colors.blue,
  ),
);
```

同じ `AnimationController` から生成される正規化された時間を共有しながら、
複数の値に変換できます。

これも `AnimationController` を用いた設計の特徴のひとつです。

---

### Tweenを連結する

`.drive()` は複数の `Tween` を連結することもできます。

```dart
final sizeAnimation = controller
    .drive(CurveTween(curve: Curves.easeInOut))
    .drive(
      Tween<double>(
        begin: 100,
        end: 200,
      ),
    );
```

ここで行っているのは、

* `AnimationController` → 正規化された時間の生成
* `CurveTween` → 正規化された時間の変換（イージング的な変換）
* `Tween` → 別の意味を持つ値への変換（px として解釈できる値への変換）

という段階的な変換です。

いずれの `Tween` も本質的には、値の変換であり、
何をしているかは各 `Tween` の実装によって決まります。

### TweenSequenceで段階的に変化させる

```dart
final sizeAnimation = controller.drive(
  TweenSequence<double>(
    [
      TweenSequenceItem(
        tween: Tween<double>(begin: 100, end: 200),
        weight: 1,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 200, end: 150),
        weight: 1,
      ),
    ],
  ),
);
```

`weight` の相対比によって各区間の時間配分が決まります。

## まとめ

`AnimationController` は正規化された時間の生成を行います。
`Tween` は正規化された時間を別の値へ変換します。

Flutterのアニメーションは、
正規化された時間を生成し、それをどのように変換するかという、
値の生成と変換の組み合わせとして整理できます。

この視点を持つことで、
アニメーションの設計はより明確になります。

本書が、その理解を深めるきっかけになれば嬉しいです。