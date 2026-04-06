package com.financetracker.dto;
import lombok.Data;
@Data public class RecurringRequest { private String name; private Double amount; private String type; private String frequency; private String nextDueDate; private String endDate; private Long categoryId; private Long bankAccountId; private String note; }
