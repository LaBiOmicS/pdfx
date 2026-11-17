/**
 * PDFX - Application Main Controller & Router (Multilingual PT/EN/ES)
 * Developed by LaBiOmicS (Laboratório de Bioinformática e Ciências Ômicas)
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
      pt: 'Editar PDF & Marca-Texto',
      en: 'Edit PDF & Highlighter',
      es: 'Editar PDF & Resaltador'
    },
    description: {
      pt: 'Substitua textos, passe marca-texto, aplique tarjas pretas de censura e notas adesivas.',
      en: 'Replace text, highlight sentences, apply blackout redactions, and add notes.',
      es: 'Reemplaza textos, resalta líneas, aplica tachaduras de censura y añade notas.'
    },
    icon: 'edit-3',
    iconBg: 'bg-indigo-50 text-indigo-700',
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
    iconBg: 'bg-blue-50 text-blue-700',
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
    iconBg: 'bg-amber-50 text-amber-700',
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
      pt: 'Reordene visualmente, gire em 90° ou exclua páginas com miniaturas interativas.',
      en: 'Visually reorder, rotate 90°, or delete pages with interactive canvas thumbnails.',
      es: 'Reordena visualmente, gira 90° o elimina páginas con miniaturas interactivas.'
    },
    icon: 'layout-grid',
    iconBg: 'bg-purple-50 text-purple-700',
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
    iconBg: 'bg-emerald-50 text-emerald-700',
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
    iconBg: 'bg-rose-50 text-rose-700',
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
    iconBg: 'bg-cyan-50 text-cyan-700',
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
    iconBg: 'bg-slate-100 text-slate-700',
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

    // Hero quick CTA to edit PDF
    const heroEditBtn = document.getElementById('hero-btn-edit');
    if (heroEditBtn) {
      heroEditBtn.addEventListener('click', () => {
        this.navigateTo('edit-pdf');
      });
    }

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
        btn.className = 'lang-btn px-2.5 py-1 text-xs font-bold rounded-lg transition bg-white shadow-xs text-slate-900';
      } else {
        btn.className = 'lang-btn px-2.5 py-1 text-xs font-medium rounded-lg transition text-slate-500 hover:text-slate-900';
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
        <div class="tool-card group relative bg-white border border-slate-200 hover:border-slate-900 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between" data-tool-id="${tool.id}">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-11 h-11 rounded-xl ${tool.iconBg || 'bg-slate-100 text-slate-800'} flex items-center justify-center group-hover:scale-105 transition-transform">
                <i data-lucide="${tool.icon}" class="w-5 h-5"></i>
              </div>
              ${badge ? `
                <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  ${badge}
                </span>
              ` : ''}
            </div>
            <h3 class="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">${name}</h3>
            <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">${desc}</p>
          </div>
          
          <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-slate-900 transition-colors">
            <span>${t('toolOpen')}</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"></i>
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
