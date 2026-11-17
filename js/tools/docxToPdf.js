/**
 * Ferramenta: Conversor de DOCX para PDF (Word para PDF)
 * Processamento 100% no navegador via docx-preview e html2pdf.js
 */
import { readFileAsArrayBuffer, downloadBlob, formatBytes, notify, setLoading } from '../utils.js';
import { t } from '../i18n.js';

export class DocxToPdfTool {
  constructor() {
    this.file = null;
    this.arrayBuffer = null;
    this.container = document.getElementById('tool-workspace');
    this.orientation = 'portrait';
    this.margin = 'standard'; // standard | narrow | wide
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <i data-lucide="file-type" class="w-7 h-7 text-blue-600"></i>
              ${t('docxToPdfTitle')}
            </h2>
            <p class="text-sm text-slate-500 mt-1">${t('docxToPdfSubtitle')}</p>
          </div>
          <button id="btn-convert-docx-action" disabled class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-slate-950/20 transition">
            <i data-lucide="download" class="w-4 h-4 text-emerald-400"></i>
            <span>${t('btnConvertDocx')}</span>
          </button>
        </div>

        <!-- Dropzone Section -->
        <div id="dropzone-section">
          <div id="dropzone" class="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-3xl p-12 text-center cursor-pointer transition bg-white group shadow-xs">
            <input type="file" id="file-input" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" class="hidden" />
            <div class="flex flex-col items-center justify-center space-y-3">
              <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition duration-200">
                <i data-lucide="file-text" class="w-8 h-8"></i>
              </div>
              <div>
                <p class="text-base font-bold text-slate-800">${t('docxDropText')}</p>
                <p class="text-xs text-slate-400 mt-1">${t('docxDropSub')}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Workspace Section (Hidden until file is loaded) -->
        <div id="docx-workspace" class="hidden space-y-6">
          
          <!-- File info card & Controls -->
          <div class="bg-white p-4 sm:p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                DOCX
              </div>
              <div>
                <h4 id="docx-filename" class="text-sm font-bold text-slate-900 truncate max-w-xs">documento.docx</h4>
                <p id="docx-filesize" class="text-xs text-slate-400">0 KB</p>
              </div>
            </div>

            <!-- Page Orientation & Margin -->
            <div class="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <div class="flex items-center gap-1.5">
                <span class="text-slate-500">${t('docxOrientation')}</span>
                <select id="select-docx-orientation" class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold">
                  <option value="portrait" selected>${t('imgPortrait')}</option>
                  <option value="landscape">${t('imgLandscape')}</option>
                </select>
              </div>

              <div class="flex items-center gap-1.5">
                <span class="text-slate-500">${t('docxMargin')}</span>
                <select id="select-docx-margin" class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold">
                  <option value="standard" selected>${t('docxStandard')}</option>
                  <option value="narrow">${t('docxNarrow')}</option>
                  <option value="wide">${t('docxWide')}</option>
                </select>
              </div>

              <button id="btn-change-docx" class="text-xs text-slate-500 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition ml-2">
                ${t('btnChangeFile')}
              </button>
            </div>
          </div>

          <!-- Document Rendered Preview Container -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>${t('docxPreviewTitle')}</span>
              <span>${t('docxLocalBadge')}</span>
            </div>

            <div class="bg-slate-200/90 rounded-3xl p-6 sm:p-10 max-h-[70vh] overflow-auto flex justify-center shadow-inner">
              <!-- Render container for docx-preview -->
              <div id="docx-render-container" class="bg-white shadow-2xl rounded p-8 sm:p-12 max-w-3xl w-full text-slate-900 leading-relaxed text-sm">
                <!-- Injected by docx-preview -->
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
    const convertBtn = document.getElementById('btn-convert-docx-action');
    const changeBtn = document.getElementById('btn-change-docx');
    const selectOrient = document.getElementById('select-docx-orientation');
    const selectMargin = document.getElementById('select-docx-margin');

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
      document.getElementById('dropzone-section').classList.remove('hidden');
      document.getElementById('docx-workspace').classList.add('hidden');
      convertBtn.disabled = true;
    });

    selectOrient?.addEventListener('change', (e) => {
      this.orientation = e.target.value;
    });

    selectMargin?.addEventListener('change', (e) => {
      this.margin = e.target.value;
    });

    convertBtn?.addEventListener('click', () => this.executeConvert());
  }

  async loadFile(file) {
    if (!file.name.toLowerCase().endsWith('.docx')) {
      notify('Por favor, selecione um arquivo no formato Word (.docx).', 'warning');
      return;
    }

    setLoading(true, 'Renderizando documento Word (.docx)...');
    try {
      this.file = file;
      this.arrayBuffer = await readFileAsArrayBuffer(file);

      document.getElementById('docx-filename').textContent = file.name;
      document.getElementById('docx-filesize').textContent = formatBytes(file.size);

      const renderContainer = document.getElementById('docx-render-container');
      renderContainer.innerHTML = '';

      // Use docx-preview to render full document structure
      if (window.docx) {
        await window.docx.renderAsync(this.arrayBuffer, renderContainer, null, {
          className: "docx-preview-content",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true
        });
      } else {
        throw new Error('Biblioteca docx-preview não carregada.');
      }

      document.getElementById('dropzone-section').classList.add('hidden');
      document.getElementById('docx-workspace').classList.remove('hidden');
      document.getElementById('btn-convert-docx-action').disabled = false;

      notify('Documento Word carregado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao ler DOCX: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  async executeConvert() {
    if (!this.file) return;

    setLoading(true, 'Gerando arquivo PDF a partir do Word...');
    try {
      const renderContainer = document.getElementById('docx-render-container');
      const baseName = this.file.name.replace(/\.docx$/i, '');

      // Margin in millimeters
      const marginsMap = {
        narrow: [6, 6, 6, 6],
        standard: [12, 12, 12, 12],
        wide: [20, 20, 20, 20]
      };
      const marginMm = marginsMap[this.margin] || [12, 12, 12, 12];

      if (!window.html2pdf) {
        throw new Error('Biblioteca html2pdf não encontrada.');
      }

      const opt = {
        margin: marginMm,
        filename: `${baseName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: this.orientation
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await window.html2pdf().set(opt).from(renderContainer).save();

      notify('PDF gerado e descarregado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao converter para PDF: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }
}
