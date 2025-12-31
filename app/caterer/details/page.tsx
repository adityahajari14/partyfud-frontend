'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

type Step = 'profile' | 'availability' | 'licenses' | 'done';

export default function CatererDetailsPage() {
    const [step, setStep] = useState<Step>('profile');

    return (
        <div className="min-h-screen flex">
            {/* LEFT SIDE */}
            <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#268700] to-[#66b447] relative overflow-hidden">
                <Image
                    src="/left_ui.svg"
                    alt="Food Theme"
                    fill
                    className="object-cover"
                />
                <div className="absolute text-4xl text-white m-8 p-6 leading-tight">
                    Unlock a new revenue stream, be part of the PartyFud platform
                </div>
                <p className="absolute text-lg text-white mx-8 mt-32 p-6 leading-tight">
                    We’re building the easiest way for food creators to reach parties, events, and celebrations across the UAE. Sign up now to join our waitlist.
                </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#66b447] px-4">
                <div className="bg-white w-full max-w-4xl rounded-xl p-8 shadow-lg">
                    {step !== 'done' && (
                        <Stepper current={step} onChange={setStep} />
                    )}

                    {step === 'profile' && (
                        <ProfileStep onNext={() => setStep('availability')} />
                    )}

                    {step === 'availability' && (
                        <AvailabilityStep onNext={() => setStep('licenses')} />
                    )}

                    {step === 'licenses' && (
                        <LicencesStep onNext={() => setStep('done')} />
                    )}

                    {step === 'done' && <SuccessStep />}
                </div>
            </div>
        </div>
    );
}

/* ---------------- STEPPER (CLICKABLE) ---------------- */

