# @freshie/plugin.postcss

## Install

```sh
$ npm install --save-dev postcss @freshie/plugin.postcss
```

***Optional***

> Additional modules that, if installed, `@freshie/plugin.postcss` will attach.

```sh
$ npm install --save-dev autoprefixer cssnano
```

## Preprocessors

> Note: Only `stylus` is supported right now.

Bring your desired preprocessor flavor, if any~!

Simply install the preprocessor itself; for example:

```sh
$ npm install --save-dev stylus
```

In most cases, that's all you need to do – `@freshie/plugin.postcss` will invoke the preprocessor when its extension(s) is/are detected. However, should you need to send the preprocessor some configuration, modify its configuration key within your `freshie.config.js` file; for example:

```js
// freshie.config.js
exports.stylus = {
  // custom options
}
```

***Direct Usage***

If you are using this plugin directly (AKA, you **are not** using freshie), you may define preprocessor configuration via plugin options:

```js
// rollup.config.js
import Postcss from '@freshie/plugin.postcss';

export default {
  // ...
  plugins: [
    Postcss({
      stylus: {
        // custom options
      }
    })
  ]
}
```
