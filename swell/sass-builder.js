/* eslint no-console: 0 */
// console.log('start sass-builder.js ...');

const path = require('path');
const fs = require('fs');

// glob
const glob = require('glob');

// dart-sass（sass）。node-sass と違いネイティブバイナリを持たないため、Node のバージョンに依存しない。
const sass = require('sass');
const globImporter = require('node-sass-glob-importer');

// postcss
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const mqpacker = require('css-mqpacker');

// consoleの色付け
const COLOR = {
	red: '\u001b[31m',
	green: '\u001b[32m',
	reset: '\x1b[0m',
};

// 環境変数・引数
const envTYPE = process.env.TYPE || '';
const TARGET_DIR = process.argv[2] || '';

// 書き出し処理
const writeCSS = (filePath, css) => {
	const dir = path.dirname(filePath);

	// ディレクトリがなければ作成
	if (!fs.existsSync(dir)) {
		console.log('mkdir ' + dir);
		fs.mkdirSync(dir, { recursive: true });
	}

	// css書き出し
	// console.log('Wrote CSS to ' + filePath);
	fs.writeFileSync(filePath, css);
};

function sassRender(srcPath, distPath) {
	// dart-sass の legacy renderSync API でコンパイルする。
	// node-sass と異なり、dart-sass は renderSync でも importer（glob import の解決）を利用できる。
	const sassResult = sass.renderSync({
		file: srcPath,
		outputStyle: 'compressed',
		importer: globImporter(),
		// 既知の deprecation 警告を抑制する（いずれも Dart Sass 3.0 までは動作するため、対応は別途行う）。
		// - import          : @import の @use/@forward 移行（SCSS 全体の改修が必要）
		// - legacy-js-api   : このスクリプトを modern compile API へ移行すれば解消できる
		// - color-functions / global-builtin : darken() 等を color.* / math.* 関数へ移行
		// ここに列挙しない新規の deprecation や本物のエラーは引き続き表示される。
		silenceDeprecations: ['import', 'legacy-js-api', 'color-functions', 'global-builtin'],
	});
	const css = sassResult.css.toString();

	// postcss実行
	return postcss([autoprefixer, mqpacker, cssnano])
		.process(css, { from: undefined })
		.then((postcssResult) => {
			writeCSS(distPath, postcssResult.css);
			// if (postcssResult.map) {fs.writeFile('dest/app.css.map', postcssResult.map.toString(), () => true);}
			return COLOR.green + 'Completed.';
		});
}

(async () => {
	// パス
	let src = 'src/scss';
	let dist = 'build/css';
	const ignore = ['**/_*.scss'];
	let files = [];

	// const targets = null;
	// if ('blocks' === envTYPE) {
	// 	src = 'src/gutenberg/blocks';
	// 	dist = 'build/blocks';
	// }

	if ('main' === envTYPE) {
		files = [
			src + '/main.scss',
			src + '/blocks.scss',
			src + '/editor/gutenberg.scss',
			src + '/editor/editor_style.scss',
		];
		// ignore = ['**/_*.scss', '**/modules/**', '**/plugins/**', '**/admin/**'];
	} else {
		if ('' !== TARGET_DIR) {
			src += '/' + TARGET_DIR;
			dist += '/' + TARGET_DIR;
		}
		files = glob.sync(src + '/**/*.scss', { ignore });
	}

	for (const filePath of files) {
		console.log(COLOR.green + 'Start sassRender: ' + COLOR.reset + filePath);

		const fileName = filePath.replace(src + '/', '');
		const srcPath = path.resolve(__dirname, src, fileName);
		const distPath = path.resolve(__dirname, dist, fileName).replace('.scss', '.css');

		/* eslint no-unused-vars:0 */
		const result = await sassRender(srcPath, distPath);
		// console.log(result);
	}
})();
