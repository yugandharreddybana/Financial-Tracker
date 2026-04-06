package com.financetracker.repository;
import com.financetracker.entity.BankAccount;
import com.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BankAccountRepository extends JpaRepository<BankAccount,Long> {
    List<BankAccount> findByUserOrderByNameAsc(User user);
}
