import { renderChat } from './chat.js';
import { renderContext } from './context.js';
import { renderHome } from './home.js';
import { renderWork } from './work.js';

const VIEWS = Object.freeze({
  home: renderHome,
  chat: renderChat,
  work: renderWork,
  context: renderContext,
});

export function renderView(state, actions) {
  return (VIEWS[state.view] || renderHome)(state, actions);
}
