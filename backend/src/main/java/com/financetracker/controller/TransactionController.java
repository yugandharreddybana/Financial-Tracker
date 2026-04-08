package com.financetracker.controller;
import com.financetracker.dto.TransactionRequest;
import com.financetracker.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/transactions") @RequiredArgsConstructor
public class TransactionController {
    private final TransactionService txService; private final CsvExportService csvService;
    @GetMapping public ResponseEntity<List<Map<String,Object>>> getAll(@RequestParam(required=false) Long bankAccountId){return ResponseEntity.ok(txService.getAllTransactions(bankAccountId));}
    @PostMapping public ResponseEntity<Map<String,Object>> create(@RequestBody TransactionRequest req){return ResponseEntity.status(HttpStatus.CREATED).body(txService.createTransaction(req));}
    @PutMapping("/{id}") public ResponseEntity<Map<String,Object>> update(@PathVariable Long id,@RequestBody TransactionRequest req){return ResponseEntity.ok(txService.updateTransaction(id,req));}
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){txService.deleteTransaction(id);return ResponseEntity.noContent().build();}
    @GetMapping("/export") public ResponseEntity<String> export() throws Exception { return ResponseEntity.ok().header("Content-Disposition","attachment; filename=transactions.csv").contentType(MediaType.parseMediaType("text/csv")).body(csvService.exportTransactionsCsv()); }
}
