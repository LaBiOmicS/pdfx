/**
 * Ferramenta: Organizar e Reordenar Páginas Visualmente (Organize)
 */
import { readFileAsArrayBuffer, downloadBlob, formatBytes, renderPdfPageToCanvas, notify, setLoading } from '../utils.js';

export class OrganizeTool {
  constructor() {
    this.file = null;
    this.pdfLibDoc = null;
    this.pdfJsDoc = null;
    this.totalPages = 0;
    // Each item: { originalIndex: number, rotation: number, isDeleted: boolean }
    this.pagesState = [];
    this.container = document.getElementById('tool-workspace');
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <i data-lucide="layout-grid" class="w-7 h-7 text-indigo-600"></i>
              Organizar Páginas
            </h2>
            <p class="text-sm text-slate-500 mt-1">Arraste para reordenar, gire ou exclua páginas visualmente.</p>
          </div>
          <div class="flex items-center gap-3">
            <button id="btn-rotate-all" disabled class="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
              <i data-lucide="rotate-cw" class="w-4 h-4"></i> Girar Todas (+90°)
            </button>
            <button id="btn-save-organized" disabled class="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Salvar Novo PDF</span>
            </button>
          </div>
        </div>

        <!-- Dropzone -->
        <div id="dropzone-section">
          <div id="dropzone" class="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20 group">
            <input type="file" id="file-input" accept=".pdf" class="hidden" />
            <div class="flex flex-col items-center justify-center space-y-3">
              <div class="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition duration-200">
                <i data-lucide="file-up" class="w-8 h-8"></i>
              </div>
              <div>
                <p class="text-base font-semibold text-slate-700">Selecione o arquivo PDF para organizar</p>
                <p class="text-xs text-slate-400 mt-1">Clique ou arraste um arquivo PDF aqui</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pages Grid Container -->
        <div id="pages-section" class="hidden space-y-4">
          <div class="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span id="organize-meta">0 páginas carregadas</span>
            <div class="flex items-center gap-4">
              <span>Dica: Arraste os cards para reorganizar</span>
              <button id="btn-reset-order" class="text-indigo-600 hover:text-indigo-800 font-semibold">Restaurar Original</button>
            </div>
          </div>

          <!-- Sortable Grid -->
          <div id="pages-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.bindEvents();
  }

  bindEvents() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const saveBtn = document.getElementById('btn-save-organized');
    const rotateAllBtn = document.getElementById('btn-rotate-all');
    const resetBtn = document.getElementById('btn-reset-order');

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

    rotateAllBtn?.addEventListener('click', () => {
      this.pagesState.forEach(p => {
        if (!p.isDeleted) p.rotation = (p.rotation + 90) % 360;
      });
      this.updateCardRotations();
    });

    resetBtn?.addEventListener('click', () => {
      this.pagesState = Array.from({ length: this.totalPages }, (_, i) => ({
        originalIndex: i,
        rotation: 0,
        isDeleted: false
      }));
      this.renderPagesGrid();
    });

