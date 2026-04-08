package com.financetracker.repository;
import com.financetracker.entity.Currency;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CurrencyRepository extends JpaRepository<Currency, Long> {
    Optional<Currency> findFirstByCode(String code);
    List<Currency> findAllByOrderByCountryAsc();
    boolean existsByCode(String code);
    boolean existsByCodeAndCountry(String code, String country);
}
