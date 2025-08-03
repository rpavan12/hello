const transactionService = require('./TransactionService');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Health Check
app.get('/api/health', (req, res) => {
    res.json("This is the health check");
});

// ADD TRANSACTION
app.post('/api/transaction', (req, res) => {
    try {
        const t = moment().unix();
        console.log(
            `{ "timestamp": ${t}, "msg": "Adding Expense", "amount": ${req.body.amount}, "description": "${req.body.description}" }`
        );

        const success = transactionService.addTransaction(req.body.amount, req.body.description);

        if (success === 200) {
            res.json({ message: 'Added transaction successfully' });
        } else {
            res.status(400).json({ message: 'Failed to add transaction' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

// GET ALL TRANSACTIONS
app.get('/api/transaction', (req, res) => {
    try {
        transactionService.getAllTransactions(function (results) {
            const transactionList = results.map(row => ({
                id: row.id,
                amount: row.amount,
                description: row.description
            }));

            const t = moment().unix();
            console.log(`{ "timestamp": ${t}, "msg": "Getting All Expenses" }`);
            console.log(`{ "expenses": ${JSON.stringify(transactionList)} }`);

            res.status(200).json({ result: transactionList });
        });
    } catch (err) {
        res.status(500).json({ message: "Could not get all transactions", error: err.message });
    }
});

// DELETE ALL TRANSACTIONS
app.delete('/api/transaction', (req, res) => {
    try {
        transactionService.deleteAllTransactions(function () {
            const t = moment().unix();
            console.log(`{ "timestamp": ${t}, "msg": "Deleted All Expenses" }`);
            res.status(200).json({ message: "Deleted all transactions successfully." });
        });
    } catch (err) {
        res.status(500).json({ message: "Deleting all transactions may have failed.", error: err.message });
    }
});

// DELETE ONE TRANSACTION BY ID
app.delete('/api/transaction/:id', (req, res) => {
    try {
        transactionService.deleteTransactionById(req.params.id, function () {
            res.status(200).json({ message: `Transaction with id ${req.params.id} deleted` });
        });
    } catch (err) {
        res.status(500).json({ message: "Error deleting transaction", error: err.message });
    }
});

// GET SINGLE TRANSACTION BY ID
app.get('/api/transaction/:id', (req, res) => {
    try {
        transactionService.findTransactionById(req.params.id, function (result) {
            if (result.length > 0) {
                const { id, amount, description } = result[0];
                res.status(200).json({ id, amount, description });
            } else {
                res.status(404).json({ message: "Transaction not found" });
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving transaction", error: err.message });
    }
});

// Start Server
app.listen(port, () => {
    const t = moment().unix();
    console.log(`{ "timestamp": ${t}, "msg": "App Started on Port ${port}" }`);
});
