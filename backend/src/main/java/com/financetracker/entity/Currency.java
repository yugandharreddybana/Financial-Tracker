package com.financetracker.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "currencies",
    schema = "finance_app",
    uniqueConstraints = @UniqueConstraint(name = "uq_currency_code_country", columnNames = {"code", "country"})
)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Currency {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String code;

    @Column(nullable = false, length = 20)
    private String symbol;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String country;

    @Column(length = 10)
    private String flag;
}
