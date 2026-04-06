package com.financetracker.controller;

import com.financetracker.service.MonthlyReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
public class MonthlyReviewController {

    private final MonthlyReviewService svc;

    @GetMapping
    public ResponseEntity<Map<String, Object>> review(
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(svc.getReview(from, to));
    }
}
