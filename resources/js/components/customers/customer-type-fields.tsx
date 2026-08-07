import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type CustomerType = 'individual' | 'company' | 'government' | 'other';

type Props = {
    type: CustomerType;
    displayName: string;
    contactPerson: string;
    contactPersonPhone: string;
    errors: {
        customer_type?: string;
        display_name?: string;
        contact_person?: string;
        contact_person_phone?: string;
    };
    onTypeChange: (value: CustomerType) => void;
    onDisplayNameChange: (value: string) => void;
    onContactPersonChange: (value: string) => void;
    onContactPersonPhoneChange: (value: string) => void;
};

const labels: Record<CustomerType, string> = {
    individual: 'Full name',
    company: 'Company / trade name',
    government: 'Office / department name',
    other: 'Display name',
};

export function CustomerTypeFields({
    type,
    displayName,
    contactPerson,
    contactPersonPhone,
    errors,
    onTypeChange,
    onDisplayNameChange,
    onContactPersonChange,
    onContactPersonPhoneChange,
}: Props) {
    const requiresContact = type === 'company' || type === 'government';

    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="customer_type">Customer type</Label>
                <select
                    id="customer_type"
                    value={type}
                    onChange={(event) => onTypeChange(event.target.value as CustomerType)}
                    className="border-input bg-background flex h-10 rounded-md border px-3 text-sm shadow-xs"
                >
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                    <option value="government">Government office</option>
                    <option value="other">Other</option>
                </select>
                <InputError message={errors.customer_type} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="display_name">{labels[type]}</Label>
                <Input id="display_name" value={displayName} onChange={(event) => onDisplayNameChange(event.target.value)} required autoFocus />
                <InputError message={errors.display_name} />
            </div>

            {type !== 'individual' && (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="contact_person">Contact person{requiresContact ? '' : ' (optional)'}</Label>
                        <Input id="contact_person" value={contactPerson} onChange={(event) => onContactPersonChange(event.target.value)} required={requiresContact} />
                        <InputError message={errors.contact_person} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="contact_person_phone">Contact person phone</Label>
                        <Input id="contact_person_phone" value={contactPersonPhone} onChange={(event) => onContactPersonPhoneChange(event.target.value)} placeholder="Optional" />
                        <InputError message={errors.contact_person_phone} />
                    </div>
                </>
            )}
        </>
    );
}
