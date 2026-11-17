/**
 * Ferramenta: Marca d'Água (Watermark)
 */
import { readFileAsArrayBuffer, downloadBlob, formatBytes, notify, setLoading } from '../utils.js';

export class WatermarkTool {
  constructor() {
    this.file = null;
    this.pdfDoc = null;
    this.totalPages = 0;
    this.container = document.getElementById('tool-workspace');
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <i data-lucide="stamp" class="w-7 h-7 text-indigo-600"></i>
              Adicionar Marca d'Água
            </h2>
            <p class="text-sm text-slate-500 mt-1">Insira textos personalizados como rascunho, confidencial ou seu nome em todas as páginas.</p>
          </div>
          <button id="btn-watermark-action" disabled class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-indigo-600/25 transition">
            <i data-lucide="check" class="w-5 h-5"></i>
            <span>Aplicar e Baixar</span>
          </button>
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
                <p class="text-base font-semibold text-slate-700">Selecione o arquivo PDF</p>
                <p class="text-xs text-slate-400 mt-1">Clique ou arraste um PDF aqui</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Options Section -->
        <div id="options-section" class="hidden space-y-6">
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

          <!-- Controls -->
          <div class="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Texto da Marca d'Água</label>
              <input type="text" id="watermark-text" value="CONFIDENCIAL" class="w-full text-sm font-semibold px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Cor</label>
                <select id="watermark-color" class="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
                  <option value="gray">Cinza Discreto</option>
                  <option value="red">Vermelho Alerta</option>
                  <option value="blue">Azul Corporativo</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Opacidade</label>
                <select id="watermark-opacity" class="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
                  <option value="0.15">Muito Suave (15%)</option>
                  <option value="0.3" selected>Padrão (30%)</option>
                  <option value="0.6">Nítida (60%)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Ângulo</label>
                <select id="watermark-angle" class="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
                  <option value="45" selected>Diagonal (+45°)</option>
                  <option value="-45">Diagonal (-45°)</option>
                  <option value="0">Horizontal (0°)</option>
                </select>
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
    const watermarkBtn = document.getElementById('btn-watermark-action');
    const changeBtn = document.getElementById('btn-change-file');

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
      document.getElementById('options-section').classList.add('hidden');
      watermarkBtn.disabled = true;
    });

    watermarkBtn?.addEventListener('click', () => this.executeWatermark());
  }

  async loadFile(file) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      notify('Por favor, selecione um arquivo PDF válido.', 'warning');
      return;
    }

    setLoading(true, 'Carregando PDF...');
    try {
      this.file = file;
      const buffer = await readFileAsArrayBuffer(file);
      this.pdfDoc = await window.PDFLib.PDFDocument.load(buffer, { ignoreEncryption: true });
      this.totalPages = this.pdfDoc.getPageCount();

      document.getElementById('pdf-filename').textContent = file.name;
      document.getElementById('pdf-meta').textContent = `${this.totalPages} página${this.totalPages > 1 ? 's' : ''} • ${formatBytes(file.size)}`;

      document.getElementById('dropzone-section').classList.add('hidden');
      document.getElementById('options-section').classList.remove('hidden');
      document.getElementById('btn-watermark-action').disabled = false;

      notify('Arquivo carregado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao carregar PDF: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  async executeWatermark() {
    if (!this.pdfDoc) return;

    const text = document.getElementById('watermark-text').value.trim();
    if (!text) {
      notify('Digite o texto da marca d’água.', 'warning');
      return;
    }

    const colorType = document.getElementById('watermark-color').value;
    const opacity = parseFloat(document.getElementById('watermark-opacity').value);
    const angle = parseInt(document.getElementById('watermark-angle').value, 10);

    setLoading(true, 'Estampando marca d’água em todas as páginas...');
    try {
      const helveticaFont = await this.pdfDoc.embedFont(window.PDFLib.StandardFonts.HelveticaBold);
      const pages = this.pdfDoc.getPages();

      let color = window.PDFLib.rgb(0.5, 0.5, 0.5); // Gray default
      if (colorType === 'red') color = window.PDFLib.rgb(0.85, 0.15, 0.15);
      if (colorType === 'blue') color = window.PDFLib.rgb(0.15, 0.35, 0.85);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const fontSize = Math.min(width, height) / 10;
        const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
        const textHeight = helveticaFont.heightAtSize(fontSize);

        page.drawText(text, {
          x: (width - textWidth) / 2,
          y: (height - textHeight) / 2,
          size: fontSize,
          font: helveticaFont,
          color: color,
          opacity: opacity,
          rotate: window.PDFLib.degrees(angle)
        });
      }

      setLoading(true, 'Salvando novo PDF...');
      const bytes = await this.pdfDoc.save();
      const baseName = this.file.name.replace(/\.pdf$/i, '');
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${baseName}_marca_dagua.pdf`);

      notify('Marca d’água aplicada com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao aplicar marca d’água: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }
}
