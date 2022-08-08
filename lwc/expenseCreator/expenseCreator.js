import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import EXPENSE_OBJECT from '@salesforce/schema/Expense__c';
import CATEGORY_FIELD from '@salesforce/schema/Expense__c.Category__c';
import EXPENSE_DATE_FIELD from '@salesforce/schema/Expense__c.Expense_Date__c';
import AMOUNT_FIELD from '@salesforce/schema/Expense__c.Amount__c';
import IS_WEEKLY_FIELD from '@salesforce/schema/Expense__c.Is_Weekly_Basis__c';
import IS_MONTHLY_FIELD  from '@salesforce/schema/Expense__c.Is_Monthly_Basis__c';

export default class ExpenseCreator extends LightningElement {
    expenseObject = EXPENSE_OBJECT;
    expenseFields = [CATEGORY_FIELD, EXPENSE_DATE_FIELD, AMOUNT_FIELD, IS_WEEKLY_FIELD, IS_MONTHLY_FIELD];
    isMonthly=false;
    isWeekly=false;
    counter=0;
    loading;
   
    handleExpenseCreated(event){
        this.resetForm();
        this.toast('Success', 'Expense created', 'success');
    }

     //This would be okay for a 'small' number of records, 7 and 30/31 in this case, 
     //but Apex would have better performance for large lists.
     createRecurrentExpenses(category, date, amount, isMonthly, isWeekly) {
        this.loading=true;
        if(isMonthly){
            if(date.getUTCDate() > 15){
                this.counter = (new Date(date.getFullYear(), date.getMonth() + 1, 0)).getDate();
                date = new Date(date.getFullYear(), date.getMonth(), 17);
            }else{
                this.counter = (new Date(date.getFullYear(), date.getMonth(), 0)).getDate();
                date = new Date(date.getFullYear(), date.getMonth() - 1, 17);
            }
        }else if(date.getDay() != 6){
            date = new Date(date.setDate((date.getDate() - date.getDay()) ));
            this.counter = 7;
        }else{
            this.counter = 7;
        }
        this.stopLoading(2000);
        for(let i = 0;i < this.counter;i++){
            const fields = {};
            fields[CATEGORY_FIELD.fieldApiName] = category;
            fields[EXPENSE_DATE_FIELD.fieldApiName] = date.toISOString().slice(0,10);
            fields[AMOUNT_FIELD.fieldApiName] = amount;
            fields[IS_WEEKLY_FIELD.fieldApiName] = isWeekly;
            fields[IS_MONTHLY_FIELD.fieldApiName] = isMonthly;
            const recordInput = { apiName: EXPENSE_OBJECT.objectApiName, fields };
            createRecord(recordInput)
                .then((expense) => {
                    if(i == this.counter - 1){
                        this.resetForm();
                        this.toast('Success', 'Expenses created', 'success');
                    }
                })
                .catch((error) => {
                    this.toast('Error', error , 'error');
                });
            date = new Date(date.setDate((date.getDate() + 1)));
        }
    }
    //Handle toast messages
    toast(title, message, variant){
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );   
    }

    //Reset form after expense creation
    resetForm() {
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
     }

     handleMonthlyExpenseChange(event){
        this.isMonthly=event.detail.checked;
        this.isWeekly=false;
        (this.template.querySelector("[data-field='weekly']")).reset();
    }

     handleWeeklyExpenseChange(event){
        this.isMonthly=false;
        this.isWeekly=event.detail.checked;
        (this.template.querySelector("[data-field='monthly']")).reset();
    }

     //Spinner to simulate loading
     stopLoading(timeoutValue) {
        setTimeout(() => {
        this.loading = false;
        }, timeoutValue);
    }

    handleSubmit(event){
        event.preventDefault();
        if(event.detail.fields.Amount__c){
            if(this.isWeekly){
                this.createRecurrentExpenses(event.detail.fields.Category__c, new Date(event.detail.fields.Expense_Date__c), event.detail.fields.Amount__c, this.isMonthly, this.isWeekly)
            }else if(this.isMonthly){
                this.createRecurrentExpenses(event.detail.fields.Category__c, new Date(event.detail.fields.Expense_Date__c), event.detail.fields.Amount__c, this.isMonthly, this.isWeekly)
            }else{
                this.template.querySelector('lightning-record-edit-form').submit();
            } 
        }else{
            this.toast('Error', 'Insert Amount', 'error');
        }
    }
}