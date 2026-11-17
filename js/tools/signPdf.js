/**
 * Ferramenta: Assinar PDF (Assinatura Digital, Desenho, Digitação e Rubrica)
 * Processamento 100% no navegador via Canvas e PDF-Lib
 */
import { readFileAsArrayBuffer, downloadBlob, formatBytes, notify, setLoading } from '../utils.js';
import { t } from '../i18n.js';

export class SignPdfTool {
  constructor() {
    this.file = null;
    this.pdfLibDoc = null;
    this.pdfJsDoc = null;
    this.totalPages = 0;
    this.currentPage = 1;
    this.container = document.getElementById('tool-workspace');
    
    this.viewportScale = 1.25;
    this.currentViewport = null;
    this.basePageWidth = 595;

    // Signatures placed on pages: pageNumber -> array of { id, x, y, width, height, dataUrl }
    this.signatures = {};
    this.activeSignatureId = null;

    // Signature creation state
    this.signatureTab = 'draw'; // 'draw' | 'type' | 'upload'
    this.drawColor = '#0f2b5c'; // Classic dark blue ink
    this.isDrawing = false;
  }

  render() {
    this.container.innerHTML = `
      <div class="w-full">
        
        <!-- Dropzone Section -->
        <div id="dropzone-section">
          <div id="dropzone" class="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-3xl p-12 text-center cursor-pointer transition bg-white group shadow-xs">
            <input type="file" id="file-input" accept=".pdf" class="hidden" />
            <div class="flex flex-col items-center justify-center space-y-3">
              <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 group-hover:scale-105 transition duration-200">
                <i data-lucide="pen-tool" class="w-8 h-8"></i>
              </div>
              <div>
                <p class="text-base font-bold text-slate-800">${t('signDropText')}</p>
                <p class="text-xs text-slate-400 mt-1">${t('signDropSub')}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Editor Workspace with Lateral Sidebar Layout -->
        <div id="sign-workspace" class="hidden flex flex-col md:flex-row gap-5 items-start">
          
          <!-- LEFT LATERAL SIDEBAR -->
          <aside class="w-full md:w-72 lg:w-80 flex-shrink-0 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-5 md:sticky md:top-20 z-20">
            
            <!-- Page Navigator & File Change -->
            <div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Páginas</span>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <button id="btn-sign-prev" class="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition disabled:opacity-30">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                  </button>
                  <span id="sign-page-indicator" class="text-xs font-bold text-slate-800 min-w-16 text-center">1 de 1</span>
                  <button id="btn-sign-next" class="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition disabled:opacity-30">
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
              <button id="btn-sign-change-file" class="text-xs text-slate-500 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                ${t('btnChangeFile')}
              </button>
            </div>

            <!-- Signature Creation Trigger -->
            <div class="space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Assinatura</span>
              
              <button id="btn-open-sign-modal" class="w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/25 hover:-translate-y-0.5">
                <i data-lucide="feather" class="w-4 h-4"></i>
                <span>${t('btnSignModal')}</span>
              </button>
            </div>

            <!-- Placed Signatures Info -->
            <div id="sign-props-panel" class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i>
                  ${t('signSelectedBadge')}
                </span>
                <button id="btn-delete-active-sign" class="text-rose-600 hover:text-rose-800 font-bold text-[11px] flex items-center gap-1">
                  <i data-lucide="trash-2" class="w-3 h-3"></i> ${t('btnDeleteSelected')}
                </button>
              </div>
              <p class="text-[11px] text-slate-500 leading-normal">
                ${t('signHintDrag')}
              </p>
            </div>

            <!-- Zoom & Save Actions -->
            <div class="pt-3 border-t border-slate-100 space-y-3">
              <div class="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs font-semibold">
                <span class="text-slate-500">Zoom:</span>
                <div class="flex items-center gap-1">
                  <button id="btn-sign-zoom-out" class="p-1 hover:bg-white rounded transition text-slate-700">
                    <i data-lucide="minus" class="w-3.5 h-3.5"></i>
                  </button>
                  <span id="sign-zoom-label" class="w-11 text-center font-mono">100%</span>
                  <button id="btn-sign-zoom-in" class="p-1 hover:bg-white rounded transition text-slate-700">
                    <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                  </button>
                  <button id="btn-sign-fit" class="ml-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-100">
                    Ajustar
                  </button>
                </div>
              </div>

              <!-- Primary Save Action Button -->
              <button id="btn-save-signed-pdf" disabled class="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-slate-950/20 flex items-center justify-center gap-2 transition hover:-translate-y-0.5">
                <i data-lucide="download" class="w-4 h-4 text-emerald-400"></i>
                <span>${t('btnSaveSigned')}</span>
              </button>
            </div>

          </aside>

          <!-- RIGHT CANVAS STAGE AREA -->
          <main class="flex-1 min-w-0 w-full">
            <div id="sign-canvas-scroll-container" class="w-full bg-slate-200/90 rounded-3xl p-4 sm:p-10 overflow-auto min-h-[75vh] flex justify-center items-start shadow-inner">
              <div id="sign-page-stage-container" class="relative bg-white shadow-2xl rounded origin-top flex-shrink-0 transition-transform">
                <canvas id="sign-pdf-page-canvas" class="block"></canvas>
                <!-- Signatures overlay layer matching canvas dimensions -->
                <div id="sign-annotations-layer" class="absolute inset-0 overflow-visible pointer-events-none"></div>
              </div>
            </div>
            
            <div class="flex items-center justify-between text-xs text-slate-400 mt-2 px-2">
              <span id="sign-dimensions-badge" class="font-mono text-[11px]">Visualização: 0 × 0 px</span>
              <span>${t('docxLocalBadge')}</span>
            </div>
          </main>

        </div>

        <!-- Signature Creator Modal -->
        <div id="sign-modal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs hidden items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="feather" class="w-5 h-5 text-indigo-600"></i>
                ${t('signModalTitle')}
              </h3>
              <button id="btn-close-sign-modal" class="text-slate-400 hover:text-slate-700 p-1">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <!-- Modal Tabs -->
            <div class="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold text-slate-600">
              <button class="sign-tab-btn flex-1 py-1.5 rounded-lg transition bg-white text-slate-900 shadow-xs" data-tab="draw">
                ${t('signTabDraw')}
              </button>
              <button class="sign-tab-btn flex-1 py-1.5 rounded-lg transition text-slate-500 hover:text-slate-900" data-tab="type">
                ${t('signTabType')}
              </button>
              <button class="sign-tab-btn flex-1 py-1.5 rounded-lg transition text-slate-500 hover:text-slate-900" data-tab="upload">
                ${t('signTabUpload')}
              </button>
            </div>

            <!-- Tab 1: Draw Pad -->
            <div id="tab-draw-content" class="space-y-3">
              <div class="border-2 border-slate-200 rounded-2xl bg-slate-50/50 overflow-hidden relative cursor-crosshair">
                <canvas id="signature-pad-canvas" width="460" height="170" class="w-full bg-white block"></canvas>
                <div class="absolute bottom-2 left-3 text-[11px] text-slate-400 select-none pointer-events-none">
                  ${t('signDrawHint')}
                </div>
              </div>

              <div class="flex items-center justify-between text-xs font-semibold">
                <div class="flex items-center gap-2">
                  <span class="text-slate-500">${t('signInkColor')}</span>
                  <button class="sign-color-btn w-6 h-6 rounded-full bg-[#0f2b5c] border-2 border-slate-900 shadow-xs" data-color="#0f2b5c" title="Azul Caneta"></button>
                  <button class="sign-color-btn w-6 h-6 rounded-full bg-[#000000] border-2 border-slate-300 shadow-xs" data-color="#000000" title="Preto"></button>
                </div>

                <button id="btn-clear-canvas" class="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1">
                  ${t('btnClearPad')}
                </button>
              </div>
            </div>

            <!-- Tab 2: Type Signature -->
            <div id="tab-type-content" class="hidden space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">${t('signYourName')}</label>
                <input type="text" id="type-sign-input" placeholder="Ex: Maria Silva" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
              </div>

              <div class="space-y-2">
                <span class="text-xs font-semibold text-slate-500">${t('signStyleLabel')}</span>
                <div class="grid grid-cols-2 gap-3">
                  <label class="p-4 border-2 border-indigo-600 rounded-xl bg-indigo-50/30 cursor-pointer text-center">
                    <input type="radio" name="typed_font" value="Dancing Script" checked class="hidden">
                    <span id="preview-font-1" style="font-family: 'Dancing Script', cursive;" class="text-2xl text-slate-800 block">Maria Silva</span>
                  </label>
                  <label class="p-4 border-2 border-slate-200 rounded-xl hover:border-slate-400 cursor-pointer text-center">
                    <input type="radio" name="typed_font" value="Caveat" class="hidden">
                    <span id="preview-font-2" style="font-family: 'Caveat', cursive;" class="text-2xl text-slate-800 block">Maria Silva</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Tab 3: Upload Image -->
            <div id="tab-upload-content" class="hidden space-y-3">
              <div id="upload-sign-dropzone" class="border-2 border-dashed border-slate-300 hover:border-slate-700 rounded-2xl p-8 text-center cursor-pointer bg-slate-50 transition">
                <input type="file" id="upload-sign-input" accept="image/png,image/jpeg" class="hidden" />
                <i data-lucide="image" class="w-8 h-8 text-slate-400 mx-auto mb-2"></i>
                <p class="text-xs font-bold text-slate-700">${t('signUploadPrompt')}</p>
                <p class="text-[11px] text-slate-400 mt-0.5">${t('signUploadHint')}</p>
              </div>
              <div id="upload-sign-preview-wrap" class="hidden text-center p-3 border border-slate-200 rounded-xl bg-white">
                <img id="upload-sign-preview" class="max-h-24 mx-auto object-contain">
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button id="btn-cancel-sign-modal" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800">
                ${t('btnCancel')}
              </button>
              <button id="btn-confirm-use-sign" class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition">
                ${t('btnInsertSign')}
              </button>
            </div>

          </div>
        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.bindEvents();
    this.initSignaturePad();
  }

  bindEvents() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const changeBtn = document.getElementById('btn-sign-change-file');
    const prevBtn = document.getElementById('btn-sign-prev');
    const nextBtn = document.getElementById('btn-sign-next');
    const zoomInBtn = document.getElementById('btn-sign-zoom-in');
    const zoomOutBtn = document.getElementById('btn-sign-zoom-out');
    const fitBtn = document.getElementById('btn-sign-fit');
    const saveBtn = document.getElementById('btn-save-signed-pdf');
    const deleteSignBtn = document.getElementById('btn-delete-active-sign');

    // Modal elements
    const openModalBtn = document.getElementById('btn-open-sign-modal');
    const closeModalBtn = document.getElementById('btn-close-sign-modal');
    const cancelModalBtn = document.getElementById('btn-cancel-sign-modal');
    const confirmSignBtn = document.getElementById('btn-confirm-use-sign');
    const signModal = document.getElementById('sign-modal');

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
      this.signatures = {};
      document.getElementById('dropzone-section').classList.remove('hidden');
      document.getElementById('sign-workspace').classList.add('hidden');
      saveBtn.disabled = true;
    });

    prevBtn?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderCurrentPage();
      }
    });

    nextBtn?.addEventListener('click', () => {
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

    fitBtn?.addEventListener('click', () => {
      this.autoFitToWidth();
    });

    deleteSignBtn?.addEventListener('click', () => {
      if (this.activeSignatureId) {
        const list = this.signatures[this.currentPage] || [];
        this.signatures[this.currentPage] = list.filter(s => s.id !== this.activeSignatureId);
        this.activeSignatureId = null;
        this.renderSignaturesForPage();
      }
    });

    saveBtn?.addEventListener('click', () => this.executeSavePdf());

    // Modal controls
    openModalBtn?.addEventListener('click', () => {
      signModal.classList.remove('hidden');
      signModal.classList.add('flex');
    });

    const hideModal = () => {
      signModal.classList.add('hidden');
      signModal.classList.remove('flex');
    };

    closeModalBtn?.addEventListener('click', hideModal);
    cancelModalBtn?.addEventListener('click', hideModal);

    // Modal Tabs switcher
    document.querySelectorAll('.sign-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        this.signatureTab = tab;

        document.querySelectorAll('.sign-tab-btn').forEach(b => {
          b.className = 'sign-tab-btn flex-1 py-1.5 rounded-lg transition text-slate-500 hover:text-slate-900';
        });
        e.currentTarget.className = 'sign-tab-btn flex-1 py-1.5 rounded-lg transition bg-white text-slate-900 shadow-xs font-bold';

        document.getElementById('tab-draw-content').classList.toggle('hidden', tab !== 'draw');
        document.getElementById('tab-type-content').classList.toggle('hidden', tab !== 'type');
        document.getElementById('tab-upload-content').classList.toggle('hidden', tab !== 'upload');
      });
    });

    // Typed input real-time preview
    const typedInput = document.getElementById('type-sign-input');
    typedInput?.addEventListener('input', (e) => {
      const val = e.target.value.trim() || 'Seu Nome';
      document.getElementById('preview-font-1').textContent = val;
      document.getElementById('preview-font-2').textContent = val;
    });

    // Radio style selection for typed font
    document.querySelectorAll('input[name="typed_font"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        document.querySelectorAll('input[name="typed_font"]').forEach(r => {
          r.closest('label').className = 'p-4 border-2 border-slate-200 rounded-xl hover:border-slate-400 cursor-pointer text-center';
        });
        e.target.closest('label').className = 'p-4 border-2 border-indigo-600 rounded-xl bg-indigo-50/30 cursor-pointer text-center';
      });
    });

    // Upload tab dropzone
    const uploadDropzone = document.getElementById('upload-sign-dropzone');
    const uploadInput = document.getElementById('upload-sign-input');
    uploadDropzone?.addEventListener('click', () => uploadInput.click());
    uploadInput?.addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (f) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          this.uploadedSignDataUrl = evt.target.result;
          document.getElementById('upload-sign-preview').src = this.uploadedSignDataUrl;
          document.getElementById('upload-sign-preview-wrap').classList.remove('hidden');
        };
        reader.readAsDataURL(f);
      }
    });

    // Confirm button in modal
    confirmSignBtn?.addEventListener('click', async () => {
      let dataUrl = null;

      if (this.signatureTab === 'draw') {
        const pad = document.getElementById('signature-pad-canvas');
        dataUrl = pad.toDataURL('image/png');
      } else if (this.signatureTab === 'type') {
        const name = document.getElementById('type-sign-input').value.trim() || 'Assinatura';
        const selectedFont = document.querySelector('input[name="typed_font"]:checked')?.value || 'Dancing Script';
        dataUrl = this.renderTypedSignatureToDataUrl(name, selectedFont);
      } else if (this.signatureTab === 'upload') {
        dataUrl = this.uploadedSignDataUrl;
      }

      if (!dataUrl) {
        notify('Crie ou selecione uma assinatura antes de inserir.', 'warning');
        return;
      }

      this.addSignatureToDocument(dataUrl);
      hideModal();
    });
  }

  initSignaturePad() {
    const canvas = document.getElementById('signature-pad-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = this.drawColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if (e.touches && e.touches[0]) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    const startDraw = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const drawMove = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const stopDraw = () => {
      this.isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', drawMove);
    window.addEventListener('mouseup', stopDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', drawMove, { passive: false });
    window.addEventListener('touchend', stopDraw);

    // Clear button
    document.getElementById('btn-clear-canvas')?.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Ink color buttons
    document.querySelectorAll('.sign-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.currentTarget.getAttribute('data-color');
        this.drawColor = color;
        ctx.strokeStyle = color;
        document.querySelectorAll('.sign-color-btn').forEach(b => {
          b.className = 'sign-color-btn w-6 h-6 rounded-full border-2 border-slate-300 shadow-xs';
        });
        e.currentTarget.className = 'sign-color-btn w-6 h-6 rounded-full border-2 border-slate-900 shadow-xs';
      });
    });
  }

  renderTypedSignatureToDataUrl(name, fontName) {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 500;
    offCanvas.height = 140;
    const ctx = offCanvas.getContext('2d');
    ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
    ctx.font = `60px "${fontName}", cursive`;
    ctx.fillStyle = '#0f2b5c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, offCanvas.width / 2, offCanvas.height / 2);
    return offCanvas.toDataURL('image/png');
  }

  updateZoomLabel() {
    const label = document.getElementById('sign-zoom-label');
    if (label) {
      label.textContent = `${Math.round(this.viewportScale * 100)}%`;
    }
  }

  autoFitToWidth() {
    const scrollContainer = document.getElementById('sign-canvas-scroll-container');
    if (!scrollContainer || !this.basePageWidth) return;
    
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
      this.signatures = {};
      this.activeSignatureId = null;

      const firstPage = await this.pdfJsDoc.getPage(1);
      const unscaledViewport = firstPage.getViewport({ scale: 1.0 });
      this.basePageWidth = unscaledViewport.width;

      document.getElementById('dropzone-section').classList.add('hidden');
      document.getElementById('sign-workspace').classList.remove('hidden');
      document.getElementById('btn-save-signed-pdf').disabled = false;

      this.autoFitToWidth();
      notify('PDF pronto para assinatura!', 'success');
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

      const canvas = document.getElementById('sign-pdf-page-canvas');
      const stage = document.getElementById('sign-page-stage-container');
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

      document.getElementById('sign-page-indicator').textContent = `${this.currentPage} de ${this.totalPages}`;
      document.getElementById('btn-sign-prev').disabled = this.currentPage <= 1;
      document.getElementById('btn-sign-next').disabled = this.currentPage >= this.totalPages;
      
      const dimBadge = document.getElementById('sign-dimensions-badge');
      if (dimBadge) {
        dimBadge.textContent = `Visualização: ${Math.round(this.currentViewport.width)} × ${Math.round(this.currentViewport.height)} px`;
      }

      this.renderSignaturesForPage();

      const scrollEl = document.getElementById('sign-canvas-scroll-container');
      if (scrollEl) scrollEl.scrollTop = 0;

    } catch (e) {
      console.error(e);
      notify('Erro ao renderizar página', 'error');
    } finally {
      setLoading(false);
    }
  }

  addSignatureToDocument(dataUrl) {
    if (!this.signatures[this.currentPage]) {
      this.signatures[this.currentPage] = [];
    }

    const id = 'sign_' + Date.now();
    const newSign = {
      id,
      x: 80,
      y: 120 + (this.signatures[this.currentPage].length * 30),
      width: 170,
      height: 60,
      dataUrl
    };

    this.signatures[this.currentPage].push(newSign);
    this.activeSignatureId = id;
    this.renderSignaturesForPage();
    notify('Assinatura inserida! Arraste para o local desejado.', 'success');
  }

  renderSignaturesForPage() {
    const layer = document.getElementById('sign-annotations-layer');
    if (!layer) return;

    layer.innerHTML = '';
    const list = this.signatures[this.currentPage] || [];

    list.forEach(item => {
      const box = document.createElement('div');
      const isActive = item.id === this.activeSignatureId;

      box.className = `absolute pointer-events-auto select-none rounded p-1 group cursor-move ${
        isActive ? 'ring-2 ring-indigo-600 bg-indigo-50/20 shadow-md' : 'hover:ring-1 hover:ring-slate-400'
      }`;
      box.style.left = `${item.x}px`;
      box.style.top = `${item.y}px`;
      box.style.width = `${item.width}px`;
      box.style.height = `${item.height}px`;

      box.innerHTML = `
        <img src="${item.dataUrl}" class="w-full h-full object-contain pointer-events-none select-none">
        <div class="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center text-slate-400 hover:text-indigo-600 font-mono text-[10px] select-none opacity-60 hover:opacity-100">
          ◢
        </div>
      `;

      layer.appendChild(box);

      box.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.resize-handle')) {
          this.activeSignatureId = item.id;
        }
      });

      this.setupDraggable(box, item);
      const resizeHandle = box.querySelector('.resize-handle');
      if (resizeHandle) this.setupResizable(box, resizeHandle, item);
    });
  }

  setupDraggable(box, item) {
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

    const onMouseDown = (e) => {
      if (e.target.closest('.resize-handle')) return;
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
      const stage = document.getElementById('sign-page-stage-container');

      const maxLeft = stage.clientWidth - box.offsetWidth;
      const maxTop = stage.clientHeight - box.offsetHeight;

      const newLeft = Math.max(0, Math.min(maxLeft, initialLeft + dx));
      const newTop = Math.max(0, Math.min(maxTop, initialTop + dy));

      box.style.left = `${newLeft}px`;
      box.style.top = `${newTop}px`;

      item.x = newLeft;
      item.y = newTop;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    box.addEventListener('mousedown', onMouseDown);
  }

  setupResizable(box, handle, item) {
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

      const newWidth = Math.max(60, initialWidth + dx);
      const newHeight = Math.max(25, initialHeight + dy);

      box.style.width = `${newWidth}px`;
      box.style.height = `${newHeight}px`;

      item.width = newWidth;
      item.height = newHeight;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
  }

  async executeSavePdf() {
    if (!this.pdfLibDoc) return;

    setLoading(true, 'Gravando assinaturas no documento PDF...');
    try {
      const pages = this.pdfLibDoc.getPages();

      for (const [pageNumStr, pageSignatures] of Object.entries(this.signatures)) {
        const pageIdx = parseInt(pageNumStr, 10) - 1;
        if (pageIdx < 0 || pageIdx >= pages.length) continue;

        const page = pages[pageIdx];
        const { width: pdfWidth, height: pdfHeight } = page.getSize();

        const pageProxy = await this.pdfJsDoc.getPage(pageIdx + 1);
        const viewport = pageProxy.getViewport({ scale: this.viewportScale });
        const scaleX = pdfWidth / viewport.width;
        const scaleY = pdfHeight / viewport.height;

        for (const sign of pageSignatures) {
          const signImageBytes = await fetch(sign.dataUrl).then(res => res.arrayBuffer());
          const embeddedImage = await this.pdfLibDoc.embedPng(signImageBytes);

          const signX = sign.x * scaleX;
          const signYTop = sign.y * scaleY;
          const signW = sign.width * scaleX;
          const signH = sign.height * scaleY;

          page.drawImage(embeddedImage, {
            x: signX,
            y: pdfHeight - signYTop - signH,
            width: signW,
            height: signH
          });
        }
      }

      setLoading(true, 'Salvando novo PDF assinado...');
      const bytes = await this.pdfLibDoc.save();
      const baseName = this.file.name.replace(/\.pdf$/i, '');
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${baseName}_assinado.pdf`);

      notify('Documento assinado com sucesso! Download iniciado.', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao gravar assinaturas: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }
}
