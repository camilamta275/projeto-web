describe("Cidadão abre chamado", () => {
  it("deve criar um chamado e encontrá-lo na listagem", () => {
    const protocolo = "SCH-2026-001";
    const descricao =
      "Existe um buraco na via pública que precisa ser resolvido.";
    const endereco = "Rua das Ninfas, 123, Boa Vista, Recife, PE";

    // Simula as categorias disponíveis na API.
    cy.intercept("GET", "**/categories", {
      statusCode: 200,
      body: {
        data: [
          {
            id: 1,
            nome: "Problemas na Via",
            descricao: "Buracos e danos nas vias públicas",
          },
        ],
      },
    }).as("getCategorias");

    // Simula a criação do chamado.
    cy.intercept("POST", "**/demands", (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: "teste-001",
          protocolo,
          title: "Problemas na Via",
          description: req.body.description,
          category_id: 1,
          category: {
            id: 1,
            nome: "Problemas na Via",
          },
          status: "Aberto",
          location: req.body.location,
          creator: {
            id: "1",
          },
          createdAt: "2026-10-14T12:00:00.000Z",
          updatedAt: "2026-10-14T12:00:00.000Z",
        },
      });
    }).as("criarChamado");

    // Simula a listagem contendo o chamado criado.
    cy.intercept("GET", "**/demands", {
      statusCode: 200,
      body: {
        data: [
          {
            id: "teste-001",
            protocolo,
            title: "Problemas na Via",
            description: descricao,
            category: {
              id: 1,
              nome: "Problemas na Via",
            },
            status: "Aberto",
            location: endereco,
            creator: {
              id: "1",
            },
            createdAt: "2026-10-14T12:00:00.000Z",
            updatedAt: "2026-10-14T12:00:00.000Z",
          },
        ],
      },
    }).as("listarChamados");

    cy.visit("https://projeto-web-one-theta.vercel.app/login");

    cy.get('input[type="email"]').type("joao@example.com");
    cy.get('input[type="password"]').type("123456");
    cy.contains("button", "Entrar").click();

    cy.contains("Meus Chamados").should("be.visible");

    cy.contains("button", "Novo Chamado").click();
    cy.url().should("include", "/cidadao/chamados/novo");

    cy.wait("@getCategorias");
    cy.contains("Qual tipo de problema você quer reportar?").should(
      "be.visible"
    );
    cy.contains("Problemas na Via").click();
    cy.contains("button", /Próximo/).click();

    cy.contains("Descrição do Problema").should("be.visible");
    cy.get("textarea").type(descricao);

    cy.contains("Endereço / Localização")
      .parent()
      .find("input")
      .type(endereco);

    cy.contains("button", /Próximo/).click();

    cy.contains("Revise os dados antes de enviar:").should("be.visible");
    cy.contains("button", /Abrir Chamado/).click();

    cy.wait("@criarChamado");

    cy.contains("Protocolo: " + protocolo).should("be.visible");
    cy.url().should("include", "/cidadao/chamados");

    cy.wait("@listarChamados");
    cy.contains(protocolo).should("be.visible");
  });
});