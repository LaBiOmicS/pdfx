/**
 * Sistema Internacionalização (i18n) - Português, Inglês e Espanhol
 */

export const TRANSLATIONS = {
  pt: {
    appName: 'PDFX',
    developedBy: 'Desenvolvido pelo LaBiOmicS',
    labFullName: 'Laboratório de Bioinformática e Ômicas',
    privacyBadge: '100% Local no Navegador • Sem Servidores',
    privacyHeroBadge: 'Privacidade Absoluta • Seus arquivos nunca saem do seu computador',
    heroTitle: 'O canivete suíço para seus PDFs,',
    heroTitleHighlight: 'rápido, privado e sem limites.',
    heroSubtitle: 'Edite textos, aplique tarjas pretas de censura, faça comentários, junte, divida e converta documentos diretamente no navegador. 100% gratuito e seguro.',
    heroStatsLocal: '100% No Navegador',
    heroStatsLocalSub: 'Sem upload para servidores',
    heroStatsCost: 'Zero Custo',
    heroStatsCostSub: 'Livre e sem assinaturas',
    heroStatsLang: '3 Idiomas',
    heroStatsLangSub: 'PT, EN & ES nativos',
    
    // Tools
    toolOpen: 'Abrir ferramenta',
    backHome: 'Início',
    btnChangeFile: 'Trocar Arquivo',
    btnSave: 'Salvar',
    btnCancel: 'Cancelar',
    processing: 'Processando...',
    waitMoment: 'Aguarde alguns instantes enquanto o arquivo é gerado.',
    dropzoneText: 'Clique para selecionar ou arraste o PDF aqui',
    dropzoneSubtitle: 'Processamento instantâneo e local',
    
    // Edit Tool
    editTitle: 'Editar PDF — Textos, Tarjas & Notas',
    editSubtitle: 'Tarje dados confidenciais, adicione caixas de texto e insira notas de revisão na página.',
    btnAddText: '+ Texto',
    btnRedactBlack: 'Tarja Preta (Censurar)',
    btnRedactWhite: 'Tarja Branca (Apagar)',
    btnAddComment: '+ Comentário / Nota',
    btnHighlight: 'Marca-Texto',
    btnSaveEdited: 'Salvar PDF Editado',
    pageIndicator: 'Página {current} de {total}',
    propFormat: 'Propriedades:',
    propFontSize: 'Fonte:',
    propColor: 'Cor:',
    btnDeleteSelected: 'Excluir Selecionado',
    editHint: '💡 Arraste pela barra para mover e pelo canto inferior direito (◢) para redimensionar tarjas ou caixas.',
    
    // Merge Tool
    mergeTitle: 'Juntar PDFs',
    mergeSubtitle: 'Combine múltiplos arquivos PDF em um único documento, na ordem que escolher.',
    btnMergeAction: 'Juntar PDFs Agora',
    mergeDropzoneSubtitle: 'Selecione 2 ou mais arquivos PDF para combiná-los',
    btnClearQueue: 'Limpar Fila',
    mergeFilesQueued: '{n} arquivo(s) na fila (arraste para reordenar)',

    // Split Tool
    splitTitle: 'Dividir PDF',
    splitSubtitle: 'Extraia páginas específicas ou separe todas as páginas do seu arquivo.',
    btnSplitAction: 'Dividir e Baixar',
    splitModeRange: 'Intervalo de Páginas',
    splitModeRangeDesc: 'Extraia apenas as páginas que precisa em um único PDF.',
    splitRangeLabel: 'Páginas ou Intervalos:',
    splitRangeExample: 'Exemplo: 1-3 extrai da página 1 até a 3.',
    splitModeAll: 'Extrair Todas as Páginas',
    splitModeAllDesc: 'Salva cada página individual como um documento PDF separado em arquivo .ZIP.',

    // Organize Tool
    organizeTitle: 'Organizar Páginas',
    organizeSubtitle: 'Arraste para reordenar, gire ou exclua páginas visualmente.',
    btnRotateAll: 'Girar Todas (+90°)',
    btnSaveOrganized: 'Salvar Novo PDF',
    btnResetOrder: 'Restaurar Original',
    organizeTip: 'Dica: Arraste os cards para reorganizar a ordem das páginas.',

    // Img to PDF
    imgToPdfTitle: 'Imagens para PDF',
    imgToPdfSubtitle: 'Converta fotos JPG, PNG e WebP em um documento PDF organizado.',
    btnConvertImg: 'Converter para PDF',
    imgFormat: 'Tamanho da Página',
    imgFormatA4: 'Padrão A4',
    imgFormatFit: 'Ajustar ao tamanho da imagem',
    imgOrientation: 'Orientação (A4)',
    imgPortrait: 'Retrato (Vertical)',
    imgLandscape: 'Paisagem (Horizontal)',
    imgMargin: 'Margem',
    imgMarginNone: 'Sem Margem',
    imgMarginSmall: 'Margem Pequena',
    imgMarginLarge: 'Margem Grande',

    // PDF to Img
    pdfToImgTitle: 'PDF para Imagens',
    pdfToImgSubtitle: 'Converta as páginas do seu PDF em imagens PNG ou JPG de alta resolução.',
    btnPdfToImg: 'Converter e Baixar',
    imgTypeLabel: 'Formato da Imagem',
    imgResolutionLabel: 'Qualidade / Resolução',
    resNormal: 'Padrão (150 DPI)',
    resHigh: 'Alta Resolução (200 DPI)',
    resUltra: 'Ultra HD (300 DPI)',
    pagesToConvert: 'Páginas para Converter',

    // Watermark
    watermarkTitle: 'Adicionar Marca d’Água',
    watermarkSubtitle: 'Insira carimbos como CONFIDENCIAL, RASCUNHO ou seu nome nas páginas.',
    btnApplyWatermark: 'Aplicar e Baixar',
    watermarkText: 'Texto da Marca d’Água',
    watermarkColor: 'Cor',
    watermarkColorGray: 'Cinza Discreto',
    watermarkColorRed: 'Vermelho Alerta',
    watermarkColorBlue: 'Azul Corporativo',
    watermarkOpacity: 'Opacidade',
    watermarkAngle: 'Ângulo',

    // Page Numbers
    pageNumbersTitle: 'Numerar Páginas',
    pageNumbersSubtitle: 'Insira números de página organizados no rodapé ou cabeçalho do seu PDF.',
    btnApplyNumbers: 'Inserir Números',
    numberPos: 'Posição da Numeração',
    numberBottomCenter: 'Rodapé Centro',
    numberBottomRight: 'Rodapé Direita',
    numberBottomLeft: 'Rodapé Esquerda',
    numberTopCenter: 'Cabeçalho Centro',
    numberTopRight: 'Cabeçalho Direita',
    numberFormat: 'Formato do Texto',
    skipFirstPage: 'Não numerar a 1ª página (Capa do documento)'
  },

  en: {
    appName: 'PDFX',
    developedBy: 'Developed by LaBiOmicS',
    labFullName: 'Bioinformatics and Omics Laboratory',
    privacyBadge: '100% In-Browser • Zero Servers',
    privacyHeroBadge: 'Absolute Privacy • Your files never leave your device',
    heroTitle: 'The Swiss Army knife for your PDFs,',
    heroTitleHighlight: 'fast, private, and with no limits.',
    heroSubtitle: 'Edit text, apply black redaction boxes, add sticky review notes, merge, split, and convert documents directly in your browser. 100% free and secure.',
    heroStatsLocal: '100% Client-Side',
    heroStatsLocalSub: 'No file uploads to servers',
    heroStatsCost: 'Zero Cost',
    heroStatsCostSub: 'Free with no subscriptions',
    heroStatsLang: '3 Languages',
    heroStatsLangSub: 'Native PT, EN & ES',

    // Tools
    toolOpen: 'Open tool',
    backHome: 'Home',
    btnChangeFile: 'Change File',
    btnSave: 'Save',
    btnCancel: 'Cancel',
    processing: 'Processing...',
    waitMoment: 'Please wait a moment while the document is being generated.',
    dropzoneText: 'Click to select or drag PDF file here',
    dropzoneSubtitle: 'Instant local processing',

    // Edit Tool
    editTitle: 'Edit PDF — Text, Redactions & Notes',
    editSubtitle: 'Redact sensitive data, insert text boxes, and place sticky notes on your pages.',
    btnAddText: '+ Text',
    btnRedactBlack: 'Blackout Redaction',
    btnRedactWhite: 'Whiteout (Erase)',
    btnAddComment: '+ Comment / Note',
    btnHighlight: 'Highlighter',
    btnSaveEdited: 'Save Edited PDF',
    pageIndicator: 'Page {current} of {total}',
    propFormat: 'Properties:',
    propFontSize: 'Font:',
    propColor: 'Color:',
    btnDeleteSelected: 'Delete Selected',
    editHint: '💡 Drag by the top bar to move and by the bottom-right corner (◢) to resize redactions or boxes.',

    // Merge Tool
    mergeTitle: 'Merge PDFs',
    mergeSubtitle: 'Combine multiple PDF files into one single document in any order.',
    btnMergeAction: 'Merge PDFs Now',
    mergeDropzoneSubtitle: 'Select 2 or more PDF files to combine',
    btnClearQueue: 'Clear Queue',
    mergeFilesQueued: '{n} file(s) in queue (drag to reorder)',

    // Split Tool
    splitTitle: 'Split PDF',
    splitSubtitle: 'Extract specific pages or separate all pages of your document.',
    btnSplitAction: 'Split & Download',
    splitModeRange: 'Page Range',
    splitModeRangeDesc: 'Extract only the pages you need into a single PDF.',
    splitRangeLabel: 'Pages or Ranges:',
    splitRangeExample: 'Example: 1-3 extracts from page 1 to 3.',
    splitModeAll: 'Extract All Pages',
    splitModeAllDesc: 'Saves each individual page as a separate PDF in a .ZIP file.',

    // Organize Tool
    organizeTitle: 'Organize Pages',
    organizeSubtitle: 'Drag to reorder, rotate, or delete pages visually with live previews.',
    btnRotateAll: 'Rotate All (+90°)',
    btnSaveOrganized: 'Save Organized PDF',
    btnResetOrder: 'Reset Order',
    organizeTip: 'Tip: Drag thumbnail cards to reorder page sequence.',

    // Img to PDF
    imgToPdfTitle: 'Images to PDF',
    imgToPdfSubtitle: 'Convert JPG, PNG, and WebP images into an organized PDF document.',
    btnConvertImg: 'Convert to PDF',
    imgFormat: 'Page Format',
    imgFormatA4: 'Standard A4',
    imgFormatFit: 'Fit to Image Size',
    imgOrientation: 'Orientation (A4)',
    imgPortrait: 'Portrait (Vertical)',
    imgLandscape: 'Landscape (Horizontal)',
    imgMargin: 'Margin',
    imgMarginNone: 'No Margin',
    imgMarginSmall: 'Small Margin',
    imgMarginLarge: 'Large Margin',

    // PDF to Img
    pdfToImgTitle: 'PDF to Images',
    pdfToImgSubtitle: 'Export PDF pages as crisp high-resolution PNG or JPG images.',
    btnPdfToImg: 'Convert & Download',
    imgTypeLabel: 'Image Format',
    imgResolutionLabel: 'Resolution / Quality',
    resNormal: 'Standard (150 DPI)',
    resHigh: 'High Resolution (200 DPI)',
    resUltra: 'Ultra HD (300 DPI)',
    pagesToConvert: 'Pages to Convert',

    // Watermark
    watermarkTitle: 'Add Watermark',
    watermarkSubtitle: 'Stamp text such as CONFIDENTIAL, DRAFT, or custom labels on all pages.',
    btnApplyWatermark: 'Apply & Download',
    watermarkText: 'Watermark Text',
    watermarkColor: 'Color',
    watermarkColorGray: 'Discreet Gray',
    watermarkColorRed: 'Alert Red',
    watermarkColorBlue: 'Corporate Blue',
    watermarkOpacity: 'Opacity',
    watermarkAngle: 'Angle',

    // Page Numbers
    pageNumbersTitle: 'Page Numbers',
    pageNumbersSubtitle: 'Insert automated page numbers in the footer or header.',
    btnApplyNumbers: 'Insert Page Numbers',
    numberPos: 'Number Position',
    numberBottomCenter: 'Bottom Center',
    numberBottomRight: 'Bottom Right',
    numberBottomLeft: 'Bottom Left',
    numberTopCenter: 'Top Center',
    numberTopRight: 'Top Right',
    numberFormat: 'Text Format',
    skipFirstPage: 'Do not number first page (Cover page)'
  },

  es: {
    appName: 'PDFX',
    developedBy: 'Desarrollado por LaBiOmicS',
    labFullName: 'Laboratorio de Bioinformática y Ómicas',
    privacyBadge: '100% En el Navegador • Cero Servidores',
    privacyHeroBadge: 'Privacidad Absoluta • Tus archivos nunca salen de tu ordenador',
    heroTitle: 'La navaja suiza para tus documentos PDF,',
    heroTitleHighlight: 'rápida, privada y sin límites.',
    heroSubtitle: 'Edita textos, aplica tachaduras de censura, añade notas adhesivas, une, divide y convierte documentos en tu navegador. 100% gratuito y seguro.',
    heroStatsLocal: '100% En el Navegador',
    heroStatsLocalSub: 'Sin subida de archivos a servidores',
    heroStatsCost: 'Cero Costo',
    heroStatsCostSub: 'Libre y sin suscripciones',
    heroStatsLang: '3 Idiomas',
    heroStatsLangSub: 'PT, EN y ES nativos',

    // Tools
    toolOpen: 'Abrir herramienta',
    backHome: 'Inicio',
    btnChangeFile: 'Cambiar Archivo',
    btnSave: 'Guardar',
    btnCancel: 'Cancelar',
    processing: 'Procesando...',
    waitMoment: 'Espere unos instantes mientras se genera el archivo.',
    dropzoneText: 'Haga clic para seleccionar o arrastre el PDF aquí',
    dropzoneSubtitle: 'Procesamiento instantáneo y local',

    // Edit Tool
    editTitle: 'Editar PDF — Textos, Tachaduras & Notas',
    editSubtitle: 'Tacha datos confidenciales, inserta cuadros de texto y añade notas adhesivas.',
    btnAddText: '+ Texto',
    btnRedactBlack: 'Tachadura Negra (Censurar)',
    btnRedactWhite: 'Tachadura Blanca (Borrar)',
    btnAddComment: '+ Comentario / Nota',
    btnHighlight: 'Resaltador',
    btnSaveEdited: 'Guardar PDF Editado',
    pageIndicator: 'Página {current} de {total}',
    propFormat: 'Propiedades:',
    propFontSize: 'Fuente:',
    propColor: 'Color:',
    btnDeleteSelected: 'Eliminar Seleccionado',
    editHint: '💡 Arrastre la barra para mover y la esquina inferior derecha (◢) para cambiar el tamaño.',

    // Merge Tool
    mergeTitle: 'Unir PDFs',
    mergeSubtitle: 'Combina múltiples archivos PDF en un solo documento organizado.',
    btnMergeAction: 'Unir PDFs Ahora',
    mergeDropzoneSubtitle: 'Seleccione 2 o más archivos PDF para combinarlos',
    btnClearQueue: 'Limpiar Cola',
    mergeFilesQueued: '{n} archivo(s) en cola (arrastre para reordenar)',

    // Split Tool
    splitTitle: 'Dividir PDF',
    splitSubtitle: 'Extrae páginas específicas o separa todas las páginas de tu archivo.',
    btnSplitAction: 'Dividir y Descargar',
    splitModeRange: 'Rango de Páginas',
    splitModeRangeDesc: 'Extrae solo las páginas que necesitas en un único PDF.',
    splitRangeLabel: 'Páginas o Rangos:',
    splitRangeExample: 'Ejemplo: 1-3 extrae de la página 1 a la 3.',
    splitModeAll: 'Extraer Todas las Páginas',
    splitModeAllDesc: 'Guarda cada página individual como documento PDF en un archivo .ZIP.',

    // Organize Tool
    organizeTitle: 'Organizar Páginas',
    organizeSubtitle: 'Arrastra para reordenar, gira o elimina páginas con vista previa visual.',
    btnRotateAll: 'Girar Todas (+90°)',
    btnSaveOrganized: 'Guardar Nuevo PDF',
    btnResetOrder: 'Restaurar Original',
    organizeTip: 'Consejo: Arrastre las tarjetas para cambiar el orden de las páginas.',

    // Img to PDF
    imgToPdfTitle: 'Imágenes a PDF',
    imgToPdfSubtitle: 'Convierte imágenes JPG, PNG y WebP en un documento PDF organizado.',
    btnConvertImg: 'Convertir a PDF',
    imgFormat: 'Tamaño de Página',
    imgFormatA4: 'Estándar A4',
    imgFormatFit: 'Ajustar al tamaño de la imagen',
    imgOrientation: 'Orientación (A4)',
    imgPortrait: 'Vertical',
    imgLandscape: 'Horizontal',
    imgMargin: 'Margen',
    imgMarginNone: 'Sin Margen',
    imgMarginSmall: 'Margen Pequeño',
    imgMarginLarge: 'Margen Grande',

    // PDF to Img
    pdfToImgTitle: 'PDF a Imágenes',
    pdfToImgSubtitle: 'Convierte las páginas de tu PDF en imágenes PNG o JPG de alta resolución.',
    btnPdfToImg: 'Convertir y Descargar',
    imgTypeLabel: 'Formato de Imagen',
    imgResolutionLabel: 'Resolución / Calidad',
    resNormal: 'Estándar (150 DPI)',
    resHigh: 'Alta Resolución (200 DPI)',
    resUltra: 'Ultra HD (300 DPI)',
    pagesToConvert: 'Páginas para Convertir',

    // Watermark
    watermarkTitle: 'Añadir Marca de Agua',
    watermarkSubtitle: 'Inserta sellos como CONFIDENCIAL, BORRADOR o tu nombre en todas las páginas.',
    btnApplyWatermark: 'Aplicar y Descargar',
    watermarkText: 'Texto de la Marca de Agua',
    watermarkColor: 'Color',
    watermarkColorGray: 'Gris Discreto',
    watermarkColorRed: 'Rojo Alerta',
    watermarkColorBlue: 'Azul Corporativo',
    watermarkOpacity: 'Opacidad',
    watermarkAngle: 'Ángulo',

    // Page Numbers
    pageNumbersTitle: 'Numerar Páginas',
    pageNumbersSubtitle: 'Inserta números de página en el pie de página o encabezado.',
    btnApplyNumbers: 'Insertar Números',
    numberPos: 'Posición de Numeración',
    numberBottomCenter: 'Pie Centro',
    numberBottomRight: 'Pie Derecha',
    numberBottomLeft: 'Pie Izquierda',
    numberTopCenter: 'Encabezado Centro',
    numberTopRight: 'Encabezado Derecha',
    numberFormat: 'Formato de Texto',
    skipFirstPage: 'No numerar la primera página (Portada)'
  }
};

let currentLang = 'pt';
try {
  if (typeof localStorage !== 'undefined') {
    currentLang = localStorage.getItem('pdfx_lang') || 'pt';
  }
} catch (e) {
  currentLang = 'pt';
}

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (TRANSLATIONS[lang]) {
    currentLang = lang;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pdfx_lang', lang);
      }
    } catch (e) {}
    return true;
  }
  return false;
}

export function t(key, replacements = {}) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS['pt'];
  let text = dict[key] || TRANSLATIONS['pt'][key] || key;

  for (const [k, v] of Object.entries(replacements)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return text;
}
