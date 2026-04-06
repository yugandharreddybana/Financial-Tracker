package com.financetracker.repository;
import com.financetracker.entity.RecurringTransaction;
import com.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction,Long> {
    List<RecurringTransaction> findByUserOrderByNextDueDateAsc(User user);
    List<RecurringTransaction> findByActiveAndNextDueDateLessThanEqual(boolean active, LocalDate date);
}
