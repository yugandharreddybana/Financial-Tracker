package com.financetracker.repository;
import com.financetracker.entity.Budget;
import com.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BudgetRepository extends JpaRepository<Budget,Long> {
    List<Budget> findByUserOrderByYearDescMonthDesc(User user);
}
