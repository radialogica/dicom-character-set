import path from 'path';
import { readFileSync } from 'fs';
import webpack from 'webpack';
const rootPath = process.cwd();
const pkgPath = path.join(rootPath, "package.json");
const pkg = JSON.parse(readFileSync(new URL(pkgPath, import.meta.url)));

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = ('0' + (today.getMonth() + 1)).slice(-2);
  const date = ('0' + today.getDate()).slice(-2);

  return `${year}-${month}-${date}`;
}

const getBanner = () => {
  return `/*! ${pkg.name} - ${pkg.version} - ` +
         `${getCurrentDate()} ` +
         `| (c) 2018 Radialogica, LLC | ${pkg.homepage} */`
}

export default () => {
  return new webpack.BannerPlugin({
    banner: getBanner(),
    entryOnly: true,
    raw: true
  });
}
