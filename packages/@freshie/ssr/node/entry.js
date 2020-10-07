import { start } from '@freshie/ssr.node';
import { render } from '~render'; // TODO: alias

const { PORT=3000 } = process.env;

start({ render, port: PORT });
