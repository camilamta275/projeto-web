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

    cy.get('input[type="email"]').type("joao@example.com");
    cy.get('input[type="password"]').type("123456");

    cy.contains("Entrar").click();

    cy.contains("Meus Chamados").should("exist");
  });
});
