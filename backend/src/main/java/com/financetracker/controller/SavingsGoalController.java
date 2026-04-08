package com.financetracker.controller;
import com.financetracker.dto.*;
import com.financetracker.service.SavingsGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/goals") @RequiredArgsConstructor
public class SavingsGoalController {
    private final SavingsGoalService svc;
    @GetMapping public ResponseEntity<List<Map<String,Object>>> getAll(){return ResponseEntity.ok(svc.getAll());}
    @PostMapping public ResponseEntity<Map<String,Object>> create(@RequestBody SavingsGoalRequest req){return ResponseEntity.status(HttpStatus.CREATED).body(svc.create(req));}
    @PostMapping("/{id}/contribute") public ResponseEntity<Map<String,Object>> contribute(@PathVariable Long id,@RequestBody ContributeRequest req){return ResponseEntity.ok(svc.contribute(id,req));}
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){svc.delete(id);return ResponseEntity.noContent().build();}
    @PutMapping("/{id}") public ResponseEntity<Map<String,Object>> update(@PathVariable Long id,@RequestBody SavingsGoalRequest req){return ResponseEntity.ok(svc.update(id,req));}
}
