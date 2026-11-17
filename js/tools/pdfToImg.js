/**
 * Ferramenta: PDF para Imagens (PDF to Images)
 */
import { readFileAsArrayBuffer, downloadBlob, formatBytes, parsePageRanges, renderPdfPageToCanvas, notify, setLoading } from '../utils.js';

export class PdfToImgTool {
  constructor() {
    this.file = null;
    this.pdfJsDoc = null;
    this.totalPages = 0;
    this.container = document.getElementById('tool-workspace');
    this.format = 'image/png';
    this.scale = 2.0; // 2x for sharp retina output
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <i data-lucide="file-image" class="w-7 h-7 text-indigo-600"></i>
              PDF para Imagens
            </h2>
            <p class="text-sm text-slate-500 mt-1">Converta as páginas do seu PDF em imagens PNG ou JPG de alta resolução.</p>
          </div>
          <button id="btn-convert-action" disabled class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-indigo-600/25 transition">
            <i data-lucide="download" class="w-5 h-5"></i>
            <span>Converter e Baixar</span>
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
                <p class="text-base font-semibold text-slate-700">Selecione o PDF para converter em imagens</p>
                <p class="text-xs text-slate-400 mt-1">Clique ou arraste um arquivo PDF aqui</p>
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

          <!-- Configuration Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
              <label class="block text-xs font-bold text-slate-700 mb-2">Formato da Imagem</label>
              <select id="select-format" class="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
                <option value="image/png">PNG (Máxima Fidelidade)</option>
                <option value="image/jpeg">JPG (Mais Leve)</option>
              </select>
            </div>

            <div class="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
              <label class="block text-xs font-bold text-slate-700 mb-2">Qualidade / Resolução</label>
              <select id="select-scale" class="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
                <option value="1.5">Padrão (150 DPI)</option>
                <option value="2.0" selected>Alta Resolução (200 DPI)</option>
                <option value="3.0">Ultra HD (300 DPI)</option>
              </select>
            </div>

            <div class="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
              <label class="block text-xs font-bold text-slate-700 mb-2">Páginas para Converter</label>
              <input type="text" id="input-pages" placeholder="Todas ou ex: 1-3, 5" value="" class="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500">
              <span class="text-[10px] text-slate-400 mt-1 block">Deixe vazio para todas</span>
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
    const convertBtn = document.getElementById('btn-convert-action');
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
      this.pdfJsDoc = null;
      document.getElementById('dropzone-section').classList.remove('hidden');
      document.getElementById('options-section').classList.add('hidden');
      convertBtn.disabled = true;
    });

    document.getElementById('select-format')?.addEventListener('change', (e) => {
      this.format = e.target.value;
    });

    document.getElementById('select-scale')?.addEventListener('change', (e) => {
      this.scale = parseFloat(e.target.value);
    });

    convertBtn?.addEventListener('click', () => this.executeConvert());
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

      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        this.pdfJsDoc = await window.pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
        this.totalPages = this.pdfJsDoc.numPages;
      }

      document.getElementById('pdf-filename').textContent = file.name;
      document.getElementById('pdf-meta').textContent = `${this.totalPages} página${this.totalPages > 1 ? 's' : ''} • ${formatBytes(file.size)}`;

      document.getElementById('dropzone-section').classList.add('hidden');
      document.getElementById('options-section').classList.remove('hidden');
      document.getElementById('btn-convert-action').disabled = false;

      notify('Arquivo carregado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      notify(`Erro ao carregar PDF: ${err.message || err}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  async executeConvert() {
    if (!this.pdfJsDoc) return;

    const pagesInput = document.getElementById('input-pages').value.trim();
    let targetPages = [];

    if (!pagesInput) {
      targetPages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    } else {
      const zeroBased = parsePageRanges(pagesInput, this.totalPages);
      targetPages = zeroBased.map(i => i + 1);
    }

    if (targetPages.length === 0) {
      notify('Nenhuma página válida especificada.', 'warning');
      return;
    }

    setLoading(true, `Iniciando conversão de ${targetPages.length} página(s)...`);
    const ext = this.format === 'image/jpeg' ? 'jpg' : 'png';
    const baseName = this.file.name.replace(/\.pdf$/i, '');

    try {
      if (targetPages.length === 1) {
        // Single page: direct image download
        const pageNum = targetPages[0];
        setLoading(true, `Renderizando página ${pageNum}...`);
        const canvas = await renderPdfPageToCanvas(this.pdfJsDoc, pageNum, this.scale);
        canvas.toBlob((blob) => {
          downloadBlob(blob, `${baseName}_pagina_${pageNum}.${ext}`);
          notify('Imagem baixada com sucesso!', 'success');
          setLoading(false);
        }, this.format, 0.92);
      } else {
        // Multiple pages: pack into a ZIP
        if (!window.JSZip) throw new Error('Biblioteca JSZip não encontrada');
        const zip = new window.JSZip();

        for (let idx = 0; idx < targetPages.length; idx++) {
          const pageNum = targetPages[idx];
          setLoading(true, `Convertendo página ${pageNum} (${idx + 1} de ${targetPages.length})...`);
          const canvas = await renderPdfPageToCanvas(this.pdfJsDoc, pageNum, this.scale);

          const imgBlob = await new Promise((res) => canvas.toBlob(res, this.format, 0.92));
          const arrayBuf = await imgBlob.arrayBuffer();
          zip.file(`${baseName}_pagina_${pageNum}.${ext}`, arrayBuf);
        }

        setLoading(true, 'Gerando arquivo compactado (.ZIP)...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, `${baseName}_imagens.zip`);
        notify('Imagens convertidas e salvas em ZIP!', 'success');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      notify(`Erro ao converter PDF em imagens: ${err.message || err}`, 'error');
      setLoading(false);
    }
  }
}
