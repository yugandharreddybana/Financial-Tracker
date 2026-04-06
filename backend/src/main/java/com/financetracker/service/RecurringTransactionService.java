package com.financetracker.service;
import com.financetracker.dto.RecurringRequest;
import com.financetracker.entity.*;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
@Service @RequiredArgsConstructor
public class RecurringTransactionService {
    private final RecurringTransactionRepository rRepo; private final CategoryRepository catRepo; private final BankAccountRepository bankRepo; private final TransactionRepository txRepo; private final UserService userService;
    public List<Map<String,Object>> getAll(){return rRepo.findByUserOrderByNextDueDateAsc(userService.getCurrentUser()).stream().map(this::build).toList();}
    public Map<String,Object> create(RecurringRequest req){
        var u=userService.getCurrentUser();
        var cat=catRepo.findById(req.getCategoryId()).orElseThrow(()->new ResourceNotFoundException("Category not found"));
        var bank=req.getBankAccountId()!=null?bankRepo.findById(req.getBankAccountId()).orElse(null):null;
        var r=RecurringTransaction.builder().name(req.getName()).amount(BigDecimal.valueOf(req.getAmount())).type(Transaction.TransactionType.valueOf(req.getType()))
            .frequency(RecurringTransaction.Frequency.valueOf(req.getFrequency())).nextDueDate(LocalDate.parse(req.getNextDueDate())).note(req.getNote()).category(cat).bankAccount(bank).user(u).build();
        return build(rRepo.save(r));
    }
    public void delete(Long id){var u=userService.getCurrentUser();var r=rRepo.findById(id).filter(x->x.getUser().getId().equals(u.getId())).orElseThrow(()->new ResourceNotFoundException("Not found"));rRepo.delete(r);}
    @Transactional
    public Map<String,Object> processDue(){
        var due=rRepo.findByActiveAndNextDueDateLessThanEqual(true,LocalDate.now());
        for(var r:due){
            txRepo.save(Transaction.builder().description(r.getName()).amount(r.getAmount()).date(r.getNextDueDate()).type(r.getType()).note(r.getNote()).category(r.getCategory()).bankAccount(r.getBankAccount()).user(r.getUser()).isRecurring(true).co2Kg(BigDecimal.ZERO).build());
            r.setLastExecutedDate(r.getNextDueDate()); r.setNextDueDate(nextDate(r.getNextDueDate(),r.getFrequency())); rRepo.save(r);
        }
        return Map.of("processed",due.size(),"message",due.size()+" recurring transactions processed");
    }
    private LocalDate nextDate(LocalDate d,RecurringTransaction.Frequency f){return switch(f){case WEEKLY->d.plusWeeks(1);case BIWEEKLY->d.plusWeeks(2);case MONTHLY->d.plusMonths(1);case QUARTERLY->d.plusMonths(3);case YEARLY->d.plusYears(1);};}
    private Map<String,Object> build(RecurringTransaction r){
        var m=new LinkedHashMap<String,Object>();
        m.put("id",r.getId());m.put("name",r.getName());m.put("amount",r.getAmount());m.put("type",r.getType().name());m.put("frequency",r.getFrequency().name());
        m.put("nextDueDate",r.getNextDueDate().toString());m.put("lastExecutedDate",r.getLastExecutedDate()!=null?r.getLastExecutedDate().toString():null);m.put("active",r.getActive());m.put("note",r.getNote());
        m.put("categoryId",r.getCategory().getId());m.put("categoryName",r.getCategory().getName());m.put("categoryIcon",r.getCategory().getIcon());m.put("categoryColor",r.getCategory().getColor());
        if(r.getBankAccount()!=null){m.put("bankAccountId",r.getBankAccount().getId());m.put("bankAccountName",r.getBankAccount().getName());m.put("bankAccountCurrency",r.getBankAccount().getCurrencyCode());}
        m.put("createdAt",r.getCreatedAt().toString()); return m;
    }
}
