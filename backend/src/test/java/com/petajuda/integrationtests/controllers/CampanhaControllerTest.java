package com.petajuda.integrationtests.controllers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
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
import com.petajuda.dtos.request.CampanhaRequest;
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
public class CampanhaControllerTest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String bearerToken;
    private String ongId;
    private CampanhaRequest campanhaRequestPadrao;
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
        jdbcTemplate.execute("TRUNCATE TABLE tabela_usuario, tabela_ong, tabela_campanha CASCADE;");
    }

    @BeforeEach
    void setUp() {
        specification = new RequestSpecBuilder()
                .setBasePath(TestConfigs.CAMPANHA_CONTROLLER_BASE_PATH)
                .setPort(this.port)
                .addFilter(new RequestLoggingFilter(LogDetail.ALL))
                .addFilter(new ResponseLoggingFilter(LogDetail.ALL))
                .build();

        String sufixoUnico = UUID.randomUUID().toString().substring(0, 8);
        String email = "ong.dono." + sufixoUnico + "@email.com";
        String telefone = "479" + sufixoUnico;
        String senha = "senhaSegura123";

        // 1. Cadastra o usuário dono da ONG
        EnderecoDto enderecoUsuario = new EnderecoDto("SC", "Florianópolis", "Centro", "Rua Lauro Müller", "Apto 301");
        UsuarioInfoRequest usuarioRequest = new UsuarioInfoRequest(
                "Marcos", "Antonio", telefone, LocalDate.of(1990, 4, 10), email, senha, enderecoUsuario
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

        // 3. Cadastra uma ONG atrelada a este usuário (Requisito para criar Campanhas)
        EnderecoDto endereco = new EnderecoDto("SC", "Florianópolis", "Centro", "Rua Felipe Schmidt", "Sala 2");
        OngRequest ongRequest = new OngRequest(
                "ONG Amigos de Pata", "Associação Amigos", gerarCnpjValido(), "pix@amigos.org", "Proteção animal", endereco
        );

        this.ongId = given().port(port)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(ongRequest)
                .when().post(TestConfigs.ONG_CONTROLLER_BASE_PATH)
                .then().statusCode(201)
                .extract().jsonPath().getString("id");

        // 4. Inicia o DTO padrão de Campanha
        // Truncated to seconds evita bugs de deserialização com precisão de nanosegundos
        LocalDateTime inicio = LocalDateTime.now().plusDays(1).truncatedTo(ChronoUnit.SECONDS);
        LocalDateTime fim = LocalDateTime.now().plusDays(30).truncatedTo(ChronoUnit.SECONDS);
        this.campanhaRequestPadrao = new CampanhaRequest(
                "Campanha de Inverno", "Arrecadação de cobertores", inicio, fim
        );
    }

    @Test
    @DisplayName("CampanhaControllerIT: Deve cadastrar uma campanha com sucesso retornando 201 Created")
    void deveCadastrarCampanhaComSucesso() {
        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(campanhaRequestPadrao)
                .when()
                .post()
                .then()
                .statusCode(201)
                .extract()
                .response();

        String id = response.jsonPath().getString("id");

        assertThat(id).isNotNull();
        assertThat(response.jsonPath().getString("titulo")).isEqualTo("Campanha de Inverno");
        assertThat(response.jsonPath().getString("ongId")).isEqualTo(this.ongId); // Validando achatamento (Flattening) do DTO
        assertThat(response.jsonPath().getBoolean("ativo")).isTrue();
    }

    @Test
    @DisplayName("CampanhaControllerIT: Deve buscar uma campanha por ID retornando 200 OK")
    void deveBuscarCampanhaPorId() {
        String campanhaId = cadastrarCampanhaAuxiliar();

        Response response = given().spec(specification)
                .pathParam("id", campanhaId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("id")).isEqualTo(campanhaId);
        assertThat(response.jsonPath().getString("titulo")).isEqualTo("Campanha de Inverno");
    }

    @Test
    @DisplayName("CampanhaControllerIT: Deve atualizar a campanha retornando 200 OK")
    void deveAtualizarCampanhaComSucesso() {
        String campanhaId = cadastrarCampanhaAuxiliar();

        LocalDateTime novoInicio = LocalDateTime.now().plusDays(5).truncatedTo(ChronoUnit.SECONDS);
        LocalDateTime novoFim = LocalDateTime.now().plusDays(40).truncatedTo(ChronoUnit.SECONDS);
        CampanhaRequest requestAtualizado = new CampanhaRequest(
                "Campanha de Verão", "Hidratação", novoInicio, novoFim
        );

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .pathParam("id", campanhaId)
                .body(requestAtualizado)
                .when()
                .put("/{id}")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getString("titulo")).isEqualTo("Campanha de Verão");
    }

    @Test
    @DisplayName("CampanhaControllerIT: Deve alterar o status ativo da campanha para false")
    void deveAlterarStatusDaCampanha() {
        String campanhaId = cadastrarCampanhaAuxiliar();

        Response response = given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .pathParam("id", campanhaId)
                .queryParam("ativo", false) // Passando status via QueryParam
                .when()
                .patch("/{id}/status")
                .then()
                .statusCode(200)
                .extract()
                .response();

        assertThat(response.jsonPath().getBoolean("ativo")).isFalse();
    }

    @Test
    @DisplayName("CampanhaControllerIT: Deve excluir a campanha com sucesso retornando 204 No Content")
    void deveExcluirCampanhaComSucesso() {
        String campanhaId = cadastrarCampanhaAuxiliar();

        given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .pathParam("id", campanhaId)
                .when()
                .delete("/{id}")
                .then()
                .statusCode(204);

        // Verifica deleção
        given().spec(specification)
                .pathParam("id", campanhaId)
                .when()
                .get("/{id}")
                .then()
                .statusCode(404);
    }

    // Método auxiliar para poupar repetição nos testes de leitura/update/delete
    private String cadastrarCampanhaAuxiliar() {
        return given().spec(specification)
                .header(TestConfigs.HEADER_PARAM_AUTHORIZATION, bearerToken)
                .contentType(TestConfigs.CONTENT_TYPE_JSON)
                .body(campanhaRequestPadrao)
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