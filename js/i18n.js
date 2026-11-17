/**
 * Sistema de Internacionalização (i18n) - PDFX
 * LaBiOmicS — Laboratório de Bioinformática e Ciências Ômicas
 */

export const TRANSLATIONS = {
  pt: {
    appName: 'PDFX',
    labName: 'LaBiOmicS',
    labFullName: 'Laboratório de Bioinformática e Ciências Ômicas',
    developedBy: 'LaBiOmicS — Laboratório de Bioinformática e Ciências Ômicas',
    privacyBadge: 'Processamento 100% Local • Zero Servidores',
    heroBadge: 'Democratização do Acesso • 100% Gratuito & Livre',
    heroTitle: 'Edite qualquer PDF direto no seu navegador.',
    heroTitleSub: 'Sem assinaturas. Sem limites. Sem enviar seus dados para a nuvem.',
    heroSubtitle: 'Uma iniciativa do LaBiOmicS para democratizar ferramentas essenciais de manipulação de documentos para estudantes, pesquisadores e profissionais.',
    heroCtaEdit: 'Começar a Editar PDF',
    heroCtaTools: 'Ver Todas as Ferramentas',

    // Mockup Demo Texts
    demoDocumentTitle: 'Relatório Técnico e Parecer Institucional',
    demoHighlightText: 'Resultados validados com alta reprodutibilidade estatística',
    demoRedactedTag: '[ DADO PESSOAL CENSURADO — LGPD ]',
    demoReplacedText: 'Texto corrigido e inserido com alinhamento profissional',
    demoNoteAuthor: 'Comitê de Avaliação',
    demoNoteText: 'Aprovado para publicação imediata com acesso público e irrestrito.',

    // Comparison Section
    compTitle: 'Acesso democrático vs. Ferramentas comerciais',
    compOtherTitle: 'Editores Comerciais (iLovePDF, Smallpdf, etc.)',
    compOtherItem1: 'Cobram assinaturas caras (R$ 30 a R$ 60/mês)',
    compOtherItem2: 'Bloqueiam após 2 ou 3 documentos por dia',
    compOtherItem3: 'Fazem upload dos seus dados sigilosos para servidores externos',
    compPdfxTitle: 'PDFX (LaBiOmicS)',
    compPdfxItem1: '100% Gratuito e Aberto para sempre, sem pegadinhas',
    compPdfxItem2: 'Uso verdadeiramente ilimitado, sem necessidade de cadastro',
    compPdfxItem3: 'Privacidade absoluta: roda 100% na memória do seu navegador',

    // Tools
    toolOpen: 'Abrir ferramenta',
    backHome: 'Voltar ao Início',
    btnChangeFile: 'Trocar Arquivo',
    btnSave: 'Salvar',
    btnCancel: 'Cancelar',
    processing: 'Processando documento...',
    waitMoment: 'Aguarde alguns segundos enquanto seu arquivo é gerado localmente.',
    dropzoneText: 'Selecione ou arraste o arquivo PDF aqui',
    dropzoneSubtitle: 'Processamento local em memória • Tamanho ilimitado',
    
    // Edit Tool
    editTitle: 'Editar PDF — Textos, Marca-Texto & Tarjas',
    editSubtitle: 'Substitua textos, marque trechos, censure informações confidenciais ou adicione notas adesivas.',
    btnAddText: '+ Texto Livre',
    btnReplaceText: '+ Substituir Texto (Fundo Branco)',
    btnRedactBlack: 'Tarja Preta (Censurar)',
    btnRedactWhite: 'Tarja Branca (Apagar)',
    btnAddComment: '+ Nota de Revisão',
    btnHighlight: 'Marca-Texto',
    btnSaveEdited: 'Salvar e Baixar PDF',
    pageIndicator: 'Página {current} de {total}',
    propFormat: 'Propriedades do Elemento:',
    propFontSize: 'Tamanho:',
    propColor: 'Cor do Texto:',
    propBgLabel: 'Fundo:',
    propBgTransparent: 'Transparente',
    propBgWhite: 'Branco (Cobrir Original)',
    btnDeleteSelected: 'Excluir Selecionado',
    editHint: '💡 Arraste pela barra para mover. Puxe a quina inferior direita (◢) para redimensionar tarjas e marca-textos.',
    
    // Merge Tool
    mergeTitle: 'Juntar PDFs',
    mergeSubtitle: 'Una múltiplos arquivos em um único PDF na ordem que desejar.',
    btnMergeAction: 'Juntar PDFs Agora',
    mergeDropzoneSubtitle: 'Selecione dois ou mais PDFs para combiná-los',
    btnClearQueue: 'Limpar Fila',
    mergeFilesQueued: '{n} arquivo(s) na fila (arraste para reordenar)',

    // Split Tool
    splitTitle: 'Dividir PDF',
    splitSubtitle: 'Separe intervalos específicos ou extraia todas as páginas do documento.',
    btnSplitAction: 'Dividir e Baixar',
    splitModeRange: 'Intervalo de Páginas',
    splitModeRangeDesc: 'Extraia apenas as páginas que você precisa em um único arquivo.',
    splitRangeLabel: 'Páginas ou Intervalos:',
    splitRangeExample: 'Exemplo: 1-3, 5, 8 extrai as páginas indicadas.',
    splitModeAll: 'Extrair Todas as Páginas',
    splitModeAllDesc: 'Salva cada página individualmente como um PDF em arquivo compactado .ZIP.',

    // Organize Tool
    organizeTitle: 'Organizar Páginas',
    organizeSubtitle: 'Reordene visualmente com miniaturas, gire em 90° ou exclua páginas.',
    btnRotateAll: 'Girar Todas (+90°)',
    btnSaveOrganized: 'Salvar Novo PDF',
    btnResetOrder: 'Restaurar Ordem Original',
    organizeTip: 'Arraste os cards para reorganizar a sequência das páginas.',

    // Img to PDF
    imgToPdfTitle: 'Imagens para PDF',
    imgToPdfSubtitle: 'Converta fotos JPG, PNG e WebP em um documento PDF organizado.',
    btnConvertImg: 'Gerar Documento PDF',
    imgFormat: 'Tamanho da Página',
    imgFormatA4: 'Formato A4 Padrão',
    imgFormatFit: 'Ajustar ao Tamanho da Imagem',
    imgOrientation: 'Orientação',
    imgPortrait: 'Retrato (Vertical)',
    imgLandscape: 'Paisagem (Horizontal)',
    imgMargin: 'Margem',
    imgMarginNone: 'Sem Margem',
    imgMarginSmall: 'Margem Pequena',
    imgMarginLarge: 'Margem Ampla',

    // PDF to Img
    pdfToImgTitle: 'PDF para Imagens',
    pdfToImgSubtitle: 'Exporte cada página do PDF como imagem PNG ou JPG de alta resolução.',
    btnPdfToImg: 'Converter e Baixar',
    imgTypeLabel: 'Formato da Imagem',
    imgResolutionLabel: 'Qualidade / Resolução',
    resNormal: 'Padrão (150 DPI)',
    resHigh: 'Alta Resolução (200 DPI)',
    resUltra: 'Ultra HD (300 DPI)',
    pagesToConvert: 'Páginas para Converter',

    // Watermark
    watermarkTitle: 'Marca d’Água',
    watermarkSubtitle: 'Estampe marcas como CONFIDENCIAL, RASCUNHO ou carimbos de texto.',
    btnApplyWatermark: 'Aplicar Marca d’Água',
    watermarkText: 'Texto da Marca',
    watermarkColor: 'Cor',
    watermarkColorGray: 'Cinza Discreto',
    watermarkColorRed: 'Vermelho Alerta',
    watermarkColorBlue: 'Azul Corporativo',
    watermarkOpacity: 'Opacidade',
    watermarkAngle: 'Ângulo',

    // Page Numbers
    pageNumbersTitle: 'Numerar Páginas',
    pageNumbersSubtitle: 'Insira números de página no rodapé ou cabeçalho do documento.',
    btnApplyNumbers: 'Inserir Numeração',
    numberPos: 'Posição',
    numberBottomCenter: 'Rodapé Centro',
    numberBottomRight: 'Rodapé Direita',
    numberBottomLeft: 'Rodapé Esquerda',
    numberTopCenter: 'Cabeçalho Centro',
    numberTopRight: 'Cabeçalho Direita',
    numberFormat: 'Formato',
    skipFirstPage: 'Não numerar a 1ª página (Capa)',

    // Sign PDF Tool
    signPdfTitle: 'Assinar PDF',
    signPdfSubtitle: 'Desenhe sua rubrica, digite seu nome ou insira uma imagem de assinatura no documento.',
    btnSignModal: '+ Criar / Inserir Assinatura',
    btnSaveSigned: 'Salvar PDF Assinado',
    signDropText: 'Selecione o documento PDF para assinar',
    signDropSub: 'Desenhe sua rubrica, digite seu nome ou carregue uma imagem da assinatura',
    signSelectedBadge: 'Assinatura Selecionada',
    signHintDrag: 'Arraste a assinatura para a linha correspondente no documento e puxe a alça ◢ para redimensionar.',
    signModalTitle: 'Criar Assinatura ou Rubrica',
    signTabDraw: '✍️ Desenhar',
    signTabType: '⌨️ Digitar',
    signTabUpload: '📁 Carregar Foto',
    signDrawHint: 'Desenhe aqui com o mouse ou tela sensível ao toque',
    signInkColor: 'Cor da Tinta:',
    btnClearPad: 'Limpar',
    signYourName: 'Seu Nome Completo:',
    signStyleLabel: 'Estilo da Assinatura:',
    signUploadPrompt: 'Clique para enviar imagem da assinatura',
    signUploadHint: 'Suporta PNG ou JPG (Fundo transparente recomendado)',
    btnInsertSign: 'Inserir no Documento',

    // DOCX to PDF Tool
    docxToPdfTitle: 'Converter Word (DOCX) para PDF',
    docxToPdfSubtitle: 'Converta arquivos do Word (.docx) em documentos PDF com layout, tabelas e formatação preservados.',
    btnConvertDocx: 'Converter e Baixar PDF',
    docxDropText: 'Selecione ou arraste seu arquivo Word (.docx)',
    docxDropSub: 'Compatível com Word, Google Docs e LibreOffice',
    docxOrientation: 'Orientação:',
    docxMargin: 'Margens:',
    docxStandard: 'Padrão (12mm)',
    docxNarrow: 'Estreita (6mm)',
    docxWide: 'Ampla (20mm)',
    docxPreviewTitle: 'Pré-visualização do Documento Convertido:',
    docxLocalBadge: '100% Processado no Navegador',
    modulesBadge: '12 Módulos 100% Gratuitos',

    // PDF to Text Tool
    pdfToTextTitle: 'Extrair Texto do PDF',
    pdfToTextSubtitle: 'Extraia todo o texto do documento com contagem de palavras e exportação em .TXT.',
    btnCopyText: 'Copiar Texto',
    btnDownloadTxt: 'Baixar Arquivo .TXT',
    textDropTitle: 'Selecione ou arraste o PDF para extrair o texto',
    textDropSub: 'Processamento instantâneo via motor nativo de texto',
    chkIncludeMarkers: 'Incluir separadores de página',
    extractedTextPreview: 'Texto Extraído do Documento:',
    textPlaceholder: 'O texto extraído aparecerá aqui...',
    copiedNotice: 'Copiado!',
    copiedSuccess: 'Texto copiado para a área de transferência!',
    copyFailed: 'Não foi possível copiar o texto automaticamente.',
    txtDownloadedSuccess: 'Arquivo .TXT descarregado com sucesso!',
    extractingTextNotice: 'Lendo e extraindo texto das páginas...',
    textExtractSuccess: 'Texto extraído com sucesso!',
    pageMarkerLabel: 'Página {current} de {total}',
    pagesWord: 'páginas',
    wordsWord: 'palavras',
    charactersWord: 'caracteres',

    // Grayscale PDF Tool
    grayscalePdfTitle: 'PDF em Preto e Branco',
    grayscalePdfSubtitle: 'Converta PDFs coloridos para tons de cinza para economizar tinta e atender normas formais.',
    btnConvertGrayscale: 'Converter e Baixar em Preto e Branco',
    grayscaleDropTitle: 'Selecione ou arraste o PDF para converter em Preto e Branco',
    grayscaleDropSub: 'Ideal para impressão econômica, arquivos de concurso e repositórios acadêmicos',
    grayModeLabel: 'Modo de Tom:',
    grayModeStandard: 'Tons de Cinza Padrão',
    grayModeContrast: 'Alto Contraste (Texto Nítido)',
    grayPreviewSampleTitle: 'Amostra da 1ª Página (Comparação em Tempo Real):',
    grayOriginalBadge: 'Original Colorido',
    grayResultBadge: 'Preto e Branco',
    renderingPreviewNotice: 'Gerando amostra em preto e branco...',
    fileLoadedSuccess: 'Documento carregado com sucesso!',
    convertingGrayscaleNotice: 'Processando página {current} de {total} em preto e branco...',
    grayscaleSuccess: 'PDF em preto e branco gerado com sucesso!',
    warnSelectPdf: 'Por favor, selecione um arquivo no formato PDF.'
  },

  en: {
    appName: 'PDFX',
    labName: 'LaBiOmicS',
    labFullName: 'Bioinformatics and Computational Omics Laboratory',
    developedBy: 'LaBiOmicS — Laboratório de Bioinformática e Ciências Ômicas',
    privacyBadge: '100% In-Browser • Zero Servers',
    heroBadge: 'Democratizing Tech • 100% Free & Open',
    heroTitle: 'Edit any PDF directly in your browser.',
    heroTitleSub: 'No subscriptions. No limits. Zero server uploads.',
    heroSubtitle: 'An initiative by LaBiOmicS to democratize essential document tools for students, researchers, and professionals worldwide.',
    heroCtaEdit: 'Start Editing PDF',
    heroCtaTools: 'Explore All Tools',

    // Mockup Demo Texts
    demoDocumentTitle: 'Technical Report & Institutional Review',
    demoHighlightText: 'Results thoroughly validated with statistical precision',
    demoRedactedTag: '[ SENSITIVE PERSONAL DATA REDACTED — GDPR ]',
    demoReplacedText: 'Corrected text inserted with seamless professional alignment',
    demoNoteAuthor: 'Review Board',
    demoNoteText: 'Approved for unrestricted public distribution and immediate open access.',

    // Comparison Section
    compTitle: 'Democratized Access vs. Commercial Paywalls',
    compOtherTitle: 'Commercial Editors (iLovePDF, Smallpdf, etc.)',
    compOtherItem1: 'Charge expensive monthly fees ($10 to $20/month)',
    compOtherItem2: 'Lock features after 2 or 3 documents per day',
    compOtherItem3: 'Upload your sensitive confidential files to cloud servers',
    compPdfxTitle: 'PDFX (LaBiOmicS)',
    compPdfxItem1: '100% Free and Open Source forever, zero hidden costs',
    compPdfxItem2: 'Truly unlimited processing with no signup required',
    compPdfxItem3: 'Absolute privacy: runs strictly in your browser memory',

    // Tools
    toolOpen: 'Open tool',
    backHome: 'Back to Home',
    btnChangeFile: 'Change File',
    btnSave: 'Save',
    btnCancel: 'Cancel',
    processing: 'Processing document...',
    waitMoment: 'Please wait a few seconds while your file is generated locally.',
    dropzoneText: 'Select or drag your PDF file here',
    dropzoneSubtitle: 'Local in-memory processing • Unlimited file size',

    // Edit Tool
    editTitle: 'Edit PDF — Text, Highlighter & Redaction',
    editSubtitle: 'Replace text, highlight passages, black out confidential data, or add sticky notes.',
    btnAddText: '+ Free Text',
    btnReplaceText: '+ Replace Text (White Background)',
    btnRedactBlack: 'Blackout Redaction',
    btnRedactWhite: 'Whiteout (Erase)',
    btnAddComment: '+ Review Note',
    btnHighlight: 'Highlighter',
    btnSaveEdited: 'Save & Download PDF',
    pageIndicator: 'Page {current} of {total}',
    propFormat: 'Element Properties:',
    propFontSize: 'Size:',
    propColor: 'Text Color:',
    propBgLabel: 'Background:',
    propBgTransparent: 'Transparent',
    propBgWhite: 'White (Cover Original)',
    btnDeleteSelected: 'Delete Selected',
    editHint: '💡 Drag by the top bar to move. Pull bottom-right corner (◢) to stretch redactions and highlighters.',

    // Merge Tool
    mergeTitle: 'Merge PDFs',
    mergeSubtitle: 'Combine multiple files into a single PDF in any sequence.',
    btnMergeAction: 'Merge PDFs Now',
    mergeDropzoneSubtitle: 'Select two or more PDFs to combine',
    btnClearQueue: 'Clear Queue',
    mergeFilesQueued: '{n} file(s) in queue (drag to reorder)',

    // Split Tool
    splitTitle: 'Split PDF',
    splitSubtitle: 'Separate specific page ranges or extract all pages individually.',
    btnSplitAction: 'Split & Download',
    splitModeRange: 'Page Range',
    splitModeRangeDesc: 'Extract only the pages you need into a single file.',
    splitRangeLabel: 'Pages or Ranges:',
    splitRangeExample: 'Example: 1-3, 5, 8 extracts the specified pages.',
    splitModeAll: 'Extract All Pages',
    splitModeAllDesc: 'Saves each individual page as a separate PDF in a compressed .ZIP archive.',

    // Organize Tool
    organizeTitle: 'Organize Pages',
    organizeSubtitle: 'Visually reorder pages with live thumbnails, rotate 90°, or delete pages.',
    btnRotateAll: 'Rotate All (+90°)',
    btnSaveOrganized: 'Save Organized PDF',
    btnResetOrder: 'Reset Original Order',
    organizeTip: 'Drag cards to reorder the page sequence.',

    // Img to PDF
    imgToPdfTitle: 'Images to PDF',
    imgToPdfSubtitle: 'Convert JPG, PNG, and WebP images into an organized PDF document.',
    btnConvertImg: 'Generate PDF Document',
    imgFormat: 'Page Size',
    imgFormatA4: 'Standard A4 Format',
    imgFormatFit: 'Fit to Image Size',
    imgOrientation: 'Orientation',
    imgPortrait: 'Portrait (Vertical)',
    imgLandscape: 'Landscape (Horizontal)',
    imgMargin: 'Margin',
    imgMarginNone: 'No Margin',
    imgMarginSmall: 'Small Margin',
    imgMarginLarge: 'Wide Margin',

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
    watermarkTitle: 'Watermark',
    watermarkSubtitle: 'Stamp text watermarks such as CONFIDENTIAL or custom labels.',
    btnApplyWatermark: 'Apply Watermark',
    watermarkText: 'Stamp Text',
    watermarkColor: 'Color',
    watermarkColorGray: 'Discreet Gray',
    watermarkColorRed: 'Alert Red',
    watermarkColorBlue: 'Corporate Blue',
    watermarkOpacity: 'Opacity',
    watermarkAngle: 'Angle',

    // Page Numbers
    pageNumbersTitle: 'Page Numbers',
    pageNumbersSubtitle: 'Insert automated page numbers in the footer or header.',
    btnApplyNumbers: 'Insert Numbers',
    numberPos: 'Position',
    numberBottomCenter: 'Bottom Center',
    numberBottomRight: 'Bottom Right',
    numberBottomLeft: 'Bottom Left',
    numberTopCenter: 'Top Center',
    numberTopRight: 'Top Right',
    numberFormat: 'Format',
    skipFirstPage: 'Skip first page (Cover page)',

    // Sign PDF Tool
    signPdfTitle: 'Sign PDF',
    signPdfSubtitle: 'Draw your handwritten signature, type your name, or upload a signature image.',
    btnSignModal: '+ Create / Insert Signature',
    btnSaveSigned: 'Save Signed PDF',
    signDropText: 'Select the PDF document to sign',
    signDropSub: 'Draw your initials, type your name, or upload a signature image',
    signSelectedBadge: 'Selected Signature',
    signHintDrag: 'Drag the signature to the desired line and pull the ◢ handle to resize.',
    signModalTitle: 'Create Signature or Initials',
    signTabDraw: '✍️ Draw',
    signTabType: '⌨️ Type',
    signTabUpload: '📁 Upload Photo',
    signDrawHint: 'Draw here using your mouse or touchscreen',
    signInkColor: 'Ink Color:',
    btnClearPad: 'Clear',
    signYourName: 'Your Full Name:',
    signStyleLabel: 'Signature Style:',
    signUploadPrompt: 'Click to upload a signature image',
    signUploadHint: 'Supports PNG or JPG (Transparent background recommended)',
    btnInsertSign: 'Insert into Document',

    // DOCX to PDF Tool
    docxToPdfTitle: 'Convert Word (DOCX) to PDF',
    docxToPdfSubtitle: 'Convert Word (.docx) documents into PDF preserving layout, tables, and typography.',
    btnConvertDocx: 'Convert & Download PDF',
    docxDropText: 'Select or drag your Word (.docx) file here',
    docxDropSub: 'Compatible with Microsoft Word, Google Docs, and LibreOffice',
    docxOrientation: 'Orientation:',
    docxMargin: 'Margins:',
    docxStandard: 'Standard (12mm)',
    docxNarrow: 'Narrow (6mm)',
    docxWide: 'Wide (20mm)',
    docxPreviewTitle: 'Converted Document Preview:',
    docxLocalBadge: '100% Processed In-Browser',
    modulesBadge: '12 100% Free Modules',

    // PDF to Text Tool
    pdfToTextTitle: 'Extract PDF Text',
    pdfToTextSubtitle: 'Extract all text content from the document with word counts and .TXT export.',
    btnCopyText: 'Copy Text',
    btnDownloadTxt: 'Download .TXT File',
    textDropTitle: 'Select or drag your PDF to extract text',
    textDropSub: 'Instant processing via native client-side text engine',
    chkIncludeMarkers: 'Include page dividers',
    extractedTextPreview: 'Extracted Document Text:',
    textPlaceholder: 'Extracted text will appear here...',
    copiedNotice: 'Copied!',
    copiedSuccess: 'Text successfully copied to clipboard!',
    copyFailed: 'Failed to copy text automatically.',
    txtDownloadedSuccess: '.TXT file downloaded successfully!',
    extractingTextNotice: 'Reading and extracting text from pages...',
    textExtractSuccess: 'Text extracted successfully!',
    pageMarkerLabel: 'Page {current} of {total}',
    pagesWord: 'pages',
    wordsWord: 'words',
    charactersWord: 'characters',

    // Grayscale PDF Tool
    grayscalePdfTitle: 'Black & White (Grayscale)',
    grayscalePdfSubtitle: 'Convert color PDFs to grayscale to save ink and comply with formal printing rules.',
    btnConvertGrayscale: 'Convert & Download Black & White',
    grayscaleDropTitle: 'Select or drag your PDF to convert to Black & White',
    grayscaleDropSub: 'Ideal for economical printing, official filings, and academic repositories',
    grayModeLabel: 'Tone Mode:',
    grayModeStandard: 'Standard Grayscale',
    grayModeContrast: 'High Contrast (Sharp Text)',
    grayPreviewSampleTitle: 'Page 1 Sample (Real-Time Comparison):',
    grayOriginalBadge: 'Color Original',
    grayResultBadge: 'Black & White',
    renderingPreviewNotice: 'Rendering black & white preview...',
    fileLoadedSuccess: 'Document loaded successfully!',
    convertingGrayscaleNotice: 'Processing page {current} of {total} in black & white...',
    grayscaleSuccess: 'Black & White PDF generated successfully!',
    warnSelectPdf: 'Please select a valid PDF file.'
  },

  es: {
    appName: 'PDFX',
    labName: 'LaBiOmicS',
    labFullName: 'Laboratorio de Bioinformática y Ciencias Ómicas',
    developedBy: 'LaBiOmicS — Laboratório de Bioinformática e Ciências Ômicas',
    privacyBadge: '100% En el Navegador • Cero Servidores',
    heroBadge: 'Democratización Tecnológica • 100% Gratuito y Libre',
    heroTitle: 'Edita cualquier PDF directamente en tu navegador.',
    heroTitleSub: 'Sin suscripciones. Sin límites. Cero subida de datos a la nube.',
    heroSubtitle: 'Una iniciativa de LaBiOmicS para democratizar las herramientas esenciales de edición para estudiantes, investigadores y profesionales.',
    heroCtaEdit: 'Comenzar a Editar PDF',
    heroCtaTools: 'Ver Todas las Herramientas',

    // Mockup Demo Texts
    demoDocumentTitle: 'Informe Técnico y Dictamen Institucional',
    demoHighlightText: 'Resultados validados con alta reproducibilidad estadística',
    demoRedactedTag: '[ DATO PERSONAL CENSURADO — RGPD ]',
    demoReplacedText: 'Texto corregido e insertado con alineación profesional',
    demoNoteAuthor: 'Comité de Revisión',
    demoNoteText: 'Aprobado para distribución pública inmediata y libre acceso.',

    // Comparison Section
    compTitle: 'Acceso Democrático vs. Herramientas Comerciales',
    compOtherTitle: 'Editores Comerciales (iLovePDF, Smallpdf, etc.)',
    compOtherItem1: 'Cobran suscripciones mensuales costosas ($10 a $20/mes)',
    compOtherItem2: 'Bloquean funciones tras 2 o 3 documentos por día',
    compOtherItem3: 'Suben tus archivos confidenciales a servidores externos',
    compPdfxTitle: 'PDFX (LaBiOmicS)',
    compPdfxItem1: '100% Gratuito y Abierto para siempre, sin cargos ocultos',
    compPdfxItem2: 'Uso verdaderamente ilimitado, sin necesidad de registro',
    compPdfxItem3: 'Privacidad absoluta: se ejecuta en la memoria de tu navegador',

    // Tools
    toolOpen: 'Abrir herramienta',
    backHome: 'Volver al Inicio',
    btnChangeFile: 'Cambiar Archivo',
    btnSave: 'Guardar',
    btnCancel: 'Cancelar',
    processing: 'Procesando documento...',
    waitMoment: 'Espere unos segundos mientras se genera el archivo localmente.',
    dropzoneText: 'Seleccione o arrastre el archivo PDF aquí',
    dropzoneSubtitle: 'Procesamiento local en memoria • Tamaño ilimitado',

    // Edit Tool
    editTitle: 'Editar PDF — Textos, Resaltador & Tachaduras',
    editSubtitle: 'Reemplaza textos, resalta líneas, censura datos confidenciales o añade notas adhesivas.',
    btnAddText: '+ Texto Libre',
    btnReplaceText: '+ Reemplazar Texto (Fondo Blanco)',
    btnRedactBlack: 'Tachadura Negra (Censurar)',
    btnRedactWhite: 'Tachadura Blanca (Borrar)',
    btnAddComment: '+ Nota de Revisión',
    btnHighlight: 'Resaltador',
    btnSaveEdited: 'Guardar y Descargar PDF',
    pageIndicator: 'Página {current} de {total}',
    propFormat: 'Propiedades del Elemento:',
    propFontSize: 'Tamaño:',
    propColor: 'Color del Texto:',
    propBgLabel: 'Fondo:',
    propBgTransparent: 'Transparente',
    propBgWhite: 'Blanco (Cubrir Original)',
    btnDeleteSelected: 'Eliminar Seleccionado',
    editHint: '💡 Arrastre por la barra para mover. Tire de la esquina inferior derecha (◢) para estirar tachaduras y resaltadores.',

    // Merge Tool
    mergeTitle: 'Unir PDFs',
    mergeSubtitle: 'Combina múltiples archivos en un único PDF en el orden que desees.',
    btnMergeAction: 'Unir PDFs Ahora',
    mergeDropzoneSubtitle: 'Seleccione dos o más PDFs para combinarlos',
    btnClearQueue: 'Limpiar Cola',
    mergeFilesQueued: '{n} archivo(s) en cola (arrastre para reordenar)',

    // Split Tool
    splitTitle: 'Dividir PDF',
    splitSubtitle: 'Separa rangos específicos o extrae todas las páginas del documento.',
    btnSplitAction: 'Dividir y Descargar',
    splitModeRange: 'Rango de Páginas',
    splitModeRangeDesc: 'Extrae solo las páginas que necesitas en un único archivo.',
    splitRangeLabel: 'Páginas o Rangos:',
    splitRangeExample: 'Ejemplo: 1-3, 5, 8 extrae las páginas indicadas.',
    splitModeAll: 'Extraer Todas las Páginas',
    splitModeAllDesc: 'Guarda cada página individual como un PDF en un archivo comprimido .ZIP.',

    // Organize Tool
    organizeTitle: 'Organizar Páginas',
    organizeSubtitle: 'Reordena visualmente con miniaturas, gira en 90° o elimina páginas.',
    btnRotateAll: 'Girar Todas (+90°)',
    btnSaveOrganized: 'Guardar Nuevo PDF',
    btnResetOrder: 'Restaurar Orden Original',
    organizeTip: 'Arrastre las tarjetas para cambiar el orden de las páginas.',

    // Img to PDF
    imgToPdfTitle: 'Imágenes a PDF',
    imgToPdfSubtitle: 'Convierte fotos JPG, PNG y WebP en un documento PDF organizado.',
    btnConvertImg: 'Generar Documento PDF',
    imgFormat: 'Tamaño de Página',
    imgFormatA4: 'Formato A4 Estándar',
    imgFormatFit: 'Ajustar al Tamaño de la Imagen',
    imgOrientation: 'Orientación',
    imgPortrait: 'Vertical',
    imgLandscape: 'Horizontal',
    imgMargin: 'Margen',
    imgMarginNone: 'Sin Margen',
    imgMarginSmall: 'Margen Pequeño',
    imgMarginLarge: 'Margen Amplio',

    // PDF to Img
    pdfToImgTitle: 'PDF a Imágenes',
    pdfToImgSubtitle: 'Exporta cada página del PDF en imágenes PNG o JPG de alta resolución.',
    btnPdfToImg: 'Convertir y Descargar',
    imgTypeLabel: 'Formato de Imagen',
    imgResolutionLabel: 'Resolución / Calidad',
    resNormal: 'Estándar (150 DPI)',
    resHigh: 'Alta Resolución (200 DPI)',
    resUltra: 'Ultra HD (300 DPI)',
    pagesToConvert: 'Páginas para Convertir',

    // Watermark
    watermarkTitle: 'Marca de Agua',
    watermarkSubtitle: 'Inserta sellos de texto como CONFIDENCIAL o marcas personalizadas.',
    btnApplyWatermark: 'Aplicar Marca de Agua',
    watermarkText: 'Texto del Sello',
    watermarkColor: 'Color',
    watermarkColorGray: 'Gris Discreto',
    watermarkColorRed: 'Rojo Alerta',
    watermarkColorBlue: 'Azul Corporativo',
    watermarkOpacity: 'Opacidade',
    watermarkAngle: 'Ángulo',

    // Page Numbers
    pageNumbersTitle: 'Numerar Páginas',
    pageNumbersSubtitle: 'Inserta números de página en el pie de página o encabezado.',
    btnApplyNumbers: 'Insertar Números',
    numberPos: 'Posición',
    numberBottomCenter: 'Pie Centro',
    numberBottomRight: 'Pie Derecha',
    numberBottomLeft: 'Pie Izquierda',
    numberTopCenter: 'Encabezado Centro',
    numberTopRight: 'Encabezado Derecha',
    numberFormat: 'Formato',
    skipFirstPage: 'No numerar la 1ª página (Portada)',

    // Sign PDF Tool
    signPdfTitle: 'Firmar PDF',
    signPdfSubtitle: 'Dibuja tu firma a mano, escribe tu nombre o sube una imagen de tu firma al documento.',
    btnSignModal: '+ Crear / Insertar Firma',
    btnSaveSigned: 'Guardar PDF Firmado',
    signDropText: 'Selecciona el documento PDF para firmar',
    signDropSub: 'Dibuja tu rúbrica, escribe tu nombre o sube una imagen de tu firma',
    signSelectedBadge: 'Firma Seleccionada',
    signHintDrag: 'Arrastra la firma a la línea correspondiente y jala el asa ◢ para redimensionar.',
    signModalTitle: 'Crear Firma o Rúbrica',
    signTabDraw: '✍️ Dibujar',
    signTabType: '⌨️ Escribir',
    signTabUpload: '📁 Cargar Foto',
    signDrawHint: 'Dibuja aquí con el mouse o pantalla táctil',
    signInkColor: 'Color de Tinta:',
    btnClearPad: 'Limpiar',
    signYourName: 'Tu Nombre Completo:',
    signStyleLabel: 'Estilo de Firma:',
    signUploadPrompt: 'Haz clic para cargar imagen de firma',
    signUploadHint: 'Soporta PNG o JPG (Fondo transparente recomendado)',
    btnInsertSign: 'Insertar en el Documento',

    // DOCX to PDF Tool
    docxToPdfTitle: 'Convertir Word (DOCX) a PDF',
    docxToPdfSubtitle: 'Convierte archivos de Word (.docx) a PDF conservando el diseño, tablas y formato.',
    btnConvertDocx: 'Convertir y Descargar PDF',
    docxDropText: 'Selecciona o arrastra tu archivo Word (.docx)',
    docxDropSub: 'Compatible con Word, Google Docs y LibreOffice',
    docxOrientation: 'Orientación:',
    docxMargin: 'Márgenes:',
    docxStandard: 'Estándar (12mm)',
    docxNarrow: 'Estrecho (6mm)',
    docxWide: 'Amplio (20mm)',
    docxPreviewTitle: 'Vista Previa del Documento Convertido:',
    docxLocalBadge: '100% Procesado en el Navegador',
    modulesBadge: '12 Módulos 100% Gratuitos',

    // PDF to Text Tool
    pdfToTextTitle: 'Extraer Texto de PDF',
    pdfToTextSubtitle: 'Extrae todo el texto del documento con conteo de palabras y exportación a .TXT.',
    btnCopyText: 'Copiar Texto',
    btnDownloadTxt: 'Descargar Archivo .TXT',
    textDropTitle: 'Selecciona o arrastra el PDF para extraer texto',
    textDropSub: 'Procesamiento instantáneo mediante motor de texto nativo',
    chkIncludeMarkers: 'Incluir separadores de página',
    extractedTextPreview: 'Texto Extraído del Documento:',
    textPlaceholder: 'El texto extraído aparecerá aquí...',
    copiedNotice: '¡Copiado!',
    copiedSuccess: '¡Texto copiado al portapapeles!',
    copyFailed: 'No se pudo copiar el texto automáticamente.',
    txtDownloadedSuccess: '¡Archivo .TXT descargado con éxito!',
    extractingTextNotice: 'Leyendo y extrayendo texto de las páginas...',
    textExtractSuccess: '¡Texto extraído con éxito!',
    pageMarkerLabel: 'Página {current} de {total}',
    pagesWord: 'páginas',
    wordsWord: 'palabras',
    charactersWord: 'caracteres',

    // Grayscale PDF Tool
    grayscalePdfTitle: 'PDF en Blanco y Negro',
    grayscalePdfSubtitle: 'Convierte PDFs a blanco y negro para ahorrar tinta y cumplir normas de impresión.',
    btnConvertGrayscale: 'Convertir y Descargar en Blanco y Negro',
    grayscaleDropTitle: 'Selecciona o arrastra el PDF para convertir a Blanco y Negro',
    grayscaleDropSub: 'Ideal para impresión económica, trámites oficiales y repositorios académicos',
    grayModeLabel: 'Modo de Tono:',
    grayModeStandard: 'Escala de Grises Estándar',
    grayModeContrast: 'Alto Contraste (Texto Nítido)',
    grayPreviewSampleTitle: 'Muestra de la Página 1 (Comparación en Tiempo Real):',
    grayOriginalBadge: 'Original a Color',
    grayResultBadge: 'Blanco y Negro',
    renderingPreviewNotice: 'Generando muestra en blanco y negro...',
    fileLoadedSuccess: '¡Documento cargado con éxito!',
    convertingGrayscaleNotice: 'Procesando página {current} de {total} en blanco y negro...',
    grayscaleSuccess: '¡PDF en blanco y negro generado con éxito!',
    warnSelectPdf: 'Por favor, selecciona un archivo en formato PDF.'
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
