package com.financetracker.repository;
import com.financetracker.entity.Category;
import com.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CategoryRepository extends JpaRepository<Category,Long> {
    List<Category> findByUserOrderByTypeAscNameAsc(User user);
    boolean existsByNameAndUser(String name, User user);
}
