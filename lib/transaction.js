/* global getAssetRegistry */

/**
* A wallet transfer has been initiated
* @param {com.nestaway.WalletTransfer} walletTransfer - the WalletTransfer transaction
* @transaction
*/
async function walletTransfer(walletTransfer) { // eslint-disable-line no-unused-vars
    const fromWallet = walletTransfer.from;
    const toWallet = walletTransfer.to;
    const transactionAmount = walletTransfer.amount;

    if(fromWallet.balance < transactionAmount){
        throw new Error ('Insufficient funds in wallet: '+fromWallet.accountId);
    }

    console.log(`source account ${fromWallet.accountId}, original balance: ${fromWallet.balance}`);
    //deducting balance from source wallet
    fromWallet.balance -= transactionAmount;
    console.log(`source account updated balance: ${fromWallet.balance}`);

    console.log(`destination account ${toWallet.accountId}, original balance: ${toWallet.balance}, original dues: ${toWallet.dues}`);

    let creditAmount = 0;
    //settle dues and calculate balance to be credited
    if(toWallet.dues < transactionAmount){
        creditAmount = transactionAmount - toWallet.dues;
        toWallet.dues = 0;
    }else{
        creditAmount = 0;
        toWallet.dues -= transactionAmount;
    }

    //update destination wallet's balance
    toWallet.balance += creditAmount;

    console.log(`destination account updated balance: ${toWallet.balance}, updated dues: ${toWallet.dues}`);

    //update the source wallet
    const sourceWallet = await getAssetRegistry('com.nestaway.Wallet');
    await sourceWallet.update(fromWallet);

    //update destination wallet
    const destinationWallet = await getAssetRegistry('com.nestaway.Wallet');
    await destinationWallet.update(toWallet);
}



/**
* A wallet debit has been initiated
* @param {com.nestaway.TransactionDebit} transactionDebit - the Debit transaction
* @transaction
*/
async function transactionDebit(transactionDebit) { // eslint-disable-line no-unused-vars

    const wallet = transactionDebit.wallet;
    const amount = transactionDebit.amount;

    wallet.balance -= amount;

    //update the source wallet
    const WALLET = await getAssetRegistry('com.nestaway.Wallet');
    await WALLET.update(wallet);

}


/**
* A wallet debit has been initiated
* @param {com.nestaway.TransactionCredit} transactionCredit - the Debit transaction
* @transaction
*/
async function transactionCredit(transactionCredit) { // eslint-disable-line no-unused-vars

    const wallet = transactionCredit.wallet;
    const amount = transactionCredit.amount;

    wallet.balance += amount;

    //update the source wallet
    const WALLET = await getAssetRegistry('com.nestaway.Wallet');
    await WALLET.update(wallet);

}