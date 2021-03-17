import { FC } from 'react'
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import { resolveIconAlias } from './font-awesome'

/**
 * Predefined and ready to use set of icons
 */

interface IconProps extends Omit<FontAwesomeIconProps, 'icon'> {
    name: string
}

export const Icon: FC<IconProps> = ({ name, ...props }) => (
    <FontAwesomeIcon {...props} icon={resolveIconAlias(name)} />
)
