package com.financetracker.dto;

import lombok.Data;

@Data
public class MonthlyNoteRequest {
    private Integer year;
    private Integer month; // 1-12
    private String note;
}
