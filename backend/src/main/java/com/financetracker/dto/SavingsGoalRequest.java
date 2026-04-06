package com.financetracker.dto;
import lombok.Data;
@Data public class SavingsGoalRequest { private String name; private String icon; private String color; private Double targetAmount; private Double currentAmount; private String targetDate; }
