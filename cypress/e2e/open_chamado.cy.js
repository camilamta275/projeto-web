describe("Cidadão abre chamado", () => {
  it("deve validar se o protocolo criado é o primeiro chamado da tela inicial", () => {
    cy.visit("https://projeto-web-one-theta.vercel.app/login");

    cy.get('input[type="email"]').type("joao@example.com");
    cy.get('input[type="password"]').type("123456");
    cy.contains("button", "Entrar").click();

    cy.contains("Meus Chamados").should("be.visible");

    cy.contains("button", "Novo Chamado").click();
    cy.url().should("include", "/cidadao/chamados/novo");
    cy.contains("Qual tipo de problema você quer reportar?").should("be.visible");

    cy.contains("Problemas na Via").click();
    cy.contains("button", /Próximo/).click();

    cy.contains("Descrição do Problema").should("be.visible");
    cy.get("textarea").type(
      "Existe um problema na via pública que precisa ser resolvido com urgência."
    );
    cy.contains("Endereço / Localização")
      .parent()
      .find("input")
      .type("Rua das Ninfas, 123, Boa Vista, Recife, PE");

    cy.contains("button", /Próximo/).click();

    cy.contains("Revise os dados antes de enviar:").should("be.visible");
    cy.contains("button", /Abrir Chamado/).click();

    cy.get('[class*="chakra-alert__desc"]', { timeout: 10000 })
      .should("be.visible")
      .invoke("text")
      .then((textoAlerta) => {
        const match = textoAlerta.match(/\d+/);
        expect(match, "alerta deve conter o número do protocolo").to.not.be.null;
        const protocoloCriado = match[0];

        cy.url({ timeout: 10000 }).should("match", /\/cidadao\/chamados\/?$/);
        cy.contains("Meus Chamados").should("be.visible");

        cy.get('a[href*="/cidadao/chamados/"]')
          .first()
          .should("be.visible")
          .invoke("text")
          .then((primeiroChamado) => {
            expect(
              primeiroChamado,
              "o primeiro chamado da lista deve conter o protocolo recém-criado"
            ).to.contain(protocoloCriado);
          });
      });
  });
});
