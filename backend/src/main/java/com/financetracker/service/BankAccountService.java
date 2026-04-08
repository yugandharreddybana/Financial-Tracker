package com.financetracker.service;
import com.financetracker.dto.BankAccountRequest;
import com.financetracker.entity.BankAccount;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.BankAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BankAccountService {
    private final BankAccountRepository repo;
    private final UserService userService;
    private static final Map<String,String[]> CURRENCY_META = Map.ofEntries(
        Map.entry("EUR",new String[]{"€","Euro","EU"}),Map.entry("GBP",new String[]{"£","British Pound","GB"}),Map.entry("USD",new String[]{"$","US Dollar","US"}),
        Map.entry("INR",new String[]{"₹","Indian Rupee","IN"}),Map.entry("JPY",new String[]{"¥","Japanese Yen","JP"}),Map.entry("CAD",new String[]{"C$","Canadian Dollar","CA"}),
        Map.entry("AUD",new String[]{"A$","Australian Dollar","AU"}),Map.entry("CHF",new String[]{"Fr","Swiss Franc","CH"}),Map.entry("CNY",new String[]{"¥","Chinese Yuan","CN"}),
        Map.entry("AED",new String[]{"د.إ","UAE Dirham","AE"}),Map.entry("NGN",new String[]{"₦","Nigerian Naira","NG"}),Map.entry("BRL",new String[]{"R$","Brazilian Real","BR"}),
        Map.entry("MXN",new String[]{"$","Mexican Peso","MX"}),Map.entry("ZAR",new String[]{"R","South African Rand","ZA"}),Map.entry("SGD",new String[]{"S$","Singapore Dollar","SG"}),
        Map.entry("HKD",new String[]{"HK$","Hong Kong Dollar","HK"}),Map.entry("SEK",new String[]{"kr","Swedish Krona","SE"}),Map.entry("NOK",new String[]{"kr","Norwegian Krone","NO"}),
        Map.entry("DKK",new String[]{"kr","Danish Krone","DK"}),Map.entry("PLN",new String[]{"zł","Polish Zloty","PL"}),Map.entry("TRY",new String[]{"₺","Turkish Lira","TR"}),
        Map.entry("KES",new String[]{"KSh","Kenyan Shilling","KE"}),Map.entry("THB",new String[]{"฿","Thai Baht","TH"}),Map.entry("MYR",new String[]{"RM","Malaysian Ringgit","MY"}),
        Map.entry("IDR",new String[]{"Rp","Indonesian Rupiah","ID"}),Map.entry("ILS",new String[]{"₪","Israeli Shekel","IL"}),Map.entry("HUF",new String[]{"Ft","Hungarian Forint","HU"})
    );
    public List<Map<String,Object>> getAll(){
        return repo.findByUserOrderByNameAsc(userService.getCurrentUser()).stream().map(this::build).toList();
    }
    public Map<String,Object> create(BankAccountRequest req){
        var u=userService.getCurrentUser();
        var meta=CURRENCY_META.getOrDefault(req.getCurrencyCode(),new String[]{"€","Euro","EU"});
        var balance = req.getCurrentBalance()!=null ? BigDecimal.valueOf(req.getCurrentBalance()) : BigDecimal.ZERO;
        boolean isCC = Boolean.TRUE.equals(req.getIsCreditCard());
        var a=BankAccount.builder()
                .name(req.getName())
                .icon(req.getIcon()!=null?req.getIcon():(isCC?"💳":"🏦"))
                .color(req.getColor()!=null?req.getColor():"#3B82F6")
                .currencyCode(req.getCurrencyCode())
                .currencySymbol(meta[0])
                .currencyName(meta[1])
                .country(meta[2])
                .currentBalance(balance)
                .isCreditCard(isCC)
                .creditLimit(isCC && req.getCreditLimit()!=null ? BigDecimal.valueOf(req.getCreditLimit()) : BigDecimal.ZERO)
                .creditUsed(BigDecimal.ZERO)
                .user(u)
                .build();
        return build(repo.save(a));
    }
    public void delete(Long id){
        var u=userService.getCurrentUser();
        var a=repo.findById(id).filter(x->x.getUser().getId().equals(u.getId())).orElseThrow(()->new ResourceNotFoundException("Not found"));
        repo.delete(a);
    }
    private Map<String,Object> build(BankAccount a){
        var m = new LinkedHashMap<String,Object>();
        m.put("id",a.getId());
        m.put("name",a.getName());
        m.put("icon",a.getIcon());
        m.put("color",a.getColor());
        m.put("currencyCode",a.getCurrencyCode());
        m.put("currencySymbol",a.getCurrencySymbol());
        m.put("currencyName",a.getCurrencyName()!=null?a.getCurrencyName():"");
        m.put("country",a.getCountry()!=null?a.getCountry():"");
        m.put("currentBalance",a.getCurrentBalance());
        m.put("isCreditCard",Boolean.TRUE.equals(a.getIsCreditCard()));
        m.put("creditLimit",a.getCreditLimit()!=null?a.getCreditLimit():BigDecimal.ZERO);
        m.put("creditUsed",a.getCreditUsed()!=null?a.getCreditUsed():BigDecimal.ZERO);
        m.put("createdAt",a.getCreatedAt().toString());
        return m;
    }
}
