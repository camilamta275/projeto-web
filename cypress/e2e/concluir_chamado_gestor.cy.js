describe("Concluir chamado como Gestor da EMLURB", () => {
  it("resolve o primeiro chamado da fila que nao esteja Fechado nem Resolvido", () => {
    const STATUS_ENCERRADOS = ["Resolvido", "Fechado"];

    // 1. Login como Gestor da EMLURB
    cy.visit("http://localhost:3001/login");
    cy.get('input[type="email"]').type("gestor@fiscalize.gov.br");
    cy.get('input[type="password"]').type("Gestor@123456");
    cy.contains("button", "Entrar").click();
    cy.url({ timeout: 10000 }).should("include", "/gestor/dashboard");

    // 2. Acessar a fila de chamados pelo menu lateral
    cy.get('a[href="/gestor/fila"]').first().click();
    cy.url().should("include", "/gestor/fila");
    cy.contains("Fila de Atendimento").should("be.visible");

    // 3. Selecionar o primeiro chamado cujo status nao seja Fechado nem Resolvido
    // (coluna de status é a 6a <td> da linha: checkbox, protocolo, categoria, endereco, prioridade, status)
    cy.get("table tbody tr").then(($linhas) => {
      const linhaElegivel = [...$linhas].find((linha) => {
        const statusTexto = Cypress.$(linha).find("td").eq(5).text().trim();
        return statusTexto.length > 0 && !STATUS_ENCERRADOS.includes(statusTexto);
      });

      expect(
        linhaElegivel,
        "deveria existir ao menos um chamado na fila que nao esteja Fechado nem Resolvido"
      ).to.exist;

      const protocolo = Cypress.$(linhaElegivel).find("td").eq(1).text().trim();

      cy.wrap(linhaElegivel).contains("Detalhes").click();

      // 4. Tela de detalhes: confirma que abriu o chamado certo
      cy.url().should("include", "/gestor/chamados/");
      cy.contains(protocolo).should("be.visible");

      // 5. Monta uma justificativa coerente com o chamado, usando o texto real da tela
      cy.contains("Descrição").parent().invoke("text").then((textoDescricao) => {
        const descricao = textoDescricao.replace("Descrição", "").trim();

        cy.get("h2").first().invoke("text").then((categoriaTexto) => {
          const contexto = `${categoriaTexto} ${descricao}`.toLowerCase();
          let justificativa;

          if (/lixo|entulho|coleta|res[ií]duo/.test(contexto)) {
            justificativa = `Coleta e limpeza realizadas no local relatado ("${descricao}"). Situacao regularizada pela equipe da EMLURB.`;
          } else if (/buraco|pavimento|cal[cç]ada|via|asfalto/.test(contexto)) {
            justificativa = `Reparo de pavimentacao concluido: "${descricao}". Via liberada ao trafego e local vistoriado pela equipe tecnica.`;
          } else if (/ilumina|poste|l[aâ]mpada|fia[cç][aã]o/.test(contexto)) {
            justificativa = `Manutencao do ponto de iluminacao concluida referente a "${descricao}". Funcionamento normalizado.`;
          } else {
            justificativa = `Chamado referente a "${descricao}" atendido e resolvido pela equipe responsavel, com a situacao devidamente regularizada.`;
          }

          // 6. Clicar em concluir, preencher justificativa e confirmar
          cy.contains("button", "Concluir").click();
          cy.contains("Concluir Chamado").should("be.visible");
          cy.get("textarea").type(justificativa);
          cy.contains("button", "Confirmar Conclusão").click();
          cy.contains("Chamado concluído!").should("be.visible");

          // 7. Validacao forte: recarrega a pagina e confirma no backend (via nova requisicao GET)
          //    que o status realmente persistiu como Resolvido, nao so a UI otimista.
          cy.reload();
          cy.get(".chakra-badge").contains("Resolvido").should("be.visible");
          cy.contains("nenhuma ação disponível").should("be.visible");
        });
      });
    });
  });
});
