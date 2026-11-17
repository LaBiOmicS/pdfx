/**
 * Ferramenta: Editar PDF — Textos, Substituição, Marca-Texto, Tarjas e Notas
 * Nova Disposição: Barra Lateral (Sidebar) com máxima área útil vertical e zero quebra de linha
 */
import { readFileAsArrayBuffer, downloadBlob, formatBytes, notify, setLoading } from '../utils.js';
import { t } from '../i18n.js';

export class EditPdfTool {
  constructor() {
    this.file = null;
    this.pdfLibDoc = null;
    this.pdfJsDoc = null;
    this.totalPages = 0;
    this.currentPage = 1;
    this.container = document.getElementById('tool-workspace');
    
    // Zoom and viewport
    this.viewportScale = 1.25;
    this.currentViewport = null;
    this.basePageWidth = 595;

    // Annotations map: pageNumber (1-based) -> Array of annotations
    // Types: 'text' | 'replace_text' | 'highlight' | 'redact_black' | 'redact_white' | 'comment'
    this.annotations = {};
    this.activeAnnotationId = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="w-full">
        
        <!-- Dropzone Section (Initial state) -->
        <div id="dropzone-section">
          <div id="dropzone" class="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-3xl p-12 text-center cursor-pointer transition bg-white group shadow-xs">
            <input type="file" id="file-input" accept=".pdf" class="hidden" />
            <div class="flex flex-col items-center justify-center space-y-3">
              <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 group-hover:scale-105 transition duration-200">
                <i data-lucide="file-up" class="w-8 h-8"></i>
              </div>
              <div>
                <p class="text-base font-bold text-slate-800">${t('dropzoneText')}</p>
                <p class="text-xs text-slate-400 mt-1">${t('dropzoneSubtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Editor Workspace with Lateral Sidebar Layout -->
        <div id="editor-workspace" class="hidden flex flex-col md:flex-row gap-5 items-start">
          
          <!-- LEFT LATERAL SIDEBAR -->
          <aside class="w-full md:w-72 lg:w-80 flex-shrink-0 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-5 md:sticky md:top-20 z-20">
            
            <!-- 1. Document & Page Navigator -->
            <div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Páginas</span>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <button id="btn-prev-page" class="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition disabled:opacity-30" title="Página anterior">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                  </button>
                  <span id="page-indicator" class="text-xs font-bold text-slate-800 min-w-16 text-center">1 de 1</span>
                  <button id="btn-next-page" class="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition disabled:opacity-30" title="Próxima página">
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
              <button id="btn-change-file" class="text-xs text-slate-500 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                ${t('btnChangeFile')}
              </button>
            </div>

            <!-- 2. Primary Toolset (Vertical Stack without wrapping) -->
            <div class="space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Ferramentas</span>
              
              <!-- Marca-Texto -->
              <button id="btn-add-highlight" class="w-full px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-between transition border border-amber-200 shadow-xs">
                <div class="flex items-center gap-2">
                  <i data-lucide="highlighter" class="w-4 h-4 text-amber-600"></i>
                  <span>${t('btnHighlight')}</span>
                </div>
                <span class="text-[10px] bg-white px-2 py-0.5 rounded font-mono text-amber-800">Marcação</span>
              </button>

              <!-- Substituir Texto (Fundo Branco) -->
              <button id="btn-add-replace-text" class="w-full px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-between transition border border-indigo-200 shadow-xs">
                <div class="flex items-center gap-2">
                  <i data-lucide="replace" class="w-4 h-4 text-indigo-600"></i>
                  <span>Substituir Texto</span>
                </div>
                <span class="text-[10px] bg-white px-2 py-0.5 rounded font-mono text-indigo-800">Cobrir</span>
              </button>

              <!-- Texto Livre -->
              <button id="btn-add-text" class="w-full px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex items-center justify-between transition border border-slate-200">
                <div class="flex items-center gap-2">
                  <i data-lucide="type" class="w-4 h-4 text-slate-600"></i>
                  <span>+ Texto Livre</span>
                </div>
                <span class="text-[10px] bg-white px-2 py-0.5 rounded font-mono text-slate-500">Transparente</span>
              </button>

              <!-- Tarja Preta (Censurar) -->
              <button id="btn-add-redact-black" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs flex items-center justify-between transition shadow-sm">
                <div class="flex items-center gap-2">
                  <i data-lucide="shield-alert" class="w-4 h-4 text-rose-400"></i>
                  <span>Tarja Preta</span>
                </div>
                <span class="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-neutral-300">Censurar</span>
              </button>

              <!-- Tarja Branca (Apagar) -->
              <button id="btn-add-redact-white" class="w-full px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-between transition border border-slate-200 shadow-xs">
                <div class="flex items-center gap-2">
                  <i data-lucide="square" class="w-4 h-4 text-slate-500"></i>
                  <span>Tarja Branca</span>
                </div>
                <span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-500">Apagar</span>
              </button>

              <!-- Nota Adesiva (Post-It) -->
              <button id="btn-add-comment" class="w-full px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs flex items-center justify-between transition border border-amber-200">
                <div class="flex items-center gap-2">
                  <i data-lucide="message-square" class="w-4 h-4 text-amber-600"></i>
                  <span>Nota de Revisão</span>
                </div>
                <span class="text-[10px] bg-white px-2 py-0.5 rounded font-mono text-amber-800">Post-it</span>
              </button>
            </div>

            <!-- 3. Contextual Properties Panel -->
            <div id="formatting-bar" class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <i data-lucide="sliders" class="w-3 h-3"></i> Propriedades
                </span>
                <button id="btn-delete-active-box" class="text-rose-600 hover:text-rose-800 font-bold text-[11px] flex items-center gap-1">
                  <i data-lucide="trash-2" class="w-3 h-3"></i> Excluir
                </button>
              </div>

              <!-- Font Size -->
              <div id="prop-font-group" class="flex items-center justify-between gap-1.5">
                <span class="text-slate-500">Tamanho da Fonte:</span>
                <select id="prop-font-size" class="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold">
                  <option value="10">10 pt</option>
                  <option value="12">12 pt</option>
                  <option value="14" selected>14 pt</option>
                  <option value="16">16 pt</option>
                  <option value="18">18 pt</option>
                  <option value="22">22 pt</option>
                  <option value="28">28 pt</option>
                  <option value="36">36 pt</option>
                </select>
              </div>

              <!-- Color & Bold -->
              <div id="prop-color-group" class="flex items-center justify-between gap-1.5">
                <span class="text-slate-500">Estilo:</span>
                <div class="flex items-center gap-2">
                  <input type="color" id="prop-color" value="#000000" class="w-6 h-6 p-0 border border-slate-200 rounded cursor-pointer bg-white" title="Cor do texto">
                  <button id="prop-toggle-bold" class="px-2 py-0.5 bg-white border border-slate-200 rounded font-bold text-slate-700 hover:bg-slate-100 transition" title="Alternar Negrito">
                    B
                  </button>
                </div>
              </div>

              <!-- Background Option -->
              <div id="prop-bg-group" class="flex items-center justify-between gap-1.5">
                <span class="text-slate-500">Fundo:</span>
                <select id="prop-bg-select" class="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold">
                  <option value="transparent">Transparente</option>
                  <option value="white">Branco (Cobrir)</option>
                </select>
              </div>

              <!-- Highlighter Color Presets -->
              <div id="prop-highlight-colors" class="hidden flex items-center justify-between gap-2">
                <span class="text-slate-500">Cor do Marca-Texto:</span>
                <div class="flex items-center gap-1.5">
                  <button class="hl-color-btn w-5 h-5 rounded-full bg-yellow-300 border-2 border-yellow-500" data-color="yellow" title="Amarelo"></button>
                  <button class="hl-color-btn w-5 h-5 rounded-full bg-emerald-300 border-2 border-slate-200" data-color="green" title="Verde"></button>
                  <button class="hl-color-btn w-5 h-5 rounded-full bg-pink-300 border-2 border-slate-200" data-color="pink" title="Rosa"></button>
                  <button class="hl-color-btn w-5 h-5 rounded-full bg-cyan-300 border-2 border-slate-200" data-color="blue" title="Azul"></button>
                </div>
              </div>
            </div>

            <!-- 4. Zoom & Save Actions -->
            <div class="pt-3 border-t border-slate-100 space-y-3">
              <!-- Zoom Control -->
              <div class="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs font-semibold">
                <span class="text-slate-500">Zoom:</span>
                <div class="flex items-center gap-1">
                  <button id="btn-zoom-out" class="p-1 hover:bg-white rounded transition text-slate-700" title="Diminuir">
                    <i data-lucide="minus" class="w-3.5 h-3.5"></i>
                  </button>
                  <span id="zoom-label" class="w-11 text-center font-mono">100%</span>
                  <button id="btn-zoom-in" class="p-1 hover:bg-white rounded transition text-slate-700" title="Aumentar">
                    <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                  </button>
                  <button id="btn-fit-width" class="ml-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-100">
                    Ajustar
                  </button>
                </div>
              </div>

              <!-- Primary Save Action Button -->
              <button id="btn-save-edited-pdf" disabled class="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-slate-950/20 flex items-center justify-center gap-2 transition hover:-translate-y-0.5">
                <i data-lucide="download" class="w-4 h-4 text-emerald-400"></i>
                <span>${t('btnSaveEdited')}</span>
              </button>
            </div>

            <p class="text-[11px] text-slate-400 text-center leading-relaxed">
              Arraste elementos para mover. Puxe a quina inferior direita <strong>◢</strong> para redimensionar.
            </p>

          </aside>

          <!-- RIGHT CANVAS STAGE AREA -->
          <main class="flex-1 min-w-0 w-full">
            <div id="canvas-scroll-container" class="w-full bg-slate-200/90 rounded-3xl p-4 sm:p-10 overflow-auto min-h-[75vh] flex justify-center items-start shadow-inner">
              <div id="page-stage-container" class="relative bg-white shadow-2xl rounded origin-top flex-shrink-0 transition-transform">
                <canvas id="pdf-page-canvas" class="block"></canvas>
                <!-- Annotations overlay layer matching canvas dimensions -->
                <div id="annotations-layer" class="absolute inset-0 overflow-visible pointer-events-none"></div>
              </div>
            </div>
            
            <div class="flex items-center justify-between text-xs text-slate-400 mt-2 px-2">
              <span id="doc-dimensions-badge" class="font-mono text-[11px]">Visualização: 0 × 0 px</span>
              <span>100% Processado no Navegador</span>
            </div>
          </main>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.bindEvents();
  }

  bindEvents() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    
    // Tools buttons
    const addTextBtn = document.getElementById('btn-add-text');
    const addReplaceTextBtn = document.getElementById('btn-add-replace-text');
    const addHighlightBtn = document.getElementById('btn-add-highlight');
    const addRedactBlackBtn = document.getElementById('btn-add-redact-black');
    const addRedactWhiteBtn = document.getElementById('btn-add-redact-white');
    const addCommentBtn = document.getElementById('btn-add-comment');
    
    // Navigation
    const prevPageBtn = document.getElementById('btn-prev-page');
    const nextPageBtn = document.getElementById('btn-next-page');
    const zoomInBtn = document.getElementById('btn-zoom-in');
    const zoomOutBtn = document.getElementById('btn-zoom-out');
    const fitWidthBtn = document.getElementById('btn-fit-width');
    const saveBtn = document.getElementById('btn-save-edited-pdf');
    const changeBtn = document.getElementById('btn-change-file');
    const deleteActiveBtn = document.getElementById('btn-delete-active-box');

    // Properties controls
    const propFontSize = document.getElementById('prop-font-size');
    const propColor = document.getElementById('prop-color');
    const propBold = document.getElementById('prop-toggle-bold');
    const propBgSelect = document.getElementById('prop-bg-select');

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
      this.pdfJsDoc = null;
      this.pdfLibDoc = null;
      this.annotations = {};
      document.getElementById('dropzone-section').classList.remove('hidden');
      document.getElementById('editor-workspace').classList.add('hidden');
      saveBtn.disabled = true;
    });

