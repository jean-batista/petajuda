package com.petajuda.mappers;

import com.petajuda.dtos.request.OngRequest;
import com.petajuda.dtos.response.OngResponse;
import com.petajuda.model.Ong;

@Mapper(componentModel = "spring")
public interface OngMapper {
    
    Ong paraEntidade(OngRequest ongRequest);
    OngResponse paraDto(Ong ong);

}
