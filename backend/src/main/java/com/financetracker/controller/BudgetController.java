package com.financetracker.controller;
import com.financetracker.dto.BudgetRequest;
import com.financetracker.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {
    private final BudgetService svc;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(svc.getAll());
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<Map<String, Object>>> getAlerts() {
        return ResponseEntity.ok(svc.getAlerts());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody BudgetRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(svc.create(req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        svc.delete(id);
        return ResponseEntity.noContent().build();
    }
}
