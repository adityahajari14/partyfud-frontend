'use client';

import { Button } from '@/components/ui/Button';

interface MenuTypeSelectionProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const MENU_TYPES = [
  {
    id: 'set_menus',
    title: 'Set Menus',
    description: 'Pre-designed packages with fixed items and pricing per person',
    icon: '📦',
    field: 'delivery_only',
  },
  {
    id: 'build_your_own',
    title: 'Build-Your-Own Menus',
    description: 'Individual items customers can mix and match',
    icon: '🔨',
    field: 'delivery_plus_setup',
  },
  {
    id: 'custom_catering',
    title: 'Custom Catering / Private Chef',
    description: 'Fully bespoke menus created for each client',
    icon: '👨‍🍳',
    field: 'full_service',
  },
];

export function MenuTypeSelection({ data, updateData, onNext, onBack }: MenuTypeSelectionProps) {
  const isSelected = (field: string) => data[field] === true;

  const toggleMenuType = (field: string) => {
    updateData({ [field]: !data[field] });
  };

  const hasAtLeastOne = data.delivery_only || data.delivery_plus_setup || data.full_service;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Menu Type Selection</h2>
        <p className="text-gray-600">
          Select the menu formats you want to offer. You can select multiple options.
        </p>
      </div>

      <div className="space-y-4">
        {MENU_TYPES.map((type) => {
          const selected = isSelected(type.field);
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => toggleMenuType(type.field)}
              className={`w-full p-6 rounded-xl border-2 text-left transition ${
                selected
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      selected
                        ? 'bg-green-500 border-green-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {selected && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{type.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{type.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {!hasAtLeastOne && (
        <p className="text-sm text-red-600">Please select at least one menu type</p>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onNext} disabled={!hasAtLeastOne}>
          Continue to Availability →
        </Button>
      </div>
    </div>
  );
}
