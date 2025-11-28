package org..hcx.handlers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org..common.dto.Response;
import org..common.dto.ResponseError;
import org..common.exception.ServiceUnavailbleException;

@ControllerAdvice
public class ExceptionHandler {

    @org.springframework.web.bind.annotation.ExceptionHandler(ServiceUnavailbleException.class)
    public ResponseEntity<Object> handleServiceUnavailableException(ServiceUnavailbleException ex) {
        return new ResponseEntity<>(new Response(new ResponseError(ex.getErrCode(), ex.getMessage(), null)), HttpStatus.SERVICE_UNAVAILABLE);
    }
}
