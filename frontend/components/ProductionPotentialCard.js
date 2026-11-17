import React from 'react';

const formatNumber = (value) =>
  Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 });

// Current production as a share of potential, where potential is 100%.
export default function ProductionPotentialCard({
  name,
  current,
  potential,
  unit,
}) {
  const percent = potential > 0 ? (current / potential) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-primary-50 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <h5 className="font-roboto-slab text-xl sm:text-2xl font-bold text-gray-900">
          {name}
        </h5>
        <div className="text-right text-sm flex-shrink-0">
          <div className="font-bold text-primary-500">
            {percent.toFixed(2)}%
          </div>
          <div className="text-gray-600">of potential</div>
        </div>
      </div>

      <div className="grid grid-cols-2 mb-5">
        <div className="pr-4 border-r border-gray-100">
          <div className="text-sm text-gray-600">Current</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {formatNumber(current)}
          </div>
          {unit && <div className="text-sm text-gray-600">{unit}</div>}
        </div>
        <div className="pl-4 text-right">
          <div className="text-sm text-gray-600">Potential</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {formatNumber(potential)}
          </div>
          {unit && <div className="text-sm text-gray-600">{unit}</div>}
        </div>
      </div>

      <div
        className="h-3 rounded bg-primary-100 overflow-hidden"
        role="progressbar"
        aria-label={`${name}: current production as a share of potential`}
        aria-valuenow={Math.round(Math.min(percent, 100))}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded bg-primary-500"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
