package com.petajuda.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable // Indica que esta classe funciona apenas como dados
public class Endereco {
    
    // Estado referente ao endereco
    @Column(name = "estado", nullable = false, length = 100)
    private String estado;

    // Cidade referente ao endereco
    @Column(name = "cidade", nullable = false, length = 100)
    private String cidade;

    // Bairro referente ao endereco
    @Column(name = "bairro", nullable = false, length = 100)
    private String bairro;
    
    // Rua referente ao endereco
    @Column(name = "rua", nullable = false, length = 100)
    private String rua;

    // Complemento referente ao endereco
    @Column(name = "complemento", nullable = false, length = 255)
    private String complemento;

    // Construtor sem argumentos
    public Endereco() {
    }

    // Construtor com argumentos
    public Endereco(String estado, String cidade, String bairro, String rua, String complemento) {
        this.estado = estado;
        this.cidade = cidade;
        this.bairro = bairro;
        this.rua = rua;
        this.complemento = complemento;
    }

    // Setters

    public String getEstado() {
        return estado;
    }

    public String getCidade() {
        return cidade;
    }

    public String getBairro() {
        return bairro;
    }

    public String getRua() {
        return rua;
    }

    public String getComplemento() {
        return complemento;
    }

    // Setters

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public void setRua(String rua) {
        this.rua = rua;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    // Hashcode e equals

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((estado == null) ? 0 : estado.hashCode());
        result = prime * result + ((cidade == null) ? 0 : cidade.hashCode());
        result = prime * result + ((bairro == null) ? 0 : bairro.hashCode());
        result = prime * result + ((rua == null) ? 0 : rua.hashCode());
        result = prime * result + ((complemento == null) ? 0 : complemento.hashCode());
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
        Endereco other = (Endereco) obj;
        if (estado == null) {
            if (other.estado != null)
                return false;
        } else if (!estado.equals(other.estado))
            return false;
        if (cidade == null) {
            if (other.cidade != null)
                return false;
        } else if (!cidade.equals(other.cidade))
            return false;
        if (bairro == null) {
            if (other.bairro != null)
                return false;
        } else if (!bairro.equals(other.bairro))
            return false;
        if (rua == null) {
            if (other.rua != null)
                return false;
        } else if (!rua.equals(other.rua))
            return false;
        if (complemento == null) {
            if (other.complemento != null)
                return false;
        } else if (!complemento.equals(other.complemento))
            return false;
        return true;
    }

}
