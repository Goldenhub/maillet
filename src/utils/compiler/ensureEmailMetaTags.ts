const EMAIL_META_TAGS: Array<Record<string, string>> = [
  { name: 'charset', content: 'utf-8' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
  { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
  { name: 'x-apple-disable-message-reformatting', content: '' },
  { name: 'format-detection', content: 'telephone=no,address=no,email=no,date=no,url=no' },
];

export function ensureEmailMetaTags(doc: Document): Document {
  let head = doc.head;
  if (!head) {
    const htmlEl = doc.documentElement;
    head = doc.createElement('head');
    htmlEl.insertBefore(head, htmlEl.firstChild || null);
  }

  EMAIL_META_TAGS.forEach((metaConfig) => {
    const name = metaConfig.name;
    const httpEquiv = metaConfig['http-equiv'];

    let existing: Element | null = null;
    if (name === 'charset') {
      existing = head!.querySelector('meta[charset]');
    } else if (httpEquiv) {
      existing = head!.querySelector(`meta[http-equiv="${httpEquiv}"]`);
    } else if (name) {
      existing = head!.querySelector(`meta[name="${name}"]`);
    }

    if (!existing) {
      const meta = doc.createElement('meta');
      if (name === 'charset') {
        meta.setAttribute('charset', 'utf-8');
      } else {
        Object.entries(metaConfig).forEach(([key, value]) => {
          if (value) meta.setAttribute(key, value);
        });
      }
      head!.appendChild(meta);
    }
  });

  return doc;
}
