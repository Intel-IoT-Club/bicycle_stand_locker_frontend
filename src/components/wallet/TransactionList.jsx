
import React from 'react';
import { Card, CardBody } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

function TransactionList({ transactions, onSync, onExport, onSearch, onFilter, filter, q }) {

    function downloadCSV(filename, rows) {
        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <section className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Input placeholder="Search transactions" value={q} onChange={(e) => onSearch(e.target.value)} />
                    <div className="hidden sm:flex gap-2 ml-2">
                        <Button variant={filter === "all" ? "solid" : "outline"} onClick={() => onFilter("all")} >All</Button>
                        <Button variant={filter === "recharge" ? "solid" : "outline"} onClick={() => onFilter("recharge")} >Recharges</Button>
                        <Button variant={filter === "ride" ? "solid" : "outline"} onClick={() => onFilter("ride")} >Ride Payments</Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onSync}>Sync</Button>
                    <Button variant="outline" onClick={() => {
                        const rows = [["id", "type", "amount", "date", "balance"], ...transactions.map(t => [t.id || "-", t.type, t.amount, t.date, t.balance])];
                        downloadCSV("transactions.csv", rows);
                        onExport();
                    }}>Export</Button>
                </div>
            </div>
            <div className="space-y-3">
                {transactions.length === 0 && <p className="text-sm text-gray-500">No transactions</p>}
                {transactions.map((tx) => (
                    <Card key={tx.id || tx.date}>
                        <CardBody className="flex items-center justify-between p-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{tx.type}</span>
                                    <span className="text-xs text-gray-400">• {new Date(tx.date).toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Balance after: ₹{tx.balance}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`${tx.amount > 0 ? "text-green-600" : "text-red-600"} font-bold`}>{tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}</div>
                                <Button variant="outline" onClick={() => {
                                    downloadCSV(`receipt_${tx.id || tx.date}.csv`, [["id", "type", "amount", "date", "balance"], [tx.id || "-", tx.type, tx.amount, tx.date, tx.balance]]);
                                }}>Receipt</Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </section>
    );
}

export default TransactionList;
