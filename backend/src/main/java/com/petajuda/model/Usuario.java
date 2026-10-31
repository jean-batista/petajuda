package com.petajuda.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.petajuda.enums.PerfilUsuario;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "tabela_usuario")
public class Usuario {
    
    // Identificador unicado de cada usuario
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Nome do usuario
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    // Sobrenome do usuario
    @Column(name = "sobrenome", nullable = false, length = 100)
    private String sobrenome;

    // Email do usuario
    @Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;

    // Telefone do usuario
    @Column(name = "telefone", nullable = false, length = 50, unique = true)
    private String telefone;

    // Senha do usuario
    @Column(name = "senha", nullable = false, length = 150)
    private String senha;

    // Identificador se o usuario esta ativo ou nao
    @Column(name = "ativo", nullable = false, length = 10)
    private Boolean ativo;

    // Data de criacao do usuario
    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    // Tipo do perfil do usuario
    @Enumerated(EnumType.STRING)
    @Column(name = "perfil_usuario", nullable = false, length = 50)
    private PerfilUsuario tipoPerfil;

    // Lista dos animais vinculados ao usuario
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true) // Mapeia o campo `usuario` na `tabela_animal`
    private List<Animal> animais = new ArrayList<>();

    // Lista de publicacoes do usuario
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true) // Mapeia o campo `usuario` na `tabela_publicacao`
    private List<Publicacao> publicacoes = new ArrayList<>();

    // Construtor sem argumentos
    public Usuario() {
    }

    // Construtor com argumentos
    public Usuario(UUID id, String nome, String sobrenome, String email, String telefone, String senha, Boolean ativo,
            LocalDateTime dataCriacao, PerfilUsuario tipoPerfil, List<Animal> animais, List<Publicacao> publicacoes) {
        this.id = id;
        this.nome = nome;
        this.sobrenome = sobrenome;
        this.email = email;
        this.telefone = telefone;
        this.senha = senha;
        this.ativo = ativo;
        this.dataCriacao = dataCriacao;
        this.tipoPerfil = tipoPerfil;
        this.animais = animais;
        this.publicacoes = publicacoes;
    }

    // Getters

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getSobrenome() {
        return sobrenome;
    }

    public String getEmail() {
        return email;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getSenha() {
        return senha;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public PerfilUsuario getTipoPerfil() {
        return tipoPerfil;
    }

    public List<Animal> getAnimais() {
        return animais;
    }

    public List<Publicacao> getPublicacoes() {
        return publicacoes;
    }

    // Setters

    public void setId(UUID id) {
        this.id = id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setSobrenome(String sobrenome) {
        this.sobrenome = sobrenome;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public void setTipoPerfil(PerfilUsuario tipoPerfil) {
        this.tipoPerfil = tipoPerfil;
    }

    public void setAnimais(List<Animal> animais) {
        this.animais = animais;
    }

    public void setPublicacoes(List<Publicacao> publicacoes) {
        this.publicacoes = publicacoes;
    }

    // Hashcode e equals

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        Usuario other = (Usuario) obj;
        if (id == null) {
            if (other.id != null)
                return false;
        } else if (!id.equals(other.id))
            return false;
        return true;
    }

}
