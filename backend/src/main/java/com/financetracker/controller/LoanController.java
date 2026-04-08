package com.financetracker.controller;
import com.financetracker.dto.LoanRequest;
import com.financetracker.dto.LoanPaymentRequest;
import com.financetracker.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/loans") @RequiredArgsConstructor
public class LoanController {
    private final LoanService service;

    @GetMapping public ResponseEntity<List<Map<String,Object>>> getAll() { return ResponseEntity.ok(service.getAll()); }
    @PostMapping public ResponseEntity<Map<String,Object>> create(@RequestBody LoanRequest req) { return ResponseEntity.ok(service.create(req)); }
    @PutMapping("/{id}") public ResponseEntity<Map<String,Object>> update(@PathVariable Long id, @RequestBody LoanRequest req) { return ResponseEntity.ok(service.update(id, req)); }
    @PostMapping("/{id}/payment") public ResponseEntity<Map<String,Object>> makePayment(@PathVariable Long id, @RequestBody LoanPaymentRequest req) { return ResponseEntity.ok(service.makePayment(id, req.getAmount())); }
    @GetMapping("/{id}/amortization") public ResponseEntity<List<Map<String,Object>>> amortization(@PathVariable Long id) { return ResponseEntity.ok(service.getAmortizationSchedule(id)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
