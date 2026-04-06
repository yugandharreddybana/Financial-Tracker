package com.financetracker.dto;
import lombok.Data;
@Data public class TransactionRequest { private String description; private Double amount; private String date; private String type; private Long categoryId; private Long bankAccountId; private String note; }
