/**
 * Ferramenta: Editar PDF (Inserir Caixas de Texto, Tarjas e Anotações)
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
    // Annotation object: { id, type: 'text'|'whiteout', x, y, width, height, text, fontSize, color, isBold, bgType }
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
              <i data-lucide="type" class="w-7 h-7 text-indigo-600"></i>
              Editar PDF — Inserir Textos
            </h2>
            <p class="text-sm text-slate-500 mt-0.5">Adicione caixas de texto editáveis, tarjas brancas e preencha formulários no documento.</p>
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
          <div class="bg-white p-3 border border-slate-200 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
            <!-- Left Tools -->
            <div class="flex items-center gap-2">
              <button id="btn-add-text" class="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1.5 transition">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Adicionar Caixa de Texto</span>
              </button>
              <button id="btn-add-whiteout" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition">
                <i data-lucide="square" class="w-4 h-4"></i>
                <span>Tarja Branca (Ocultar)</span>
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

          <!-- Formatting Properties Bar (Active when a box is selected) -->
          <div id="formatting-bar" class="bg-indigo-50/60 p-2.5 border border-indigo-100 rounded-xl flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            <span class="text-indigo-800 font-bold flex items-center gap-1">
              <i data-lucide="sliders" class="w-3.5 h-3.5"></i> Formatação:
            </span>
            
            <div class="flex items-center gap-1.5">
              <span>Tamanho:</span>
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

            <div class="flex items-center gap-1.5">
              <span>Cor:</span>
              <input type="color" id="prop-color" value="#000000" class="w-7 h-7 p-0.5 border border-slate-300 rounded cursor-pointer bg-white">
            </div>

            <button id="prop-toggle-bold" class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-100 transition">
              B
            </button>

            <div class="flex items-center gap-1.5">
              <span>Fundo:</span>
              <select id="prop-bg" class="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs">
                <option value="transparent">Transparente</option>
                <option value="white">Fundo Branco (Tarja)</option>
                <option value="yellow">Marca-Texto Amarelo</option>
              </select>
            </div>

            <button id="btn-delete-active-box" class="ml-auto text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-100 transition font-semibold">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Excluir</span>
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

          <p class="text-center text-xs text-slate-400">
            Dica: Clique na caixa de texto para digitar. Arraste pela borda ou ícone de mover para reposicionar em qualquer lugar da folha.
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
    const addWhiteoutBtn = document.getElementById('btn-add-whiteout');
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
    const propBg = document.getElementById('prop-bg');

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

    addTextBtn?.addEventListener('click', () => this.addAnnotation('text'));
    addWhiteoutBtn?.addEventListener('click', () => this.addAnnotation('whiteout'));

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

    propBg?.addEventListener('change', (e) => {
      const active = this.getActiveAnnotation();
      if (active) {
        active.bgType = e.target.value;
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

      // Load with pdf-lib for editing / saving
      this.pdfLibDoc = await window.PDFLib.PDFDocument.load(buffer, { ignoreEncryption: true });

      // Load with pdf.js for high-fidelity interactive canvas rendering
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
      notify('PDF pronto para edição! Clique em "Adicionar Caixa de Texto".', 'success');
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
      const layer = document.getElementById('annotations-layer');
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
    const newBox = {
      id,
      type,
      x: 50,
      y: 50 + (this.annotations[this.currentPage].length * 30),
      width: type === 'whiteout' ? 180 : 220,
      height: type === 'whiteout' ? 35 : 55,
      text: type === 'whiteout' ? '' : 'Digite seu texto aqui...',
      fontSize: 14,
      color: '#000000',
      isBold: false,
      bgType: type === 'whiteout' ? 'white' : 'transparent'
    };

    this.annotations[this.currentPage].push(newBox);
    this.activeAnnotationId = id;
    this.renderAnnotationsForPage();
    notify(type === 'whiteout' ? 'Tarja branca adicionada.' : 'Caixa de texto adicionada! Arraste para posicionar.', 'info');
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

      box.className = `absolute rounded transition-shadow cursor-default ${
        isActive ? 'ring-2 ring-indigo-500 shadow-md' : 'border border-dashed border-slate-300 hover:border-slate-500'
      }`;
      box.style.left = `${ann.x}px`;
      box.style.top = `${ann.y}px`;
      box.style.minWidth = `${ann.width}px`;

      // Apply background
      if (ann.bgType === 'white') {
        box.style.backgroundColor = '#ffffff';
      } else if (ann.bgType === 'yellow') {
        box.style.backgroundColor = 'rgba(254, 240, 138, 0.65)';
      } else {
        box.style.backgroundColor = 'transparent';
      }

      // Drag handle + Content editable
      box.innerHTML = `
        <div class="flex items-center justify-between px-1.5 py-0.5 bg-slate-100/90 border-b border-slate-200/60 rounded-t text-[10px] text-slate-500 drag-handle cursor-move select-none ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}">
          <span class="flex items-center gap-1 font-bold">
            <i data-lucide="grip-horizontal" class="w-3.5 h-3.5"></i>
            ${ann.type === 'whiteout' ? 'Tarja' : 'Texto'}
          </span>
          <button class="btn-del-ann text-slate-400 hover:text-rose-600">
            <i data-lucide="x" class="w-3 h-3"></i>
          </button>
        </div>
        ${ann.type === 'whiteout' ? `
          <div class="p-2 text-center text-[10px] text-slate-300 pointer-events-none select-none">
            [ Tarja de Ocultação ]
          </div>
        ` : `
          <div contenteditable="true" class="ann-text-content px-2 py-1 outline-none text-left break-words" style="
            font-size: ${ann.fontSize}px;
            color: ${ann.color};
            font-weight: ${ann.isBold ? 'bold' : 'normal'};
            min-height: 24px;
          ">${ann.text}</div>
        `}
      `;

      layer.appendChild(box);

      // Event: select annotation
      box.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.btn-del-ann')) {
          this.activeAnnotationId = ann.id;
          this.syncPropertiesBar(ann);
        }
      });

      // Event: delete annotation
      box.querySelector('.btn-del-ann')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.annotations[this.currentPage] = list.filter(a => a.id !== ann.id);
        if (this.activeAnnotationId === ann.id) this.activeAnnotationId = null;
        this.renderAnnotationsForPage();
      });

      // Event: update text content
      const textEl = box.querySelector('.ann-text-content');
      if (textEl) {
        textEl.addEventListener('input', () => {
          ann.text = textEl.innerText;
        });
      }

      // Drag implementation
      const handle = box.querySelector('.drag-handle');
      if (handle) {
        this.setupBoxDraggable(box, handle, ann);
      }
    });

    if (window.lucide) window.lucide.createIcons();
  }

  syncPropertiesBar(ann) {
    const propFontSize = document.getElementById('prop-font-size');
    const propColor = document.getElementById('prop-color');
    const propBold = document.getElementById('prop-toggle-bold');
    const propBg = document.getElementById('prop-bg');

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
    if (propBg) propBg.value = ann.bgType;
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

  // Parse HEX color to RGB 0-1 for PDF-Lib
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

    setLoading(true, 'Aplicando caixas de texto e modificações no PDF...');
    try {
      const fontRegular = await this.pdfLibDoc.embedFont(window.PDFLib.StandardFonts.Helvetica);
      const fontBold = await this.pdfLibDoc.embedFont(window.PDFLib.StandardFonts.HelveticaBold);
      const pages = this.pdfLibDoc.getPages();

      // Loop through all pages with annotations
      for (const [pageNumStr, pageAnnotations] of Object.entries(this.annotations)) {
        const pageIdx = parseInt(pageNumStr, 10) - 1;
        if (pageIdx < 0 || pageIdx >= pages.length) continue;

        const page = pages[pageIdx];
        const { width: pdfWidth, height: pdfHeight } = page.getSize();

        // Get viewport to calculate exact scale from canvas pixels to PDF points
        const pageProxy = await this.pdfJsDoc.getPage(pageIdx + 1);
        const viewport = pageProxy.getViewport({ scale: this.viewportScale });
        const scaleX = pdfWidth / viewport.width;
        const scaleY = pdfHeight / viewport.height;

        for (const ann of pageAnnotations) {
          const font = ann.isBold ? fontBold : fontRegular;
          const pdfFontSize = ann.fontSize * scaleX;
          const boxX = ann.x * scaleX;
          
          // PDF coordinate system origin is bottom-left, canvas is top-left
          const headerOffset = 18 * scaleY;
          const boxYTop = ann.y * scaleY;

          // Draw background or whiteout rectangle if specified
          if (ann.bgType === 'white' || ann.type === 'whiteout') {
            const rectHeight = (ann.type === 'whiteout' ? ann.height : (ann.fontSize + 16)) * scaleY;
            const rectWidth = (ann.width || 180) * scaleX;
            page.drawRectangle({
              x: boxX,
              y: pdfHeight - boxYTop - rectHeight,
              width: rectWidth,
              height: rectHeight,
              color: window.PDFLib.rgb(1, 1, 1),
              opacity: 1
            });
          } else if (ann.bgType === 'yellow') {
            const rectHeight = (ann.fontSize + 12) * scaleY;
            const rectWidth = (ann.width || 180) * scaleX;
            page.drawRectangle({
              x: boxX,
              y: pdfHeight - boxYTop - rectHeight,
              width: rectWidth,
              height: rectHeight,
              color: window.PDFLib.rgb(1, 0.95, 0.5),
              opacity: 0.6
            });
          }

          // Draw text if not purely a whiteout
          if (ann.type === 'text' && ann.text.trim()) {
            const textColor = this.hexToRgb(ann.color || '#000000');
            const lines = ann.text.split('\n');
            let currentLineY = pdfHeight - boxYTop - headerOffset - pdfFontSize;

            for (const line of lines) {
              if (line.trim()) {
                page.drawText(line, {
                  x: boxX + (4 * scaleX),
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
