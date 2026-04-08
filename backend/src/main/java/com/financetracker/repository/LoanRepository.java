package com.financetracker.repository;
import com.financetracker.entity.Loan;
import com.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface LoanRepository extends JpaRepository<Loan,Long> {
    List<Loan> findByUserOrderByCreatedAtDesc(User user);
}
