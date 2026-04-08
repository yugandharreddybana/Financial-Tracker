package com.financetracker.repository;
import com.financetracker.entity.Transaction;
import com.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
public interface TransactionRepository extends JpaRepository<Transaction,Long> {
    List<Transaction> findByUserOrderByDateDescCreatedAtDesc(User user);

    // Global aggregates (all accounts)
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user=:user AND t.type='INCOME' AND MONTH(t.date)=:month AND YEAR(t.date)=:year")
    BigDecimal sumIncomeByMonth(User user, int month, int year);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user=:user AND t.type='EXPENSE' AND MONTH(t.date)=:month AND YEAR(t.date)=:year")
    BigDecimal sumExpenseByMonth(User user, int month, int year);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user=:user AND t.type='EXPENSE' AND t.category.id=:catId AND MONTH(t.date)=:month AND YEAR(t.date)=:year")
    BigDecimal sumExpenseByCategoryAndMonth(User user, Long catId, int month, int year);

    @Query("SELECT SUM(t.co2Kg) FROM Transaction t WHERE t.user=:user AND MONTH(t.date)=:month AND YEAR(t.date)=:year")
    BigDecimal sumCo2ByMonth(User user, int month, int year);

    // Account-specific aggregates (nullable accountId -> all accounts)
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user=:user AND t.type='INCOME' AND MONTH(t.date)=:month AND YEAR(t.date)=:year AND (:accountId IS NULL OR t.bankAccount.id = :accountId)")
    BigDecimal sumIncomeByMonth(User user, int month, int year, Long accountId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user=:user AND t.type='EXPENSE' AND MONTH(t.date)=:month AND YEAR(t.date)=:year AND (:accountId IS NULL OR t.bankAccount.id = :accountId)")
    BigDecimal sumExpenseByMonth(User user, int month, int year, Long accountId);

    @Query("SELECT SUM(t.co2Kg) FROM Transaction t WHERE t.user=:user AND MONTH(t.date)=:month AND YEAR(t.date)=:year AND (:accountId IS NULL OR t.bankAccount.id = :accountId)")
    BigDecimal sumCo2ByMonth(User user, int month, int year, Long accountId);

    List<Transaction> findByUserAndDateBetweenOrderByDateAsc(User user, LocalDate from, LocalDate to);

    @Query("SELECT t FROM Transaction t WHERE t.user=:user ORDER BY t.date DESC, t.createdAt DESC")
    List<Transaction> findTop10ByUserOrderByDateDesc(User user, org.springframework.data.domain.Pageable pageable);
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user=:user AND t.type='INCOME' AND t.category.id=:catId AND MONTH(t.date)=:month AND YEAR(t.date)=:year")
    BigDecimal sumIncomeByCategoryAndMonth(User user, Long catId, int month, int year);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user=:user AND t.type='INCOME' AND YEAR(t.date)=:year")
    BigDecimal sumIncomeByYear(User user, int year);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user=:user AND t.type='EXPENSE' AND YEAR(t.date)=:year")
    BigDecimal sumExpenseByYear(User user, int year);

    List<Transaction> findByUserAndBankAccountIdOrderByDateDescCreatedAtDesc(User user, Long bankAccountId);
}
