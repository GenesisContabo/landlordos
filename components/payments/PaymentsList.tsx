'use client'

import { useState } from 'react'

type PaymentWithContext = {
  payment: {
    id: string
    amount: string
    paymentDate: string
    paymentMethod: string | null
    notes: string | null
    createdAt: Date | null
  }
  tenant: {
    name: string
  }
  unit: {
    unitNumber: string
  } | null
  property: {
    name: string
  } | null
}

export default function PaymentsList({ initialPayments }: { initialPayments: PaymentWithContext[] }) {
  const [payments] = useState(initialPayments)

  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No payments recorded yet</h3>
        <p className="text-slate-400">Record your first payment to start tracking rent income</p>
      </div>
    )
  }

  // Calculate total
  const total = payments.reduce((sum, p) => sum + parseFloat(p.payment.amount), 0)

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <p className="text-sm text-slate-400">Total Payments</p>
        <p className="text-3xl font-bold text-green-400">${total.toFixed(2)}</p>
      </div>

      <div className="space-y-2">
        {payments.map(({ payment, tenant, unit, property }) => (
          <div
            key={payment.id}
            className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 hover:border-slate-600 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{tenant.name}</span>
                  {property && unit && (
                    <span className="text-xs text-slate-400">
                      {property.name} - Unit {unit.unitNumber}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                  {payment.paymentMethod && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="capitalize">{payment.paymentMethod}</span>
                    </>
                  )}
                </div>
                {payment.notes && (
                  <p className="mt-2 text-sm text-slate-400">{payment.notes}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-400">
                  ${parseFloat(payment.amount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
