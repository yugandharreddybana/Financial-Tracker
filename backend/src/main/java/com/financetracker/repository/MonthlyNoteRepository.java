package com.financetracker.repository;

import com.financetracker.entity.MonthlyNote;
import com.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MonthlyNoteRepository extends JpaRepository<MonthlyNote, Long> {
    Optional<MonthlyNote> findByUserAndYearAndMonth(User user, Integer year, Integer month);
}
