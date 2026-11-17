/**
 * Ferramenta: Editar PDF — Inserir Textos, Tarjas (Preta/Branca) e Comentários
 */
import { readFileAsArrayBuffer, downloadBlob, formatBytes, notify, setLoading } from '../utils.js';

export class EditPdfTool {
  constructor() {
    this.file = null;
    this.pdfLibDoc = null;
    this.pdfJsDoc = null;
    this.totalPages = 0;
    this.currentPage = 1;
    this.container = document.getElementById('tool-workspace');
    
    // Scale for rendering page canvas
    this.viewportScale = 1.35;
    this.currentViewport = null;

    // Annotations map: pageNumber (1-based) -> Array of annotations
    // Types: 'text' | 'redact_black' | 'redact_white' | 'comment' | 'highlight'
    this.annotations = {};
    this.activeAnnotationId = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-4">
        <!-- Header & Action Bar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <i data-lucide="edit-3" class="w-7 h-7 text-indigo-600"></i>
              Editar PDF — Textos, Tarjas & Comentários
            </h2>
            <p class="text-sm text-slate-500 mt-0.5">Tarje dados confidenciais, adicione caixas de texto e insira notas e comentários nas páginas.</p>
          </div>
          <div class="flex items-center gap-3">
            <button id="btn-save-edited-pdf" disabled class="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition">
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>Salvar PDF Editado</span>
            </button>
          </div>
        </div>

        <!-- Dropzone Section -->
        <div id="dropzone-section">
          <div id="dropzone" class="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-10 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20 group">
            <input type="file" id="file-input" accept=".pdf" class="hidden" />
            <div class="flex flex-col items-center justify-center space-y-3">
              <div class="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition duration-200">
                <i data-lucide="file-up" class="w-8 h-8"></i>
              </div>
              <div>
                <p class="text-base font-semibold text-slate-700">Selecione o arquivo PDF para editar</p>
                <p class="text-xs text-slate-400 mt-1">Clique ou arraste um PDF aqui</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Editor Workspace (Hidden until file is loaded) -->
        <div id="editor-workspace" class="hidden space-y-3">
          
          <!-- Top Editor Toolbar -->
          <div class="bg-white p-3 border border-slate-200 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-2.5">
            <!-- Left Action Tools -->
            <div class="flex flex-wrap items-center gap-2">
              <button id="btn-add-text" class="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1.5 transition">
                <i data-lucide="type" class="w-4 h-4"></i>
                <span>+ Texto</span>
              </button>
              
              <button id="btn-add-redact-black" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm">
                <i data-lucide="shield-alert" class="w-4 h-4 text-rose-400"></i>
                <span>Tarja Preta (Censurar)</span>
              </button>

              <button id="btn-add-redact-white" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition border border-slate-200">
                <i data-lucide="square" class="w-4 h-4"></i>
                <span>Tarja Branca (Apagar)</span>
              </button>

              <button id="btn-add-comment" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs flex items-center gap-1.5 transition border border-amber-200">
                <i data-lucide="message-square" class="w-4 h-4 text-amber-600"></i>
                <span>+ Comentário / Nota</span>
              </button>

              <button id="btn-add-highlight" class="px-3 py-1.5 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-yellow-800 font-semibold text-xs flex items-center gap-1.5 transition border border-yellow-200">
                <i data-lucide="highlighter" class="w-4 h-4 text-yellow-600"></i>
                <span>Marca-Texto</span>
              </button>
            </div>

            <!-- Page Navigation -->
            <div class="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
              <button id="btn-prev-page" class="p-1 hover:bg-white rounded-lg transition disabled:opacity-30">
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
              </button>
              <span id="page-indicator">Página 1 de 1</span>
              <button id="btn-next-page" class="p-1 hover:bg-white rounded-lg transition disabled:opacity-30">
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
              </button>
            </div>

            <!-- Zoom & Change File -->
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1 text-xs text-slate-600 font-semibold">
                <button id="btn-zoom-out" class="p-1.5 hover:bg-slate-100 rounded-lg transition" title="Reduzir zoom">
                  <i data-lucide="zoom-out" class="w-4 h-4"></i>
                </button>
                <span id="zoom-label" class="w-12 text-center">100%</span>
                <button id="btn-zoom-in" class="p-1.5 hover:bg-slate-100 rounded-lg transition" title="Aumentar zoom">
                  <i data-lucide="zoom-in" class="w-4 h-4"></i>
                </button>
              </div>
              <button id="btn-change-file" class="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1">
                Trocar Arquivo
              </button>
            </div>
          </div>

          <!-- Formatting Properties Bar -->
          <div id="formatting-bar" class="bg-indigo-50/60 p-2.5 border border-indigo-100 rounded-xl flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            <span class="text-indigo-800 font-bold flex items-center gap-1">
              <i data-lucide="sliders" class="w-3.5 h-3.5"></i> Propriedades:
            </span>
            
            <div id="prop-font-group" class="flex items-center gap-1.5">
              <span>Fonte:</span>
              <select id="prop-font-size" class="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs">
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

            <div id="prop-color-group" class="flex items-center gap-1.5">
              <span>Cor:</span>
              <input type="color" id="prop-color" value="#000000" class="w-7 h-7 p-0.5 border border-slate-300 rounded cursor-pointer bg-white">
            </div>

            <button id="prop-toggle-bold" class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-100 transition" title="Alternar Negrito">
              B
            </button>

            <button id="btn-delete-active-box" class="ml-auto text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-100 transition font-semibold">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Excluir Item Selecionado</span>
            </button>
          </div>

          <!-- Canvas Page Stage with Scrollable Area -->
          <div class="relative bg-slate-200/70 p-6 rounded-3xl overflow-auto max-h-[75vh] flex items-center justify-center">
            <div id="page-stage-container" class="relative bg-white shadow-2xl rounded transition-transform origin-top">
              <canvas id="pdf-page-canvas" class="block"></canvas>
              <!-- Annotations overlay layer exactly matching canvas dimensions -->
              <div id="annotations-layer" class="absolute inset-0 select-none overflow-hidden"></div>
            </div>
          </div>

          <p class="text-center text-xs text-slate-500">
            💡 <strong>Instruções:</strong> Use a barra superior para adicionar tarjas pretas (censura), notas adesivas ou caixas de texto. Arraste pela barra superior para mover e <strong>pelo canto inferior direito (◢) para redimensionar</strong> a tarja ou caixa.
          </p>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.bindEvents();
  }

