# CWE-570 Migration Progress

**Session ID:** cwe570-fix-20260406  
**Date:** 2026-04-06  
**Goal:** Scan and resolve CWE-570 (Expression is Always False) vulnerabilities  
**Branch:** `fix/cwe-570-expression-always-false` (from `fix/cwe-682-incorrect-calculation`)

---

## General
- Previous branch: `fix/cwe-682-incorrect-calculation`
- New branch: `fix/cwe-570-expression-always-false`
- Language: Java 17 / Spring Boot 3.2.3
- Build tool: Maven
- JAVA_HOME: `/usr/lib/jvm/java-21-openjdk-amd64`

---

## Plan
See [plan.md](.migration/cwe570/plan.md)

---

## Progress

- [✅] Migration Plan Generated
- [✅] Version Control Setup (branch created: `fix/cwe-570-expression-always-false`, previous stash saved)
- Code Migration
    - [⌛️] `backend/src/main/java/com/financetracker/security/JwtUtil.java` — remove always-false `secret == null` check
    - [ ] `backend/src/main/java/com/financetracker/service/TransactionService.java` — remove always-false `amount == null` in `applyDeltaToAccount` / `revertDeltaFromAccount`
    - [ ] `backend/src/main/java/com/financetracker/service/SubscriptionService.java` — remove always-false `desc == null` in `normalizeDescription` / `prettyDescription`
    - [ ] `backend/src/main/java/com/financetracker/service/BankAccountService.java` — remove always-false `delta==null||account==null` guard in `adjustBalance`
- Validation & Fixing
    - [ ] Build and Fix
    - [ ] Test Validation
- [ ] Final Summary
