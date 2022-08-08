@isTest
private class Test_ExpenseController {
    
    @TestSetup
    static void makeData(){
        List<String> cats = new List<String>{'Housing', 'Transportation', 'Food', 'Medical Healthcare', 'Others'};
        List<Expense__c> exps = new List<Expense__c>();
        for(Integer i = 0; i < 5; i++){
            exps.add(new Expense__c(
                Category__c = cats[i],
                Expense_Date__c = System.Today(),
                Amount__c = 100 + (i*10)
            ));
        }
        insert exps;
    }

    @isTest
    static void getExpensesTest() {
        test.StartTest();
        List<Expense__c> myExps = ExpenseController.getExpenses();
        test.StopTest();
        system.assertEquals(5, myExps.size());
    }
}