/**
 * Ferramenta: PDF em Preto e Branco (Escala de Cinza / Grayscale)
 * Processamento 100% no cliente via Canvas e PDF-Lib
 * Desenvolvido pelo LaBiOmicS
 */
import { readFileAsArrayBuffer, downloadBlob, formatBytes, notify, setLoading } from '../utils.js';
import { t } from '../i18n.js';

export class GrayscalePdfTool {
  constructor() {
    this.file = null;
    this.arrayBuffer = null;
    this.pdfDoc = null;
    this.totalPages = 0;
    this.resolutionDpi = 150; // 150 or 200
    this.contrastMode = 'standard'; // standard | high
    this.container = document.getElementById('tool-workspace');
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <i data-lucide="contrast" class="w-7 h-7 text-zinc-700"></i>
              ${t('grayscalePdfTitle')}
            </h2>
            <p class="text-sm text-slate-500 mt-1">${t('grayscalePdfSubtitle')}</p>
          </div>
          <button id="btn-convert-grayscale-action" disabled class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-slate-950/20 transition">
            <i data-lucide="download" class="w-4 h-4 text-emerald-400"></i>
            <span>${t('btnConvertGrayscale')}</span>
          </button>
        </div>

        <!-- Dropzone Section -->
        <div id="dropzone-section">
          <div id="dropzone" class="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-3xl p-12 text-center cursor-pointer transition bg-white group shadow-xs">
            <input type="file" id="file-input" accept=".pdf" class="hidden" />
            <div class="flex flex-col items-center justify-center space-y-3">
              <div class="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center group-hover:scale-105 transition duration-200">
                <i data-lucide="contrast" class="w-8 h-8"></i>
              </div>
              <div>
                <p class="text-base font-bold text-slate-800">${t('grayscaleDropTitle')}</p>
                <p class="text-xs text-slate-400 mt-1">${t('grayscaleDropSub')}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Workspace Section (Hidden until file is loaded) -->
        <div id="grayscale-workspace" class="hidden space-y-6">
          
          <!-- File info card & Controls -->
          <div class="bg-white p-4 sm:p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center font-bold text-xs">
                B&W
              </div>
              <div>
                <h4 id="grayscale-filename" class="text-sm font-bold text-slate-900 truncate max-w-xs">documento.pdf</h4>
                <p id="grayscale-info" class="text-xs text-slate-500 mt-0.5">0 páginas • 0 KB</p>
              </div>
            </div>

            <!-- Resolution and Contrast Mode -->
            <div class="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <div class="flex items-center gap-1.5">
                <span class="text-slate-500">${t('imgResolutionLabel')}:</span>
                <select id="select-grayscale-dpi" class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold">
                  <option value="150" selected>${t('resNormal')}</option>
                  <option value="200">${t('resHigh')}</option>
                </select>
              </div>

              <div class="flex items-center gap-1.5">
                <span class="text-slate-500">${t('grayModeLabel')}:</span>
                <select id="select-grayscale-mode" class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold">
                  <option value="standard" selected>${t('grayModeStandard')}</option>
                  <option value="high">${t('grayModeContrast')}</option>
                </select>
              </div>

              <button id="btn-change-grayscale-file" class="text-xs text-slate-500 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition ml-2">
                ${t('btnChangeFile')}
              </button>
            </div>
          </div>

          <!-- Live Sample Preview (Page 1) -->
          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div class="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
              <span class="font-bold text-slate-700 flex items-center gap-1.5">
                <i data-lucide="eye" class="w-4 h-4 text-zinc-700"></i>
                ${t('grayPreviewSampleTitle')}
              </span>
              <span class="text-slate-400">${t('docxLocalBadge')}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              <!-- Original Side -->
              <div class="space-y-2 text-center">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">${t('grayOriginalBadge')}</span>
                <div class="bg-slate-100 rounded-2xl p-4 flex justify-center shadow-inner overflow-hidden max-h-[420px]">
                  <canvas id="gray-canvas-original" class="shadow-md rounded max-h-[380px] w-auto max-w-full bg-white"></canvas>
                </div>
              </div>

              <!-- Grayscale Output Side -->
              <div class="space-y-2 text-center">
                <span class="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center justify-center gap-1">
                  <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i>
                  ${t('grayResultBadge')}
                </span>
                <div class="bg-slate-100 rounded-2xl p-4 flex justify-center shadow-inner overflow-hidden max-h-[420px]">
                  <canvas id="gray-canvas-result" class="shadow-md rounded max-h-[380px] w-auto max-w-full bg-white"></canvas>
                </div>
              </div>

            </div>
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
    const changeBtn = document.getElementById('btn-change-grayscale-file');
    const convertBtn = document.getElementById('btn-convert-grayscale-action');
    const selectDpi = document.getElementById('select-grayscale-dpi');
    const selectMode = document.getElementById('select-grayscale-mode');

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
      this.arrayBuffer = null;
      this.pdfDoc = null;
      document.getElementById('dropzone-section').classList.remove('hidden');
      document.getElementById('grayscale-workspace').classList.add('hidden');
      convertBtn.disabled = true;
    });

    selectDpi?.addEventListener('change', (e) => {
      this.resolutionDpi = parseInt(e.target.value, 10);
    });

    selectMode?.addEventListener('change', async (e) => {
      this.contrastMode = e.target.value;
      await this.renderSamplePreview();
    });

    convertBtn?.addEventListener('click', () => this.executeConversion());
  }

  async loadFile(file) {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      notify(t('warnSelectPdf'), 'warning');
      return;
    }

    setLoading(true, t('renderingPreviewNotice'));
    try {
      this.file = file;
      this.arrayBuffer = await readFileAsArrayBuffer(file);
      this.pdfDoc = await window.pdfjsLib.getDocument({ data: new Uint8Array(this.arrayBuffer.slice(0)) }).promise;
      this.totalPages = this.pdfDoc.numPages;

      document.getElementById('grayscale-filename').textContent = file.name;
      document.getElementById('grayscale-info').textContent = `${this.totalPages} ${t('pagesWord')} • ${formatBytes(file.size)}`;

      document.getElementById('dropzone-section').classList.add('hidden');
      document.getElementById('grayscale-workspace').classList.remove('hidden');
      document.getElementById('btn-convert-grayscale-action').disabled = false;

      await this.renderSamplePreview();
      notify(t('fileLoadedSuccess'), 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao carregar PDF: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  async renderSamplePreview() {
    if (!this.pdfDoc) return;
    try {
      const page = await this.pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });

      // Canvas Original
      const origCanvas = document.getElementById('gray-canvas-original');
      origCanvas.width = viewport.width;
      origCanvas.height = viewport.height;
      const origCtx = origCanvas.getContext('2d');
      await page.render({ canvasContext: origCtx, viewport }).promise;

      // Canvas Result (Grayscale)
      const resCanvas = document.getElementById('gray-canvas-result');
      resCanvas.width = viewport.width;
      resCanvas.height = viewport.height;
      const resCtx = resCanvas.getContext('2d');

      // Apply grayscale filter and contrast
      if (this.contrastMode === 'high') {
        resCtx.filter = 'grayscale(100%) contrast(140%) brightness(95%)';
      } else {
        resCtx.filter = 'grayscale(100%)';
      }

      resCtx.drawImage(origCanvas, 0, 0);
      resCtx.filter = 'none'; // reset
    } catch (e) {
      console.error('Error rendering sample preview:', e);
    }
  }

  async executeConversion() {
    if (!this.pdfDoc || !this.file) return;

    setLoading(true, t('convertingGrayscaleNotice', { current: 1, total: this.totalPages }));
    try {
      const scale = this.resolutionDpi / 72; // DPI to scale factor (72 DPI is baseline)
      const newPdf = await window.PDFLib.PDFDocument.create();

      for (let i = 1; i <= this.totalPages; i++) {
        setLoading(true, t('convertingGrayscaleNotice', { current: i, total: this.totalPages }));

        const page = await this.pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });

        // Offscreen canvas for full page rendering
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');

        // Render page
        await page.render({ canvasContext: ctx, viewport }).promise;

        // Grayscale conversion pass
        const grayCanvas = document.createElement('canvas');
        grayCanvas.width = canvas.width;
        grayCanvas.height = canvas.height;
        const grayCtx = grayCanvas.getContext('2d');

        if (this.contrastMode === 'high') {
          grayCtx.filter = 'grayscale(100%) contrast(140%) brightness(95%)';
        } else {
          grayCtx.filter = 'grayscale(100%)';
        }

        grayCtx.drawImage(canvas, 0, 0);

        // Convert to JPEG image buffer
        const jpegDataUrl = grayCanvas.toDataURL('image/jpeg', 0.88);
        const embeddedImg = await newPdf.embedJpg(jpegDataUrl);

        // Native PDF dimensions (points)
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const newPage = newPdf.addPage([unscaledViewport.width, unscaledViewport.height]);

        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: unscaledViewport.width,
          height: unscaledViewport.height
        });
      }

      const pdfBytes = await newPdf.save();
      const baseName = this.file.name.replace(/\.pdf$/i, '');
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `${baseName}-preto-e-branco.pdf`);

      notify(t('grayscaleSuccess'), 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao gerar PDF em tons de cinza: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }
}
