/**
 * Ferramenta: Juntar PDF (Merge)
 */
import { readFileAsArrayBuffer, downloadBlob, formatBytes, notify, setLoading } from '../utils.js';

export class MergeTool {
  constructor() {
    this.files = []; // Array of File objects
    this.container = document.getElementById('tool-workspace');
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <i data-lucide="layers" class="w-7 h-7 text-indigo-600"></i>
              Juntar PDFs
            </h2>
            <p class="text-sm text-slate-500 mt-1">Combine múltiplos arquivos PDF em um único documento, na ordem que você escolher.</p>
          </div>
          <button id="btn-merge-action" disabled class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-indigo-600/25 transition">
            <i data-lucide="combine" class="w-5 h-5"></i>
            <span>Juntar PDFs Agora</span>
          </button>
        </div>

        <!-- Upload Dropzone -->
        <div id="dropzone" class="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20 group">
          <input type="file" id="file-input" multiple accept=".pdf" class="hidden" />
          <div class="flex flex-col items-center justify-center space-y-3">
            <div class="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition duration-200">
              <i data-lucide="file-up" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="text-base font-semibold text-slate-700">Clique para selecionar ou arraste arquivos PDF aqui</p>
              <p class="text-xs text-slate-400 mt-1">Selecione 2 ou mais arquivos PDF para combiná-los</p>
            </div>
            <button type="button" class="mt-2 text-xs font-semibold px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50">
              Navegar no Computador
            </button>
          </div>
        </div>

        <!-- File List & Reorder Section -->
        <div id="file-list-container" class="space-y-3 ${this.files.length === 0 ? 'hidden' : ''}">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-slate-700" id="file-count-badge">0 arquivos selecionados</span>
            <button id="btn-clear-all" class="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1">
              <i data-lucide="trash-2" class="w-4 h-4"></i> Limpar Fila
            </button>
          </div>
          
          <div id="file-list" class="space-y-2"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.bindEvents();
    this.renderFileList();
  }

  bindEvents() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const mergeBtn = document.getElementById('btn-merge-action');
    const clearBtn = document.getElementById('btn-clear-all');

    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      this.handleFiles(Array.from(e.target.files));
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

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files) {
        this.handleFiles(Array.from(e.dataTransfer.files));
      }
    });

    clearBtn?.addEventListener('click', () => {
      this.files = [];
      this.renderFileList();
    });

    mergeBtn?.addEventListener('click', () => this.executeMerge());

    // Setup drag-and-drop reordering with SortableJS
    const listEl = document.getElementById('file-list');
    if (listEl && window.Sortable) {
      new window.Sortable(listEl, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: (evt) => {
          const moved = this.files.splice(evt.oldIndex, 1)[0];
          this.files.splice(evt.newIndex, 0, moved);
          this.renderFileList();
        }
      });
    }
  }

  handleFiles(newFiles) {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfs.length === 0) {
      notify('Por favor, selecione arquivos em formato PDF válido.', 'warning');
      return;
    }
    this.files.push(...pdfs);
    this.renderFileList();
  }

  renderFileList() {
    const listContainer = document.getElementById('file-list-container');
    const listEl = document.getElementById('file-list');
    const countBadge = document.getElementById('file-count-badge');
    const mergeBtn = document.getElementById('btn-merge-action');

    if (!listContainer || !listEl) return;

    if (this.files.length === 0) {
      listContainer.classList.add('hidden');
      if (mergeBtn) mergeBtn.disabled = true;
      return;
    }

    listContainer.classList.remove('hidden');
    countBadge.textContent = `${this.files.length} arquivo${this.files.length > 1 ? 's' : ''} na fila (arraste para reordenar)`;
    if (mergeBtn) mergeBtn.disabled = this.files.length < 2;

    listEl.innerHTML = this.files.map((file, idx) => `
      <div class="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-200 transition" data-index="${idx}">
        <div class="flex items-center gap-3 min-w-0">
          <div class="drag-handle cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1">
            <i data-lucide="grip-vertical" class="w-5 h-5"></i>
          </div>
          <span class="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
            ${idx + 1}
          </span>
          <i data-lucide="file-text" class="w-5 h-5 text-indigo-500 flex-shrink-0"></i>
          <div class="truncate">
            <p class="text-sm font-semibold text-slate-800 truncate">${file.name}</p>
            <p class="text-xs text-slate-400">${formatBytes(file.size)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-remove-file p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition" data-index="${idx}" title="Remover">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();

    listEl.querySelectorAll('.btn-remove-file').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        this.files.splice(index, 1);
        this.renderFileList();
      });
    });
  }

  async executeMerge() {
    if (this.files.length < 2) {
      notify('Adicione pelo menos 2 PDFs para juntar.', 'warning');
      return;
    }

    setLoading(true, 'Unindo os documentos PDF...');
    try {
      const mergedPdf = await window.PDFLib.PDFDocument.create();

      for (let i = 0; i < this.files.length; i++) {
        const file = this.files[i];
        setLoading(true, `Carregando arquivo ${i + 1} de ${this.files.length} (${file.name})...`);
        const fileBuffer = await readFileAsArrayBuffer(file);
        const pdf = await window.PDFLib.PDFDocument.load(fileBuffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      setLoading(true, 'Salvando o PDF combinado...');
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, 'documento_combinado.pdf');

      notify('PDFs combinados com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao juntar PDFs: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }
}
