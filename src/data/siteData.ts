export const salon = {
  name: 'Lab Hair Design',
  kana: 'ラボヘアデザイン',
  instagramUrl: 'https://www.instagram.com/lab.hair.design?igsh=ZmRndGE5YzlubzZi&utm_source=qr',
  hotpepperUrl: 'https://beauty.hotpepper.jp/slnH000286767/',
  bookingUrl: 'https://beauty.hotpepper.jp/CSP/bt/reserve/?storeId=H000286767',
  telPageUrl: 'https://beauty.hotpepper.jp/slnH000286767/tel/',
  address: '静岡県静岡市葵区伝馬町9-10',
  accessSummary: '新静岡駅・静岡駅の両駅から徒歩圏内。予約と来店前の確認は Hot Pepper Beauty から可能です。',
  accessGuide: [
    '新静岡駅をご利用の方は、伝馬町通り方面へ進み、伝馬町エリアの商業通り沿いを目印にお越しください。',
    '静岡駅をご利用の方は、駅前エリアから新静岡駅方面へ向かうルートがわかりやすく、伝馬町通りへのアクセスがスムーズです。',
  ],
  hours: '木・金 10:00〜21:00 / 月・火・水 10:00〜20:00 / 土日祝 10:00〜19:00',
  lastReception: '木・金 最終受付20:00 / 月・火・水 最終受付19:00 / 土日祝 最終受付18:00',
  closed: '第1・第3火曜定休、その他時期により不定休あり',
  stationAccess: '新静岡駅・静岡駅から徒歩圏内',
  parking: '近隣コインパーキングあり',
  payment: 'Visa / Mastercard / JCB / American Express / Diners Club',
  cutPrice: '¥5,800〜',
  seats: 'セット面4席',
  staffCount: 'スタイリスト1人 / アシスタント1人',
  rating: '4.89',
  reviewCount: '55件',
  lead: '全席半個室サロン。再現性と質感にこだわった style 人気No.1 の髪質改善カラー&トリートメント、メンズも歓迎。',
  intro:
    '【平日20時までの営業で仕事帰りにも◎当日18時以降の予約はお電話で受付中】丁寧なカウンセリングで理想のスタイルや好みを共有し、質感にこだわった技術で一人ひとりに合わせたスタイルを提案します。',
  features: [
    '全席半個室',
    '夜19時以降も受付OK',
    '最寄り駅から徒歩圏内',
    '完全予約制',
    'メンズ歓迎',
  ],
};

export const staffMembers = [
  {
    slug: 'kei',
    name: 'kei',
    kana: 'ケイ',
    role: 'オーナースタイリスト',
    history: '歴25年',
    profile: '丁寧なカウンセリングと再現性の高いデザイン提案を大切にしています。',
    image: 'https://lab-hair-design.com/wp-content/uploads/2026/07/IMG_6119.jpg',
  },
] as const;

export const styleCategories = ['Color', 'Bob', 'Layer', 'Medium', 'Design', 'Inner Color'] as const;

export const hairStyles = [
  {
    slug: 'deep-purple',
    title: '＊艶カラー＊ディープパープル',
    stylist: 'Lab',
    category: 'Color',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'chocolate-color',
    title: '艶々チョコレートカラー',
    stylist: 'Lab',
    category: 'Color',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'lavender-purple',
    title: '上品な色気溢れるラベンダーパープル',
    stylist: 'Lab',
    category: 'Color',
    image: 'https://images.unsplash.com/photo-1523263685509-57c1d050d19b?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'blue-black-kubire',
    title: 'ブルーブラック/くびれ巻き',
    stylist: 'Lab',
    category: 'Medium',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'bordeaux-bob',
    title: '艶々ボルドーカラー×顎下ボブ',
    stylist: 'Lab',
    category: 'Bob',
    image: 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'white-milktea',
    title: 'ホワイトミルクティー',
    stylist: 'Lab',
    category: 'Color',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'inner-pink',
    title: 'インナーピンク',
    stylist: 'Lab',
    category: 'Inner Color',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'milktea-beige-classic',
    title: '王道ミルクティーベージュ',
    stylist: 'Lab',
    category: 'Color',
    image: 'https://images.unsplash.com/photo-1503951458645-643d53bfd90f?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'tone-bob-endcolor',
    title: 'ハイトーンボブ×オレンジ＆イエローエンドカラー',
    stylist: 'Lab',
    category: 'Bob',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'silver-greige',
    title: 'シルバーグレージュ',
    stylist: 'Lab',
    category: 'Color',
    image: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'jellyfish-design-color',
    title: 'クラゲカット×デザインカラー',
    stylist: 'Lab',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'milktea-beige',
    title: 'ミルクティーベージュ',
    stylist: 'Lab',
    category: 'Color',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
  },
] as const;

