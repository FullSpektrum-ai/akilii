export function h(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'className') element.className = value;
    else if (key === 'text') element.textContent = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.assign(element.dataset, value);
    } else if (key in element && key !== 'role') {
      try { element[key] = value; } catch { element.setAttribute(key, String(value)); }
    } else element.setAttribute(key, String(value));
  }

  const values = Array.isArray(children) ? children : [children];
  for (const child of values.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return element;
}

export function clear(element) {
  element.replaceChildren();
  return element;
}

export function emptyState(title, body) {
  return h('div', { className: 'empty-state' }, [
    h('h2', { text: title }),
    h('p', { text: body }),
  ]);
}

export function sectionHeading(eyebrow, title, description = '') {
  return h('header', { className: 'section-heading' }, [
    h('span', { className: 'eyebrow', text: eyebrow }),
    h('h1', { text: title }),
    description ? h('p', { text: description }) : null,
  ]);
}
