package com.financetracker.service;

import com.financetracker.entity.Category;
import com.financetracker.entity.Transaction;
import com.financetracker.entity.User;
import com.financetracker.repository.BankAccountRepository;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class TransactionServiceTest {

    @Test
    void calculatesCo2ForExpense() {
        var txRepo = Mockito.mock(TransactionRepository.class);
        var catRepo = Mockito.mock(CategoryRepository.class);
        var bankRepo = Mockito.mock(BankAccountRepository.class);
        var userService = Mockito.mock(UserService.class);

        var user = User.builder().id(1L).email("test@example.com").build();
        Mockito.when(userService.getCurrentUser()).thenReturn(user);

        var category = Category.builder().id(1L).name("Food & Dining").type(Category.CategoryType.EXPENSE).build();
        Mockito.when(catRepo.findById(1L)).thenReturn(java.util.Optional.of(category));

        var service = new TransactionService(txRepo, catRepo, bankRepo, userService);
        var req = new com.financetracker.dto.TransactionRequest();
        req.setDescription("Dinner");
        req.setAmount(50.0);
        req.setDate(LocalDate.now().toString());
        req.setType(Transaction.TransactionType.EXPENSE.name());
        req.setCategoryId(1L);

        var result = service.createTransaction(req);
        BigDecimal co2 = (BigDecimal) result.get("co2Kg");
        assertThat(co2).isNotNull();
        // Food & Dining factor is 0.8 => 50 * 0.8 = 40
        assertThat(co2).isEqualByComparingTo(BigDecimal.valueOf(40.0));
    }
}
