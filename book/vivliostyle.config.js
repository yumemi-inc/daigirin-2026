module.exports = {
  title: "ゆめみより '26",
  author: 'ゆめみより製作委員会',
  language: 'ja',
  size: 'A5',
  theme: [
    'vivliostyle-theme-macneko-techbook@0.5.0',
    '@mitsuharu/vivliostyle-theme-noto-sans-jp@0.1.4',
    'theme/theme-custom',
  ],
  entry: [
    // 目次
    'index.md',
    // はじめに
    'preface.md',

    // 各章の原稿
    // Web3 / ブロックチェーン
    'solana-nft-complete-guide.md',
    'solana-swap-complete-guide.md',
    'solana-anchor.md',

    // 生成AI / AI活用
    'kishimoto01.md',
    'kishimoto02.md',
    'kishimoto03.md',
    'yuuuka01.md',
    'yuuuka02.md',
    'ad_motsu.md',

    // 開発基盤・設計
    'emoto.md',
    'k_kojima.md',
    'usami-jj.md',

    // セキュリティ
    'kitaji0306-secops.md',

    // モバイル / クライアント
    'yuki.md',
    'akatsuki174.md',
    'harutiro.md',
    'yokota.md',
    'kawashima.md',

    // 著者紹介
    'authors.md',
    // 奥付
    'colophon.md',
  ],
  entryContext: './manuscripts',
  output: ['output/ebook.pdf'],
  workspaceDir: '.vivliostyle',
  toc: false,
  cover: undefined,
}
