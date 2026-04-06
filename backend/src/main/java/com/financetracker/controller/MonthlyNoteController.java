package com.financetracker.controller;

import com.financetracker.dto.MonthlyNoteRequest;
import com.financetracker.service.MonthlyNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/monthly-notes")
@RequiredArgsConstructor
public class MonthlyNoteController {

    private final MonthlyNoteService svc;

    @GetMapping
    public ResponseEntity<Map<String, Object>> get(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        return ResponseEntity.ok(svc.get(year, month));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> upsert(@RequestBody MonthlyNoteRequest req) {
        return ResponseEntity.ok(svc.upsert(req));
    }
}
