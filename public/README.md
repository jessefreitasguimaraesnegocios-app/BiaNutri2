# Ícones PWA

Esta pasta deve conter os ícones necessários para o PWA funcionar corretamente.

## Ícones Necessários

Você precisa criar os seguintes arquivos de ícone:

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels
3. **apple-touch-icon.png** - 180x180 pixels (opcional, mas recomendado para iOS)

## Como Criar os Ícones

### Opção 1: Gerador Online (Recomendado)

1. Acesse: https://realfavicongenerator.net/ ou https://www.pwabuilder.com/imageGenerator
2. Faça upload de uma imagem quadrada (mínimo 512x512px)
3. Baixe os ícones gerados
4. Coloque `icon-192.png` e `icon-512.png` nesta pasta

### Opção 2: Criar Manualmente

Use uma ferramenta de edição de imagem (Photoshop, GIMP, Figma, etc.):

1. Crie uma imagem quadrada com o logo/ícone do BiaNutri
2. Exporte em PNG com:
   - `icon-192.png` - 192x192px
   - `icon-512.png` - 512x512px
   - `apple-touch-icon.png` - 180x180px (opcional)

## Dicas

- Use cores que combinem com o tema do app (#22c55e - verde)
- Mantenha o design simples e reconhecível em tamanhos pequenos
- Use fundo transparente ou sólido (evite gradientes complexos)
- Teste os ícones em diferentes dispositivos após o deploy

## Verificação

Após adicionar os ícones, execute:
```bash
npm run build
```

Os ícones serão incluídos automaticamente no build do PWA.