    saveBtn?.addEventListener('click', () => this.executeSave());
  }

  async loadFile(file) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      notify('Por favor, selecione um arquivo PDF válido.', 'warning');
      return;
    }

    setLoading(true, 'Renderizando miniaturas das páginas...');
    try {
      this.file = file;
      const buffer = await readFileAsArrayBuffer(file);
      
      this.pdfLibDoc = await window.PDFLib.PDFDocument.load(buffer, { ignoreEncryption: true });
      this.totalPages = this.pdfLibDoc.getPageCount();

      // Configure pdf.js worker and load document for visual thumbnails
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        this.pdfJsDoc = await window.pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise;
      }

      this.pagesState = Array.from({ length: this.totalPages }, (_, i) => ({
        originalIndex: i,
        rotation: 0,
        isDeleted: false
      }));

      document.getElementById('dropzone-section').classList.add('hidden');
      document.getElementById('pages-section').classList.remove('hidden');
      document.getElementById('btn-save-organized').disabled = false;
      document.getElementById('btn-rotate-all').disabled = false;
      document.getElementById('organize-meta').textContent = `${this.totalPages} páginas carregadas • ${formatBytes(file.size)}`;

      await this.renderPagesGrid();
      notify('Miniaturas geradas com sucesso! Arraste para reordenar.', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao carregar páginas: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  async renderPagesGrid() {
    const gridEl = document.getElementById('pages-grid');
    if (!gridEl) return;

    gridEl.innerHTML = '';

    for (let i = 0; i < this.pagesState.length; i++) {
      const pageInfo = this.pagesState[i];
      if (pageInfo.isDeleted) continue;

      const card = document.createElement('div');
      card.className = 'page-card relative bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:border-indigo-300 flex flex-col items-center group cursor-grab active:cursor-grabbing';
      card.setAttribute('data-id', i);

      card.innerHTML = `
        <div class="relative w-full aspect-[1/1.414] bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center mb-2.5">
          <div class="canvas-wrapper flex items-center justify-center w-full h-full transition-transform duration-200" style="transform: rotate(${pageInfo.rotation}deg)">
            <div class="loading-spin text-xs text-slate-400">Carregando...</div>
          </div>
          <!-- Quick action buttons overlay -->
          <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button class="btn-rotate-card p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-indigo-600 shadow-md transition" title="Girar 90°">
              <i data-lucide="rotate-cw" class="w-4 h-4"></i>
            </button>
            <button class="btn-delete-card p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600 shadow-md transition" title="Excluir página">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
        <div class="w-full flex items-center justify-between text-xs px-1 text-slate-600 font-semibold">
          <span class="page-number-label">Página ${pageInfo.originalIndex + 1}</span>
          <span class="text-[10px] text-slate-400 font-mono">${pageInfo.rotation}°</span>
        </div>
      `;

      gridEl.appendChild(card);

      // Async render thumbnail
      this.renderThumbnailToCard(card, pageInfo.originalIndex + 1);

      // Card action events
      const rotateBtn = card.querySelector('.btn-rotate-card');
      const deleteBtn = card.querySelector('.btn-delete-card');

      rotateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pageInfo.rotation = (pageInfo.rotation + 90) % 360;
        const wrapper = card.querySelector('.canvas-wrapper');
        if (wrapper) wrapper.style.transform = `rotate(${pageInfo.rotation}deg)`;
        card.querySelector('.font-mono').textContent = `${pageInfo.rotation}°`;
      });

      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pageInfo.isDeleted = true;
        card.remove();
        this.updateRemainingMeta();
      });
    }

    if (window.lucide) window.lucide.createIcons();

    // Enable SortableJS on the grid
    if (window.Sortable) {
      new window.Sortable(gridEl, {
        animation: 200,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: (evt) => {
          const item = this.pagesState.splice(evt.oldIndex, 1)[0];
          this.pagesState.splice(evt.newIndex, 0, item);
        }
      });
    }
  }

  async renderThumbnailToCard(card, pageNum) {
    if (!this.pdfJsDoc) return;
    try {
      const canvas = await renderPdfPageToCanvas(this.pdfJsDoc, pageNum, 0.4);
      canvas.className = 'max-w-full max-h-full object-contain pointer-events-none rounded shadow-sm';
      const wrapper = card.querySelector('.canvas-wrapper');
      if (wrapper) {
        wrapper.innerHTML = '';
        wrapper.appendChild(canvas);
      }
    } catch (e) {
      console.warn('Erro ao renderizar miniatura da página', pageNum, e);
    }
  }

  updateCardRotations() {
    const cards = document.querySelectorAll('#pages-grid .page-card');
    cards.forEach((card, index) => {
      const state = this.pagesState[index];
      if (state) {
        const wrapper = card.querySelector('.canvas-wrapper');
        if (wrapper) wrapper.style.transform = `rotate(${state.rotation}deg)`;
        const mono = card.querySelector('.font-mono');
        if (mono) mono.textContent = `${state.rotation}°`;
      }
    });
  }

  updateRemainingMeta() {
    const active = this.pagesState.filter(p => !p.isDeleted);
    document.getElementById('organize-meta').textContent = `${active.length} páginas ativas (de ${this.totalPages})`;
    document.getElementById('btn-save-organized').disabled = active.length === 0;
  }

  async executeSave() {
    const activePages = this.pagesState.filter(p => !p.isDeleted);
    if (activePages.length === 0) {
      notify('Todas as páginas foram removidas. Adicione ou restaure as páginas.', 'warning');
      return;
    }

    setLoading(true, 'Construindo o novo PDF reorganizado...');
    try {
      const newPdf = await window.PDFLib.PDFDocument.create();

      for (let i = 0; i < activePages.length; i++) {
        const item = activePages[i];
        const [copiedPage] = await newPdf.copyPages(this.pdfLibDoc, [item.originalIndex]);
        
        if (item.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(window.PDFLib.degrees((currentRotation + item.rotation) % 360));
        }

        newPdf.addPage(copiedPage);
      }

      setLoading(true, 'Salvando arquivo...');
      const bytes = await newPdf.save();
      const baseName = this.file.name.replace(/\.pdf$/i, '');
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${baseName}_organizado.pdf`);

      notify('Novo PDF salvo e descarregado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao salvar PDF reorganizado: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }
}
