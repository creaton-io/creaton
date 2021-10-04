import resolveURL from 'resolve-url';
import { devDependencies } from '../../package.json';

/*
 * Default options for browser environment
 */
export default {
  corePath: process.env.NODE_ENV === 'development'
    ? resolveURL('/node_modules/@ffmpeg/core/dist/ffmpeg-core.js')
    : `https://unpkg.com/@ffmpeg/core@${devDependencies['@ffmpeg/core'].substring(1)}/dist/ffmpeg-core.js`,
};
