import fs from 'fs'
import { compileTemplate } from '@vue/compiler-sfc';

/** @type {import('vite').Plugin} */
export default function hexLoader() {

  return {
    name: 'svg-component',
    transform(_code: string, id: string) {
      const [path, query] = id.split('?');
      if (!path.endsWith(".svg") || query != 'svg-component')
          return _code;

      const text = fs.readFileSync(path, "utf-8");
      const parsedText = text
        .replace(/"#[0-9A-Za-z]+"/g, '"currentColor"')
        .replace(/"white"/g, '"currentColor"')
        .replace(/"black"/g, '"currentColor"')
        .replace(/fill-opacity=".+?"/g, "")
        .trim()

      let { code } = compileTemplate({
        id: path,
        source: parsedText,
        transformAssetUrls: false,
        filename: path
      })

      code = code.replace('export function render', 'function render');
      code += `\nexport default { render };`;

      return code
    }
  }
};
