/**
 * Ferramenta: Extrair Texto do PDF (PDF para Texto / TXT)
 * Processamento 100% no cliente via PDF.js
 * Desenvolvido pelo LaBiOmicS
 */
import { readFileAsArrayBuffer, downloadBlob, formatBytes, notify, setLoading } from '../utils.js';
import { t } from '../i18n.js';

export class PdfToTextTool {
  constructor() {
    this.file = null;
    this.pdfDoc = null;
    this.totalPages = 0;
    this.pagesText = []; // Array of strings per page
    this.fullText = '';
    this.includePageMarkers = true;
    this.container = document.getElementById('tool-workspace');
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <i data-lucide="file-text" class="w-7 h-7 text-teal-600"></i>
              ${t('pdfToTextTitle')}
            </h2>
            <p class="text-sm text-slate-500 mt-1">${t('pdfToTextSubtitle')}</p>
          </div>
          <div id="text-top-actions" class="hidden flex items-center gap-2">
            <button id="btn-copy-extracted-text" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition">
              <i data-lucide="copy" class="w-4 h-4 text-slate-600"></i>
              <span id="copy-btn-label">${t('btnCopyText')}</span>
            </button>
            <button id="btn-download-txt-file" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-lg shadow-slate-950/20 transition">
              <i data-lucide="download" class="w-4 h-4 text-emerald-400"></i>
              <span>${t('btnDownloadTxt')}</span>
            </button>
          </div>
        </div>

        <!-- Dropzone Section -->
        <div id="dropzone-section">
          <div id="dropzone" class="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-3xl p-12 text-center cursor-pointer transition bg-white group shadow-xs">
            <input type="file" id="file-input" accept=".pdf" class="hidden" />
            <div class="flex flex-col items-center justify-center space-y-3">
              <div class="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition duration-200">
                <i data-lucide="file-text" class="w-8 h-8"></i>
              </div>
              <div>
                <p class="text-base font-bold text-slate-800">${t('textDropTitle')}</p>
                <p class="text-xs text-slate-400 mt-1">${t('textDropSub')}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Workspace Section (Hidden until file is loaded) -->
        <div id="text-workspace" class="hidden space-y-5">
          
          <!-- Statistics Card -->
          <div class="bg-white p-4 sm:p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                TXT
              </div>
              <div>
                <h4 id="text-filename" class="text-sm font-bold text-slate-900 truncate max-w-xs">documento.pdf</h4>
                <p id="text-stats-summary" class="text-xs text-slate-500 mt-0.5">0 páginas • 0 palavras • 0 caracteres</p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-4 text-xs">
              <label class="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                <input type="checkbox" id="chk-page-markers" checked class="rounded text-teal-600 focus:ring-teal-500">
                <span>${t('chkIncludeMarkers')}</span>
              </label>

              <button id="btn-change-text-file" class="text-xs text-slate-500 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                ${t('btnChangeFile')}
              </button>
            </div>
          </div>

          <!-- Text Preview Card -->
          <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <span class="font-bold text-slate-700 flex items-center gap-1.5">
                <i data-lucide="align-left" class="w-4 h-4 text-teal-600"></i>
                ${t('extractedTextPreview')}
              </span>
              <span class="text-slate-400">${t('docxLocalBadge')}</span>
            </div>

            <textarea id="extracted-text-area" rows="18" class="w-full p-4 bg-slate-50/80 border border-slate-200 rounded-2xl font-mono text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-teal-600 focus:bg-white resize-y transition" placeholder="${t('textPlaceholder')}"></textarea>
          </div>

        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.bindEvents();
  }

  bindEvents() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const changeBtn = document.getElementById('btn-change-text-file');
    const copyBtn = document.getElementById('btn-copy-extracted-text');
    const downloadBtn = document.getElementById('btn-download-txt-file');
    const chkMarkers = document.getElementById('chk-page-markers');

    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) await this.loadFile(file);
      fileInput.value = '';
    });

    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add('dropzone-active');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dropzone-active');
      });
    });

    dropzone.addEventListener('drop', async (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await this.loadFile(e.dataTransfer.files[0]);
      }
    });

    changeBtn?.addEventListener('click', () => {
      this.file = null;
      this.pdfDoc = null;
      this.pagesText = [];
      this.fullText = '';
      document.getElementById('dropzone-section').classList.remove('hidden');
      document.getElementById('text-workspace').classList.add('hidden');
      document.getElementById('text-top-actions').classList.add('hidden');
    });

    chkMarkers?.addEventListener('change', (e) => {
      this.includePageMarkers = e.target.checked;
      this.updateRenderedText();
    });

    copyBtn?.addEventListener('click', async () => {
      const text = document.getElementById('extracted-text-area').value;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const label = document.getElementById('copy-btn-label');
        const originalText = label.textContent;
        label.textContent = t('copiedNotice');
        notify(t('copiedSuccess'), 'success');
        setTimeout(() => {
          label.textContent = originalText;
        }, 2500);
      } catch (err) {
        console.error(err);
        notify(t('copyFailed'), 'error');
      }
    });

    downloadBtn?.addEventListener('click', () => {
      const text = document.getElementById('extracted-text-area').value;
      if (!text || !this.file) return;
      const baseName = this.file.name.replace(/\.pdf$/i, '');
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      downloadBlob(blob, `${baseName}-texto.txt`);
      notify(t('txtDownloadedSuccess'), 'success');
    });
  }

  async loadFile(file) {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      notify(t('warnSelectPdf'), 'warning');
      return;
    }

    setLoading(true, t('extractingTextNotice'));
    try {
      this.file = file;
      const arrayBuffer = await readFileAsArrayBuffer(file);
      this.pdfDoc = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      this.totalPages = this.pdfDoc.numPages;

      this.pagesText = [];

      // Extract text page by page
      for (let i = 1; i <= this.totalPages; i++) {
        const page = await this.pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        
        let lastY = null;
        let pageStr = '';

        for (const item of textContent.items) {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 8) {
            pageStr += '\n';
          } else if (pageStr.length > 0 && !pageStr.endsWith(' ') && !pageStr.endsWith('\n')) {
            pageStr += ' ';
          }
          pageStr += item.str;
          lastY = item.transform[5];
        }

        this.pagesText.push(pageStr.trim());
      }

      document.getElementById('text-filename').textContent = file.name;
      document.getElementById('dropzone-section').classList.add('hidden');
      document.getElementById('text-workspace').classList.remove('hidden');
      document.getElementById('text-top-actions').classList.remove('hidden');

      this.updateRenderedText();
      notify(t('textExtractSuccess'), 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao extrair texto: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  updateRenderedText() {
    let combined = '';
    for (let i = 0; i < this.pagesText.length; i++) {
      const pageNum = i + 1;
      const content = this.pagesText[i];
      if (this.includePageMarkers) {
        combined += `--- ${t('pageMarkerLabel', { current: pageNum, total: this.totalPages })} ---\n\n`;
      }
      combined += content + '\n\n';
    }

    const area = document.getElementById('extracted-text-area');
    if (area) area.value = combined.trim();

    // Stats calculation
    const rawNoMarkers = this.pagesText.join(' ');
    const charCount = rawNoMarkers.length;
    const wordCount = rawNoMarkers.trim() ? rawNoMarkers.trim().split(/\s+/).length : 0;

    const statsEl = document.getElementById('text-stats-summary');
    if (statsEl) {
      statsEl.textContent = `${this.totalPages} ${t('pagesWord')} • ${wordCount.toLocaleString()} ${t('wordsWord')} • ${charCount.toLocaleString()} ${t('charactersWord')}`;
    }
  }
}
