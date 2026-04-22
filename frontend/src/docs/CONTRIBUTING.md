# Contribuindo para Fiscalize

## 📋 Padrões de Commits

Use o formato Conventional Commits:

```
<tipo>(<escopo>): <assunto>

<corpo>

<rodapé>
```

### Tipos de Commit

- **feat**: Uma nova funcionalidade
- **fix**: Correção de um bug
- **docs**: Alterações na documentação
- **style**: Formatação, semicolons faltantes, etc (não altera código)
- **refactor**: Refatoração de código
- **perf**: Melhoria de performance
- **test**: Adição ou alteração de testes
- **ci**: Alterações em CI/CD

### Exemplos

```
feat(tickets): adicionar filtro por categoria

Implementa filtro dropdown na página de tickets permitindo
filtrar por categoria específica.

Closes #123
```

```
fix(api): corrigir erro 500 na criação de tickets
```

```
docs(readme): atualizar instruções de instalação
```

## 🔀 Workflow de Git

1. Crie uma branch: `git checkout -b feat/nome-da-feature`
2. Commit as mudanças: `git commit -m 'feat(scope): description'`
3. Push: `git push origin feat/nome-da-feature`
4. Abra um Pull Request

## ✅ Checklist antes de Fazer Commit

- [ ] Código segue os padrões do projeto
- [ ] Sem console.log() ou debug code
- [ ] TypeScript types estão corretos
- [ ] Testes passando (se aplicável)
- [ ] ESLint sem erros
- [ ] Formatação correta (Prettier)

## 🧪 Testes

Escreva testes para novas funcionalidades:

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## 📝 Arquivos Importante

- `src/types/index.ts` - Definições de tipos globais
- `src/lib/validations.ts` - Esquemas Zod
- `src/stores/` - State management com Zustand
- `src/components/` - Componentes reutilizáveis
- `src/app/` - Páginas e rotas Next.js

## 🎨 Code Review

Verifique antes de submeter:

1. Está bem documentado?
2. Segue os padrões do projeto?
3. Há casos de erro tratados?
4. TypeScript types estão corretos?
5. Há testes?

## 📚 Recursos Úteis

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Chakra UI Components](https://chakra-ui.com/docs/components)
- [Conventional Commits](https://www.conventionalcommits.org/)