  bindEvents() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const addTextBtn = document.getElementById('btn-add-text');
    const addRedactBlackBtn = document.getElementById('btn-add-redact-black');
    const addRedactWhiteBtn = document.getElementById('btn-add-redact-white');
    const addCommentBtn = document.getElementById('btn-add-comment');
    const addHighlightBtn = document.getElementById('btn-add-highlight');
    
    const prevPageBtn = document.getElementById('btn-prev-page');
    const nextPageBtn = document.getElementById('btn-next-page');
    const zoomInBtn = document.getElementById('btn-zoom-in');
    const zoomOutBtn = document.getElementById('btn-zoom-out');
    const saveBtn = document.getElementById('btn-save-edited-pdf');
    const changeBtn = document.getElementById('btn-change-file');
    const deleteActiveBtn = document.getElementById('btn-delete-active-box');

    // Properties controls
    const propFontSize = document.getElementById('prop-font-size');
    const propColor = document.getElementById('prop-color');
    const propBold = document.getElementById('prop-toggle-bold');

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

    // Add buttons
    addTextBtn?.addEventListener('click', () => this.addAnnotation('text'));
    addRedactBlackBtn?.addEventListener('click', () => this.addAnnotation('redact_black'));
    addRedactWhiteBtn?.addEventListener('click', () => this.addAnnotation('redact_white'));
    addCommentBtn?.addEventListener('click', () => this.addAnnotation('comment'));
    addHighlightBtn?.addEventListener('click', () => this.addAnnotation('highlight'));

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
        this.viewportScale += 0.25;
        this.updateZoomLabel();
        this.renderCurrentPage();
      }
    });

    zoomOutBtn?.addEventListener('click', () => {
      if (this.viewportScale > 0.75) {
        this.viewportScale -= 0.25;
        this.updateZoomLabel();
        this.renderCurrentPage();
      }
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
      label.textContent = `${Math.round((this.viewportScale / 1.35) * 100)}%`;
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

      document.getElementById('dropzone-section').classList.add('hidden');
      document.getElementById('editor-workspace').classList.remove('hidden');
      document.getElementById('btn-save-edited-pdf').disabled = false;

      await this.renderCurrentPage();
      notify('PDF pronto! Escolha uma ferramenta na barra superior.', 'success');
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

      // Update page navigation UI
      document.getElementById('page-indicator').textContent = `Página ${this.currentPage} de ${this.totalPages}`;
      document.getElementById('btn-prev-page').disabled = this.currentPage <= 1;
      document.getElementById('btn-next-page').disabled = this.currentPage >= this.totalPages;

      this.renderAnnotationsForPage();
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
    let width = 200, height = 50, text = '', fontSize = 14, color = '#000000', isBold = false;

    if (type === 'redact_black') {
      width = 160;
      height = 24;
      text = '';
    } else if (type === 'redact_white') {
      width = 160;
      height = 24;
      text = '';
    } else if (type === 'comment') {
      width = 220;
      height = 95;
      text = 'Adicione seu comentário ou observação aqui...';
      fontSize = 12;
      color = '#78350f';
    } else if (type === 'highlight') {
      width = 180;
      height = 22;
      text = '';
    } else {
      // Regular text
      width = 220;
      height = 50;
      text = 'Digite seu texto aqui...';
      fontSize = 14;
      color = '#000000';
    }

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
      isBold
    };

    this.annotations[this.currentPage].push(newBox);
    this.activeAnnotationId = id;
    this.renderAnnotationsForPage();

    const messages = {
      redact_black: 'Tarja preta de censura adicionada. Arraste e estique pelo canto ◢.',
      redact_white: 'Tarja branca para apagar adicionada.',
      comment: 'Nota de comentário adicionada! Digite sua observação.',
      highlight: 'Marca-texto adicionado.',
      text: 'Caixa de texto adicionada! Clique para digitar.'
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

      if (ann.type === 'redact_black') {
        box.className = `absolute select-none bg-black rounded shadow-md group ${
          isActive ? 'ring-2 ring-indigo-500' : 'hover:ring-1 hover:ring-slate-400'
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
        box.className = `absolute select-none bg-white rounded border border-slate-300 shadow-sm group ${
          isActive ? 'ring-2 ring-indigo-500' : 'hover:border-slate-500'
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
        // Sticky Note
        box.className = `absolute select-none bg-amber-50 rounded-xl border border-amber-300 shadow-md group ${
          isActive ? 'ring-2 ring-indigo-500' : 'hover:shadow-lg'
        }`;
        innerContent = `
          <div class="flex items-center justify-between px-2 py-1 bg-amber-200/80 text-[11px] text-amber-900 drag-handle cursor-move rounded-t-xl font-bold border-b border-amber-300/60">
            <span class="flex items-center gap-1">
              <i data-lucide="message-square" class="w-3.5 h-3.5 text-amber-700"></i> Comentário
            </span>
            <button class="btn-del-ann text-amber-700 hover:text-rose-600">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
          </div>
          <div contenteditable="true" class="ann-text-content p-2 text-xs text-amber-950 outline-none leading-relaxed break-words" style="min-height: 55px;">${ann.text}</div>
        `;
      } else if (ann.type === 'highlight') {
        box.className = `absolute select-none bg-yellow-300/50 rounded border border-yellow-400/80 shadow-sm group ${
          isActive ? 'ring-2 ring-indigo-500' : ''
        }`;
        innerContent = `
          <div class="flex items-center justify-between px-1.5 py-0.5 bg-yellow-400/70 text-[10px] text-yellow-900 drag-handle cursor-move rounded-t">
            <span class="flex items-center gap-1 font-bold">
              <i data-lucide="highlighter" class="w-3 h-3"></i> Marca-Texto
            </span>
            <button class="btn-del-ann text-yellow-900 hover:text-rose-600">
              <i data-lucide="x" class="w-3 h-3"></i>
            </button>
          </div>
        `;
      } else {
        // Plain text box
        box.className = `absolute select-none bg-transparent rounded border border-dashed border-slate-300 hover:border-slate-500 group ${
          isActive ? 'ring-2 ring-indigo-500 bg-white/40 shadow-sm' : ''
        }`;
        innerContent = `
          <div class="flex items-center justify-between px-1.5 py-0.5 bg-slate-100/90 border-b border-slate-200/60 rounded-t text-[10px] text-slate-500 drag-handle cursor-move select-none ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}">
            <span class="flex items-center gap-1 font-bold">
              <i data-lucide="type" class="w-3 h-3"></i> Caixa de Texto
            </span>
            <button class="btn-del-ann text-slate-400 hover:text-rose-600">
              <i data-lucide="x" class="w-3 h-3"></i>
            </button>
          </div>
          <div contenteditable="true" class="ann-text-content px-2 py-1 outline-none text-left break-words" style="
            font-size: ${ann.fontSize}px;
            color: ${ann.color};
            font-weight: ${ann.isBold ? 'bold' : 'normal'};
            min-height: 24px;
          ">${ann.text}</div>
        `;
      }

      // Add bottom-right resize grip
      innerContent += `
        <div class="resize-handle absolute bottom-0 right-0 w-3.5 h-3.5 cursor-se-resize flex items-center justify-center text-slate-400 hover:text-indigo-600 font-mono text-[9px] select-none opacity-60 hover:opacity-100">
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

      // Update text content
      const textEl = box.querySelector('.ann-text-content');
      if (textEl) {
        textEl.addEventListener('input', () => {
          ann.text = textEl.innerText;
        });
      }

      // Setup Drag & Setup Resize
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
    const fontGroup = document.getElementById('prop-font-group');
    const colorGroup = document.getElementById('prop-color-group');

    // Show/hide font controls depending on annotation type
    const hasText = ann.type === 'text' || ann.type === 'comment';
    if (fontGroup) fontGroup.style.display = hasText ? 'flex' : 'none';
    if (colorGroup) colorGroup.style.display = (ann.type === 'text') ? 'flex' : 'none';
    if (propBold) propBold.style.display = hasText ? 'inline-block' : 'none';

    if (propFontSize) propFontSize.value = ann.fontSize;
    if (propColor) propColor.value = ann.color;
    if (propBold) {
      if (ann.isBold) {
        propBold.classList.add('bg-indigo-600', 'text-white');
        propBold.classList.remove('bg-white', 'text-slate-700');
      } else {
        propBold.classList.remove('bg-indigo-600', 'text-white');
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

    setLoading(true, 'Aplicando tarjas, comentários e modificações...');
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

          if (ann.type === 'redact_black') {
            // Permanent black redaction rectangle (covers everything underneath)
            page.drawRectangle({
              x: boxX,
              y: pdfHeight - boxYTop - boxH,
              width: boxW,
              height: boxH,
              color: window.PDFLib.rgb(0, 0, 0),
              opacity: 1
            });
          } else if (ann.type === 'redact_white') {
            // Whiteout rectangle
            page.drawRectangle({
              x: boxX,
              y: pdfHeight - boxYTop - boxH,
              width: boxW,
              height: boxH,
              color: window.PDFLib.rgb(1, 1, 1),
              opacity: 1
            });
          } else if (ann.type === 'highlight') {
            // Semitransparent yellow highlighter
            page.drawRectangle({
              x: boxX,
              y: pdfHeight - boxYTop - boxH,
              width: boxW,
              height: boxH,
              color: window.PDFLib.rgb(1, 0.92, 0.2),
              opacity: 0.4
            });
          } else if (ann.type === 'comment') {
            // Yellow Sticky Note: Body + Header + Text
            const headerHeight = 16 * scaleY;
            
            // Note body
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

            // Note top banner
            page.drawRectangle({
              x: boxX,
              y: pdfHeight - boxYTop - headerHeight,
              width: boxW,
              height: headerHeight,
              color: window.PDFLib.rgb(0.96, 0.88, 0.5),
              opacity: 1
            });

            // Note title
            page.drawText('Comentario', {
              x: boxX + (5 * scaleX),
              y: pdfHeight - boxYTop - headerHeight + (3 * scaleY),
              size: 9 * scaleX,
              font: fontBold,
              color: window.PDFLib.rgb(0.4, 0.25, 0.05)
            });

            // Note comment text
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
          } else if (ann.type === 'text' && ann.text.trim()) {
            // Text box
            const font = ann.isBold ? fontBold : fontRegular;
            const pdfFontSize = ann.fontSize * scaleX;
            const headerOffset = 14 * scaleY;
            const textColor = this.hexToRgb(ann.color || '#000000');
            const lines = ann.text.split('\n');
            let currentLineY = pdfHeight - boxYTop - headerOffset - pdfFontSize;

            for (const line of lines) {
              if (line.trim()) {
                page.drawText(line, {
                  x: boxX + (2 * scaleX),
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
