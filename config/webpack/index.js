const env = process.env.ENV || 'dev';
import config from `./webpack-${env}.js`;

export default config;
