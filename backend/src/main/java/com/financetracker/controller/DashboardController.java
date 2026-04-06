package com.financetracker.controller;
import com.financetracker.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService svc;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats(@RequestParam(value = "bankAccountId", required = false) Long bankAccountId) {
        return ResponseEntity.ok(svc.getStats(bankAccountId));
    }

    @GetMapping("/health-score")
    public ResponseEntity<Map<String, Object>> health(@RequestParam(value = "bankAccountId", required = false) Long bankAccountId) {
        return ResponseEntity.ok(svc.getHealthScore(bankAccountId));
    }

    @GetMapping("/net-worth")
    public ResponseEntity<Map<String, Object>> netWorth(@RequestParam(value = "bankAccountId", required = false) Long bankAccountId) {
        return ResponseEntity.ok(svc.getNetWorth(bankAccountId));
    }

    @GetMapping("/cash-flow-forecast")
    public ResponseEntity<Map<String, Object>> cashFlow(@RequestParam(value = "bankAccountId", required = false) Long bankAccountId) {
        return ResponseEntity.ok(svc.getCashFlowForecast(bankAccountId));
    }

    @GetMapping("/carbon-footprint")
    public ResponseEntity<Map<String, Object>> carbon(@RequestParam(value = "bankAccountId", required = false) Long bankAccountId) {
        return ResponseEntity.ok(svc.getCarbonFootprint(bankAccountId));
    }
}