function Stepper({
    current,
    onChange,
}: {
    current: Step;
    onChange: (s: Step) => void;
}) {
    const steps: { key: Step; label: string }[] = [
        { key: 'profile', label: 'Profile' },
        { key: 'availability', label: 'Availability' },
        { key: 'licenses', label: 'Licenses' },
    ];

    return (
        <div className="flex gap-2 mb-8 bg-gray-100 rounded-lg p-1">
            {steps.map(step => (
                <button
                    key={step.key}
                    onClick={() => onChange(step.key)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${current === step.key
                            ? 'bg-[#268700] text-white'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {step.label}
                </button>
            ))}
        </div>
    );
}

/* ---------------- PROFILE ---------------- */

export function ProfileStep({ onNext }: { onNext: () => void }) {
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const BUSINESS_TYPES = [
        'Bakery',
        'Restaurant',
        'Cloud Kitchen',
        'Catering Company',
        'Home Chef',
    ];

    const CUISINES = [
        'Mediterranean',
        'Italian',
        'Spanish',
        'Greek',
        'Turkish',
        'Lebanese',
        'Moroccan',
    ];

    const toggleCuisine = (cuisine: string) => {
        setSelectedCuisines((prev) =>
            prev.includes(cuisine)
                ? prev.filter((c) => c !== cuisine)
                : [...prev, cuisine]
        );
    };

    return (
        <div className="space-y-6">
            {/* Business name & type */}
            <div className="grid grid-cols-2 gap-4">
                <Input label="Business Name *" placeholder="Varun Chopra" />

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                        Business Type *
                    </label>
                    <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700]">
                        {BUSINESS_TYPES.map((type) => (
                            <option key={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                    Description *
                </label>
                <textarea
                    rows={2}
                    placeholder="Describe your catering services..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#268700]"
                />
            </div>

            {/* Service area */}
            <Input label="Service Area *" placeholder="Abu Dhabi" />

            {/* Guests */}
            <div className="grid grid-cols-2 gap-4">
                <Input label="Minimum Guests *" type="number" placeholder="12" />
                <Input label="Maximum Guests *" type="number" placeholder="23" />
            </div>

            {/* Cuisine types */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Cuisine Types *
                </label>

                <div className="grid grid-cols-4 gap-3">
                    {CUISINES.map((cuisine) => (
                        <label
                            key={cuisine}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedCuisines.includes(cuisine)}
                                onChange={() => toggleCuisine(cuisine)}
                                className="h-4 w-4 rounded border-gray-300 text-[#268700] focus:ring-[#268700]"
                            />
                            {cuisine}
                        </label>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6">
                <Button variant="outline" className="w-1/2">
                    Save Progress
                </Button>

                <Button
                    onClick={onNext}
                    className="w-1/2 ml-4 bg-[#268700] hover:bg-[#1f6b00]"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

/* ---------------- AVAILABILITY ---------------- */

function AvailabilityStep({ onNext }: { onNext: () => void }) {

    const REGION = [
        'Abu Dhabi',
        'Dubai',
        'Sharjah',
        'Ajman',
        'Ras Al Khaimah',
        'Fujairah',
        'Umm Al Quwain',
        'Moroccan',
    ];
    return (
        <div className="space-y-6">

            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700]">
                {REGION.map((type) => (
                    <option key={type}>{type}</option>
                ))}
            </select>

            <CheckboxGroup
                title="Delivery & Setup Options *"
                options={[
                    {
                        label: 'Delivery Only',
                        description: 'Food delivered ready to serve',
                    },
                    {
                        label: 'Delivery + Setup',
                        description: 'We deliver and set up the food display',
                    },
                    {
                        label: 'Full Service',
                        description: 'Includes setup, service, and cleanup',
                    },
                ]}
            />

            <CheckboxGroup
                title="Staffing Options *"
                options={[
                    {
                        label: 'No Staff',
                        description: 'Food only',
                    },
                    {
                        label: 'Servers',
                        description: 'Additional staff to serve food',
                    },
                ]}
            />


            <div className="flex justify-between pt-6">
                <Button variant="outline">Save Progress</Button>
                <Button onClick={onNext}>Next</Button>
            </div>
        </div>
    );
}

/* ---------------- LICENCES ---------------- */
type UploadedFile = {
    id: string;
    file: File;
};
export function LicencesStep({ onNext }: { onNext: () => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [error, setError] = useState('');

    const MAX_SIZE_MB = 5;

    const validateAndAddFiles = (selectedFiles: FileList) => {
        const newFiles: UploadedFile[] = [];
        setError('');

        Array.from(selectedFiles).forEach((file) => {
            if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) {
                setError('Only PDF, PNG, or JPG files are allowed');
                return;
            }

            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                setError('Each file must be under 5MB');
                return;
            }

            newFiles.push({
                id: crypto.randomUUID(),
                file,
            });
        });

        if (newFiles.length) {
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            validateAndAddFiles(e.dataTransfer.files);
        }
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* Food License */}
            <div>
                <label className="text-sm font-medium text-gray-700">
                    Food License <span className="text-red-500">*</span>
                </label>

                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#268700] transition"
                >
                    <p className="text-sm text-gray-600">
                        Drop your files here or{' '}
                        <span className="text-[#268700] font-medium">Click to upload</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        JPEG, PNG or PDF (max 5MB)
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => {
                            if (e.target.files) {
                                validateAndAddFiles(e.target.files);
                            }
                        }}
                    />
                </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {/* Uploaded Files */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                        Registration <span className="text-red-500">*</span>
                    </label>

                    {files.map(({ id, file }) => (
                        <div
                            key={id}
                            className="flex items-center justify-between border rounded-lg p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded">
                                    PDF
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-green-600">✔</span>
                                <button
                                    onClick={() => removeFile(id)}
                                    className="text-gray-400 hover:text-red-500 transition"
                                >
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-6">
                <Button variant="outline">Save Progress</Button>
                <Button onClick={onNext} disabled={files.length === 0}>
                    Next
                </Button>
            </div>
        </div>
    );
}

/* ---------------- SUCCESS ---------------- */

function SuccessStep() {
    return (
        <div className="text-center py-12 space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-4xl">
                ✓
            </div>

            <h2 className="text-xl font-semibold">
                Your Profile has been Sent for Review
            </h2>

            <p className="text-gray-500 max-w-md mx-auto">
                Our team will review your details and notify you once approved.
            </p>
            <Link href="/login">
                <Button className="mt-6">Go back Home</Button>
            </Link>

        </div>
    );
}

/* ---------------- CHECKBOX GROUP ---------------- */

type Option = {
    label: string;
    description?: string;
};

function CheckboxGroup({
    title,
    options,
}: {
    title: string;
    options: Option[];
}) {
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (label: string) => {
        setSelected((prev) =>
            prev.includes(label)
                ? prev.filter((v) => v !== label)
                : [...prev, label]
        );
    };

    return (
        <div className="space-y-4">
            {/* Group title */}
            <h3 className="text-sm font-medium text-gray-800">{title}</h3>

            <div className="space-y-4">
                {options.map((opt) => (
                    <label
                        key={opt.label}
                        className="flex items-start gap-3 cursor-pointer"
                    >
                        {/* Checkbox */}
                        <input
                            type="checkbox"
                            checked={selected.includes(opt.label)}
                            onChange={() => toggle(opt.label)}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-[#268700] focus:ring-[#268700]"
                        />

                        {/* Label + description */}
                        <div className="leading-tight">
                            <p className="text-sm font-medium text-gray-900">
                                {opt.label}
                            </p>
                            {opt.description && (
                                <p className="text-sm text-gray-500">
                                    {opt.description}
                                </p>
                            )}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}
