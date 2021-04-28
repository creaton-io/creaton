export enum CheckboxState {}

export const Checkbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (e: any) => void  }) => {
    return (
        <div className="flex items-center">
            <input id="remember_me" name="remember_me" type="checkbox"
                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                   onChange={onChange}
                   checked={checked}
            />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                    {label}
                </label>
        </div>
    );
}
