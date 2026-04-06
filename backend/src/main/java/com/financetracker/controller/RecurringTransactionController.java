package com.financetracker.controller;
import com.financetracker.dto.RecurringRequest;
import com.financetracker.service.RecurringTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/recurring") @RequiredArgsConstructor
public class RecurringTransactionController {
    private final RecurringTransactionService svc;
    @GetMapping public ResponseEntity<List<Map<String,Object>>> getAll(){return ResponseEntity.ok(svc.getAll());}
    @PostMapping public ResponseEntity<Map<String,Object>> create(@RequestBody RecurringRequest req){return ResponseEntity.status(HttpStatus.CREATED).body(svc.create(req));}
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){svc.delete(id);return ResponseEntity.noContent().build();}
    @PostMapping("/process-due") public ResponseEntity<Map<String,Object>> processDue(){return ResponseEntity.ok(svc.processDue());}
}
