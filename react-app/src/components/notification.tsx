import { Icon } from '../icons';
import clsx from 'clsx';

const NotiType = {
    success: {
        label: 'Success',
        icon: 'check',
        iconClass: 'bg-green-100 text-green-500',
        titleClass: 'text-green-500',
    },
    warning: {
        label: 'Warning',
        icon: 'exclamation',
        iconClass: 'bg-indigo-100 text-indigo-500',
        titleClass: 'text-indigo-500',
    },
    info: {
        label: 'Info',
        icon: 'info',
        iconClass: 'bg-blue-100 text-blue-500',
        titleClass: 'text-blue-500',
    },
    error: {
        label: 'Error',
        icon: 'times',
        iconClass: 'bg-red-100 text-red-500',
        titleClass: 'text-red-500',
    },
    custom: {
        label: 'Custom message',
        background: 'bg-gray-50',
        icon: 'cog',
        iconClass: 'bg-gray-100 text-gray-500',
        titleClass: 'text-gray-500',
    }
}
export const Notification = ({ type = 'success', label, icon, description, close }: any) => {
    const defaultSetting = NotiType[type];
    return (
        <div className={clsx('flex shadow-lg rounded-lg p-6 items-center', defaultSetting.background)} style={{ width: 'fit-content' }}>
            <div className={clsx('flex justify-center items-center rounded-full w-12 h-12 text-lg', defaultSetting.iconClass)}><Icon name={icon || defaultSetting.icon} /></div>
            <div className="mx-5 w-40 md:w-80">
                <h2 className={clsx(' font-semibold text-lg', defaultSetting.titleClass)}>{label || defaultSetting.label}</h2>
                <div className="text-gray-400 text-xs">{description || 'lorem ipsum dolor sit amet'}</div>
            </div>
            <Icon className="text-gray-400" name="times" onClick={close}/>
        </div>
    );
}
