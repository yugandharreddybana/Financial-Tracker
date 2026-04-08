package com.financetracker.dto;
import lombok.Data;
@Data public class LoanRequest {
    private String name;
    private String loanType;
    private Double totalAmount;
    private Double amountPaid;
    private Double monthlyInstallment;
    private Double interestRate;
    private String startDate;
    private String endDate;
    private String lender;
    private Long lenderBankAccountId;
    private String note;
}
