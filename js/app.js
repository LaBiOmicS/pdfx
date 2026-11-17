/**
 * Application Main Controller & Router
 */
import { MergeTool } from './tools/merge.js';
import { SplitTool } from './tools/split.js';
import { OrganizeTool } from './tools/organize.js';
import { ImgToPdfTool } from './tools/imgToPdf.js';
import { PdfToImgTool } from './tools/pdfToImg.js';
import { WatermarkTool } from './tools/watermark.js';
import { PageNumbersTool } from './tools/pageNumbers.js';

const TOOLS_CONFIG = [
  {
    id: 'merge',
    name: 'Juntar PDF',
    description: 'Combine múltiplos arquivos PDF em um único documento organizado.',
    icon: 'layers',
    color: 'from-blue-500 to-indigo-600',
    badge: 'Popular',
    createInstance: () => new MergeTool()
  },
  {
    id: 'split',
    name: 'Dividir PDF',
    description: 'Extraia páginas individuais ou intervalos específicos em novos PDFs.',
    icon: 'scissors',
    color: 'from-amber-500 to-orange-600',
    badge: 'Rápido',
    createInstance: () => new SplitTool()
  },
  {
    id: 'organize',
    name: 'Organizar Páginas',
    description: 'Reordene visualmente, gire ou exclua páginas com miniaturas interativas.',
    icon: 'layout-grid',
    color: 'from-purple-500 to-pink-600',
    badge: 'Visual',
    createInstance: () => new OrganizeTool()
  },
  {
    id: 'img-to-pdf',
    name: 'Imagens para PDF',
    description: 'Converta imagens JPG, PNG ou WebP em documento PDF com margens ajustáveis.',
    icon: 'image',
    color: 'from-emerald-500 to-teal-600',
    badge: null,
    createInstance: () => new ImgToPdfTool()
  },
  {
    id: 'pdf-to-img',
    name: 'PDF para Imagens',
    description: 'Exporte cada página do PDF em imagens PNG ou JPG de alta resolução.',
    icon: 'file-image',
    color: 'from-rose-500 to-red-600',
    badge: null,
    createInstance: () => new PdfToImgTool()
  },
  {
    id: 'watermark',
    name: 'Marca d’Água',
    description: 'Estampe carimbos ou marcas de texto (Confidencial, Rascunho, etc.) no seu PDF.',
    icon: 'stamp',
    color: 'from-cyan-500 to-blue-600',
    badge: null,
    createInstance: () => new WatermarkTool()
  },
  {
    id: 'page-numbers',
    name: 'Numerar Páginas',
    description: 'Insira números de página no rodapé ou cabeçalho do documento automaticamente.',
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

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      const toolId = e.state?.toolId || null;
      this.switchView(toolId, false);
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

    gridEl.innerHTML = TOOLS_CONFIG.map(tool => `
      <div class="tool-card group relative bg-white border border-slate-200/80 hover:border-indigo-400/80 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between" data-tool-id="${tool.id}">
        <div>
          <div class="flex items-center justify-between mb-5">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr ${tool.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
              <i data-lucide="${tool.icon}" class="w-7 h-7"></i>
            </div>
            ${tool.badge ? `
              <span class="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                ${tool.badge}
              </span>
            ` : ''}
          </div>
          <h3 class="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">${tool.name}</h3>
          <p class="text-xs text-slate-500 mt-2 leading-relaxed">${tool.description}</p>
        </div>
        
        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">
          <span>Abrir ferramenta</span>
          <i data-lucide="arrow-right" class="w-4 h-4 transform group-hover:translate-x-1 transition-transform"></i>
        </div>
      </div>
    `).join('');

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
