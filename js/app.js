/**
 * PDFX - Application Main Controller & Router (Multilingual PT/EN/ES)
 * Developed by LaBiOmicS (Laboratório de Bioinformática e Ômicas)
 */
import { getLang, setLang, t } from './i18n.js';
import { EditPdfTool } from './tools/editPdf.js';
import { MergeTool } from './tools/merge.js';
import { SplitTool } from './tools/split.js';
import { OrganizeTool } from './tools/organize.js';
import { ImgToPdfTool } from './tools/imgToPdf.js';
import { PdfToImgTool } from './tools/pdfToImg.js';
import { WatermarkTool } from './tools/watermark.js';
import { PageNumbersTool } from './tools/pageNumbers.js';

const TOOLS_CONFIG = [
  {
    id: 'edit-pdf',
    name: {
      pt: 'Editar PDF (Texto, Tarjas & Notas)',
      en: 'Edit PDF (Text, Redaction & Notes)',
      es: 'Editar PDF (Texto, Tachaduras & Notas)'
    },
    description: {
      pt: 'Insira textos, tarjas pretas de censura, tarjas brancas e notas adesivas de comentários.',
      en: 'Insert text, blackout redactions, whiteout erase, and review sticky notes.',
      es: 'Inserta textos, tachaduras de censura, tachadura blanca y notas adhesivas de revisión.'
    },
    icon: 'edit-3',
    color: 'from-rose-500 via-purple-600 to-indigo-600',
    badge: { pt: 'Destaque', en: 'Featured', es: 'Destacado' },
    createInstance: () => new EditPdfTool()
  },
  {
    id: 'merge',
    name: {
      pt: 'Juntar PDFs',
      en: 'Merge PDFs',
      es: 'Unir PDFs'
    },
    description: {
      pt: 'Combine múltiplos arquivos PDF em um único documento organizado.',
      en: 'Combine multiple PDF files into a single organized document.',
      es: 'Combina múltiples archivos PDF en un solo documento organizado.'
    },
    icon: 'layers',
    color: 'from-blue-500 to-indigo-600',
    badge: { pt: 'Popular', en: 'Popular', es: 'Popular' },
    createInstance: () => new MergeTool()
  },
  {
    id: 'split',
    name: {
      pt: 'Dividir PDF',
      en: 'Split PDF',
      es: 'Dividir PDF'
    },
    description: {
      pt: 'Extraia páginas individuais ou intervalos específicos em novos PDFs.',
      en: 'Extract individual pages or specific page ranges into new PDFs.',
      es: 'Extrae páginas individuales o rangos específicos en nuevos PDFs.'
    },
    icon: 'scissors',
    color: 'from-amber-500 to-orange-600',
    badge: null,
    createInstance: () => new SplitTool()
  },
  {
    id: 'organize',
    name: {
      pt: 'Organizar Páginas',
      en: 'Organize Pages',
      es: 'Organizar Páginas'
    },
    description: {
      pt: 'Reordene visualmente, gire ou exclua páginas com miniaturas interativas.',
      en: 'Visually reorder, rotate, or delete pages with interactive canvas thumbnails.',
      es: 'Reordena visualmente, gira o elimina páginas con miniaturas interactivas.'
    },
    icon: 'layout-grid',
    color: 'from-purple-500 to-pink-600',
    badge: { pt: 'Visual', en: 'Visual', es: 'Visual' },
    createInstance: () => new OrganizeTool()
  },
  {
    id: 'img-to-pdf',
    name: {
      pt: 'Imagens para PDF',
      en: 'Images to PDF',
      es: 'Imágenes a PDF'
    },
    description: {
      pt: 'Converta imagens JPG, PNG ou WebP em documento PDF com margens ajustáveis.',
      en: 'Convert JPG, PNG, and WebP images into a PDF with custom margins.',
      es: 'Convierte imágenes JPG, PNG o WebP en PDF con márgenes ajustables.'
    },
    icon: 'image',
    color: 'from-emerald-500 to-teal-600',
    badge: null,
    createInstance: () => new ImgToPdfTool()
  },
  {
    id: 'pdf-to-img',
    name: {
      pt: 'PDF para Imagens',
      en: 'PDF to Images',
      es: 'PDF a Imágenes'
    },
    description: {
      pt: 'Exporte cada página do PDF em imagens PNG ou JPG de alta resolução.',
      en: 'Export each PDF page into high-resolution PNG or JPG images.',
      es: 'Exporta cada página del PDF en imágenes PNG o JPG de alta resolución.'
    },
    icon: 'file-image',
    color: 'from-rose-500 to-red-600',
    badge: null,
    createInstance: () => new PdfToImgTool()
  },
  {
    id: 'watermark',
    name: {
      pt: 'Marca d’Água',
      en: 'Watermark',
      es: 'Marca de Agua'
    },
    description: {
      pt: 'Estampe carimbos ou marcas de texto (Confidencial, Rascunho) no documento.',
      en: 'Stamp text stamps or watermarks (Confidential, Draft) across all pages.',
      es: 'Inserta sellos de texto (Confidencial, Borrador) en todo el documento.'
    },
    icon: 'stamp',
    color: 'from-cyan-500 to-blue-600',
    badge: null,
    createInstance: () => new WatermarkTool()
  },
  {
    id: 'page-numbers',
    name: {
      pt: 'Numerar Páginas',
      en: 'Page Numbers',
      es: 'Numerar Páginas'
    },
    description: {
      pt: 'Insira números de página no rodapé ou cabeçalho do documento automaticamente.',
      en: 'Insert automated page numbers in the footer or header.',
      es: 'Inserta números de página en el pie de página o encabezado automáticamente.'
    },
    icon: 'hash',
    color: 'from-violet-500 to-indigo-600',
    badge: null,
    createInstance: () => new PageNumbersTool()
  }
];

