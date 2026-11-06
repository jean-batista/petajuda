package com.petajuda.dtos.request;

import com.petajuda.dtos.EnderecoDto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record OngRequest(

@NotBlank(message = "O nome da ONG é obrigatório.")
@Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
String nome,

@NotBlank(message = "A razão social é obrigatória.")
@Size(max = 100, message = "A razão social deve ter no máximo 100 caracteres.")
String razaoSocial,

@NotBlank(message = "O CNPJ é obrigatório.")
@Pattern(regexp = "\\d{14}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}", message = "CNPJ inválido.")
String cnpj,

@Size(max = 100, message = "A chave Pix deve ter no máximo 100 caracteres.")
String chavePix,

@NotBlank(message = "A descrição é obrigatória.")
String descricao,

@NotNull(message = "O endereço é obrigatório.")
@Valid
EnderecoDto endereco


) {}