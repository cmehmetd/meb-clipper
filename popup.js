const convertButton = document.querySelector('#convert');
const downloadButton = document.querySelector('#download');
const markdownField = document.querySelector('#markdown');
const filenameField = document.querySelector('#filename');
const includeImagesField = document.querySelector('#includeImages');
const status = document.querySelector('#status');
const wordCount = document.querySelector('#wordCount');

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function updateWordCount() {
  const words = markdownField.value.trim().match(/\S+/g)?.length ?? 0;
  wordCount.textContent = words ? `${words.toLocaleString('tr-TR')} kelime` : 'Henüz içerik yok';
  downloadButton.disabled = !markdownField.value.trim();
}

function safeFilename(value) {
  const name = value.trim().replace(/\.md$/i, '').replace(/[\\/:*?"<>|]/g, '-').slice(0, 100) || 'sayfa';
  return `${name}.md`;
}

function suggestedFilename(title) {
  return safeFilename(title.toLocaleLowerCase('tr-TR').replace(/\s+/g, '-'));
}

async function getCurrentPageMarkdown(includeImages) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('Açık sekme bulunamadı.');

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (shouldIncludeImages) => {
      const ignored = 'script, style, noscript, template, svg, canvas, iframe, nav, footer, aside, form, button, input, select, textarea, dialog, [role="navigation"], [role="contentinfo"], .navbar, .nav, .footer, #navbar, #nav, #footer, [aria-hidden="true"], [hidden]';
      const root = (document.querySelector('article, main, [role="main"]') || document.body).cloneNode(true);
      root.querySelectorAll(ignored).forEach((node) => node.remove());

      const absoluteUrl = (value) => {
        try { return new URL(value, document.baseURI).href; } catch { return ''; }
      };
      const clean = (value) => value.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
      const escapeText = (value) => value.replace(/([\\`*_{}\[\]<>()#+.!|])/g, '\\$1');
      const convert = (node) => {
        if (node.nodeType === Node.TEXT_NODE) return escapeText(node.nodeValue || '');
        if (node.nodeType !== Node.ELEMENT_NODE) return '';
        const tag = node.tagName.toLowerCase();
        const children = [...node.childNodes].map(convert).join('');
        if (/^h[1-6]$/.test(tag)) return `\n\n${'#'.repeat(Number(tag[1]))} ${clean(children)}\n\n`;
        if (tag === 'p' || tag === 'div' || tag === 'section' || tag === 'header' || tag === 'article') return `\n\n${clean(children)}\n\n`;
        if (tag === 'br') return '\n';
        if (tag === 'strong' || tag === 'b') return `**${clean(children)}**`;
        if (tag === 'em' || tag === 'i') return `*${clean(children)}*`;
        if (tag === 'code' && node.parentElement?.tagName.toLowerCase() !== 'pre') return `\`${clean(node.textContent || '').replace(/`/g, '\\`')}\``;
        if (tag === 'pre') return `\n\n\`\`\`\n${(node.textContent || '').trim()}\n\`\`\`\n\n`;
        if (tag === 'a') { const href = absoluteUrl(node.getAttribute('href') || ''); return href ? `[${clean(children) || href}](${href})` : children; }
        if (tag === 'img') { if (!shouldIncludeImages) return ''; const src = absoluteUrl(node.currentSrc || node.getAttribute('src') || ''); return src ? `![${node.getAttribute('alt') || ''}](${src})` : ''; }
        if (tag === 'li') return `\n- ${clean(children)}`;
        if (tag === 'ul' || tag === 'ol') return `\n${children}\n`;
        if (tag === 'blockquote') return `\n\n> ${clean(children).replace(/\n/g, '\n> ')}\n\n`;
        if (tag === 'hr') return '\n\n---\n\n';
        if (tag === 'table') return `\n\n${clean(node.innerText || '')}\n\n`;
        return children;
      };
      const content = clean(convert(root));
      const title = document.title.trim() || 'Sayfa';
      return { title, markdown: `# ${title}\n\nKaynak: ${location.href}\n\n${content}`.trim() + '\n' };
    },
    args: [includeImages]
  });
  return result;
}

convertButton.addEventListener('click', async () => {
  convertButton.disabled = true;
  setStatus('Sayfa cihazınızda dönüştürülüyor…');
  try {
    const page = await getCurrentPageMarkdown(includeImagesField.checked);
    markdownField.value = page.markdown;
    filenameField.value = suggestedFilename(page.title);
    updateWordCount();
    setStatus('Hazır. İndirmeden önce metni düzenleyebilirsiniz.');
    markdownField.focus();
  } catch (error) {
    setStatus(`Dönüştürülemedi: ${error.message}`, true);
  } finally {
    convertButton.disabled = false;
  }
});

downloadButton.addEventListener('click', async () => {
  const content = markdownField.value;
  if (!content.trim()) return;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }));
  try {
    await chrome.downloads.download({ url, filename: safeFilename(filenameField.value), saveAs: true });
    setStatus('Markdown dosyası indirilmeye gönderildi.');
  } catch (error) {
    setStatus(`İndirme başlatılamadı: ${error.message}`, true);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
});

markdownField.addEventListener('input', updateWordCount);
filenameField.addEventListener('blur', () => { filenameField.value = safeFilename(filenameField.value); });
