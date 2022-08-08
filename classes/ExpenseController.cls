public with sharing class ExpenseController {
    
    @AuraEnabled(cacheable=true)
    public static List<Expense__c> getExpenses(){
        return [SELECT Id, Name, Category__c, Expense_Date__c, Amount__c, Is_Weekly_Basis__c, Is_Monthly_Basis__c FROM Expense__c];
    }
   
}