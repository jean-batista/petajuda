package com.petajuda.integrationtests.controllers;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;

import com.petajuda.configs.TestConfigs;
import com.petajuda.dtos.EnderecoDto;
import com.petajuda.dtos.request.OngRequest;
import com.petajuda.dtos.request.UsuarioCredenciaisRequest;
import com.petajuda.dtos.request.UsuarioInfoRequest;
import com.petajuda.integrationtests.AbstractIntegrationTest;

import static io.restassured.RestAssured.given;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class OngControllerTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String bearerToken;
    private OngRequest ongRequestPadrao;
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
        // Limpa tabelas respeitando a hierarquia de FK (Cascade)
        jdbcTemplate.execute("TRUNCATE TABLE tabela_usuario, tabela_ong CASCADE;");
    }

    @BeforeEach
    void setUp() {
        specification = new RequestSpecBuilder()
                .setBasePath(TestConfigs.ONG_CONTROLLER_BASE_PATH)
                .setPort(this.port)
                .addFilter(new RequestLoggingFilter(LogDetail.ALL))
                .addFilter(new ResponseLoggingFilter(LogDetail.ALL))
                .build();

        String sufixoUnico = UUID.randomUUID().toString().substring(0, 8);
        String email = "dono.ong." + sufixoUnico + "@email.com";
        String telefone = "489" + sufixoUnico;
        String senha = "senhaForte123";

        // 1. Cadastra o usuário dono da ONG
        UsuarioInfoRequest usuarioRequest = new UsuarioInfoRequest(
                "Helena", "Souza", telefone, email, senha
        );

        given().port(port)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(usuarioRequest)
                .when().post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/cadastro")
                .then().statusCode(201);

        // 2. Faz Login e extrai o Token JWT
        String token = given().port(port)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(new UsuarioCredenciaisRequest(email, senha))
                .when().post(TestConfigs.AUTENTICACAO_CONTROLLER_BASE_PATH + "/login")
                .then().statusCode(200)
                .extract().jsonPath().getString("token");

        this.bearerToken = "Bearer " + token;

        // 3. Inicializa o DTO padrão de requisição de ONG
        EnderecoDto endereco = new EnderecoDto("SC", "Tubarão", "Oficinas", "Rua Altamiro Guimarães", "Sala 3");
        this.ongRequestPadrao = new OngRequest(
                "Patinhas do Bem", "Associação Patinhas do Bem", gerarCnpjValido(), "pix@patinhas.org", "Protegendo animais de rua", endereco
        );
    }

    @Test
    @DisplayName("OngControllerIT: Deve cadastrar uma ONG com sucesso retornando 201 Created")
    void deveCadastrarOngComSucesso() {
        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(ongRequestPadrao)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .response();

        String id = response.jsonPath().getString("id");

        assertThat(id).isNotNull();
        assertThat(response.jsonPath().getString("nome")).isEqualTo("Patinhas do Bem");
        assertThat(response.jsonPath().getString("usuarioId")).isNotNull();
    }

    @Test
    @DisplayName("OngControllerIT: Não deve permitir que um mesmo usuário cadastre mais de uma ONG (Retorna 400)")
    void naoDevePermitirDuasOngsParaOMesmoUsuario() {
        // Cadastra a primeira ONG com sucesso
        cadastrarOngAuxiliar();

        // Tenta cadastrar uma segunda ONG usando o mesmo token (e um novo CNPJ para não estourar chave de CNPJ antes da regra de negócio)
        EnderecoDto endereco2 = new EnderecoDto("SC", "Laguna", "Centro", "Rua Y", "Sala 1");
        OngRequest ongRequest2 = new OngRequest(
                "Outra ONG", "Outra Razao", gerarCnpjValido(), "pix@outra.org", "Descrição", endereco2
        );

        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(ongRequest2)
                .when()
                .post()
                .then()
                .statusCode(400); // Bad Request (BusinessException mapeada)
    }

    @Test
    @DisplayName("OngControllerIT: Deve buscar o perfil de uma ONG pelo ID retornando 200 OK")
    void deveBuscarOngPorId() {
        String ongId = cadastrarOngAuxiliar();

        Response response = given().spec(specification)
                .pathParam("id", ongId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("id")).isEqualTo(ongId);
        assertThat(response.jsonPath().getString("nome")).isEqualTo("Patinhas do Bem");
    }

    @Test
    @DisplayName("OngControllerIT: Deve listar as ONGs públicas do sistema retornando 200 OK")
    void deveListarOngs() {
        cadastrarOngAuxiliar();

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
    @DisplayName("OngControllerIT: Deve atualizar os dados da ONG do usuário retornando 200 OK")
    void deveAtualizarOngComSucesso() {
        String ongId = cadastrarOngAuxiliar();

        EnderecoDto novoEndereco = new EnderecoDto("SC", "Tubarão", "Centro", "Rua X", "Sem Complemento");
        OngRequest requestAtualizado = new OngRequest(
                "Patinhas do Bem Atualizado", "Associação Patinhas do Bem", gerarCnpjValido(), "novopix@patinhas.org", "Nova descrição", novoEndereco
        );

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .pathParam("id", ongId)
                .body(requestAtualizado)
                .when()
                .put("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("nome")).isEqualTo("Patinhas do Bem Atualizado");
        assertThat(response.jsonPath().getString("chavePix")).isEqualTo("novopix@patinhas.org");
    }

    @Test
    @DisplayName("OngControllerIT: Deve excluir a ONG do usuário retornando 204 No Content")
    void deveExcluirOngComSucesso() {
        String ongId = cadastrarOngAuxiliar();

        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .pathParam("id", ongId)
                .when()
                .delete("/{id}")
                .then()
                .statusCode(204);

        // Verifica a deleção chamando o ID explicitamente com o path completo e esperando um 404
        given().spec(specification)
                .pathParam("id", ongId)
                .when()
                .get(TestConfigs.ONG_CONTROLLER_BASE_PATH + "/{id}")
                .then()
                .statusCode(404);
    }

    // Método auxiliar
    private String cadastrarOngAuxiliar() {
        return given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(ongRequestPadrao)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .jsonPath().getString("id");
    }

    // Gera um CNPJ matematicamente válido aleatoriamente para os testes
    private String gerarCnpjValido() {
        int[] n = new int[12];
        for (int i = 0; i < 8; i++) n[i] = (int) (Math.random() * 10);
        n[8] = 0; n[9] = 0; n[10] = 0; n[11] = 1; // 0001

        int d1 = n[11]*2 + n[10]*3 + n[9]*4 + n[8]*5 + n[7]*6 + n[6]*7 + n[5]*8 + n[4]*9 + n[3]*2 + n[2]*3 + n[1]*4 + n[0]*5;
        d1 = 11 - (d1 % 11);
        if (d1 >= 10) d1 = 0;

        int d2 = d1*2 + n[11]*3 + n[10]*4 + n[9]*5 + n[8]*6 + n[7]*7 + n[6]*8 + n[5]*9 + n[4]*2 + n[3]*3 + n[2]*4 + n[1]*5 + n[0]*6;
        d2 = 11 - (d2 % 11);
        if (d2 >= 10) d2 = 0;

        return String.format("%d%d.%d%d%d.%d%d%d/%d%d%d%d-%d%d",
                n[0], n[1], n[2], n[3], n[4], n[5], n[6], n[7], n[8], n[9], n[10], n[11], d1, d2);
    }
}