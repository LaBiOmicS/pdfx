/**
 * Ferramenta: Numerar Páginas (Page Numbers)
 */
import { readFileAsArrayBuffer, downloadBlob, formatBytes, notify, setLoading } from '../utils.js';

export class PageNumbersTool {
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
              <i data-lucide="hash" class="w-7 h-7 text-indigo-600"></i>
              Numerar Páginas
            </h2>
            <p class="text-sm text-slate-500 mt-1">Insira números de página organizados no rodapé ou cabeçalho do seu PDF.</p>
          </div>
          <button id="btn-numbers-action" disabled class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-indigo-600/25 transition">
            <i data-lucide="check" class="w-5 h-5"></i>
            <span>Inserir Números</span>
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
          <div class="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Posição da Numeração</label>
                <select id="select-position" class="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
                  <option value="bottom-center" selected>Rodapé Centro</option>
                  <option value="bottom-right">Rodapé Direita</option>
                  <option value="bottom-left">Rodapé Esquerda</option>
                  <option value="top-right">Cabeçalho Direita</option>
                  <option value="top-center">Cabeçalho Centro</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Formato do Texto</label>
                <select id="select-format" class="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
                  <option value="p_de_total" selected>Página {n} de {total}</option>
                  <option value="n_total">{n} / {total}</option>
                  <option value="only_n">Apenas {n}</option>
                </select>
              </div>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <input type="checkbox" id="check-skip-first" class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500">
              <label for="check-skip-first" class="text-xs font-semibold text-slate-700 cursor-pointer">
                Não numerar a 1ª página (Capa do documento)
              </label>
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
    const numbersBtn = document.getElementById('btn-numbers-action');
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
      numbersBtn.disabled = true;
    });

    numbersBtn?.addEventListener('click', () => this.executeNumbering());
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
      document.getElementById('btn-numbers-action').disabled = false;

      notify('Arquivo carregado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao carregar PDF: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  async executeNumbering() {
    if (!this.pdfDoc) return;

    const position = document.getElementById('select-position').value;
    const format = document.getElementById('select-format').value;
    const skipFirst = document.getElementById('check-skip-first').checked;

    setLoading(true, 'Inserindo numeração nas páginas...');
    try {
      const helvetica = await this.pdfDoc.embedFont(window.PDFLib.StandardFonts.Helvetica);
      const pages = this.pdfDoc.getPages();
      const fontSize = 10;
      const margin = 28;

      for (let i = 0; i < pages.length; i++) {
        if (skipFirst && i === 0) continue;

        const page = pages[i];
        const { width, height } = page.getSize();
        const pageNum = i + 1;

        let text = `Página ${pageNum} de ${this.totalPages}`;
        if (format === 'n_total') text = `${pageNum} / ${this.totalPages}`;
        if (format === 'only_n') text = `${pageNum}`;

        const textWidth = helvetica.widthOfTextAtSize(text, fontSize);
        let x = (width - textWidth) / 2;
        let y = margin;

        if (position === 'bottom-right') {
          x = width - textWidth - margin;
          y = margin;
        } else if (position === 'bottom-left') {
          x = margin;
          y = margin;
        } else if (position === 'top-center') {
          x = (width - textWidth) / 2;
          y = height - margin;
        } else if (position === 'top-right') {
          x = width - textWidth - margin;
          y = height - margin;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font: helvetica,
          color: window.PDFLib.rgb(0.35, 0.35, 0.35)
        });
      }

      setLoading(true, 'Salvando novo PDF...');
      const bytes = await this.pdfDoc.save();
      const baseName = this.file.name.replace(/\.pdf$/i, '');
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${baseName}_numerado.pdf`);

      notify('Numeração de páginas aplicada com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao numerar páginas: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }
}
