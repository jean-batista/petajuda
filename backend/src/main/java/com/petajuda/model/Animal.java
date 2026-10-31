package com.petajuda.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.petajuda.enums.EspecieAnimal;
import com.petajuda.enums.IdadeAnimal;
import com.petajuda.enums.PorteAnimal;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "tabela_animal")
public class Animal {
    
    // Identificador unico de cada animal
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Nome do animal
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    // Sexo do animal
    @Column(name = "sexo", nullable = false, length = 10)
    private String sexo;

    // Cor predominante do animal
    @Column(name = "cor_predominante", nullable = false, length = 50)
    private String corPredominante;

    // Identificador se o animal esta castrado ou nao
    @Column(name = "castrado", nullable = false, length = 10)
    private boolean castrado;

    // Identificador se o animal esta vacinado ou nao
    @Column(name = "vacinado", nullable = false, length = 10)
    private boolean vacinado;

    // Descricao do animal
    @Column(name = "descricao", nullable = false, columnDefinition = "TEXT") // Define text para nao limitar o valor da descricao
    private String descricao;

    // Foto do animal salva em formato de url
    @Column(name = "foto_url", nullable = false, columnDefinition = "TEXT") // Define text para nao limitar o valor da descricao
    private String fotoUrl;

    // Idade do animal
    @Enumerated(EnumType.STRING)
    @Column(name = "idade", nullable = false, length = 50)
    private IdadeAnimal idade;
    
    // Porte do animal
    @Enumerated(EnumType.STRING)
    @Column(name = "porte", nullable = false, length = 50)
    private PorteAnimal porte;
    
    // Especie do animal
    @Enumerated(EnumType.STRING)
    @Column(name = "especie", nullable = false, length = 50)
    private EspecieAnimal especie;

    // Usuario que o animal esta vinculado
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Publicacoes que o animal esta envolvido
    @OneToMany(mappedBy = "animal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Publicacao> publicacoes = new ArrayList<>();

    // Construtor sem argumentos
    public Animal() {
    }

    // Construtor com argumentos
    public Animal(UUID id, String nome, String sexo, String corPredominante, boolean castrado, boolean vacinado,
            String descricao, String fotoUrl, IdadeAnimal idade, PorteAnimal porte, EspecieAnimal especie,
            Usuario usuario, List<Publicacao> publicacoes) {
        this.id = id;
        this.nome = nome;
        this.sexo = sexo;
        this.corPredominante = corPredominante;
        this.castrado = castrado;
        this.vacinado = vacinado;
        this.descricao = descricao;
        this.fotoUrl = fotoUrl;
        this.idade = idade;
        this.porte = porte;
        this.especie = especie;
        this.usuario = usuario;
        this.publicacoes = publicacoes;
    }

    // Getters

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getSexo() {
        return sexo;
    }

    public String getCorPredominante() {
        return corPredominante;
    }

    public boolean isCastrado() {
        return castrado;
    }

    public boolean isVacinado() {
        return vacinado;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public IdadeAnimal getIdade() {
        return idade;
    }

    public PorteAnimal getPorte() {
        return porte;
    }

    public EspecieAnimal getEspecie() {
        return especie;
    }

    public Usuario getUsuario() {
        return usuario;
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

    public void setSexo(String sexo) {
        this.sexo = sexo;
    }

    public void setCorPredominante(String corPredominante) {
        this.corPredominante = corPredominante;
    }

    public void setCastrado(boolean castrado) {
        this.castrado = castrado;
    }

    public void setVacinado(boolean vacinado) {
        this.vacinado = vacinado;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }

    public void setIdade(IdadeAnimal idade) {
        this.idade = idade;
    }

    public void setPorte(PorteAnimal porte) {
        this.porte = porte;
    }

    public void setEspecie(EspecieAnimal especie) {
        this.especie = especie;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
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
        Animal other = (Animal) obj;
        if (id == null) {
            if (other.id != null)
                return false;
        } else if (!id.equals(other.id))
            return false;
        return true;
    }

}
