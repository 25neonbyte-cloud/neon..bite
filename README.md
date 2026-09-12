# NeonBite — Landing Page Modernizada

Implementação estática para GitHub Pages baseada na direção visual aprovada do projeto.

## Regra crítica: agregador

O diretório existente `agregador/` do repositório original **não deve ser substituído, editado, formatado, movido ou apagado**.

Este pacote contém somente os arquivos da landing page. Ao copiar estes arquivos para a raiz do repositório atual, mantenha o diretório `agregador/` existente exatamente como está.

## Arquivos da landing

- `index.html` — estrutura dos 8 blocos aprovados.
- `styles.css` — sistema visual, Liquid Glass, neon controlado e responsividade.
- `app.js` — menu mobile, scrollspy, interações, dashboard, carrossel mobile e portfólio dinâmico.
- `assets/logo-neonbite.png` — logo transparente fornecida pelo proprietário da marca.
- `assets/logo-neonbite-dark.png` — versão adicional fornecida.
- `data/portfolio.json` — base real do portfólio. Está vazia conforme opção B aprovada.
- `data/portfolio.example.json` — exemplo de estrutura para cadastrar um case.
- `docs/conceitos/` — imagens-conceito aprovadas para conferência visual.

## Adicionar um case

1. Crie `assets/portfolio/` e coloque a imagem do projeto nela.
2. Abra `data/portfolio.json`.
3. Adicione um objeto dentro de `projects` seguindo `data/portfolio.example.json`.
4. Categorias suportadas pelos filtros atuais:
   - `automation`
   - `marketing`
   - `presence`

Exemplo mínimo:

```json
{
  "projects": [
    {
      "id": "meu-projeto",
      "title": "Meu Projeto",
      "category": "marketing",
      "categoryLabel": "Marketing Digital",
      "description": "Resumo do trabalho.",
      "image": "assets/portfolio/meu-projeto.webp",
      "alt": "Descrição da imagem",
      "result": "Destaque opcional",
      "url": "#"
    }
  ]
}
```

## Publicação

Substitua na raiz do repositório somente os arquivos correspondentes a esta landing e adicione as novas pastas `assets/`, `data/` e, opcionalmente, `docs/`.

**Não faça `rm -rf` na raiz do repositório antes de copiar o projeto**, pois isso apagaria o módulo `agregador/`.

O link relativo `./agregador/` já está mantido na navegação mobile e no rodapé.

## Contato configurado

- WhatsApp: `+55 (62) 9366-1942`
- Instagram: `@neonbite_`

## Observação sobre métricas

O dashboard identifica os números como demonstrativos. Antes de publicar números como resultados ou provas comerciais, substitua-os por dados verificáveis dos cases reais.