class App {
  constructor() {
    this.currentTool = null;
    this.currentToolId = null;
  }

  init() {
    this.updateLanguageUI();
    this.renderDashboard();
    this.bindGlobalEvents();
    this.handleInitialRoute();
  }

  bindGlobalEvents() {
    // Logo / Home click
    document.querySelectorAll('.btn-home').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(null);
      });
    });

    // Language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.currentTarget.getAttribute('data-lang');
        if (lang && setLang(lang)) {
          this.updateLanguageUI();
          this.renderDashboard();
          if (this.currentTool && this.currentTool.render) {
            this.currentTool.render();
          }
        }
      });
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      const toolId = e.state?.toolId || null;
      this.switchView(toolId, false);
    });
  }

  updateLanguageUI() {
    const currentLang = getLang();

    // Update active button state
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      if (lang === currentLang) {
        btn.className = 'lang-btn px-2.5 py-1 text-xs font-bold rounded-lg transition bg-white shadow-xs text-purple-700';
      } else {
        btn.className = 'lang-btn px-2.5 py-1 text-xs font-semibold rounded-lg transition text-slate-500 hover:text-slate-900';
      }
    });

    // Translate DOM elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key);
      }
    });
  }

  handleInitialRoute() {
    const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
    if (hash && TOOLS_CONFIG.some(t => t.id === hash)) {
      this.switchView(hash, false);
    } else {
      this.switchView(null, false);
    }
  }

  navigateTo(toolId) {
    if (toolId) {
      window.history.pushState({ toolId }, '', `#/${toolId}`);
    } else {
      window.history.pushState({ toolId: null }, '', window.location.pathname);
    }
    this.switchView(toolId, false);
  }

  switchView(toolId, updateHistory = true) {
    const dashboardView = document.getElementById('dashboard-view');
    const toolView = document.getElementById('tool-view');
    const navBackBtn = document.getElementById('nav-back-button');

    if (!toolId) {
      this.currentToolId = null;
      this.currentTool = null;
      dashboardView.classList.remove('hidden');
      toolView.classList.add('hidden');
      navBackBtn.classList.add('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const toolMeta = TOOLS_CONFIG.find(t => t.id === toolId);
      if (!toolMeta) {
        this.switchView(null);
        return;
      }

      this.currentToolId = toolId;
      dashboardView.classList.add('hidden');
      toolView.classList.remove('hidden');
      navBackBtn.classList.remove('hidden');

      this.currentTool = toolMeta.createInstance();
      this.currentTool.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (window.lucide) window.lucide.createIcons();
  }

  renderDashboard() {
    const gridEl = document.getElementById('tools-grid');
    if (!gridEl) return;

    const lang = getLang();

    gridEl.innerHTML = TOOLS_CONFIG.map(tool => {
      const name = tool.name[lang] || tool.name['pt'];
      const desc = tool.description[lang] || tool.description['pt'];
      const badge = tool.badge ? (tool.badge[lang] || tool.badge['pt']) : null;

      return `
        <div class="tool-card group relative bg-white border border-slate-200/90 hover:border-purple-400 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between" data-tool-id="${tool.id}">
          <div>
            <div class="flex items-center justify-between mb-5">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr ${tool.color} flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <i data-lucide="${tool.icon}" class="w-7 h-7"></i>
              </div>
              ${badge ? `
                <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  ${badge}
                </span>
              ` : ''}
            </div>
            <h3 class="text-base font-bold text-slate-800 group-hover:text-purple-700 transition-colors">${name}</h3>
            <p class="text-xs text-slate-500 mt-2 leading-relaxed">${desc}</p>
          </div>
          
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-purple-600 transition-colors">
            <span>${t('toolOpen')}</span>
            <i data-lucide="arrow-right" class="w-4 h-4 transform group-hover:translate-x-1 transition-transform"></i>
          </div>
        </div>
      `;
    }).join('');

    gridEl.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', () => {
        const toolId = card.getAttribute('data-tool-id');
        this.navigateTo(toolId);
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }
}

// Start app on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
  });
}