export const homeInfo = [
  {
    label: 'Salon Info',
    title: '全席半個室、質感と再現性を大切にするサロン',
    body: 'Hot Pepper Beauty 掲載のサロン情報をもとに、人気No.1の髪質改善カラー&トリートメント、メンズ歓迎、完全予約制の特徴を整理しています。',
    image: 'https://lab-hair-design.com/wp-content/uploads/2026/07/IMG_6119.jpg',
  },
  {
    label: 'Hours',
    title: '木・金は21時まで営業',
    body: '木・金は10:00〜21:00、月・火・水は10:00〜20:00、土日祝は10:00〜19:00。18時以降の予約は電話受付案内あり。',
  },
  {
    label: 'Access',
    title: '新静岡駅・静岡駅から徒歩圏内',
    body: '住所は静岡県静岡市葵区伝馬町9-10として統一し、アクセス・採用ページも同じ表記に揃えています。',
  },
] as const;

export const infoEntries = [
  {
    label: 'Feature',
    title: '全席半個室・完全予約制',
    text: '4席のセット面を備えた半個室サロン。落ち着いた空間で、丁寧なカウンセリングと再現性の高いデザインを提案します。',
  },
  {
    label: 'Reservation',
    title: '平日夜の予約案内',
    text: '木・金は最終受付20:00、月・火・水は最終受付19:00。Hot Pepper Beauty の掲載情報では、当日18時以降の予約は電話受付案内があります。',
  },
  {
    label: 'Payment & Parking',
    title: 'カード決済対応・近隣コインパーキングあり',
    text: 'Visa、Mastercard、JCB、American Express、Diners Club に対応。駐車は近隣コインパーキングの利用案内があります。',
  },
] as const;

export const priceSections = [
  {
    category: 'Cut',
    items: [
      { name: 'カット', price: '¥5,800〜', note: 'シャンプーブロー込み。3Dカットで動きや軽さを表現。' },
      { name: 'スクールカット', price: '¥4,950〜', note: '中学生以下対象。シャンプーブロー込み。' },
      { name: 'フロントカット（前がみカット）', price: '¥2,200', note: '前髪のみ。カット施術から2ヶ月以内は無料。' },
    ],
  },
  {
    category: 'Color',
    items: [
      { name: '根元のみ（白髪リタッチカラー）', price: '¥6,400〜', note: '前回カラーから2ヶ月以内のリタッチ。' },
      { name: 'カラーリング（全体）', price: '¥7,700〜', note: 'シャンプーブロー込み。' },
      { name: 'ブリーチ+ワンカラー', price: '¥18,480〜', note: 'シャンプーブロー込み。' },
    ],
  },
  {
    category: 'Perm',
    items: [
      { name: 'ノーマルパーマ', price: '¥9,240〜', note: 'シャンプーブロー込み。' },
      { name: 'クリープパーマ / 水パーマ', price: '¥10,400〜', note: 'スチームを使い水分を補いながら施術。' },
      { name: '部分パーマ', price: '¥6,930〜', note: '必要な部分にかけるポイントパーマ。' },
      { name: 'ストレートパーマ', price: '¥12,100〜', note: 'パーマ落とし向けのストレート。' },
    ],
  },
  {
    category: 'Straight',
    items: [
      { name: '縮毛矯正', price: '¥16,170〜', note: 'アイロンを使い熱を加えてストレートに。' },
      { name: '根元矯正', price: '¥15,020〜', note: '根元のみ、3ヶ月以内のリタッチ。' },
      { name: '前髪矯正', price: '¥9,240〜', note: '前髪部分のみ。他メニューとセットで割引案内あり。' },
    ],
  },
] as const;

