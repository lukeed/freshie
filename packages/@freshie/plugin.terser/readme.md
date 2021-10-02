# @freshie/plugin.terser

## Install

```sh
$ npm install --save-dev @freshie/plugin.terser
```

## Usage

> **Important:** This is only relevant if/when you **are not** using `freshie` – `freshie` projects should ignore this section and it's handled automatically for you.

```js
// rollup.config.js
import { terser } from '@freshie/plugin.terser';

export default {
  // ...
  plugins: [
    terser({
      // see Options
    })
  ]
}
```

## Options

This plugin directly accepts terser's [`minify` options](https://github.com/terser/terser#minify-options). In addition to terser's defaults, this plugin applies these defaults:

* `module` – is `true` when Rollup's output format is `esm` or `es`
* `sourceMap` – is `true` when Rollup's `sourcemap` is enabled, otherwise `false`
* `toplevel` – is always `true` by default


## License

MIT © [Luke Edwards](https://lukeed.com)
