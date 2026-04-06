# CWE-570 Migration Plan

**Session ID:** cwe570-fix-20260406  
**Created:** 2026-04-06  
**Scenario:** Scan and resolve CWE-570 (Expression is Always False) in Java project  
**Language:** Java 17  
**Build Tool:** Maven  
**Branch:** `fix/cwe-570-expression-always-false`

---

## Build Environment
- JDK: 21.0.10 (LTS, suitable for Java 17 project)
- JAVA_HOME: `/usr/lib/jvm/java-21-openjdk-amd64`
- Maven: system Maven via wrapper or installed Maven

---

## CWE-570 Definition
CWE-570 — **Expression is Always False**: The software contains a Boolean expression that will always evaluate to `false`.

---

## Identified Vulnerabilities

### 1. `JwtUtil.java` — `secret == null` is always false
**File:** `backend/src/main/java/com/financetracker/security/JwtUtil.java`  
**Line:** 21  
**Code:**
```java
if (secret == null || secret.isBlank()) {
```
**Reason:** `secret` is injected via `@Value("${app.jwt.secret}")` with no default. Spring Boot throws `BeanCreationException` during context initialisation if the property is missing — so `@PostConstruct` is never reached with a `null` secret. Hence `secret == null` is always false.  
**Fix:** Remove `secret == null ||` → keep only `secret.isBlank()`.

---

### 2. `TransactionService.java` — `amount == null` in `applyDeltaToAccount` is always false
**File:** `backend/src/main/java/com/financetracker/service/TransactionService.java`  
**Line:** 203  
**Code:**
```java
private void applyDeltaToAccount(BankAccount account, Transaction.TransactionType type, BigDecimal amount) {
    if (amount == null) return;
```
**Reason:** All call sites pass `t.getAmount()` where `t` is built with `BigDecimal.valueOf(req.getAmount())` (non-null) or loaded from the DB with `@Column(nullable=false)`. The null check is dead code.  
**Fix:** Remove `if (amount == null) return;`.

---

### 3. `TransactionService.java` — `amount == null` in `revertDeltaFromAccount` is always false
**File:** `backend/src/main/java/com/financetracker/service/TransactionService.java`  
**Line:** 209  
**Code:**
```java
private void revertDeltaFromAccount(BankAccount account, Transaction.TransactionType type, BigDecimal amount) {
    if (amount == null) return;
```
**Reason:** Same as #2.  
**Fix:** Remove `if (amount == null) return;`.

---

### 4. `SubscriptionService.java` — `desc == null` in `normalizeDescription` is always false
**File:** `backend/src/main/java/com/financetracker/service/SubscriptionService.java`  
**Line:** 96  
**Code:**
```java
String d = desc == null ? "" : desc.trim().toLowerCase(Locale.ENGLISH);
```
**Reason:** Only call site is `normalizeDescription(t.getDescription())` where `t.getDescription()` is `@Column(nullable=false)` in the `Transaction` entity — never null.  
**Fix:** Remove ternary dead branch → `String d = desc.trim().toLowerCase(Locale.ENGLISH);`.

---

### 5. `SubscriptionService.java` — `desc == null` in `prettyDescription` is always false
**File:** `backend/src/main/java/com/financetracker/service/SubscriptionService.java`  
**Line:** 103  
**Code:**
```java
if (desc == null || desc.isBlank()) return "Unknown";
```
**Reason:** Only call site is `prettyDescription(last.getDescription())` where `last.getDescription()` is `@Column(nullable=false)` — never null.  
**Fix:** Remove `desc == null ||` → `if (desc.isBlank()) return "Unknown";`.

---

### 6. `BankAccountService.java` — `delta==null||account==null` in `adjustBalance` is always false
**File:** `backend/src/main/java/com/financetracker/service/BankAccountService.java`  
**Line:** 47  
**Code:**
```java
if(delta==null||account==null)return;
```
**Reason:** All call sites pass non-null `account` (callers guard with `if (account != null)`) and non-null `delta` (computed as `amount.negate()` or `amount`, where `amount` is guaranteed non-null). The guard is dead code.  
**Fix:** Remove `if(delta==null||account==null)return;`.

---

## Files to Be Changed (in dependency order)
1. `backend/src/main/java/com/financetracker/security/JwtUtil.java`
2. `backend/src/main/java/com/financetracker/service/TransactionService.java`
3. `backend/src/main/java/com/financetracker/service/SubscriptionService.java`
4. `backend/src/main/java/com/financetracker/service/BankAccountService.java`
