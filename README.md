# ⚡ PDFX — By LaBiOmicS

> **O Canivete Suíço de PDF 100% no Navegador**  
> Desenvolvido pelo **LaBiOmicS** (Laboratório de Bioinformática e Ciências Ômicas)  
> Multilíngue nativo: **Português (PT)**, **Inglês (EN)** e **Espanhol (ES)**.

🌐 **Acesse a aplicação ao vivo:**  
👉 **[https://labiomics.github.io/pdfx/](https://labiomics.github.io/pdfx/)**

---

## 🌟 Principais Recursos

1. **Editar PDF (Texto, Tarjas, Marca-Texto & Comentários)**:
   - **Tarjas Pretas de Censura (Blackout/Redact)**: Oculte permanentemente dados sensíveis (CPF, laudos, nomes, prontuários) com tarjas opacas e redimensionáveis.
   - **Tarjas Brancas (Apagar)**: Cubra e apague trechos de formulários ou documentos em fundo branco.
   - **Comentários & Notas (Sticky Notes)**: Adicione notas adesivas amarelas de revisão com títulos e observações.
   - **Caixas de Texto Livres**: Digite sobre o PDF com controle de fonte, tamanho, cores, negrito e redimensionamento interativo.
   - **Substituição de Texto**: Campo de texto com fundo branco automático para sobrepor e substituir informações no documento.
   - **Marca-Texto Multi-Cores**: Realce linhas e trechos importantes com faixas translúcidas (Amarelo, Verde, Rosa, Azul).
   - **Disposição Ergonômica com Menu Lateral**: Barra de ferramentas lateral para maximizar a área de visualização vertical do PDF e eliminar quebras de linha.
2. **Assinar PDF (Assinatura Digital e Rubrica)**:
   - **Desenho Livre (Touch / Mouse)**: Desenhe sua assinatura ou rubrica com opções de cor de tinta (Azul Caneta ou Preto).
   - **Digitar Nome em Fontes Cursivas**: Digite seu nome completo e selecione estilos tipográficos cursivos realistas (`Dancing Script`, `Caveat`).
   - **Upload de Imagem**: Carregue fotos ou imagens transparentes da sua assinatura física.
   - **Posicionamento e Redimensionamento**: Arraste para o local da assinatura e redimensione com a alça interativa.
3. **Converter Word (DOCX) para PDF**:
   - Conversão 100% no cliente preservando títulos, parágrafos, tabelas e tipografia sem necessidade de LibreOffice ou servidor externo.
   - Opções de orientação (Retrato/Paisagem) e margens (Padrão, Estreita, Ampla).
4. **Juntar PDFs (Merge)**: Combine múltiplos arquivos PDF com reordenação arrastar-e-soltar.
5. **Dividir PDF (Split)**: Separe por intervalos específicos (ex: `1-3, 5, 8-10`) ou extraia todas as páginas individuais em um pacote `.ZIP`.
6. **Organizar Páginas**: Visualize miniaturas via canvas, reordene arrastando os cards (drag & drop), gire em $90^\circ$ e exclua páginas.
7. **Imagens para PDF**: Converta fotos PNG, JPG e WebP em PDF, escolhendo formato (A4 vs Tamanho Real), orientação e margens.
8. **PDF para Imagens**: Converta páginas em fotos PNG/JPG em alta resolução (150, 200 ou 300 DPI) com download direto ou em lote compactado (`.zip`).
9. **Marca d'Água**: Aplique textos personalizados com ângulo, opacidade e cores customizadas.
10. **Numerar Páginas**: Insira numeração de páginas automatizada no cabeçalho ou rodapé.
11. **Extrair Texto do PDF (PDF para TXT)**: Extraia todo o conteúdo textual do PDF com contagem precisa de palavras e caracteres, pré-visualização formatada, botão de cópia instantânea e exportação em arquivo `.txt`.
12. **PDF em Preto e Branco (Escala de Cinza / Grayscale)**: Converta PDFs coloridos para tons de cinza ou alto contraste com resolução selecionável (150 ou 200 DPI), perfeito para economizar tinta/toner em impressões e atender exigências de editais, concursos e repositórios acadêmicos.

---

## 🛡️ Privacidade e Conformidade (LGPD / GDPR)

- **Processamento 100% no Navegador**: Os documentos **nunca saem da máquina do usuário**. Nenhum dado é transmitido para servidores de terceiros.
- **Segurança para Pesquisa e Medicina**: Especialmente concebido pelo **LaBiOmicS** para análise de artigos, dados genômicos, prontuários e laudos que exigem estrito sigilo.
- **Custo Zero & Sem Limites**: Sem assinaturas, sem marcas d'água de publicidade e sem cotas diárias de arquivos.

---

## 🚀 Publicação no GitHub Pages

O projeto roda diretamente na branch `main` com GitHub Pages ativo via GitHub Actions:
- **Repositório:** [https://github.com/LaBiOmicS/pdfx](https://github.com/LaBiOmicS/pdfx)
- **URL do Site:** [https://labiomics.github.io/pdfx/](https://labiomics.github.io/pdfx/)

---

## 💻 Teste Local

```bash
# Com Python:
python3 -m http.server 8080

# Com Node / npx:
npx serve .
```

Acesse: `http://localhost:8080`
