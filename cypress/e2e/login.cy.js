describe("Login no sistema Fiscalize", () => {
  it("deve acessar a tela de login", () => {
    cy.visit("https://projeto-web-one-theta.vercel.app/login");

    cy.contains("Fiscalize").should("exist");
    cy.contains("Email").should("exist");
    cy.contains("Senha").should("exist");
    cy.contains("Entrar").should("exist");
  });

  it("deve fazer login com usuário de teste", () => {
    cy.visit("https://projeto-web-one-theta.vercel.app/login");

    cy.get('input[type="email"]').type("admin@recife.pe.gov.br");
    cy.get('input[type="password"]').type("123456");

    cy.contains("Entrar").click();

    cy.url().should("not.include", "/login");
  });
});

describe("Cidadão abre chamado", () => {
  it("deve validar se o protocolo criado é o primeiro chamado da tela inicial", () => {
    cy.visit("https://projeto-web-one-theta.vercel.app/login");

    cy.get('input[type="email"]').type("joao@example.com");
    cy.get('input[type="password"]').type("123456");
    cy.contains("Entrar").click();

    cy.contains("Novo Chamado").click();
    cy.contains("Problemas na Via").click();
    cy.contains("Próximo").click();

    cy.get("textarea")
      .type("Existe um problema na via pública.");

    cy.contains("Endereço / Localização")
      .parent()
      .find("input")
      .type("Rua das ninfas, boa vista");

    cy.contains("Próximo").click();
    cy.contains("Abrir Chamado").click();

    cy.get('[class*="chakra-alert__desc"]')
      .should("be.visible")
      .invoke("text")
      .then((textoAlerta) => {
        const protocoloCriado = textoAlerta.match(/\d+/)[0];

        cy.xpath("/html/body/div[1]/div/div/div[2]/div/div[5]/a[1]/div")
          .should("be.visible")
          .invoke("text")
          .then((primeiroChamado) => {
            expect(primeiroChamado).to.contain(protocoloCriado);
          });
      });
  });
});