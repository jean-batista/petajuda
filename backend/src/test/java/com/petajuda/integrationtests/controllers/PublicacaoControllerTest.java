package com.petajuda.integrationtests.controllers;

import com.petajuda.configs.TestConfigs;
import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.AnimalRequest;
import com.petajuda.dtos.request.PublicacaoRequest;
import com.petajuda.dtos.request.UsuarioCredenciaisRequest;
import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.enums.*;
import com.petajuda.integrationtests.AbstractIntegrationTest;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class PublicacaoControllerTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String bearerToken;
    private String animalId;
    private PublicacaoRequest publicacaoRequestPadrao;
    private RequestSpecification specification;

    @BeforeAll
    void beforeAll() {
        limparBanco();
    }

    @AfterEach
    void afterEach() {
        limparBanco();
    }

    private void limparBanco() {
        // Limpa tabelas na ordem de dependência (Cascade)
        jdbcTemplate.execute("TRUNCATE TABLE tabela_usuario, tabela_animal, tabela_publicacao CASCADE;");
    }

    @BeforeEach
    void setUp() {
        specification = new RequestSpecBuilder()
                .setBasePath(TestConfigs.PUBLICACAO_CONTROLLER_BASE_PATH)
                .setPort(this.port)
                .addFilter(new RequestLoggingFilter(LogDetail.ALL))
                .addFilter(new ResponseLoggingFilter(LogDetail.ALL))
                .build();

        String sufixoUnico = UUID.randomUUID().toString().substring(0, 8);
        String email = "dono.post." + sufixoUnico + "@email.com";
        String telefone = "489" + sufixoUnico;
        String senha = "senhaSegura123";

        // 1. Cadastra o usuário dono do post
        UsuarioInfoRequest usuarioRequest = new UsuarioInfoRequest(
                "Fernanda", "Lima", telefone, email, senha
        );

        given().port(port)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(usuarioRequest)
                .when().post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/cadastro")
                .then().statusCode(201);

        // 2. Faz Login e pega o Token JWT
        String token = given().port(port)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(new UsuarioCredenciaisRequest(email, senha))
                .when().post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/login")
                .then().statusCode(200)
                .extract().jsonPath().getString("token");

        this.bearerToken = "Bearer " + token;

        // 3. Cadastra um Animal atrelado a este usuário (Requisito para criar Publicação)
        AnimalRequest animalRequest = new AnimalRequest(
                "Bolinha", "Fêmea", "Branca", true, true,
                "Gatinha muito mansa", "http://foto.com/bolinha.jpg",
                IdadeAnimal.FILHOTE, PorteAnimal.PEQUENO, EspecieAnimal.GATO
        );

        this.animalId = given().port(port)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(animalRequest)
                .when().post(TestConfigs.ANIMAL_CONTROLLER_BASE_PATH)
                .then().statusCode(201)
                .extract().jsonPath().getString("id");

        // 4. Inicia o DTO padrão de Publicação injetando o ID do animal gerado
        EnderecoDto endereco = new EnderecoDto("SC", "Tubarão", "Passagem", "Rua Z", "Perto da ponte");
        this.publicacaoRequestPadrao = new PublicacaoRequest(
                "Gatinha Encontrada", "Encontrei essa gatinha perdida na rua",
                TipoPublicacao.ENCONTRADO, UUID.fromString(animalId), endereco
        );
    }

    @Test
    @DisplayName("PublicacaoControllerIT: Deve criar uma publicação com sucesso retornando 201 Created")
    void deveCadastrarPublicacaoComSucesso() {
        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(publicacaoRequestPadrao)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .response();

        String id = response.jsonPath().getString("id");

        assertThat(id).isNotNull();
        assertThat(response.jsonPath().getString("titulo")).isEqualTo("Gatinha Encontrada");
        assertThat(response.jsonPath().getString("animalId")).isEqualTo(this.animalId); // Validando achatamento
        assertThat(response.jsonPath().getString("status")).isEqualTo(StatusPublicacao.ATIVO.name());
    }

    @Test
    @DisplayName("PublicacaoControllerIT: Deve buscar uma publicação por ID retornando 200 OK")
    void deveBuscarPublicacaoPorId() {
        String publicacaoId = cadastrarPublicacaoAuxiliar();

        Response response = given().spec(specification)
                .pathParam("id", publicacaoId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("id")).isEqualTo(publicacaoId);
        assertThat(response.jsonPath().getString("titulo")).isEqualTo("Gatinha Encontrada");
    }

    @Test
    @DisplayName("PublicacaoControllerIT: Deve listar as publicações no feed retornando 200 OK")
    void deveListarTodasAsPublicacoes() {
        cadastrarPublicacaoAuxiliar();

        Response response = given().spec(specification)
                .when()
                .get()
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getList("")).isNotEmpty();
    }

    @Test
    @DisplayName("PublicacaoControllerIT: Deve atualizar a publicação retornando 200 OK")
    void deveAtualizarPublicacaoComSucesso() {
        String publicacaoId = cadastrarPublicacaoAuxiliar();

        EnderecoDto novoEndereco = new EnderecoDto("SC", "Tubarão", "Centro", "Rua X", "Sem Complemento");
        PublicacaoRequest requestAtualizado = new PublicacaoRequest(
                "Gatinha Perdida", "Ela fugiu ontem",
                TipoPublicacao.PERDIDO, UUID.fromString(animalId), novoEndereco
        );

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .pathParam("id", publicacaoId)
                .body(requestAtualizado)
                .when()
                .put("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("titulo")).isEqualTo("Gatinha Perdida");
        assertThat(response.jsonPath().getString("tipo")).isEqualTo(TipoPublicacao.PERDIDO.name());
    }

    @Test
    @DisplayName("PublicacaoControllerIT: Deve alterar o status da publicação (ex: para RESOLVIDO)")
    void deveAlterarStatusDaPublicacao() {
        String publicacaoId = cadastrarPublicacaoAuxiliar();

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .pathParam("id", publicacaoId)
                .queryParam("status", StatusPublicacao.RESOLVIDO.name()) // Passando status via QueryParam
                .when()
                .patch("/{id}/status")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("status")).isEqualTo(StatusPublicacao.RESOLVIDO.name());
    }

    @Test
    @DisplayName("PublicacaoControllerIT: Deve excluir a publicação com sucesso retornando 204 No Content")
    void deveExcluirPublicacaoComSucesso() {
        String publicacaoId = cadastrarPublicacaoAuxiliar();

        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .pathParam("id", publicacaoId)
                .when()
                .delete("/{id}")
                .then()
                .statusCode(204);

        // Verifica a deleção chamando o ID explícito e esperando um 404
        given().spec(specification)
                .pathParam("id", publicacaoId)
                .when()
                .get(TestConfigs.PUBLICACAO_CONTROLLER_BASE_PATH + "/{id}")
                .then()
                .statusCode(404);
    }

    // Método auxiliar para poupar repetição nos testes
    private String cadastrarPublicacaoAuxiliar() {
        return given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(publicacaoRequestPadrao)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .jsonPath().getString("id");
    }
}