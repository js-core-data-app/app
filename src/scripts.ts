import * as fs from 'fs';
import * as path from 'path';

import { createNappJSModule, NappJSModule } from './model';
import { getPluginsPaths } from './plugins';

export const loadScripts = () => {
  console.log("searching for scripts...");

  const scriptsPath = path.resolve(process.env.SCRIPTS_PATH || "./scripts");

  let scripts: NappJSModule[] = []
  let pluginPaths = getPluginsPaths()
  let paths = pluginPaths.map<{plugin: string | null, path: string}>(p => {
    return {
      plugin: path.basename(p),
      path: path.join(p,'scripts')
    }
  }).concat([{plugin: null,path:scriptsPath}])

  for(let p of paths) {
    if (fs.existsSync(p.path)) {
      for(let filename of fs.readdirSync(p.path)) {
        if (path.extname(filename) === '.js'){
          let name = (p.plugin ? `${p.plugin}/` : '') + path.basename(filename).replace('.js','')
          scripts.push(createNappJSModule(name,path.join(p.path,filename)))
        }
      }
    }
  }

  if (scripts.length === 0) {
    console.log("no scripts found");
  } else {
    console.log("scripts found:", scripts.map(x => x.name).join(', '));
  }

  return scripts
}