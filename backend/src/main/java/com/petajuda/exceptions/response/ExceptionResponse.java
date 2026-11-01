package com.petajuda.exceptions.response;

import java.io.Serializable;
import java.util.Date;

public record ExceptionResponse(
    Date timestamp,
    String message,
    String details
) implements Serializable {}