/**
 * Ferramenta: Dividir PDF (Split)
 */
import { readFileAsArrayBuffer, downloadBlob, formatBytes, parsePageRanges, notify, setLoading } from '../utils.js';

export class SplitTool {
  constructor() {
    this.file = null;
    this.pdfDoc = null;
    this.totalPages = 0;
    this.container = document.getElementById('tool-workspace');
    this.mode = 'range'; // 'range' | 'all'
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <i data-lucide="scissors" class="w-7 h-7 text-indigo-600"></i>
              Dividir PDF
            </h2>
            <p class="text-sm text-slate-500 mt-1">Extraia páginas específicas ou separe todas as páginas do seu arquivo.</p>
          </div>
          <button id="btn-split-action" disabled class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-indigo-600/25 transition">
            <i data-lucide="download" class="w-5 h-5"></i>
            <span>Dividir e Baixar</span>
          </button>
        </div>

        <!-- Dropzone or Active File Info -->
        <div id="dropzone-section">
          <div id="dropzone" class="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20 group">
            <input type="file" id="file-input" accept=".pdf" class="hidden" />
            <div class="flex flex-col items-center justify-center space-y-3">
              <div class="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition duration-200">
                <i data-lucide="file-up" class="w-8 h-8"></i>
              </div>
              <div>
                <p class="text-base font-semibold text-slate-700">Selecione o arquivo PDF para dividir</p>
                <p class="text-xs text-slate-400 mt-1">Clique ou arraste um arquivo PDF aqui</p>
              </div>
            </div>
          </div>
        </div>

        <div id="split-options-section" class="hidden space-y-6">
          <!-- File Summary Card -->
          <div class="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <i data-lucide="file-text" class="w-6 h-6"></i>
              </div>
              <div>
                <p class="text-sm font-bold text-slate-800" id="pdf-filename">documento.pdf</p>
                <p class="text-xs text-slate-500" id="pdf-meta">0 páginas • 0 KB</p>
              </div>
            </div>
            <button id="btn-change-file" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition">
              Trocar Arquivo
            </button>
          </div>

          <!-- Split Mode Selector -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="relative flex flex-col p-5 bg-white border-2 rounded-2xl cursor-pointer transition shadow-sm hover:border-indigo-400" id="opt-label-range">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <input type="radio" name="split_mode" value="range" checked class="text-indigo-600 focus:ring-indigo-500 w-4 h-4">
                  <span class="font-bold text-slate-800">Intervalo de Páginas</span>
                </div>
                <i data-lucide="bookmark" class="w-5 h-5 text-indigo-500"></i>
              </div>
              <p class="text-xs text-slate-500 mb-3">Extraia apenas as páginas que você precisa em um único PDF.</p>
              <div id="range-input-wrapper" class="mt-auto">
                <label class="text-xs font-semibold text-slate-700">Páginas ou Intervalos:</label>
                <input type="text" id="split-range-input" placeholder="Ex: 1-3, 5, 8" value="1" class="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                <span class="text-[11px] text-slate-400 mt-1 block">Exemplo: 1-3 extrai da página 1 até a 3.</span>
              </div>
            </label>

            <label class="relative flex flex-col p-5 bg-white border-2 rounded-2xl cursor-pointer transition shadow-sm hover:border-indigo-400" id="opt-label-all">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <input type="radio" name="split_mode" value="all" class="text-indigo-600 focus:ring-indigo-500 w-4 h-4">
                  <span class="font-bold text-slate-800">Extrair Todas as Páginas</span>
                </div>
                <i data-lucide="archive" class="w-5 h-5 text-indigo-500"></i>
              </div>
              <p class="text-xs text-slate-500 mb-3">Salva cada página individual como um documento PDF separado.</p>
              <div class="mt-auto p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                <i data-lucide="info" class="w-4 h-4 text-indigo-500 flex-shrink-0"></i>
                <span>Gera um pacote compactado (.ZIP) com todas as páginas.</span>
              </div>
            </label>
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
    const splitBtn = document.getElementById('btn-split-action');
    const changeBtn = document.getElementById('btn-change-file');
    const modeRadios = document.querySelectorAll('input[name="split_mode"]');

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
      document.getElementById('dropzone-section').classList.remove('hidden');
      document.getElementById('split-options-section').classList.add('hidden');
      splitBtn.disabled = true;
    });

    modeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.mode = e.target.value;
      });
    });

    splitBtn?.addEventListener('click', () => this.executeSplit());
  }

  async loadFile(file) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      notify('Por favor, selecione um arquivo PDF válido.', 'warning');
      return;
    }

    setLoading(true, 'Lendo arquivo PDF...');
    try {
      this.file = file;
      const buffer = await readFileAsArrayBuffer(file);
      this.pdfDoc = await window.PDFLib.PDFDocument.load(buffer, { ignoreEncryption: true });
      this.totalPages = this.pdfDoc.getPageCount();

      document.getElementById('pdf-filename').textContent = file.name;
      document.getElementById('pdf-meta').textContent = `${this.totalPages} página${this.totalPages > 1 ? 's' : ''} • ${formatBytes(file.size)}`;
      
      const defaultRange = this.totalPages > 1 ? `1-${Math.min(3, this.totalPages)}` : '1';
      document.getElementById('split-range-input').value = defaultRange;

      document.getElementById('dropzone-section').classList.add('hidden');
      document.getElementById('split-options-section').classList.remove('hidden');
      document.getElementById('btn-split-action').disabled = false;

      notify(`Arquivo carregado com sucesso (${this.totalPages} páginas).`, 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao abrir PDF: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  async executeSplit() {
    if (!this.pdfDoc) return;

    if (this.mode === 'range') {
      const rangeStr = document.getElementById('split-range-input').value.trim();
      const pageIndices = parsePageRanges(rangeStr, this.totalPages);

      if (pageIndices.length === 0) {
        notify('Nenhuma página válida especificada no intervalo.', 'warning');
        return;
      }

      setLoading(true, `Extraindo ${pageIndices.length} páginas...`);
      try {
        const newPdf = await window.PDFLib.PDFDocument.create();
        const copiedPages = await newPdf.copyPages(this.pdfDoc, pageIndices);
        copiedPages.forEach(p => newPdf.addPage(p));

        const bytes = await newPdf.save();
        const baseName = this.file.name.replace(/\.pdf$/i, '');
        downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${baseName}_dividido.pdf`);
        notify('Páginas extraídas com sucesso!', 'success');
      } catch (err) {
        console.error(err);
        notify(`Erro ao dividir PDF: ${err.message || err}`, 'error');
      } finally {
        setLoading(false);
      }
    } else {
      // Extract all pages as a ZIP bundle
      setLoading(true, `Criando arquivos individuais para todas as ${this.totalPages} páginas...`);
      try {
        if (!window.JSZip) {
          throw new Error('Biblioteca JSZip não carregada');
        }
        const zip = new window.JSZip();
        const baseName = this.file.name.replace(/\.pdf$/i, '');

        for (let i = 0; i < this.totalPages; i++) {
          setLoading(true, `Extraindo página ${i + 1} de ${this.totalPages}...`);
          const singleDoc = await window.PDFLib.PDFDocument.create();
          const [copiedPage] = await singleDoc.copyPages(this.pdfDoc, [i]);
          singleDoc.addPage(copiedPage);
          const singleBytes = await singleDoc.save();
          zip.file(`${baseName}_pagina_${i + 1}.pdf`, singleBytes);
        }

        setLoading(true, 'Compactando arquivo ZIP...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, `${baseName}_paginas_separadas.zip`);
        notify('Todas as páginas foram extraídas e compactadas em ZIP!', 'success');
      } catch (err) {
        console.error(err);
        notify(`Erro ao extrair todas as páginas: ${err.message || err}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  }
}
