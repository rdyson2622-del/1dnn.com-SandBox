import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

export default function ReferralFeeCalculator() {
  const [salePrice, setSalePrice] = useState('500000');
  const [referralRate, setReferralRate] = useState('25');
  const [mgmtRate, setMgmtRate] = useState('15');

  const price = parseFloat(salePrice) || 0;
  const refRate = parseFloat(referralRate) || 0;
  const mgmtRate2 = parseFloat(mgmtRate) || 0;

  const referralFee = (price * refRate) / 100;
  const mgmtFee = (price * mgmtRate2) / 100;
  const totalFees = referralFee + mgmtFee;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-slate-900">Fee Calculator</h3>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs">Estimated Sale Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <Input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="pl-7 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Referral Fee %</Label>
            <Input
              type="number"
              value={referralRate}
              onChange={(e) => setReferralRate(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Mgmt Fee %</Label>
            <Input
              type="number"
              value={mgmtRate}
              onChange={(e) => setMgmtRate(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-2 pt-3 border-t border-blue-200"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Referral Fee ({refRate}%):</span>
          <span className="font-semibold text-slate-900">
            ${referralFee.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Mgmt Fee ({mgmtRate2}%):</span>
          <span className="font-semibold text-slate-900">
            ${mgmtFee.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-blue-200 bg-blue-100 -mx-4 px-4 py-2 rounded">
          <span className="text-sm font-semibold text-blue-900">Total Potential Fees:</span>
          <span className="text-lg font-bold text-blue-900">
            ${totalFees.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="flex gap-2 text-xs">
        <div className="flex-1 bg-white rounded p-2 border border-blue-200">
          <p className="text-slate-500">Per $100k</p>
          <p className="font-semibold text-slate-900">
            ${((refRate + mgmtRate2) * 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="flex-1 bg-white rounded p-2 border border-blue-200">
          <p className="text-slate-500">Total %</p>
          <p className="font-semibold text-slate-900">{refRate + mgmtRate2}%</p>
        </div>
      </div>
    </div>
  );
}