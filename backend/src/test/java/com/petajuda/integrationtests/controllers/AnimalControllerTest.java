package com.petajuda.integrationtests.controllers;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import com.petajuda.configs.TestConfigs;
import com.petajuda.dtos.request.AnimalRequest;
import com.petajuda.dtos.request.UsuarioCredenciaisRequest;
import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.enums.EspecieAnimal;
import com.petajuda.enums.IdadeAnimal;
import com.petajuda.enums.PorteAnimal;
import com.petajuda.integrationtests.AbstractIntegrationTest;

import static io.restassured.RestAssured.given;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class AnimalControllerTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String bearerToken;
    private AnimalRequest animalRequestPadrao;
    private RequestSpecification specification;

    @BeforeAll
    void beforeAll() {
        limparBanco();
    }

    @AfterAll
    void afterAll() {
        limparBanco();
    }

    private void limparBanco() {
        // Limpa as tabelas principais e as dependentes (cascade) para garantir isolamento
        jdbcTemplate.execute("TRUNCATE TABLE tabela_usuario, tabela_denuncia CASCADE;");
    }

    @BeforeEach
    void setUp() {
        // Inicializa a specification para ser reaproveitada nos testes do AnimalController
        specification = new RequestSpecBuilder()
                .setBasePath(TestConfigs.ANIMAL_CONTROLLER_BASE_PATH)
                .setPort(this.port)
                .addFilter(new RequestLoggingFilter(LogDetail.ALL))
                .addFilter(new ResponseLoggingFilter(LogDetail.ALL))
                .build();

        // 1. Cria um usuário único para isolar o contexto de cada teste
        String sufixoUnico = UUID.randomUUID().toString().substring(0, 8);
        String email = "dono.animal." + sufixoUnico + "@email.com";
        String telefone = "489" + sufixoUnico;
        String senha = "senhaSegura123";

        UsuarioInfoRequest usuarioRequest = new UsuarioInfoRequest(
                "Carlos", "Medeiros", telefone, email, senha
        );

        // Cadastra o usuário chamando a API real (sem a spec do Animal)
        given()
                .port(port)
                .filter(new RequestLoggingFilter(LogDetail.ALL))
                .filter(new ResponseLoggingFilter(LogDetail.ALL))
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(usuarioRequest)
                .when()
                .post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/cadastro")
                .then()
                .statusCode(201);

        // 2. Faz o login e extrai o Token JWT
        UsuarioCredenciaisRequest credenciais = new UsuarioCredenciaisRequest(email, senha);

        String token = given()
                .port(port)
                .filter(new RequestLoggingFilter(LogDetail.ALL))
                .filter(new ResponseLoggingFilter(LogDetail.ALL))
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(credenciais)
                .when()
                .post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/login")
                .then()
                .statusCode(200)
                .extract()
                .jsonPath().getString("token");

        this.bearerToken = "Bearer " + token;

        // 3. Inicializa um DTO de requisição padrão de Animal para reaproveitar nos testes
        this.animalRequestPadrao = new AnimalRequest(
                "Rex", "Macho", "Caramelo", true, true,
                "Cachorro muito dócil encontrado na rua",
                "http://foto.com/rex.jpg",
                IdadeAnimal.ADULTO, PorteAnimal.MEDIO, EspecieAnimal.CACHORRO
        );
    }

    @Test
    @DisplayName("AnimalControllerIT: Deve cadastrar um animal com sucesso retornando 201 Created")
    void deveCadastrarAnimalComSucesso() {
        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(animalRequestPadrao)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .response();

        String id = response.jsonPath().getString("id");
        String nome = response.jsonPath().getString("nome");

        assertThat(id).isNotNull();
        assertThat(nome).isEqualTo("Rex");
        assertThat(response.header("Location")).contains(TestConfigs.ANIMAL_CONTROLLER_BASE_PATH + "/" + id);
    }

    @Test
    @DisplayName("AnimalControllerIT: Deve buscar um animal específico por ID retornando 200 OK")
    void deveBuscarAnimalPorIdComSucesso() {
        // Primeiro cadastra o animal
        String animalId = cadastrarAnimalAuxiliarEObterId();

        // Depois busca ele
        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken) // Rota pública não exigiria token, mas passamos por segurança
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .pathParam("id", animalId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("id")).isEqualTo(animalId);
        assertThat(response.jsonPath().getString("nome")).isEqualTo("Rex");
    }

    @Test
    @DisplayName("AnimalControllerIT: Deve retornar 403/401 ao tentar cadastrar um animal sem token JWT")
    void deveRetornarErroAoCadastrarSemAutenticacao() {
        given().spec(specification)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(animalRequestPadrao) // Sem header de Authorization
                .when()
                .post()
                .then()
                // Dependendo de como o Spring Security trata na sua versão, pode ser 401 (Unauthorized) ou 403 (Forbidden)
                .statusCode(org.hamcrest.Matchers.anyOf(org.hamcrest.Matchers.is(401), org.hamcrest.Matchers.is(403)));
    }

    @Test
    @DisplayName("AnimalControllerIT: Deve atualizar os dados do animal retornando 200 OK")
    void deveAtualizarAnimalComSucesso() {
        String animalId = cadastrarAnimalAuxiliarEObterId();

        AnimalRequest atualizarRequest = new AnimalRequest(
                "Rex Atualizado", "Macho", "Preto", true, true,
                "Descrição atualizada", "http://foto.com/rex2.jpg",
                IdadeAnimal.IDOSO, PorteAnimal.GRANDE, EspecieAnimal.CACHORRO
        );

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .pathParam("id", animalId)
                .body(atualizarRequest)
                .when()
                .put("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("nome")).isEqualTo("Rex Atualizado");
        assertThat(response.jsonPath().getString("idade")).isEqualTo(IdadeAnimal.IDOSO.name());
    }

    @Test
    @DisplayName("AnimalControllerIT: Deve excluir um animal com sucesso retornando 204 No Content")
    void deveExcluirAnimalComSucesso() {
        String animalId = cadastrarAnimalAuxiliarEObterId();

        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .pathParam("id", animalId)
                .when()
                .delete("/{id}")
                .then()
                .statusCode(204);

        // Verifica se realmente foi excluído (tentando buscar pelo id)
        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .pathParam("id", animalId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(404);
    }

    // Método auxiliar para criar um animal e retornar o ID formatado como String
    private String cadastrarAnimalAuxiliarEObterId() {
        return given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(animalRequestPadrao)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .jsonPath().getString("id");
    }
}