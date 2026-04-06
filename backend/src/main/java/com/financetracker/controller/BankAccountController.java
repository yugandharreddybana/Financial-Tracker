package com.financetracker.controller;
import com.financetracker.dto.BankAccountRequest;
import com.financetracker.service.BankAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/bank-accounts") @RequiredArgsConstructor
public class BankAccountController {
    private final BankAccountService svc;
    @GetMapping public ResponseEntity<List<Map<String,Object>>> getAll(){return ResponseEntity.ok(svc.getAll());}
    @PostMapping public ResponseEntity<Map<String,Object>> create(@RequestBody BankAccountRequest req){return ResponseEntity.status(HttpStatus.CREATED).body(svc.create(req));}
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){svc.delete(id);return ResponseEntity.noContent().build();}
}
