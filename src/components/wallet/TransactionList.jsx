import React from 'react';
import { Input } from '../../ui/input.jsx';

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
        <div className="h-full flex flex-col font-afacad">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b-2 border-gray-100 pb-4">
                <h3 className="text-3xl font-bold text-black">Transactions</h3>
                <div className="flex gap-2">
                    <button onClick={onSync} className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-black hover:bg-gray-100">
                        ↻
                    </button>
                    <button onClick={() => {
                        const rows = [["id", "type", "amount", "date", "balance"], ...transactions.map(t => [t.id || "-", t.type, t.amount, t.date, t.balance])];
                        downloadCSV("transactions.csv", rows);
                        onExport();
                    }}
                        className="px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <input
                    placeholder="Search..."
                    value={q}
                    onChange={(e) => onSearch(e.target.value)}
                    className="flex-1 bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-black focus:border-[#016766] focus:outline-none font-bold placeholder-gray-400"
                />
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                    {['all', 'recharge', 'ride', 'earnings'].map((f) => (
                        <button
                            key={f}
                            onClick={() => onFilter(f)}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === f ? 'bg-[#016766] text-white shadow-sm' : 'text-gray-500 hover:text-black'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {transactions.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-xl">No transactions found</div>
                )}
                {transactions.map((tx) => (
                    <div key={tx.id || tx.date} className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#016766] p-4 flex items-center justify-between transition-all duration-200">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${tx.amount > 0 ? 'bg-green-100 text-[#016766]' : 'bg-red-100 text-red-600'}`}>
                                {tx.amount > 0 ? '↓' : '↑'}
                            </div>
                            <div>
                                <div className="text-lg font-bold text-black">{tx.type}</div>
                                <div className="text-sm text-gray-500 font-medium">{new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-xl font-bold ${tx.amount > 0 ? "text-[#016766]" : "text-black"}`}>
                                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                            </div>
                            <div className="text-xs text-gray-400 font-bold mt-1">Bal: ₹{tx.runningBalance || tx.balance || "-"}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TransactionList;