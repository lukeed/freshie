import * as log from './log';
import * as fs from './fs';

export const ok = (mix: unknown, msg: string) => !!mix || log.error(msg);
export const exists = (file: string, msg: string) =>  fs.exists(file) || log.error(msg);
