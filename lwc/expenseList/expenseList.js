import { LightningElement, wire} from 'lwc';
import getExpenses from '@salesforce/apex/ExpenseController.getExpenses';
import { refreshApex } from '@salesforce/apex';
import NAME_FIELD from '@salesforce/schema/Expense__c.Name';
import CATEGORY_FIELD from '@salesforce/schema/Expense__c.Category__c';
import EXPENSE_DATE_FIELD from '@salesforce/schema/Expense__c.Expense_Date__c';
import AMOUNT_FIELD from '@salesforce/schema/Expense__c.Amount__c';
import IS_WEEKLY_FIELD from '@salesforce/schema/Expense__c.Is_Weekly_Basis__c';
import IS_MONTHLY_FIELD  from '@salesforce/schema/Expense__c.Is_Monthly_Basis__c';


const COLUMNS = [
    { label: 'Name', fieldName: NAME_FIELD.fieldApiName },
    { label: 'Category', fieldName: CATEGORY_FIELD.fieldApiName},
    { label: 'Expense Date', fieldName: EXPENSE_DATE_FIELD.fieldApiName, type: 'date' },
    { label: 'Amount', fieldName: AMOUNT_FIELD.fieldApiName, type: 'currency' },
    { label: 'Is Weekly?', fieldName: IS_WEEKLY_FIELD.fieldApiName, type: 'checkbox' },
    { label: 'Is Monthly?', fieldName: IS_MONTHLY_FIELD.fieldApiName, type: 'checkbox' },
];

export default class ExpenseList extends LightningElement {
    columns = COLUMNS;
    expenses;
    loading;
    error;

    @wire(getExpenses) expensesHandler(result){
        this.wiredExpensesResult = result;
        if (result.data) {
            this.expenses = result.data
        } else if (result.error) {
            this.error = result.error;
        }
    }

    refreshDataTable(){
        this.loading=true;
        refreshApex(this.wiredExpensesResult);
        this.stopLoading(1000);
    }

    stopLoading(timeoutValue) {
        setTimeout(() => {
        this.loading = false;
        }, timeoutValue);
    }
}