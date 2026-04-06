package com.financetracker.exception;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String,String>> handleBad(BadRequestException e){ return ResponseEntity.badRequest().body(Map.of("error",e.getMessage())); }
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String,String>> handleNotFound(ResourceNotFoundException e){ return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error",e.getMessage())); }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,String>> handleGeneral(Exception e){ return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error","Internal server error")); }
}
