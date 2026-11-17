/**
 * Ferramenta: Imagens para PDF (Images to PDF)
 */
import { readFileAsArrayBuffer, downloadBlob, formatBytes, notify, setLoading } from '../utils.js';

export class ImgToPdfTool {
  constructor() {
    this.images = []; // Array of { file, dataUrl, name, size }
    this.container = document.getElementById('tool-workspace');
    this.pageFormat = 'a4'; // 'a4' | 'fit'
    this.orientation = 'portrait'; // 'portrait' | 'landscape'
    this.margin = 20; // 0, 20, 40
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <i data-lucide="image" class="w-7 h-7 text-indigo-600"></i>
              Imagens para PDF
            </h2>
            <p class="text-sm text-slate-500 mt-1">Converta JPG, PNG e WebP em um documento PDF organizado.</p>
          </div>
          <button id="btn-convert-img-action" disabled class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-indigo-600/25 transition">
            <i data-lucide="file-check" class="w-5 h-5"></i>
            <span>Converter para PDF</span>
          </button>
        </div>

        <!-- Dropzone -->
        <div id="dropzone" class="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20 group">
          <input type="file" id="file-input" multiple accept="image/png, image/jpeg, image/webp" class="hidden" />
          <div class="flex flex-col items-center justify-center space-y-3">
            <div class="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition duration-200">
              <i data-lucide="images" class="w-8 h-8"></i>
            </div>
            <div>
              <p class="text-base font-semibold text-slate-700">Selecione ou arraste imagens aqui</p>
              <p class="text-xs text-slate-400 mt-1">Suporta JPG, PNG e WebP</p>
            </div>
          </div>
        </div>

        <!-- Options & Gallery -->
        <div id="gallery-section" class="hidden space-y-6">
          <!-- Configuration Bar -->
          <div class="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Tamanho da Página</label>
              <select id="select-format" class="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
                <option value="a4">Padrão A4</option>
                <option value="fit">Ajustar ao tamanho da imagem</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Orientação (A4)</label>
              <select id="select-orientation" class="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
                <option value="portrait">Retrato (Vertical)</option>
                <option value="landscape">Paisagem (Horizontal)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Margem</label>
              <select id="select-margin" class="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
                <option value="0">Sem Margem (Total)</option>
                <option value="20" selected>Margem Pequena</option>
                <option value="40">Margem Grande</option>
              </select>
            </div>
          </div>

          <!-- Gallery Grid -->
          <div class="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span id="img-count-badge">0 imagens</span>
            <span>Arraste para definir a ordem das páginas</span>
          </div>

          <div id="images-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.bindEvents();
  }

  bindEvents() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const convertBtn = document.getElementById('btn-convert-img-action');

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

    document.getElementById('select-format')?.addEventListener('change', (e) => {
      this.pageFormat = e.target.value;
    });

    document.getElementById('select-orientation')?.addEventListener('change', (e) => {
      this.orientation = e.target.value;
    });

    document.getElementById('select-margin')?.addEventListener('change', (e) => {
      this.margin = parseInt(e.target.value, 10);
    });

    convertBtn?.addEventListener('click', () => this.executeConvert());
  }

  async handleFiles(newFiles) {
    const valid = newFiles.filter(f => f.type.startsWith('image/'));
    if (valid.length === 0) {
      notify('Selecione arquivos de imagem válidos (JPG, PNG ou WebP).', 'warning');
      return;
    }

    setLoading(true, 'Carregando imagens...');
    try {
      for (const file of valid) {
        const dataUrl = await this.fileToDataUrl(file);
        this.images.push({ file, dataUrl, name: file.name, size: file.size });
      }
      this.renderImagesGrid();
    } finally {
      setLoading(false);
    }
  }

  fileToDataUrl(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  renderImagesGrid() {
    const gallerySection = document.getElementById('gallery-section');
    const gridEl = document.getElementById('images-grid');
    const convertBtn = document.getElementById('btn-convert-img-action');
    const countBadge = document.getElementById('img-count-badge');

    if (!gallerySection || !gridEl) return;

    if (this.images.length === 0) {
      gallerySection.classList.add('hidden');
      if (convertBtn) convertBtn.disabled = true;
      return;
    }

    gallerySection.classList.remove('hidden');
    convertBtn.disabled = false;
    countBadge.textContent = `${this.images.length} imagem${this.images.length > 1 ? 'ns' : ''}`;

    gridEl.innerHTML = this.images.map((img, idx) => `
      <div class="page-card relative bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm group cursor-grab active:cursor-grabbing" data-index="${idx}">
        <div class="relative w-full aspect-square bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center mb-2">
          <img src="${img.dataUrl}" alt="${img.name}" class="w-full h-full object-cover">
          <button class="btn-remove-img absolute top-1.5 right-1.5 p-1 rounded-lg bg-white/90 hover:bg-rose-600 text-slate-700 hover:text-white shadow transition" data-index="${idx}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        <div class="flex items-center justify-between text-xs px-1 text-slate-600 font-semibold truncate">
          <span class="truncate">${img.name}</span>
          <span class="text-[10px] text-slate-400 flex-shrink-0 ml-1">#${idx + 1}</span>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();

    gridEl.querySelectorAll('.btn-remove-img').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        this.images.splice(index, 1);
        this.renderImagesGrid();
      });
    });

    if (window.Sortable) {
      new window.Sortable(gridEl, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: (evt) => {
          const item = this.images.splice(evt.oldIndex, 1)[0];
          this.images.splice(evt.newIndex, 0, item);
          this.renderImagesGrid();
        }
      });
    }
  }

  // Convert any image (including WebP) to PNG buffer via offscreen canvas
  async imageToPngBuffer(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ buffer: reader.result, width: img.width, height: img.height });
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        }, 'image/png');
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  async executeConvert() {
    if (this.images.length === 0) return;

    setLoading(true, 'Criando documento PDF com as imagens...');
    try {
      const pdfDoc = await window.PDFLib.PDFDocument.create();

      for (let i = 0; i < this.images.length; i++) {
        setLoading(true, `Inserindo imagem ${i + 1} de ${this.images.length}...`);
        const { buffer, width, height } = await this.imageToPngBuffer(this.images[i].dataUrl);
        const embeddedImg = await pdfDoc.embedPng(buffer);

        let pageWidth, pageHeight;
        if (this.pageFormat === 'a4') {
          // A4 dimensions in points: 595.28 x 841.89
          if (this.orientation === 'portrait') {
            pageWidth = 595.28;
            pageHeight = 841.89;
          } else {
            pageWidth = 841.89;
            pageHeight = 595.28;
          }
        } else {
          // Fit to image
          pageWidth = width + (this.margin * 2);
          pageHeight = height + (this.margin * 2);
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate fitted image dimensions respecting margins
        const availableWidth = pageWidth - (this.margin * 2);
        const availableHeight = pageHeight - (this.margin * 2);
        const scale = Math.min(availableWidth / width, availableHeight / height);

        const drawWidth = width * scale;
        const drawHeight = height * scale;
        const drawX = (pageWidth - drawWidth) / 2;
        const drawY = (pageHeight - drawHeight) / 2;

        page.drawImage(embeddedImg, {
          x: drawX,
          y: drawY,
          width: drawWidth,
          height: drawHeight
        });
      }

      setLoading(true, 'Finalizando download do PDF...');
      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'imagens_convertidas.pdf');

      notify('PDF criado com sucesso a partir das imagens!', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao converter imagens: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }
}
