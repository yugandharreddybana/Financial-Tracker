package com.financetracker.controller;
import com.financetracker.dto.CategoryRequest;
import com.financetracker.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/categories") @RequiredArgsConstructor
public class CategoryController {
    private final CategoryService svc;
    @GetMapping public ResponseEntity<List<Map<String,Object>>> getAll(){return ResponseEntity.ok(svc.getAll());}
    @PostMapping public ResponseEntity<Map<String,Object>> create(@RequestBody CategoryRequest req){return ResponseEntity.status(HttpStatus.CREATED).body(svc.create(req));}
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){svc.delete(id);return ResponseEntity.noContent().build();}
}
