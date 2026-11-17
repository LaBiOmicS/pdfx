# 📄 PDF Studio Web

Ferramenta completa de manipulação e edição de PDF inspirada no iLovePDF, desenvolvida para rodar **100% no navegador** e publicada no **GitHub Pages** (sem backend, sem servidor, com privacidade total e custo zero).

🌐 **Acesse a aplicação ao vivo:**  
👉 **[https://labiomics.github.io/pdf-studio-web/](https://labiomics.github.io/pdf-studio-web/)**

---

## 🌟 Principais Funcionalidades

1. **Editar PDF (Texto, Tarjas & Comentários)**:
   - **Tarjas Pretas de Censura (Redact)**: Oculte permanentemente dados sensíveis (CPF, endereços, nomes) com tarjas opacas redimensionáveis.
   - **Tarjas Brancas (Apagar)**: Cubra e apague textos indesejados sobre papel branco.
   - **Notas e Comentários (Post-it)**: Insira notas adesivas de revisão com cabeçalho estilizado e observações em qualquer parte do documento.
   - **Caixas de Texto Livres**: Digite sobre o PDF com controle de fonte, cores, negrito e redimensionamento interativo.
   - **Marca-Texto**: Realce linhas e trechos importantes com faixa amarela semitransparente.
2. **Juntar PDFs (Merge)**: Combine múltiplos arquivos PDF na ordem que desejar, com arrastar-e-soltar.
3. **Dividir PDF (Split)**: Separe por intervalos específicos (ex: `1-3, 5, 8-10`) ou extraia todas as páginas individuais em um pacote `.ZIP`.
4. **Organizar Páginas (Visual Organize)**: Visualize miniaturas de todas as páginas renderizadas via canvas, reordene arrastando os cards (drag & drop), gire em $90^\circ$ ou exclua páginas indesejadas.
5. **Imagens para PDF**: Converta fotos PNG, JPG e WebP em um único PDF organizado, com controle de formato (A4 vs Tamanho Real), orientação e margens.
6. **PDF para Imagens**: Converta cada página do seu PDF em imagens PNG ou JPG de alta resolução (150, 200 ou 300 DPI), com download direto ou em lote compactado (`.zip`).
7. **Marca d'Água (Watermark)**: Aplique carimbos de texto (ex: *CONFIDENCIAL*, *RASCUNHO*, *CÓPIA*) com ângulo, opacidade e cores customizáveis.
8. **Numerar Páginas**: Insira numeração de páginas automatizada no cabeçalho ou rodapé, com opção de ignorar a capa (primeira página).

---

## 🛡️ Vantagens de Rodar no Navegador (Client-Side)

- **Privacidade Absoluta (LGPD / GDPR)**: Os arquivos **nunca** saem do dispositivo do usuário. Nenhuma requisição de upload é enviada para servidores de terceiros.
- **Custo Zero de Hospedagem**: Por ser 100% estático (HTML, CSS e JS), roda gratuitamente e sem limites no **GitHub Pages**, Vercel, Netlify ou Cloudflare Pages.
- **Sem Limites de Uso**: Sem cotas diárias de arquivos, sem marca d'água forçada e sem assinaturas pagas.

---

## 🚀 Como Publicar no GitHub Pages (Passo a Passo)

### Método 1: Direto pelo Repositório (Mais simples)

1. Crie um novo repositório no seu GitHub (ex: `meu-editor-pdf`).
2. No seu computador, inicialize o Git e envie os arquivos:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit - PDF Studio Web"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/meu-editor-pdf.git
   git push -u origin main
   ```
3. No GitHub, abra seu repositório e vá em:
   **Settings** $\rightarrow$ **Pages** (no menu lateral esquerdo).
4. Em **Build and deployment**:
   - **Source**: Escolha `Deploy from a branch`.
   - **Branch**: Selecione `main` e a pasta `/ (root)`.
   - Clique em **Save**.
5. Aguarde cerca de 1 minuto e seu site estará no ar na URL:  
   `https://SEU_USUARIO.github.io/meu-editor-pdf/`

---

### Método 2: Via GitHub Actions (Já configurado!)

O repositório já inclui o arquivo `.github/workflows/deploy.yml`.  
Se você preferir:
1. Vá em **Settings** $\rightarrow$ **Pages**.
2. Em **Source**, mude para **GitHub Actions**.
3. A cada commit na branch `main`, o GitHub fará a publicação automática.

---

## 💻 Como Rodar e Testar Localmente

Como não há necessidade de compilação pesada (usamos módulos ES6 nativos e Tailwind), você pode testar em qualquer servidor HTTP local:

### Com Python:
```bash
python3 -m http.server 8080
```
Depois acesse: `http://localhost:8080`

### Com Node.js / npx:
```bash
npx serve .
```

---

## 🧰 Bibliotecas Utilizadas

- [**PDF-Lib**](https://pdf-lib.js.org/): Criação, união, divisão, injeção de páginas, marcas d'água e numeração.
- [**PDF.js (Mozilla)**](https://mozilla.github.io/pdf.js/): Renderização visual de páginas de PDF em HTML5 Canvas para miniaturas interativas e conversão para imagens.
- [**SortableJS**](https://sortablejs.github.io/Sortable/): Drag & Drop suave e responsivo para reordenação de páginas e arquivos.
- [**JSZip**](https://stuk.github.io/jszip/): Compactação client-side para downloads em lote.
- [**Tailwind CSS**](https://tailwindcss.com/): Interface moderna, responsiva e acessível.
- [**Lucide Icons**](https://lucide.dev/): Pacote de ícones vetoriais modernos.