    // Tool actions
    addHighlightBtn?.addEventListener('click', () => this.addAnnotation('highlight'));
    addReplaceTextBtn?.addEventListener('click', () => this.addAnnotation('replace_text'));
    addTextBtn?.addEventListener('click', () => this.addAnnotation('text'));
    addRedactBlackBtn?.addEventListener('click', () => this.addAnnotation('redact_black'));
    addRedactWhiteBtn?.addEventListener('click', () => this.addAnnotation('redact_white'));
    addCommentBtn?.addEventListener('click', () => this.addAnnotation('comment'));

    prevPageBtn?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderCurrentPage();
      }
    });

    nextPageBtn?.addEventListener('click', () => {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.renderCurrentPage();
      }
    });

    zoomInBtn?.addEventListener('click', () => {
      if (this.viewportScale < 2.5) {
        this.viewportScale = parseFloat((this.viewportScale + 0.15).toFixed(2));
        this.updateZoomLabel();
        this.renderCurrentPage();
      }
    });

    zoomOutBtn?.addEventListener('click', () => {
      if (this.viewportScale > 0.6) {
        this.viewportScale = parseFloat((this.viewportScale - 0.15).toFixed(2));
        this.updateZoomLabel();
        this.renderCurrentPage();
      }
    });

    fitWidthBtn?.addEventListener('click', () => {
      this.autoFitToWidth();
    });

    // Property updates on active box
    propFontSize?.addEventListener('change', (e) => {
      const active = this.getActiveAnnotation();
      if (active) {
        active.fontSize = parseInt(e.target.value, 10);
        this.renderAnnotationsForPage();
      }
    });

    propColor?.addEventListener('input', (e) => {
      const active = this.getActiveAnnotation();
      if (active) {
        active.color = e.target.value;
        this.renderAnnotationsForPage();
      }
    });

    propBold?.addEventListener('click', () => {
      const active = this.getActiveAnnotation();
      if (active) {
        active.isBold = !active.isBold;
        this.renderAnnotationsForPage();
      }
    });

    propBgSelect?.addEventListener('change', (e) => {
      const active = this.getActiveAnnotation();
      if (active) {
        active.bgType = e.target.value;
        this.renderAnnotationsForPage();
      }
    });

    // Highlighter preset color buttons
    document.querySelectorAll('.hl-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.currentTarget.getAttribute('data-color');
        const active = this.getActiveAnnotation();
        if (active && active.type === 'highlight') {
          active.highlightColor = color;
          this.renderAnnotationsForPage();
        }
      });
    });

    deleteActiveBtn?.addEventListener('click', () => {
      if (this.activeAnnotationId) {
        const pageList = this.annotations[this.currentPage] || [];
        this.annotations[this.currentPage] = pageList.filter(a => a.id !== this.activeAnnotationId);
        this.activeAnnotationId = null;
        this.renderAnnotationsForPage();
      }
    });

    saveBtn?.addEventListener('click', () => this.executeSavePdf());
  }

  updateZoomLabel() {
    const label = document.getElementById('zoom-label');
    if (label) {
      label.textContent = `${Math.round(this.viewportScale * 100)}%`;
    }
  }

  autoFitToWidth() {
    const scrollContainer = document.getElementById('canvas-scroll-container');
    if (!scrollContainer || !this.basePageWidth) return;
    
    // Fit to container width with comfortable margins
    const availableWidth = scrollContainer.clientWidth - 80;
    if (availableWidth > 200) {
      const targetScale = parseFloat((availableWidth / this.basePageWidth).toFixed(2));
      this.viewportScale = Math.max(0.6, Math.min(1.8, targetScale));
      this.updateZoomLabel();
      this.renderCurrentPage();
    }
  }

  async loadFile(file) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      notify('Por favor, selecione um arquivo PDF válido.', 'warning');
      return;
    }

    setLoading(true, 'Carregando documento PDF...');
    try {
      this.file = file;
      const buffer = await readFileAsArrayBuffer(file);

      this.pdfLibDoc = await window.PDFLib.PDFDocument.load(buffer, { ignoreEncryption: true });

      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        this.pdfJsDoc = await window.pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise;
        this.totalPages = this.pdfJsDoc.numPages;
      }

      this.currentPage = 1;
      this.annotations = {};
      this.activeAnnotationId = null;

      // Get page 1 dimensions to calculate optimal fit scale
      const firstPage = await this.pdfJsDoc.getPage(1);
      const unscaledViewport = firstPage.getViewport({ scale: 1.0 });
      this.basePageWidth = unscaledViewport.width;

      document.getElementById('dropzone-section').classList.add('hidden');
      document.getElementById('editor-workspace').classList.remove('hidden');
      document.getElementById('btn-save-edited-pdf').disabled = false;

      // Set scale that fits screen nicely
      this.autoFitToWidth();
      notify('PDF carregado com sucesso! Escolha uma ferramenta na barra lateral.', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao carregar PDF: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  async renderCurrentPage() {
    if (!this.pdfJsDoc) return;

    setLoading(true, `Renderizando página ${this.currentPage}...`);
    try {
      const page = await this.pdfJsDoc.getPage(this.currentPage);
      this.currentViewport = page.getViewport({ scale: this.viewportScale });

      const canvas = document.getElementById('pdf-page-canvas');
      const stage = document.getElementById('page-stage-container');
      const context = canvas.getContext('2d');

      canvas.width = this.currentViewport.width;
      canvas.height = this.currentViewport.height;

      stage.style.width = `${this.currentViewport.width}px`;
      stage.style.height = `${this.currentViewport.height}px`;

      const renderContext = {
        canvasContext: context,
        viewport: this.currentViewport
      };

      await page.render(renderContext).promise;

      // Update badge and UI
      document.getElementById('page-indicator').textContent = `${this.currentPage} de ${this.totalPages}`;
      document.getElementById('btn-prev-page').disabled = this.currentPage <= 1;
      document.getElementById('btn-next-page').disabled = this.currentPage >= this.totalPages;
      
      const dimBadge = document.getElementById('doc-dimensions-badge');
      if (dimBadge) {
        dimBadge.textContent = `Visualização: ${Math.round(this.currentViewport.width)} × ${Math.round(this.currentViewport.height)} px`;
      }

      this.renderAnnotationsForPage();

      // Reset scroll to top
      const scrollEl = document.getElementById('canvas-scroll-container');
      if (scrollEl) scrollEl.scrollTop = 0;

    } catch (e) {
      console.error(e);
      notify('Erro ao renderizar página', 'error');
    } finally {
      setLoading(false);
    }
  }

  addAnnotation(type = 'text') {
    if (!this.annotations[this.currentPage]) {
      this.annotations[this.currentPage] = [];
    }

    const id = 'ann_' + Date.now();
    let width = 200, height = 45, text = '', fontSize = 14, color = '#000000', isBold = false, bgType = 'transparent', highlightColor = 'yellow';

    if (type === 'highlight') {
      width = 240;
      height = 24;
      highlightColor = 'yellow';
    } else if (type === 'replace_text') {
      width = 200;
      height = 42;
      text = 'Novo texto...';
      fontSize = 14;
      bgType = 'white'; // Covers original text
    } else if (type === 'text') {
      width = 200;
      height = 42;
      text = 'Digite aqui...';
      fontSize = 14;
      bgType = 'transparent';
    } else if (type === 'redact_black') {
      width = 160;
      height = 26;
      text = '';
    } else if (type === 'redact_white') {
      width = 160;
      height = 26;
      text = '';
    } else if (type === 'comment') {
      width = 220;
      height = 95;
      text = 'Digite sua observação...';
      fontSize = 12;
      color = '#78350f';
    }

    // Position in the visible center area of the document
    const newBox = {
      id,
      type,
      x: 60,
      y: 60 + (this.annotations[this.currentPage].length * 25),
      width,
      height,
      text,
      fontSize,
      color,
      isBold,
      bgType,
      highlightColor
    };

    this.annotations[this.currentPage].push(newBox);
    this.activeAnnotationId = id;
    this.renderAnnotationsForPage();

    const messages = {
      highlight: 'Marca-texto posicionado! Arraste sobre o texto e puxe a alça ◢ para ajustar.',
      replace_text: 'Caixa de substituição adicionada! O fundo branco apaga o texto original.',
      text: 'Caixa de texto adicionada!',
      redact_black: 'Tarja preta de censura adicionada.',
      redact_white: 'Tarja branca para apagar adicionada.',
      comment: 'Nota adesiva adicionada.'
    };
    notify(messages[type] || 'Item adicionado.', 'info');
  }

  getActiveAnnotation() {
    if (!this.activeAnnotationId) return null;
    const list = this.annotations[this.currentPage] || [];
    return list.find(a => a.id === this.activeAnnotationId);
  }

  renderAnnotationsForPage() {
    const layer = document.getElementById('annotations-layer');
    if (!layer) return;

    layer.innerHTML = '';
    const list = this.annotations[this.currentPage] || [];

    list.forEach(ann => {
      const box = document.createElement('div');
      const isActive = ann.id === this.activeAnnotationId;

      box.setAttribute('data-ann-id', ann.id);
      box.style.left = `${ann.x}px`;
      box.style.top = `${ann.y}px`;
      box.style.width = `${ann.width}px`;
      box.style.minHeight = `${ann.height}px`;

      let innerContent = '';

      if (ann.type === 'highlight') {
        const bgColors = {
          yellow: 'bg-yellow-300/50 border-yellow-400',
          green: 'bg-emerald-300/50 border-emerald-400',
          pink: 'bg-pink-300/50 border-pink-400',
          blue: 'bg-cyan-300/50 border-cyan-400'
        };
        const activeClass = bgColors[ann.highlightColor || 'yellow'] || bgColors.yellow;

        box.className = `absolute pointer-events-auto select-none rounded border ${activeClass} shadow-xs group ${
          isActive ? 'ring-2 ring-slate-900' : ''
        }`;
        innerContent = `
          <div class="flex items-center justify-between px-1.5 py-0.5 bg-yellow-400/90 text-[10px] text-yellow-950 drag-handle cursor-move rounded-t font-bold">
            <span class="flex items-center gap-1">
              <i data-lucide="highlighter" class="w-3 h-3"></i> Marca-Texto
            </span>
            <button class="btn-del-ann text-yellow-950 hover:text-rose-600">
              <i data-lucide="x" class="w-3 h-3"></i>
            </button>
          </div>
        `;
      } else if (ann.type === 'redact_black') {
        box.className = `absolute pointer-events-auto select-none bg-black rounded shadow-md group ${
          isActive ? 'ring-2 ring-slate-900' : 'hover:ring-1 hover:ring-slate-400'
        }`;
        innerContent = `
          <div class="flex items-center justify-between px-1.5 py-0.5 bg-slate-800 text-[10px] text-white drag-handle cursor-move rounded-t">
            <span class="flex items-center gap-1 font-bold">
              <i data-lucide="shield-alert" class="w-3 h-3 text-rose-400"></i> Tarja Preta
            </span>
            <button class="btn-del-ann text-slate-300 hover:text-rose-400">
              <i data-lucide="x" class="w-3 h-3"></i>
            </button>
          </div>
          <div class="h-full flex items-center justify-center p-1">
            <span class="text-[9px] uppercase tracking-wider text-neutral-400 font-mono font-bold select-none">[ CENSURADO ]</span>
          </div>
        `;
      } else if (ann.type === 'redact_white') {
        box.className = `absolute pointer-events-auto select-none bg-white rounded border border-slate-300 shadow-sm group ${
          isActive ? 'ring-2 ring-slate-900' : 'hover:border-slate-500'
        }`;
        innerContent = `
          <div class="flex items-center justify-between px-1.5 py-0.5 bg-slate-100 text-[10px] text-slate-600 drag-handle cursor-move rounded-t border-b border-slate-200">
            <span class="flex items-center gap-1 font-bold">
              <i data-lucide="square" class="w-3 h-3 text-slate-500"></i> Tarja Branca
            </span>
            <button class="btn-del-ann text-slate-400 hover:text-rose-600">
              <i data-lucide="x" class="w-3 h-3"></i>
            </button>
          </div>
          <div class="h-full flex items-center justify-center p-1">
            <span class="text-[9px] text-slate-400 select-none">[ Apagado ]</span>
          </div>
        `;
      } else if (ann.type === 'comment') {
        box.className = `absolute pointer-events-auto select-none bg-amber-50 rounded-xl border border-amber-300 shadow-md group ${
          isActive ? 'ring-2 ring-slate-900' : 'hover:shadow-lg'
        }`;
        innerContent = `
          <div class="flex items-center justify-between px-2 py-1 bg-amber-200/90 text-[11px] text-amber-900 drag-handle cursor-move rounded-t-xl font-bold border-b border-amber-300/60">
            <span class="flex items-center gap-1">
              <i data-lucide="message-square" class="w-3.5 h-3.5 text-amber-700"></i> Nota
            </span>
            <button class="btn-del-ann text-amber-700 hover:text-rose-600">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
          </div>
          <div class="p-1">
            <textarea class="ann-textarea w-full bg-transparent resize-none border-none outline-none leading-relaxed text-xs text-amber-950 font-medium" rows="3">${ann.text}</textarea>
          </div>
        `;
      } else {
        // Plain Text or Replace Text
        const isWhiteBg = ann.bgType === 'white' || ann.type === 'replace_text';
        box.className = `absolute pointer-events-auto rounded shadow-xs group ${
          isWhiteBg ? 'bg-white border border-slate-300' : 'bg-transparent border border-dashed border-slate-400/80 hover:border-slate-800'
        } ${isActive ? 'ring-2 ring-slate-900 shadow-md' : ''}`;

        innerContent = `
          <div class="flex items-center justify-between px-1.5 py-0.5 bg-slate-100/95 border-b border-slate-200 rounded-t text-[10px] text-slate-600 drag-handle cursor-move select-none ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}">
            <span class="flex items-center gap-1 font-bold">
              <i data-lucide="type" class="w-3 h-3 text-slate-700"></i>
              ${isWhiteBg ? 'Texto (Substituir)' : 'Texto Livre'}
            </span>
            <button class="btn-del-ann text-slate-400 hover:text-rose-600">
              <i data-lucide="x" class="w-3 h-3"></i>
            </button>
          </div>
          <div class="p-1">
            <textarea class="ann-textarea w-full bg-transparent resize-none border-none outline-none leading-normal p-1 select-text" style="
              font-size: ${ann.fontSize}px;
              color: ${ann.color};
              font-weight: ${ann.isBold ? 'bold' : 'normal'};
              min-height: 28px;
            ">${ann.text}</textarea>
          </div>
        `;
      }

      // Resize handle on bottom-right corner
      innerContent += `
        <div class="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center text-slate-400 hover:text-slate-900 font-mono text-[10px] select-none opacity-60 hover:opacity-100 pointer-events-auto">
          ◢
        </div>
      `;

      box.innerHTML = innerContent;
      layer.appendChild(box);

      // Select annotation on click
      box.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.btn-del-ann') && !e.target.closest('.resize-handle')) {
          this.activeAnnotationId = ann.id;
          this.syncPropertiesBar(ann);
        }
      });

      // Delete annotation
      box.querySelector('.btn-del-ann')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.annotations[this.currentPage] = list.filter(a => a.id !== ann.id);
        if (this.activeAnnotationId === ann.id) this.activeAnnotationId = null;
        this.renderAnnotationsForPage();
      });

      // Update text from textarea
      const textarea = box.querySelector('.ann-textarea');
      if (textarea) {
        textarea.addEventListener('input', () => {
          ann.text = textarea.value;
        });
      }

      // Drag & Resize
      const dragHandle = box.querySelector('.drag-handle');
      if (dragHandle) this.setupBoxDraggable(box, dragHandle, ann);

      const resizeHandle = box.querySelector('.resize-handle');
      if (resizeHandle) this.setupBoxResizable(box, resizeHandle, ann);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  syncPropertiesBar(ann) {
    const propFontSize = document.getElementById('prop-font-size');
    const propColor = document.getElementById('prop-color');
    const propBold = document.getElementById('prop-toggle-bold');
    const propBgSelect = document.getElementById('prop-bg-select');
    const fontGroup = document.getElementById('prop-font-group');
    const colorGroup = document.getElementById('prop-color-group');
    const bgGroup = document.getElementById('prop-bg-group');
    const hlColorsGroup = document.getElementById('prop-highlight-colors');

    const isText = ann.type === 'text' || ann.type === 'replace_text';
    const isComment = ann.type === 'comment';
    const isHighlight = ann.type === 'highlight';

    if (fontGroup) fontGroup.style.display = (isText || isComment) ? 'flex' : 'none';
    if (colorGroup) colorGroup.style.display = isText ? 'flex' : 'none';
    if (propBold) propBold.style.display = isText ? 'inline-block' : 'none';
    if (bgGroup) bgGroup.style.display = isText ? 'flex' : 'none';
    if (hlColorsGroup) hlColorsGroup.style.display = isHighlight ? 'flex' : 'none';

    if (propFontSize) propFontSize.value = ann.fontSize;
    if (propColor) propColor.value = ann.color;
    if (propBgSelect) propBgSelect.value = (ann.bgType === 'white' || ann.type === 'replace_text') ? 'white' : 'transparent';
    if (propBold) {
      if (ann.isBold) {
        propBold.classList.add('bg-slate-900', 'text-white');
        propBold.classList.remove('bg-white', 'text-slate-700');
      } else {
        propBold.classList.remove('bg-slate-900', 'text-white');
        propBold.classList.add('bg-white', 'text-slate-700');
      }
    }
  }

  setupBoxDraggable(box, handle, ann) {
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

    const onMouseDown = (e) => {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = box.offsetLeft;
      initialTop = box.offsetTop;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const stage = document.getElementById('page-stage-container');

      const maxLeft = stage.clientWidth - box.offsetWidth;
      const maxTop = stage.clientHeight - box.offsetHeight;

      const newLeft = Math.max(0, Math.min(maxLeft, initialLeft + dx));
      const newTop = Math.max(0, Math.min(maxTop, initialTop + dy));

      box.style.left = `${newLeft}px`;
      box.style.top = `${newTop}px`;

      ann.x = newLeft;
      ann.y = newTop;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
  }

  setupBoxResizable(box, handle, ann) {
    let startX = 0, startY = 0, initialWidth = 0, initialHeight = 0;

    const onMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      initialWidth = box.offsetWidth;
      initialHeight = box.offsetHeight;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newWidth = Math.max(50, initialWidth + dx);
      const newHeight = Math.max(20, initialHeight + dy);

      box.style.width = `${newWidth}px`;
      box.style.minHeight = `${newHeight}px`;

      ann.width = newWidth;
      ann.height = newHeight;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
  }

  hexToRgb(hex) {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
      r: ((num >> 16) & 255) / 255,
      g: ((num >> 8) & 255) / 255,
      b: (num & 255) / 255
    };
  }

  async executeSavePdf() {
    if (!this.pdfLibDoc) return;

    setLoading(true, 'Aplicando marca-textos, substituições e edições no PDF...');
    try {
      const fontRegular = await this.pdfLibDoc.embedFont(window.PDFLib.StandardFonts.Helvetica);
      const fontBold = await this.pdfLibDoc.embedFont(window.PDFLib.StandardFonts.HelveticaBold);
      const pages = this.pdfLibDoc.getPages();

      for (const [pageNumStr, pageAnnotations] of Object.entries(this.annotations)) {
        const pageIdx = parseInt(pageNumStr, 10) - 1;
        if (pageIdx < 0 || pageIdx >= pages.length) continue;

        const page = pages[pageIdx];
        const { width: pdfWidth, height: pdfHeight } = page.getSize();

        const pageProxy = await this.pdfJsDoc.getPage(pageIdx + 1);
        const viewport = pageProxy.getViewport({ scale: this.viewportScale });
        const scaleX = pdfWidth / viewport.width;
        const scaleY = pdfHeight / viewport.height;

        for (const ann of pageAnnotations) {
          const boxX = ann.x * scaleX;
          const boxYTop = ann.y * scaleY;
          const boxW = (ann.width || 120) * scaleX;
          const boxH = (ann.height || 30) * scaleY;

          // 1. MARCA-TEXTO (Highlighter)
          if (ann.type === 'highlight') {
            let hRgb = window.PDFLib.rgb(1, 0.92, 0.2); // Amarelo
            if (ann.highlightColor === 'green') hRgb = window.PDFLib.rgb(0.2, 0.92, 0.4);
            if (ann.highlightColor === 'pink') hRgb = window.PDFLib.rgb(1, 0.4, 0.7);
            if (ann.highlightColor === 'blue') hRgb = window.PDFLib.rgb(0.2, 0.8, 1);

            page.drawRectangle({
              x: boxX,
              y: pdfHeight - boxYTop - boxH,
              width: boxW,
              height: boxH,
              color: hRgb,
              opacity: 0.42
            });
          }
          // 2. TARJA PRETA (Censura / Redact)
          else if (ann.type === 'redact_black') {
            page.drawRectangle({
              x: boxX,
              y: pdfHeight - boxYTop - boxH,
              width: boxW,
              height: boxH,
              color: window.PDFLib.rgb(0, 0, 0),
              opacity: 1
            });
          }
          // 3. TARJA BRANCA (Apagar / Whiteout)
          else if (ann.type === 'redact_white') {
            page.drawRectangle({
              x: boxX,
              y: pdfHeight - boxYTop - boxH,
              width: boxW,
              height: boxH,
              color: window.PDFLib.rgb(1, 1, 1),
              opacity: 1
            });
          }
          // 4. COMENTÁRIO / NOTA ADESIVA
          else if (ann.type === 'comment') {
            const headerHeight = 16 * scaleY;
            
            // Corpo da nota
            page.drawRectangle({
              x: boxX,
              y: pdfHeight - boxYTop - boxH,
              width: boxW,
              height: boxH,
              color: window.PDFLib.rgb(1, 0.98, 0.8),
              borderColor: window.PDFLib.rgb(0.9, 0.78, 0.3),
              borderWidth: 1,
              opacity: 0.95
            });

            // Barra superior
            page.drawRectangle({
              x: boxX,
              y: pdfHeight - boxYTop - headerHeight,
              width: boxW,
              height: headerHeight,
              color: window.PDFLib.rgb(0.96, 0.88, 0.5),
              opacity: 1
            });

            // Título
            page.drawText('Comentario', {
              x: boxX + (5 * scaleX),
              y: pdfHeight - boxYTop - headerHeight + (3 * scaleY),
              size: 9 * scaleX,
              font: fontBold,
              color: window.PDFLib.rgb(0.4, 0.25, 0.05)
            });

            // Texto do comentário
            if (ann.text.trim()) {
              const lines = ann.text.split('\n');
              const fontSize = 10 * scaleX;
              let lineY = pdfHeight - boxYTop - headerHeight - fontSize - (4 * scaleY);

              for (const line of lines) {
                if (line.trim() && lineY > (pdfHeight - boxYTop - boxH)) {
                  page.drawText(line, {
                    x: boxX + (5 * scaleX),
                    y: lineY,
                    size: fontSize,
                    font: fontRegular,
                    color: window.PDFLib.rgb(0.25, 0.15, 0.05)
                  });
                  lineY -= fontSize * 1.3;
                }
              }
            }
          }
          // 5. CAIXA DE TEXTO / SUBSTITUIR TEXTO
          else if ((ann.type === 'text' || ann.type === 'replace_text') && ann.text.trim()) {
            const isWhiteBg = ann.bgType === 'white' || ann.type === 'replace_text';

            if (isWhiteBg) {
              page.drawRectangle({
                x: boxX,
                y: pdfHeight - boxYTop - boxH,
                width: boxW,
                height: boxH,
                color: window.PDFLib.rgb(1, 1, 1),
                opacity: 1
              });
            }

            const font = ann.isBold ? fontBold : fontRegular;
            const pdfFontSize = ann.fontSize * scaleX;
            const headerOffset = 14 * scaleY;
            const textColor = this.hexToRgb(ann.color || '#000000');
            const lines = ann.text.split('\n');
            let currentLineY = pdfHeight - boxYTop - headerOffset - pdfFontSize;

            for (const line of lines) {
              if (line.trim()) {
                page.drawText(line, {
                  x: boxX + (3 * scaleX),
                  y: currentLineY,
                  size: pdfFontSize,
                  font: font,
                  color: window.PDFLib.rgb(textColor.r, textColor.g, textColor.b),
                  opacity: 1
                });
              }
              currentLineY -= pdfFontSize * 1.25;
            }
          }
        }
      }

      setLoading(true, 'Salvando novo PDF editado...');
      const bytes = await this.pdfLibDoc.save();
      const baseName = this.file.name.replace(/\.pdf$/i, '');
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${baseName}_editado.pdf`);

      notify('PDF editado com sucesso! O download foi iniciado.', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao salvar edições do PDF: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }
}
