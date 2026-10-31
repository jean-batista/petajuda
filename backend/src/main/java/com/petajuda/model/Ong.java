package com.petajuda.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "tabela_ong")
public class Ong {
    
    // Identificador unico da ong
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Nome da ong
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    // Razao social da ong
    @Column(name = "razao_social", nullable = false, length = 100)
    private String razaoSocial;

    // Cnpj da ong
    @Column(name = "cnpj", nullable = false, length = 100)
    private String cnpj;

    // Chave pix da ong
    @Column(name = "chave_pix", nullable = true, length = 100)
    private String chavePix;

    // Descricao da ong
    @Column(name = "descricao", nullable = false, columnDefinition = "TEXT")
    private String descricao;

    // Capanhas realizadas pela ong
    @OneToMany(mappedBy = "ong", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Campanha> campanhas = new ArrayList<>();

    // Endereco vinculado a ong
    @Column(name = "endereco", nullable = false, length = 50)
    private Endereco endereco;

    // Construtor sem argumentos
    public Ong() {
    }

    // Construtor com argumentos
    public Ong(UUID id, String nome, String razaoSocial, String cnpj, String chavePix, String descricao,
            List<Campanha> campanhas, Endereco endereco) {
        this.id = id;
        this.nome = nome;
        this.razaoSocial = razaoSocial;
        this.cnpj = cnpj;
        this.chavePix = chavePix;
        this.descricao = descricao;
        this.campanhas = campanhas;
        this.endereco = endereco;
    }

    // Getters

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public String getCnpj() {
        return cnpj;
    }

    public String getChavePix() {
        return chavePix;
    }

    public String getDescricao() {
        return descricao;
    }

    public List<Campanha> getCampanhas() {
        return campanhas;
    }

    public Endereco getEndereco() {
        return endereco;
    }

    // Setters

    public void setId(UUID id) {
        this.id = id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public void setChavePix(String chavePix) {
        this.chavePix = chavePix;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public void setCampanhas(List<Campanha> campanhas) {
        this.campanhas = campanhas;
    }

    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
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
        Ong other = (Ong) obj;
        if (id == null) {
            if (other.id != null)
                return false;
        } else if (!id.equals(other.id))
            return false;
        return true;
    }

    

}
