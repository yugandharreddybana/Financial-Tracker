package com.financetracker.controller;

import com.financetracker.service.IncomeAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/income")
@RequiredArgsConstructor
public class IncomeController {
    private final IncomeAnalyticsService svc;

    @GetMapping("/breakdown")
    public ResponseEntity<Map<String, Object>> breakdown() {
        return ResponseEntity.ok(svc.getIncomeBreakdown());
    }
}
