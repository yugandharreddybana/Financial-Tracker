package com.financetracker.dto;
import lombok.Data;
@Data public class BudgetRequest { private Long categoryId; private Double limitAmount; private Integer month; private Integer year; }