export const priceHighlights = [
  {
    label: 'Coupon',
    title: 'カット+フルカラー+ハホニコTr',
    price: '¥11,000',
    text: '再来向け掲載クーポン。似合わせからトレンドまで希望に合わせて提案。',
  },
  {
    label: 'Coupon',
    title: 'カット+ダメージレスパーマ+贅沢トリートメント',
    price: '¥12,100〜',
    text: '毎日のセットを楽にしたい方向けの掲載メニュー。',
  },
  {
    label: 'Care',
    title: 'ミルボントリートメント',
    price: '¥2,200',
    text: '他メニューとセットで利用できる期間限定の掲載価格。',
  },
] as const;

export const shopCareItems = [
  {
    label: 'Care Menu',
    title: 'ミルボントリートメント',
    price: '¥2,200',
    text: '他メニューとセットで利用可能な掲載ケアメニュー。軽く試したい方向けの入口として紹介されています。',
  },
  {
    label: 'Care Menu',
    title: '贅沢トリートメント',
    price: '¥4,620〜',
    text: '人気のハホニコを使ったスチームトリートメント。つるつるサラサラの質感を目指す方向け。',
  },
  {
    label: 'Care Menu',
    title: 'ハホニコラメラメトリートメント',
    price: '¥5,780〜',
    text: 'シャンプードライ込みで案内されているハホニコの集中ケア。',
  },
  {
    label: 'Care Line',
    title: 'ミルボン マイフォースTr',
    price: '¥12,100〜',
    text: '髪の状態に合わせて理想の質感へ導くケアラインとして掲載されています。',
  },
] as const;

export const photoGallery = [
  {
    slug: 'travel-01',
    title: 'Travel 01',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    caption: '旅先の景色',
  },
  {
    slug: 'travel-02',
    title: 'Travel 02',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    caption: 'ロケーション',
  },
  {
    slug: 'goods-01',
    title: 'Goods 01',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    caption: 'セレクトアイテム',
  },
  {
    slug: 'goods-02',
    title: 'Goods 02',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80',
    caption: 'フォトモック',
  },
  {
    slug: 'street-01',
    title: 'Street 01',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    caption: 'ストリートスナップ',
  },
  {
    slug: 'portrait-01',
    title: 'Portrait 01',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    caption: 'ポートレート',
  },
  {
    slug: 'fashion-01',
    title: 'Fashion 01',
    image: 'https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=900&q=80',
    caption: 'ルックカット',
  },
  {
    slug: 'city-01',
    title: 'City 01',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80',
    caption: 'シティビュー',
  },
  {
    slug: 'detail-01',
    title: 'Detail 01',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80',
    caption: 'ディテールカット',
  },
] as const;

export const accessPage = {
  slug: 'access-default',
  title: 'Access',
  body: '〒422-8067 静岡県静岡市駿河区南町7-9 サウスパラシオン2階\n静岡駅 南口から徒歩3分',
  excerpt: 'Google Maps からアクセスをご確認ください。',
  image: '',
} as const;

export const recruitPage = {
  slug: 'recruit-default',
  title: 'Quiet craft, honest growth.',
  body: '広い世界で感性を磨き、知性を育む。\n私たちは、技術を磨くだけの場所ではありません。個々の成長にどこまでも投資するサロンです。',
  excerpt: '',
  image: '',
} as const;

export const shopPage = {
  slug: 'shop-default',
  title: 'VIETNAM LOCAL BRAND',
  body: 'ベトナムローカルブランド・ファッション\nCOMING SOON\nGOODS ITEMS',
  excerpt: '',
  image: '',
} as const;

export const instagramFeed = [] as const;
