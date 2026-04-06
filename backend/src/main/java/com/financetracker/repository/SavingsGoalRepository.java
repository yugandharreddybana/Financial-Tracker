package com.financetracker.repository;
import com.financetracker.entity.SavingsGoal;
import com.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal,Long> {
    List<SavingsGoal> findByUserOrderByCreatedAtDesc(User user);
}
